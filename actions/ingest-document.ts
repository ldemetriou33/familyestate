'use server'

/**
 * ABBEY OS - Legal Brain: Document Ingestion Server Action
 * 
 * Pipeline: Parse PDF → Chunk → Embed → Store → Summarize
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { 
  parsePdfBuffer, 
  cleanExtractedText 
} from '@/lib/legal-brain/pdf-parser'
import { 
  chunkDocument, 
  mergeSmallChunks,
  DocumentChunk 
} from '@/lib/legal-brain/chunker'
import { 
  generateEmbeddings, 
  formatEmbeddingForPg 
} from '@/lib/legal-brain/embeddings'

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================
// TYPES
// ============================================

export interface IngestDocumentInput {
  file: {
    name: string
    type: string
    size: number
    base64: string
  }
  documentType: string
  propertyId?: string
  notes?: string
}

export interface IngestDocumentResult {
  success: boolean
  documentId?: string
  summary?: string
  chunkCount?: number
  error?: string
}

export interface IngestProgress {
  stage: 'parsing' | 'chunking' | 'embedding' | 'storing' | 'summarizing' | 'complete' | 'error'
  progress: number
  message: string
}

// ============================================
// MAIN INGESTION ACTION
// ============================================

/**
 * Ingest a document into the Legal Brain vector store
 */
export async function ingestDocument(
  input: IngestDocumentInput
): Promise<IngestDocumentResult> {
  const { file, documentType, propertyId, notes } = input
  
  try {
    // ===== STAGE 1: PARSE PDF =====
    console.log(`[Legal Brain] Parsing document: ${file.name}`)
    
    const buffer = Buffer.from(file.base64, 'base64')
    const parsed = await parsePdfBuffer(buffer)
    const cleanedText = cleanExtractedText(parsed.text)
    
    if (!cleanedText || cleanedText.length < 100) {
      return {
        success: false,
        error: 'Document appears to be empty or unreadable. Please check the PDF.',
      }
    }

    // ===== STAGE 2: CREATE DOCUMENT RECORD =====
    console.log(`[Legal Brain] Creating document record...`)
    
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        type: documentType,
        property_id: propertyId || null,
        url: '', // Will be updated after upload
        page_count: parsed.pageCount,
        file_size: file.size,
        mime_type: file.type,
        notes: notes || null,
        is_indexed: false,
        data_source: 'MANUAL',
        last_updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (docError || !document) {
      throw new Error(`Failed to create document record: ${docError?.message}`)
    }

    const documentId = document.id

    // ===== STAGE 3: CHUNK THE DOCUMENT =====
    console.log(`[Legal Brain] Chunking document into semantic segments...`)
    
    let chunks = chunkDocument(cleanedText, {
      targetTokens: 500,
      maxTokens: 1000,
      overlapTokens: 50,
    })
    
    // Merge any chunks that are too small
    chunks = mergeSmallChunks(chunks, 100)
    
    console.log(`[Legal Brain] Created ${chunks.length} chunks`)

    // ===== STAGE 4: GENERATE EMBEDDINGS =====
    console.log(`[Legal Brain] Generating embeddings...`)
    
    const chunkTexts = chunks.map(c => c.content)
    const embeddings = await generateEmbeddings(chunkTexts)

    // ===== STAGE 5: STORE CHUNKS & EMBEDDINGS =====
    console.log(`[Legal Brain] Storing chunks and embeddings...`)
    
    // Store chunks in document_chunks table
    const chunkRecords = chunks.map((chunk, i) => ({
      document_id: documentId,
      content: chunk.content,
      page_number: chunk.pageNumber || null,
      chunk_index: chunk.index,
      char_start: chunk.charStart,
      char_end: chunk.charEnd,
      token_count: embeddings[i]?.tokenCount || chunk.tokenCount,
      has_embedding: true,
    }))

    const { data: savedChunks, error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkRecords)
      .select('id')

    if (chunkError || !savedChunks) {
      throw new Error(`Failed to store chunks: ${chunkError?.message}`)
    }

    // Store embeddings in document_embeddings table
    const embeddingRecords = savedChunks.map((chunk, i) => ({
      chunk_id: chunk.id,
      embedding: formatEmbeddingForPg(embeddings[i].embedding),
    }))

    // Insert embeddings in batches to avoid request size limits
    const batchSize = 50
    for (let i = 0; i < embeddingRecords.length; i += batchSize) {
      const batch = embeddingRecords.slice(i, i + batchSize)
      
      const { error: embedError } = await supabase
        .from('document_embeddings')
        .insert(batch)

      if (embedError) {
        console.error(`[Legal Brain] Warning: Failed to store embedding batch: ${embedError.message}`)
      }
    }

    // ===== STAGE 6: GENERATE SUMMARY =====
    console.log(`[Legal Brain] Generating AI summary...`)
    
    const summary = await generateDocumentSummary(
      file.name,
      documentType,
      cleanedText.slice(0, 8000) // First ~2000 tokens for summary
    )

    // Update document with summary and mark as indexed
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        summary,
        is_indexed: true,
        indexed_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (updateError) {
      console.error(`[Legal Brain] Warning: Failed to update document summary: ${updateError.message}`)
    }

    console.log(`[Legal Brain] ✅ Document ingested successfully: ${documentId}`)

    return {
      success: true,
      documentId,
      summary,
      chunkCount: chunks.length,
    }

  } catch (error: any) {
    console.error('[Legal Brain] Ingestion error:', error)
    return {
      success: false,
      error: error.message || 'Unknown error during document ingestion',
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a high-level summary of the document
 */
async function generateDocumentSummary(
  filename: string,
  documentType: string,
  content: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a document summarizer for a property estate management system. 
Generate a concise 1-2 sentence summary of the document that captures:
- The type of document and its purpose
- Key parties involved
- Important dates, amounts, or conditions
- The property it relates to

Keep it factual and actionable. Example:
"Mortgage Deed for Flat 4B, £285,000 at 5.2% fixed until Dec 2028 with NatWest. Early repayment charge of 3% applies until Jun 2027."`
      },
      {
        role: 'user',
        content: `Summarize this ${documentType} document titled "${filename}":

${content}`
      }
    ],
    temperature: 0.3,
    max_tokens: 200,
  })

  return response.choices[0].message.content || 'Summary generation failed'
}

/**
 * Re-index an existing document (e.g., after content update)
 */
export async function reindexDocument(documentId: string): Promise<IngestDocumentResult> {
  try {
    // Fetch the document
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      throw new Error(`Document not found: ${documentId}`)
    }

    // Delete existing chunks and embeddings
    await supabase.from('document_chunks').delete().eq('document_id', documentId)

    // Re-fetch and process the document from URL
    // This would need the actual file content - for now return error
    return {
      success: false,
      error: 'Re-indexing requires the original file. Please re-upload the document.',
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Delete a document and all its chunks/embeddings
 */
export async function deleteIndexedDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Cascading delete will handle chunks and embeddings
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get indexing status for all documents
 */
export async function getDocumentIndexStatus(): Promise<{
  total: number
  indexed: number
  pending: number
  documents: Array<{
    id: string
    name: string
    type: string
    isIndexed: boolean
    chunkCount: number
    summary: string | null
  }>
}> {
  const { data: documents, error } = await supabase
    .from('documents')
    .select(`
      id,
      name,
      type,
      is_indexed,
      summary,
      document_chunks(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }

  const total = documents?.length || 0
  const indexed = documents?.filter(d => d.is_indexed).length || 0

  return {
    total,
    indexed,
    pending: total - indexed,
    documents: (documents || []).map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      isIndexed: d.is_indexed,
      chunkCount: (d.document_chunks as any)?.[0]?.count || 0,
      summary: d.summary,
    })),
  }
}

