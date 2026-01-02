/**
 * ABBEY OS - Legal Brain
 * 
 * RAG-powered legal document understanding and reasoning system
 */

import OpenAI from 'openai'
import { generateEmbedding, formatEmbeddingForPg } from './embeddings'
import { createClient } from '@supabase/supabase-js'

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

export interface DocumentSearchResult {
  chunkId: string
  documentId: string
  documentName: string
  documentType: string
  content: string
  pageNumber: number | null
  similarity: number
}

export interface LegalBrainResponse {
  answer: string
  citations: {
    documentName: string
    documentType: string
    pageNumber: number | null
    excerpt: string
    relevance: number
  }[]
  confidence: number
  reasoning?: string
}

export interface AgentContext {
  propertyId?: string
  documentTypes?: string[]
  query?: string
}

// ============================================
// CORE SEARCH FUNCTION
// ============================================

/**
 * Search documents using semantic similarity
 */
export async function searchDocuments(
  query: string,
  options: {
    propertyId?: string
    documentTypes?: string[]
    matchThreshold?: number
    matchCount?: number
  } = {}
): Promise<DocumentSearchResult[]> {
  const {
    propertyId,
    documentTypes,
    matchThreshold = 0.7,
    matchCount = 5,
  } = options

  // Generate embedding for the query
  const { embedding } = await generateEmbedding(query)
  const embeddingStr = formatEmbeddingForPg(embedding)

  // Call the appropriate search function based on filters
  let results

  if (documentTypes && documentTypes.length > 0) {
    const { data, error } = await supabase.rpc('search_documents_by_type', {
      query_embedding: embeddingStr,
      doc_types: documentTypes,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })
    if (error) throw new Error(`Search failed: ${error.message}`)
    results = data
  } else if (propertyId) {
    const { data, error } = await supabase.rpc('search_documents_by_property', {
      query_embedding: embeddingStr,
      property_id: propertyId,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })
    if (error) throw new Error(`Search failed: ${error.message}`)
    results = data
  } else {
    const { data, error } = await supabase.rpc('search_documents', {
      query_embedding: embeddingStr,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })
    if (error) throw new Error(`Search failed: ${error.message}`)
    results = data
  }

  return (results || []).map((r: any) => ({
    chunkId: r.chunk_id,
    documentId: r.document_id,
    documentName: r.document_name || 'Unknown Document',
    documentType: r.document_type || 'OTHER',
    content: r.content,
    pageNumber: r.page_number,
    similarity: r.similarity,
  }))
}

// ============================================
// THE ORACLE - Main Reasoning Engine
// ============================================

const ESTATE_LAWYER_SYSTEM_PROMPT = `You are the Estate Lawyer AI for Abbey OS - a family estate management system.

Your role is to provide accurate, legally-informed answers about the estate's documents, including:
- Mortgage deeds and financing terms
- Planning permissions and building restrictions
- Restrictive covenants and easements
- Commercial and residential leases
- Title deeds and property rights

CRITICAL RULES:
1. Answer ONLY using the provided document context. If the answer is not in the documents, say so explicitly.
2. ALWAYS cite the specific document name and page number for every claim.
3. Use clear, plain English but be precise about legal terms.
4. Highlight any risks, deadlines, or action items you identify.
5. If you're uncertain about an interpretation, flag it as requiring professional legal review.

FORMAT YOUR RESPONSE:
- Start with a direct answer to the question
- Follow with supporting evidence from documents
- End with any recommended actions or warnings`

/**
 * Ask the Legal Brain a question
 */
export async function askLegalBrain(
  question: string,
  context?: AgentContext
): Promise<LegalBrainResponse> {
  // Step 1: Search for relevant document chunks
  const searchResults = await searchDocuments(question, {
    propertyId: context?.propertyId,
    documentTypes: context?.documentTypes,
    matchThreshold: 0.65,
    matchCount: 8,
  })

  if (searchResults.length === 0) {
    return {
      answer: "I couldn't find any relevant documents to answer your question. Please ensure the relevant documents (mortgage deeds, planning permissions, etc.) have been uploaded and indexed.",
      citations: [],
      confidence: 0,
    }
  }

  // Step 2: Build context from search results
  const contextText = searchResults
    .map((r, i) => `
[Document ${i + 1}: ${r.documentName} (${r.documentType})${r.pageNumber ? `, Page ${r.pageNumber}` : ''}]
${r.content}
---`)
    .join('\n')

  // Step 3: Generate answer using GPT-4o
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: ESTATE_LAWYER_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `DOCUMENT CONTEXT:
${contextText}

QUESTION: ${question}

Please answer the question using ONLY the document context provided above. Cite specific documents and page numbers for all claims.`
      }
    ],
    temperature: 0.3, // Lower temperature for more factual responses
    max_tokens: 2000,
  })

  const answer = response.choices[0].message.content || ''

  // Step 4: Calculate confidence based on search relevance
  const avgSimilarity = searchResults.reduce((sum, r) => sum + r.similarity, 0) / searchResults.length
  const confidence = Math.min(avgSimilarity * 1.2, 0.95) // Scale and cap

  return {
    answer,
    citations: searchResults.map(r => ({
      documentName: r.documentName,
      documentType: r.documentType,
      pageNumber: r.pageNumber,
      excerpt: r.content.slice(0, 200) + '...',
      relevance: r.similarity,
    })),
    confidence,
  }
}

// ============================================
// STRATEGIC AGENTS
// ============================================

/**
 * Agent A: The Refinance Hawk
 * Analyzes mortgage documents for refinancing opportunities
 */
export async function analyzeRefinanceOptions(propertyId: string): Promise<LegalBrainResponse> {
  const question = `Analyze the mortgage deed for this property. Extract and summarize:
1. Current interest rate and type (fixed/variable)
2. Early Repayment Charge (ERC) - amount and conditions
3. Term end date and any penalty-free window dates
4. Variable rate margins or trackers
5. Any break clauses or special conditions

Based on this, advise whether now is a good time to refinance or if we should wait.`

  return askLegalBrain(question, {
    propertyId,
    documentTypes: ['MORTGAGE', 'CONTRACT'],
  })
}

/**
 * Agent B: The Expansion Scout
 * Checks planning permissions and covenants for development potential
 */
export async function analyzeExpansionPotential(
  propertyId: string,
  proposedWork: string
): Promise<LegalBrainResponse> {
  const question = `I want to: ${proposedWork}

Analyze all planning permissions and restrictive covenants for this property. Check for:
1. Height restrictions or maximum stories
2. Building line restrictions
3. Neighbors' rights (light, access, support)
4. Listed building status or conservation area rules
5. Use class restrictions
6. Any historic planning conditions that might apply

Assess the risk level (Low/Medium/High) and recommend next steps.`

  return askLegalBrain(question, {
    propertyId,
    documentTypes: ['PLANNING_PERMISSION', 'RESTRICTIVE_COVENANT', 'TITLE_DEED'],
  })
}

/**
 * Agent C: The Lease Guardian
 * Scans commercial leases for upcoming rent reviews and key dates
 */
export async function scanLeaseRentReviews(
  daysAhead: number = 90
): Promise<LegalBrainResponse> {
  const question = `Scan all commercial lease documents and identify:
1. Any rent review clauses coming up in the next ${daysAhead} days
2. The rent review formula (RPI, CPI, open market, fixed increase)
3. Notice requirements for rent reviews
4. Break clause dates coming up
5. Any repair or decoration obligations due

For each item found, specify the exact date and what action is needed.`

  return askLegalBrain(question, {
    documentTypes: ['COMMERCIAL_LEASE', 'LEASE_AGREEMENT'],
  })
}

/**
 * Agent D: The Covenant Checker
 * Quick check if a specific action is allowed under covenants
 */
export async function checkCovenantCompliance(
  propertyId: string,
  proposedAction: string
): Promise<LegalBrainResponse> {
  const question = `Is the following action permitted under the restrictive covenants and title conditions for this property?

Proposed action: ${proposedAction}

Check for any explicit prohibitions, required consents, or conditions that would apply. Answer with a clear YES/NO followed by explanation and any required steps.`

  return askLegalBrain(question, {
    propertyId,
    documentTypes: ['RESTRICTIVE_COVENANT', 'TITLE_DEED', 'PLANNING_PERMISSION'],
  })
}

// Export all functions
export {
  generateEmbedding,
  formatEmbeddingForPg,
} from './embeddings'

export {
  chunkDocument,
  chunkDocumentWithPages,
} from './chunker'

export {
  parsePdfFromUrl,
  parsePdfBuffer,
  parsePdfBase64,
  cleanExtractedText,
} from './pdf-parser'

