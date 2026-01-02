/**
 * ABBEY OS - Legal Brain: PDF Parser
 * 
 * Extracts text from PDF documents for indexing
 */

// We'll use pdf-parse for server-side PDF extraction
// In production, you might use a more robust solution like pdf.js or a dedicated service

export interface ParsedDocument {
  text: string
  pages: string[]
  pageCount: number
  metadata: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    creationDate?: Date
    modificationDate?: Date
  }
}

/**
 * Parse a PDF file from a URL
 */
export async function parsePdfFromUrl(url: string): Promise<ParsedDocument> {
  // Fetch the PDF
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`)
  }
  
  const arrayBuffer = await response.arrayBuffer()
  return parsePdfBuffer(Buffer.from(arrayBuffer))
}

/**
 * Parse a PDF file from a buffer
 */
// Import pdf-parse - need to use dynamic import for server-side usage
async function getPdfParser(): Promise<(buffer: Buffer) => Promise<any>> {
  const mod = await import('pdf-parse')
  return mod as unknown as (buffer: Buffer) => Promise<any>
}

export async function parsePdfBuffer(buffer: Buffer): Promise<ParsedDocument> {
  // Get pdf-parse module
  const pdfParse = await getPdfParser()
  
  const data = await pdfParse(buffer)
  
  // Split by page markers if available
  const pages = extractPages(data.text, data.numpages)
  
  return {
    text: data.text,
    pages,
    pageCount: data.numpages,
    metadata: {
      title: data.info?.Title,
      author: data.info?.Author,
      subject: data.info?.Subject,
      creator: data.info?.Creator,
      creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
      modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined,
    }
  }
}

/**
 * Parse a PDF file from base64
 */
export async function parsePdfBase64(base64: string): Promise<ParsedDocument> {
  const buffer = Buffer.from(base64, 'base64')
  return parsePdfBuffer(buffer)
}

/**
 * Extract individual pages from PDF text
 * This is a heuristic - different PDFs may have different formats
 */
function extractPages(fullText: string, pageCount: number): string[] {
  if (pageCount <= 1) {
    return [fullText]
  }
  
  // Try to detect page boundaries using common patterns
  const pagePatterns = [
    /\n\s*Page\s+\d+\s*(of\s+\d+)?\s*\n/gi,
    /\n\s*-\s*\d+\s*-\s*\n/g,
    /\f/g, // Form feed character (common in PDFs)
  ]
  
  for (const pattern of pagePatterns) {
    const pages = fullText.split(pattern).filter(p => p.trim().length > 0)
    if (pages.length >= pageCount * 0.5) { // At least half the expected pages
      return pages
    }
  }
  
  // Fallback: split evenly by character count
  const charsPerPage = Math.ceil(fullText.length / pageCount)
  const pages: string[] = []
  
  for (let i = 0; i < pageCount; i++) {
    const start = i * charsPerPage
    const end = Math.min((i + 1) * charsPerPage, fullText.length)
    pages.push(fullText.slice(start, end))
  }
  
  return pages
}

/**
 * Clean extracted text
 */
export function cleanExtractedText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/[\t ]+/g, ' ')
    // Normalize newlines
    .replace(/\r\n/g, '\n')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove page numbers and headers/footers that are just numbers
    .replace(/^\s*\d+\s*$/gm, '')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Final trim
    .trim()
}

/**
 * Check if file is a PDF based on magic bytes
 */
export function isPdf(buffer: Buffer): boolean {
  // PDF magic bytes: %PDF-
  return buffer.length >= 4 && 
         buffer[0] === 0x25 && 
         buffer[1] === 0x50 && 
         buffer[2] === 0x44 && 
         buffer[3] === 0x46
}

