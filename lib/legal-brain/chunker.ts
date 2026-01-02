/**
 * ABBEY OS - Legal Brain: Document Chunker
 * 
 * Splits documents into semantic chunks optimized for retrieval
 */

export interface DocumentChunk {
  content: string
  index: number
  pageNumber?: number
  charStart: number
  charEnd: number
  tokenCount: number
}

// Approximate tokens per character (English text averages ~4 chars per token)
const CHARS_PER_TOKEN = 4

// Target chunk sizes
const TARGET_CHUNK_TOKENS = 500  // ~2000 characters
const MAX_CHUNK_TOKENS = 1000   // ~4000 characters
const MIN_CHUNK_TOKENS = 100    // ~400 characters
const OVERLAP_TOKENS = 50       // ~200 characters overlap

/**
 * Estimate token count from character count
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}

/**
 * Find natural break points in text
 */
function findBreakPoints(text: string): number[] {
  const breakPoints: number[] = []
  
  // Priority 1: Double newlines (paragraph breaks)
  let match
  const paragraphRegex = /\n\n+/g
  while ((match = paragraphRegex.exec(text)) !== null) {
    breakPoints.push(match.index + match[0].length)
  }
  
  // Priority 2: Section headers (numbered sections, all caps lines)
  const headerRegex = /\n(?:\d+\.|\d+\.\d+|[A-Z]{3,}[A-Z\s]+:?)\s/g
  while ((match = headerRegex.exec(text)) !== null) {
    breakPoints.push(match.index)
  }
  
  // Priority 3: Single newlines
  const newlineRegex = /\n/g
  while ((match = newlineRegex.exec(text)) !== null) {
    breakPoints.push(match.index + 1)
  }
  
  // Priority 4: Sentence endings
  const sentenceRegex = /[.!?]\s+/g
  while ((match = sentenceRegex.exec(text)) !== null) {
    breakPoints.push(match.index + match[0].length)
  }
  
  // Sort and deduplicate
  return [...new Set(breakPoints)].sort((a, b) => a - b)
}

/**
 * Find the best break point near a target position
 */
function findBestBreakNear(
  breakPoints: number[], 
  target: number, 
  minPos: number,
  maxPos: number
): number {
  let best = target
  let bestDistance = Infinity
  
  for (const bp of breakPoints) {
    if (bp >= minPos && bp <= maxPos) {
      const distance = Math.abs(bp - target)
      if (distance < bestDistance) {
        bestDistance = distance
        best = bp
      }
    }
  }
  
  return best
}

/**
 * Split document text into semantic chunks
 */
export function chunkDocument(
  text: string,
  options: {
    targetTokens?: number
    maxTokens?: number
    minTokens?: number
    overlapTokens?: number
  } = {}
): DocumentChunk[] {
  const {
    targetTokens = TARGET_CHUNK_TOKENS,
    maxTokens = MAX_CHUNK_TOKENS,
    minTokens = MIN_CHUNK_TOKENS,
    overlapTokens = OVERLAP_TOKENS,
  } = options

  // Clean the text
  const cleanText = text.replace(/\r\n/g, '\n').trim()
  
  if (!cleanText) {
    return []
  }

  const targetChars = targetTokens * CHARS_PER_TOKEN
  const maxChars = maxTokens * CHARS_PER_TOKEN
  const minChars = minTokens * CHARS_PER_TOKEN
  const overlapChars = overlapTokens * CHARS_PER_TOKEN

  const breakPoints = findBreakPoints(cleanText)
  const chunks: DocumentChunk[] = []
  
  let currentStart = 0
  let chunkIndex = 0

  while (currentStart < cleanText.length) {
    // Calculate target end position
    const targetEnd = currentStart + targetChars
    const maxEnd = Math.min(currentStart + maxChars, cleanText.length)
    const minEnd = currentStart + minChars

    // Find the best break point
    let chunkEnd: number
    
    if (targetEnd >= cleanText.length) {
      // Last chunk - take everything
      chunkEnd = cleanText.length
    } else {
      // Find natural break near target
      chunkEnd = findBestBreakNear(breakPoints, targetEnd, minEnd, maxEnd)
      
      // If no good break found, use target
      if (chunkEnd === targetEnd && !breakPoints.includes(targetEnd)) {
        // Try to at least break at word boundary
        const spaceIndex = cleanText.lastIndexOf(' ', maxEnd)
        if (spaceIndex > minEnd) {
          chunkEnd = spaceIndex + 1
        } else {
          chunkEnd = Math.min(maxEnd, cleanText.length)
        }
      }
    }

    // Extract chunk content
    const content = cleanText.slice(currentStart, chunkEnd).trim()
    
    if (content.length >= minChars || currentStart + content.length >= cleanText.length) {
      chunks.push({
        content,
        index: chunkIndex,
        charStart: currentStart,
        charEnd: chunkEnd,
        tokenCount: estimateTokens(content),
      })
      chunkIndex++
    }

    // Move to next chunk with overlap
    currentStart = Math.max(chunkEnd - overlapChars, currentStart + 1)
    
    // Prevent infinite loop
    if (chunkEnd >= cleanText.length) {
      break
    }
  }

  return chunks
}

