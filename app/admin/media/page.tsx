'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Image as ImageIcon, X, Copy, Check, Loader2, FolderPlus, Folder, Trash2 } from 'lucide-react'

interface UploadedFile {
  url: string
  path: string
  name: string
  size: number
  type: string
}

export default function MediaVaultPage() {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [selectedBucket, setSelectedBucket] = useState<'property-images' | 'room-images' | 'cafe-menu-images'>('property-images')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const loadFiles = useCallback(async () => {
    try {
      const { data, error } = await supabase.storage
        .from(selectedBucket)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) throw error

      const fileList: UploadedFile[] = (data || []).map((file: any) => {
        const { data: urlData } = supabase.storage
          .from(selectedBucket)
          .getPublicUrl(file.name)

        return {
          url: urlData.publicUrl,
          path: file.name,
          name: file.name,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'image/jpeg',
        }
      })

      setFiles(fileList)
    } catch (error) {
      console.error('Failed to load files:', error)
      setFiles([])
    }
  }, [supabase, selectedBucket])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = fileName

      const { data, error: uploadError } = await supabase.storage
        .from(selectedBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      await loadFiles()
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (path: string) => {
    if (!confirm('Delete this file?')) return

    try {
      const { error } = await supabase.storage
        .from(selectedBucket)
        .remove([path])

      if (error) throw error
      await loadFiles()
    } catch (error: any) {
      console.error('Delete error:', error)
      alert(error.message || 'Failed to delete file')
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Media Vault</h1>
          <p className="text-slate-400">Upload and manage images for properties, rooms, and menu items</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="property-images">Property Images</option>
            <option value="room-images">Room Images</option>
            <option value="cafe-menu-images">Cafe Menu Images</option>
          </select>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragActive
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
          }}
          className="hidden"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-4"
        >
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
              <span className="text-slate-300">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-400" />
              <div>
                <span className="text-slate-300 font-medium">Click to upload</span>
                <span className="text-slate-500"> or drag and drop</span>
              </div>
              <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
            </>
          )}
        </label>
      </div>

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
          <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No images uploaded yet</p>
          <p className="text-sm text-slate-500">Upload your first image to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.path}
              className="group relative bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-all"
            >
              {/* Image */}
              <div className="aspect-square bg-slate-900 relative">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(file.url)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    {copiedUrl === file.url ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(file.path)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div className="p-3">
                <p className="text-xs text-slate-400 truncate mb-1" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>

              {/* URL Display (on hover) */}
              {copiedUrl === file.url && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-green-500/20 border-t border-green-500/30">
                  <p className="text-xs text-green-400 text-center">URL Copied!</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <h3 className="font-semibold text-amber-400 mb-2">How to Use</h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Upload images to the selected bucket</li>
          <li>• Click the copy icon to copy the image URL</li>
          <li>• Paste the URL into property, room, or menu item forms</li>
          <li>• Delete images you no longer need</li>
        </ul>
      </div>
    </div>
  )
}

