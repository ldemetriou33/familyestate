'use client'

import { useState } from 'react'
import { Brain, Upload, MessageSquare, FileText, Sparkles } from 'lucide-react'
import { DocumentUpload, LegalBrainChat } from '@/components/legal-brain'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type Tab = 'chat' | 'upload' | 'documents'

export default function LegalBrainSection() {
  const [activeTab, setActiveTab] = useState<Tab>('chat')

  const tabs = [
    { id: 'chat', label: 'Ask the Estate', icon: MessageSquare },
    { id: 'upload', label: 'Upload Documents', icon: Upload },
    { id: 'documents', label: 'Document Vault', icon: FileText },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Brain className="w-7 h-7 text-[var(--accent)]" />
            Legal Brain
            <span className="px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            RAG-powered legal document understanding and strategic reasoning
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[var(--border-primary)] pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && <LegalBrainChat />}
      
      {activeTab === 'upload' && (
        <div className="max-w-3xl">
          <DocumentUpload />
        </div>
      )}
      
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Documents Grid - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-5 h-5 text-[var(--accent)]" />
                Indexed Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                <p className="text-[var(--text-muted)]">
                  No documents indexed yet. Upload your legal documents to get started.
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm"
                >
                  Upload Documents
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Document Types Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supported Document Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: '🏦', label: 'Mortgage Deeds', desc: 'Analyze terms, ERCs, rates' },
                  { icon: '📋', label: 'Planning Permission', desc: 'Building rights & restrictions' },
                  { icon: '⚖️', label: 'Covenants', desc: 'Use restrictions & easements' },
                  { icon: '📜', label: 'Title Deeds', desc: 'Ownership & rights' },
                  { icon: '🏪', label: 'Commercial Leases', desc: 'Rent reviews & break clauses' },
                  { icon: '🏠', label: 'Residential Leases', desc: 'Tenant agreements' },
                  { icon: '📐', label: 'Surveys', desc: 'Property condition' },
                  { icon: '💰', label: 'Valuations', desc: 'Asset values' },
                ].map((type, i) => (
                  <div key={i} className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <span className="text-2xl">{type.icon}</span>
                    <p className="font-medium text-[var(--text-primary)] text-sm mt-1">
                      {type.label}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{type.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