/**
 * Split document with page markers
 * Expects format: "PAGE 1\n...\nPAGE 2\n..." or similar
 */
export function chunkDocumentWithPages(
  text: string,
  pageMarkerRegex: RegExp = /PAGE\s+(\d+)/gi
): DocumentChunk[] {
  const pages: { pageNum: number; content: string; startPos: number }[] = []
  
  // Find all page markers
  let match
  const markers: { pos: number; page: number }[] = []
  
  while ((match = pageMarkerRegex.exec(text)) !== null) {
    markers.push({ pos: match.index, page: parseInt(match[1]) })
  }
  
  if (markers.length === 0) {
    // No page markers - treat as single page
    return chunkDocument(text).map(chunk => ({
      ...chunk,
      pageNumber: 1,
    }))
  }

  // Split by page
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].pos
    const end = i < markers.length - 1 ? markers[i + 1].pos : text.length
    const pageContent = text.slice(start, end)
    
    pages.push({
      pageNum: markers[i].page,
      content: pageContent,
      startPos: start,
    })
  }

  // Chunk each page and combine
  const allChunks: DocumentChunk[] = []
  
  for (const page of pages) {
    const pageChunks = chunkDocument(page.content)
    
    for (const chunk of pageChunks) {
      allChunks.push({
        ...chunk,
        index: allChunks.length,
        pageNumber: page.pageNum,
        charStart: page.startPos + chunk.charStart,
        charEnd: page.startPos + chunk.charEnd,
      })
    }
  }

  return allChunks
}

/**
 * Merge small chunks with neighbors
 */
export function mergeSmallChunks(
  chunks: DocumentChunk[],
  minTokens: number = MIN_CHUNK_TOKENS
): DocumentChunk[] {
  if (chunks.length <= 1) return chunks

  const merged: DocumentChunk[] = []
  let pending: DocumentChunk | null = null

  for (const chunk of chunks) {
    if (!pending) {
      pending = chunk
      continue
    }

    if (pending.tokenCount < minTokens) {
      // Merge with current chunk
      pending = {
        content: pending.content + '\n\n' + chunk.content,
        index: pending.index,
        pageNumber: pending.pageNumber,
        charStart: pending.charStart,
        charEnd: chunk.charEnd,
        tokenCount: pending.tokenCount + chunk.tokenCount,
      }
    } else {
      merged.push(pending)
      pending = chunk
    }
  }

  if (pending) {
    // Handle last pending chunk
    if (pending.tokenCount < minTokens && merged.length > 0) {
      const last = merged[merged.length - 1]
      merged[merged.length - 1] = {
        ...last,
        content: last.content + '\n\n' + pending.content,
        charEnd: pending.charEnd,
        tokenCount: last.tokenCount + pending.tokenCount,
      }
    } else {
      merged.push(pending)
    }
  }

  // Re-index
  return merged.map((chunk, i) => ({ ...chunk, index: i }))
}

