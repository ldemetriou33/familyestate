/**
 * ABBEY OS - Legal Brain: Embeddings Engine
 * 
 * Handles generating embeddings via OpenAI and storing them in Supabase pgvector
 */

import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Embedding model - text-embedding-3-small is cost-effective and high quality
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

export interface EmbeddingResult {
  embedding: number[]
  tokenCount: number
}

/**
 * Generate an embedding vector for a text string
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text')
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
  })

  return {
    embedding: response.data[0].embedding,
    tokenCount: response.usage.total_tokens,
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  if (texts.length === 0) {
    return []
  }

  // Filter out empty texts
  const cleanTexts = texts.map(t => t.trim()).filter(t => t.length > 0)
  
  if (cleanTexts.length === 0) {
    throw new Error('All texts are empty')
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleanTexts,
  })

  return response.data.map((item, index) => ({
    embedding: item.embedding,
    tokenCount: Math.floor(response.usage.total_tokens / cleanTexts.length), // Approximate per-text
  }))
}

/**
 * Format embedding vector for PostgreSQL pgvector
 */
export function formatEmbeddingForPg(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}

/**
 * Calculate cosine similarity between two embeddings (for testing)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same dimensions')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS }

