'use client'

import { useState, useCallback, useRef } from 'react'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Building2,
  Scale
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ingestDocument, IngestDocumentResult } from '@/actions/ingest-document'
import { properties } from '@/lib/mock-data/seed'

interface UploadedFile {
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error'
  progress: number
  result?: IngestDocumentResult
}

const DOCUMENT_TYPES = [
  { value: 'MORTGAGE', label: 'Mortgage Deed', icon: '🏦' },
  { value: 'PLANNING_PERMISSION', label: 'Planning Permission', icon: '📋' },
  { value: 'RESTRICTIVE_COVENANT', label: 'Restrictive Covenant', icon: '⚖️' },
  { value: 'CONTRACT', label: 'Contract', icon: '📝' },
  { value: 'COMMERCIAL_LEASE', label: 'Commercial Lease', icon: '🏪' },
  { value: 'LEASE_AGREEMENT', label: 'Residential Lease', icon: '🏠' },
  { value: 'TITLE_DEED', label: 'Title Deed', icon: '📜' },
  { value: 'SURVEY', label: 'Survey Report', icon: '📐' },
  { value: 'VALUATION', label: 'Valuation', icon: '💰' },
  { value: 'OTHER', label: 'Other', icon: '📄' },
]

export function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [documentType, setDocumentType] = useState('MORTGAGE')
  const [propertyId, setPropertyId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'application/pdf'
    )

    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }, [])

  const addFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }))
    setFiles(prev => [...prev, ...uploadedFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      f => f.type === 'application/pdf'
    )
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const processFile = async (fileIndex: number) => {
    const uploadedFile = files[fileIndex]
    if (!uploadedFile || uploadedFile.status !== 'pending') return

    // Update status to uploading
    setFiles(prev => prev.map((f, i) => 
      i === fileIndex ? { ...f, status: 'uploading', progress: 20 } : f
    ))

    try {
      // Convert file to base64
      const base64 = await fileToBase64(uploadedFile.file)

      // Update status to processing
      setFiles(prev => prev.map((f, i) => 
        i === fileIndex ? { ...f, status: 'processing', progress: 50 } : f
      ))

      // Call the ingestion action
      const result = await ingestDocument({
        file: {
          name: uploadedFile.file.name,
          type: uploadedFile.file.type,
          size: uploadedFile.file.size,
          base64,
        },
        documentType,
        propertyId: propertyId || undefined,
        notes: notes || undefined,
      })

      // Update with result
      setFiles(prev => prev.map((f, i) => 
        i === fileIndex 
          ? { 
              ...f, 
              status: result.success ? 'success' : 'error',
              progress: 100,
              result,
            } 
          : f
      ))

    } catch (error: any) {
      setFiles(prev => prev.map((f, i) => 
        i === fileIndex 
          ? { 
              ...f, 
              status: 'error',
              progress: 0,
              result: { success: false, error: error.message },
            } 
          : f
      ))
    }
  }

  const processAllFiles = async () => {
    const pendingIndices = files
      .map((f, i) => f.status === 'pending' ? i : -1)
      .filter(i => i >= 0)

    for (const index of pendingIndices) {
      await processFile(index)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
    })
  }

  const pendingCount = files.filter(f => f.status === 'pending').length
  const successCount = files.filter(f => f.status === 'success').length

  return (
    <Card className="border-[var(--border-primary)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="w-5 h-5 text-[var(--accent)]" />
          Legal Brain - Document Vault
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Type & Property Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Related Property (Optional)
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any relevant context about this document..."
            rows={2}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
              : 'border-[var(--border-primary)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-secondary)]'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
          <p className="text-lg font-medium text-[var(--text-primary)] mb-1">
            Drag & drop PDF documents here
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            or click to browse • Supports PDF files
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                Documents ({files.length})
              </h4>
              {pendingCount > 0 && (
                <button
                  onClick={processAllFiles}
                  className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Process {pendingCount} Document{pendingCount !== 1 ? 's' : ''}
                </button>
              )}
            </div>

            {files.map((uploadedFile, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-colors ${
                  uploadedFile.status === 'success' ? 'border-green-500/30 bg-green-500/5' :
                  uploadedFile.status === 'error' ? 'border-red-500/30 bg-red-500/5' :
                  'border-[var(--border-primary)] bg-[var(--bg-secondary)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${
                      uploadedFile.status === 'success' ? 'bg-green-500/10' :
                      uploadedFile.status === 'error' ? 'bg-red-500/10' :
                      'bg-[var(--accent)]/10'
                    }`}>
                      {uploadedFile.status === 'uploading' || uploadedFile.status === 'processing' ? (
                        <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
                      ) : uploadedFile.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : uploadedFile.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-[var(--accent)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--text-primary)] truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {/* Status message */}
                      {uploadedFile.status === 'processing' && (
                        <p className="text-xs text-[var(--accent)] mt-1">
                          Processing: Parsing → Chunking → Embedding...
                        </p>
                      )}
                      {uploadedFile.status === 'success' && uploadedFile.result && (
                        <div className="mt-2">
                          <p className="text-xs text-green-500 mb-1">
                            ✓ Indexed {uploadedFile.result.chunkCount} chunks
                          </p>
                          <p className="text-xs text-[var(--text-muted)] italic">
                            {uploadedFile.result.summary}
                          </p>
                        </div>
                      )}
                      {uploadedFile.status === 'error' && uploadedFile.result?.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {uploadedFile.result.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {uploadedFile.status === 'pending' && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-[var(--bg-tertiary)] rounded"
                    >
                      <X className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                  <div className="mt-3 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                      style={{ width: `${uploadedFile.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Success Summary */}
        {successCount > 0 && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-500">
                  {successCount} document{successCount !== 1 ? 's' : ''} indexed successfully
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  You can now ask the Legal Brain questions about these documents.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

