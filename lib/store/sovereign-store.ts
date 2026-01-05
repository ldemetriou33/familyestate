/**
 * Abbey OS - Sovereign Store (Zustand)
 * Manages relational data: Entities, Assets, Liabilities, Documents
 */

import { create } from 'zustand'
import type { Entity, Asset, Liability, Document } from '@/lib/types/sovereign-schema'

interface SovereignStore {
  // State
  entities: Entity[]
  assets: Asset[]
  liabilities: Liability[]
  documents: Document[]
  
  // Entity CRUD
  addEntity: (entity: Entity) => void
  updateEntity: (id: string, updates: Partial<Entity>) => void
  deleteEntity: (id: string) => void
  
  // Asset CRUD
  addAsset: (asset: Asset) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  deleteAsset: (id: string) => void
  
  // Liability CRUD
  addLiability: (liability: Liability) => void
  updateLiability: (id: string, updates: Partial<Liability>) => void
  deleteLiability: (id: string) => void
  
  // Document CRUD
  addDocument: (document: Document) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
  
  // Relational Queries
  getAssetsByEntity: (entityId: string) => Asset[]
  getLiabilitiesByAsset: (assetId: string) => Liability[]
  getDocumentsByRelated: (relatedId: string, type: 'Asset' | 'Entity') => Document[]
  
  // Aggregations
  getEntityTotals: (entityId: string) => { totalValue: number; totalDebt: number; netEquity: number }
  getPrincipalEquity: () => number
  getMinorityEquity: () => number
  getTotalAUM: () => number
  getCashFlow: () => { monthlyIncome: number; monthlyDebtPayments: number; monthlyFreeCashFlow: number }
  
  // Initialize with seed data
  initialize: (data: { entities: Entity[]; assets: Asset[]; liabilities: Liability[]; documents: Document[] }) => void
}

const convertToGBP = (value: number, currency: string): number => {
  if (currency === 'GBP') return value
  if (currency === 'EUR') return value * 0.85
  if (currency === 'USD') return value * 0.79
  return value
}

