'use server'

/**
 * ABBEY OS - Legal Brain: Query Server Actions
 * 
 * Server actions for querying the Legal Brain
 */

import {
  askLegalBrain,
  analyzeRefinanceOptions,
  analyzeExpansionPotential,
  scanLeaseRentReviews,
  checkCovenantCompliance,
  LegalBrainResponse,
} from '@/lib/legal-brain'

// ============================================
// GENERAL QUERY
// ============================================

export interface AskQuestionInput {
  question: string
  propertyId?: string
  documentTypes?: string[]
}

export async function askQuestion(input: AskQuestionInput): Promise<LegalBrainResponse> {
  return askLegalBrain(input.question, {
    propertyId: input.propertyId,
    documentTypes: input.documentTypes,
    query: input.question,
  })
}

// ============================================
// SPECIALIZED AGENTS
// ============================================

/**
 * Refinance Hawk - Analyze mortgage for refinancing opportunities
 */
export async function runRefinanceAnalysis(propertyId: string): Promise<LegalBrainResponse> {
  return analyzeRefinanceOptions(propertyId)
}

/**
 * Expansion Scout - Check if development work is possible
 */
export async function runExpansionAnalysis(
  propertyId: string,
  proposedWork: string
): Promise<LegalBrainResponse> {
  return analyzeExpansionPotential(propertyId, proposedWork)
}

/**
 * Lease Guardian - Scan for upcoming rent reviews
 */
export async function runLeaseReviewScan(daysAhead: number = 90): Promise<LegalBrainResponse> {
  return scanLeaseRentReviews(daysAhead)
}

/**
 * Covenant Checker - Quick compliance check
 */
export async function runCovenantCheck(
  propertyId: string,
  proposedAction: string
): Promise<LegalBrainResponse> {
  return checkCovenantCompliance(propertyId, proposedAction)
}

// ============================================
// QUICK SUGGESTIONS
// ============================================

export interface QuickSuggestion {
  id: string
  question: string
  category: 'refinance' | 'expansion' | 'lease' | 'covenant' | 'general'
  icon: string
}

export async function getQuickSuggestions(): Promise<QuickSuggestion[]> {
  return [
    {
      id: '1',
      question: 'Can we refinance The Grand Hotel mortgage?',
      category: 'refinance',
      icon: '💰',
    },
    {
      id: '2',
      question: 'What are the early repayment charges on our mortgages?',
      category: 'refinance',
      icon: '📊',
    },
    {
      id: '3',
      question: 'Can we add an extension to the cafe building?',
      category: 'expansion',
      icon: '🏗️',
    },
    {
      id: '4',
      question: 'Are there height restrictions on any properties?',
      category: 'covenant',
      icon: '📏',
    },
    {
      id: '5',
      question: 'When is the next rent review for commercial leases?',
      category: 'lease',
      icon: '📅',
    },
    {
      id: '6',
      question: 'Can we change the use class of the ground floor flat?',
      category: 'covenant',
      icon: '🔄',
    },
    {
      id: '7',
      question: 'What are the break clause dates in our leases?',
      category: 'lease',
      icon: '🚪',
    },
    {
      id: '8',
      question: 'Are there any restrictive covenants limiting business use?',
      category: 'covenant',
      icon: '⚠️',
    },
  ]
}

// ============================================
// AUTOMATED DAILY SCAN
// ============================================

export interface AlertItem {
  type: 'rent_review' | 'break_clause' | 'mortgage_term' | 'covenant_breach' | 'certificate_expiry'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  dueDate?: string
  propertyName?: string
  documentName?: string
  suggestedAction?: string
}

/**
 * Run automated daily scan and return alerts
 * This would typically be called by a cron job
 */
export async function runDailyScan(): Promise<AlertItem[]> {
  const alerts: AlertItem[] = []
  
  try {
    // Scan for lease rent reviews in next 90 days
    const leaseReview = await scanLeaseRentReviews(90)
    
    // Parse the response for actionable items
    // In production, you'd use structured output from GPT-4
    if (leaseReview.answer && !leaseReview.answer.includes("couldn't find")) {
      alerts.push({
        type: 'rent_review',
        severity: 'warning',
        title: 'Upcoming Rent Reviews Detected',
        description: leaseReview.answer.slice(0, 200) + '...',
        suggestedAction: 'Review lease terms and prepare for negotiations',
      })
    }

    // Add more scans here (mortgage terms, certificate expiries, etc.)

  } catch (error) {
    console.error('[Legal Brain] Daily scan error:', error)
  }

  return alerts
}

