'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useEstate } from '@/hooks/useEstate'
import type { EstateContextType } from '@/lib/types/estate-state'

const EstateContext = createContext<EstateContextType | undefined>(undefined)

export function EstateProvider({ children }: { children: ReactNode }) {
  const estate = useEstate()

  return <EstateContext.Provider value={estate}>{children}</EstateContext.Provider>
}

export function useEstateContext(): EstateContextType {
  const context = useContext(EstateContext)
  if (!context) {
    throw new Error('useEstateContext must be used within EstateProvider')
  }
  return context
}