export const useSovereignStore = create<SovereignStore>((set, get) => ({
  // Initial state
  entities: [],
  assets: [],
  liabilities: [],
  documents: [],
  
  // Entity CRUD
  addEntity: (entity) => set((state) => ({
    entities: [...state.entities, { ...entity, created_at: new Date().toISOString() }]
  })),
  
  updateEntity: (id, updates) => set((state) => ({
    entities: state.entities.map((e) =>
      e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
    )
  })),
  
  deleteEntity: (id) => set((state) => ({
    entities: state.entities.filter((e) => e.id !== id),
    assets: state.assets.filter((a) => a.entity_id !== id)
  })),
  
  // Asset CRUD
  addAsset: (asset) => set((state) => ({
    assets: [...state.assets, { ...asset, created_at: new Date().toISOString() }]
  })),
  
  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map((a) =>
      a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
    )
  })),
  
  deleteAsset: (id) => set((state) => ({
    assets: state.assets.filter((a) => a.id !== id),
    liabilities: state.liabilities.filter((l) => l.asset_id !== id)
  })),
  
  // Liability CRUD
  addLiability: (liability) => set((state) => ({
    liabilities: [...state.liabilities, { ...liability, created_at: new Date().toISOString() }]
  })),
  
  updateLiability: (id, updates) => set((state) => ({
    liabilities: state.liabilities.map((l) =>
      l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    )
  })),
  
  deleteLiability: (id) => set((state) => ({
    liabilities: state.liabilities.filter((l) => l.id !== id)
  })),
  
  // Document CRUD
  addDocument: (document) => set((state) => ({
    documents: [...state.documents, { ...document, created_at: new Date().toISOString() }]
  })),
  
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map((d) =>
      d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
    )
  })),
  
  deleteDocument: (id) => set((state) => ({
    documents: state.documents.filter((d) => d.id !== id)
  })),
  
  // Relational Queries
  getAssetsByEntity: (entityId) => {
    return get().assets.filter((a) => a.entity_id === entityId)
  },
  
  getLiabilitiesByAsset: (assetId) => {
    return get().liabilities.filter((l) => l.asset_id === assetId)
  },
  
  getDocumentsByRelated: (relatedId, type) => {
    return get().documents.filter((d) => d.related_id === relatedId && d.related_type === type)
  },
  
  // Aggregations
  getEntityTotals: (entityId) => {
    const assets = get().getAssetsByEntity(entityId)
    const totalValue = assets.reduce((sum, a) => sum + convertToGBP(a.valuation, a.currency), 0)
    
    const assetIds = assets.map((a) => a.id)
    const totalDebt = get().liabilities
      .filter((l) => assetIds.includes(l.asset_id))
      .reduce((sum, l) => sum + convertToGBP(l.amount, 'GBP'), 0)
    
    return {
      totalValue,
      totalDebt,
      netEquity: totalValue - totalDebt
    }
  },
  
  getPrincipalEquity: () => {
    let total = 0
    const { entities, assets, liabilities } = get()
    
    for (const entity of entities) {
      const entityAssets = assets.filter((a) => a.entity_id === entity.id)
      const dadShare = entity.shareholders.find((s) => s.name === 'Dad')?.percentage || 0
      
      for (const asset of entityAssets) {
        const assetLiabilities = liabilities.filter((l) => l.asset_id === asset.id)
        const totalDebt = assetLiabilities.reduce((sum, l) => sum + convertToGBP(l.amount, 'GBP'), 0)
        const netValue = convertToGBP(asset.valuation, asset.currency) - totalDebt
        total += (netValue * dadShare) / 100
      }
    }
    
    return total
  },
  
  getMinorityEquity: () => {
    let total = 0
    const { entities, assets, liabilities } = get()
    
    for (const entity of entities) {
      const entityAssets = assets.filter((a) => a.entity_id === entity.id)
      const minorityShare = entity.shareholders
        .filter((s) => s.name !== 'Dad')
        .reduce((sum, s) => sum + s.percentage, 0)
      
      for (const asset of entityAssets) {
        const assetLiabilities = liabilities.filter((l) => l.asset_id === asset.id)
        const totalDebt = assetLiabilities.reduce((sum, l) => sum + convertToGBP(l.amount, 'GBP'), 0)
        const netValue = convertToGBP(asset.valuation, asset.currency) - totalDebt
        total += (netValue * minorityShare) / 100
      }
    }
    
    return total
  },
  
  getTotalAUM: () => {
    const { assets } = get()
    return assets.reduce((sum, a) => sum + convertToGBP(a.valuation, a.currency), 0)
  },
  
  getCashFlow: () => {
    const { assets, liabilities } = get()
    let monthlyIncome = 0
    let monthlyDebtPayments = 0
    
    // Calculate income from assets
    for (const asset of assets) {
      monthlyIncome += asset.revenue_monthly
    }
    
    // Calculate debt payments
    for (const liability of liabilities) {
      if (liability.monthly_payment) {
        monthlyDebtPayments += liability.monthly_payment
      } else if (liability.type === 'Interest Only' || liability.type === 'Equity Release') {
        const annualInterest = liability.amount * (liability.rate / 100)
        monthlyDebtPayments += annualInterest / 12
      } else if (!liability.is_compounding) {
        // Calculate amortized payment (simplified)
        const annualInterest = liability.amount * (liability.rate / 100)
        monthlyDebtPayments += annualInterest / 12
      }
      // Compounding debts (like Oakwood) don't have monthly payments
    }
    
    return {
      monthlyIncome,
      monthlyDebtPayments,
      monthlyFreeCashFlow: monthlyIncome - monthlyDebtPayments
    }
  },
  
  // Initialize with seed data
  initialize: (data) => set({
    entities: data.entities,
    assets: data.assets,
    liabilities: data.liabilities,
    documents: data.documents
  })
}))

