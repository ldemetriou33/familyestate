'use client'

import { useState } from 'react'
import { Upload, FileText, Building2, Hotel, Wallet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { uploadBankStatement, uploadHotelDaily, uploadRentRoll } from '@/actions/ingest'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type UploadType = 'bank' | 'hotel' | 'rentroll' | null

export default function DataImportPage() {
  const [activeTab, setActiveTab] = useState<UploadType>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)

  const handleFileUpload = async (type: UploadType, file: File) => {
    if (!file || !type) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      let uploadResult
      switch (type) {
        case 'bank':
          uploadResult = await uploadBankStatement(formData)
          break
        case 'hotel':
          uploadResult = await uploadHotelDaily(formData)
          break
        case 'rentroll':
          uploadResult = await uploadRentRoll(formData)
          break
        default:
          throw new Error('Invalid upload type')
      }

      setResult({
        success: uploadResult.success,
        message: uploadResult.message || (uploadResult.success ? 'Upload successful!' : 'Upload failed'),
        details: uploadResult,
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/portfolio"
          className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Data Import</h1>
          <p className="text-[var(--text-muted)] mt-1">Upload CSV files to import real data</p>
        </div>
      </div>

      {/* Upload Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all ${
            activeTab === 'bank' ? 'ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--bg-secondary)]'
          }`}
          onClick={() => setActiveTab('bank')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="w-5 h-5 text-[var(--accent)]" />
              Bank Statements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              Upload CSV bank statements to import transactions
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            activeTab === 'hotel' ? 'ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--bg-secondary)]'
          }`}
          onClick={() => setActiveTab('hotel')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hotel className="w-5 h-5 text-[var(--accent)]" />
              Hotel Daily Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              Upload PMS exports for occupancy and revenue data
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            activeTab === 'rentroll' ? 'ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--bg-secondary)]'
          }`}
          onClick={() => setActiveTab('rentroll')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5 text-[var(--accent)]" />
              Rent Roll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              Upload tenant payment and arrears data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Form */}
      {activeTab && (
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'bank' && 'Upload Bank Statement'}
              {activeTab === 'hotel' && 'Upload Hotel Daily Metrics'}
              {activeTab === 'rentroll' && 'Upload Rent Roll'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploadForm
              type={activeTab}
              onUpload={handleFileUpload}
              uploading={uploading}
            />

            {result && (
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-medium ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                    {result.message}
                  </span>
                </div>
                {result.details && (
                  <div className="text-sm text-[var(--text-muted)] mt-2 space-y-1">
                    {result.details.imported !== undefined && (
                      <p>Imported: {result.details.imported} records</p>
                    )}
                    {result.details.duplicates !== undefined && (
                      <p>Duplicates skipped: {result.details.duplicates}</p>
                    )}
                    {result.details.errors && result.details.errors.length > 0 && (
                      <div>
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside">
                          {result.details.errors.map((error: string, i: number) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CSV Format Instructions */}
            <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
              <h3 className="font-medium mb-2 text-[var(--text-primary)]">CSV Format Requirements:</h3>
              {activeTab === 'bank' && (
                <div className="text-sm text-[var(--text-muted)] space-y-1">
                  <p>Required columns: Date, Description, Amount, Balance</p>
                  <p>Date format: DD/MM/YYYY or YYYY-MM-DD</p>
                  <p>Amount: Positive for credits, negative for debits</p>
                </div>
              )}
              {activeTab === 'hotel' && (
                <div className="text-sm text-[var(--text-muted)] space-y-1">
                  <p>Required columns: Date, OccupiedRooms, AvailableRooms, Revenue, ADR</p>
                  <p>Date format: YYYY-MM-DD</p>
                </div>
              )}
              {activeTab === 'rentroll' && (
                <div className="text-sm text-[var(--text-muted)] space-y-1">
                  <p>Required columns: UnitNumber, TenantName, MonthlyRent, NextDueDate, PaymentStatus</p>
                  <p>PaymentStatus: PAID, PARTIAL, OVERDUE</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alternative Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Alternative Data Input Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 text-[var(--text-primary)]">1. Portfolio Admin</h3>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              Manually add properties and units through the Portfolio Admin page.
            </p>
            <Link
              href="/dashboard/admin/portfolio"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Go to Portfolio Admin →
            </Link>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-[var(--text-primary)]">2. Automatic Integrations</h3>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              Connect Xero, Cloudbeds, and Square for automatic data sync (recommended).
            </p>
            <Link
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault()
                // This would open integrations modal - you'd need to implement this
                window.location.href = '/dashboard?tab=integrations'
              }}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Go to Integrations →
            </Link>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-[var(--text-primary)]">3. Daily Log</h3>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              Add manual context notes on the dashboard for daily events.
            </p>
            <Link
              href="/dashboard"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Go to Dashboard →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FileUploadForm({
  type,
  onUpload,
  uploading,
}: {
  type: UploadType
  onUpload: (type: UploadType, file: File) => void
  uploading: boolean
}) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (file && type) {
      await onUpload(type, file)
      setFile(null)
      // Reset file input
      const input = document.getElementById('file-input') as HTMLInputElement
      if (input) input.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-[var(--border-primary)] rounded-lg p-8 text-center">
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label
          htmlFor="file-input"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="w-12 h-12 text-[var(--text-muted)]" />
          <span className="text-[var(--text-primary)] font-medium">
            {file ? file.name : 'Click to select CSV file'}
          </span>
          <span className="text-sm text-[var(--text-muted)]">
            or drag and drop
          </span>
        </label>
      </div>

      {file && (
        <div className="flex items-center gap-2 p-3 bg-[var(--bg-secondary)] rounded-lg">
          <FileText className="w-5 h-5 text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-primary)] flex-1">{file.name}</span>
          <span className="text-xs text-[var(--text-muted)]">
            {(file.size / 1024).toFixed(2)} KB
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={!file || uploading}
        className="w-full px-4 py-3 bg-[var(--accent)] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Upload CSV
          </>
        )}
      </button>
    </form>
  )
}

