'use client'

import { useState } from 'react'
import { X, DollarSign, TrendingUp, TrendingDown, Sparkles, Calendar, Save, RefreshCw } from 'lucide-react'
import { formatGBP } from '@/lib/utils'
import { units, properties } from '@/lib/mock-data/seed'

interface RateManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

interface RateRule {
  id: string
  name: string
  type: 'base' | 'weekend' | 'seasonal' | 'event'
  multiplier: number
  active: boolean
}

interface RoomRate {
  unitId: string
  unitNumber: string
  type: string
  baseRate: number
  currentRate: number
  suggestedRate: number
  occupancyLast30: number
}

export function RateManagerModal({ isOpen, onClose }: RateManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'rates' | 'rules' | 'ai'>('rates')
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [bulkRate, setBulkRate] = useState('')
  
  if (!isOpen) return null

  const hotelProperty = properties.find(p => p.type === 'HOTEL')
  const hotelUnits = units.filter(u => u.propertyId === hotelProperty?.id)

  // Mock rate data
  const roomRates: RoomRate[] = hotelUnits.map(unit => ({
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    type: unit.type || 'Standard',
    baseRate: unit.currentRate || 120,
    currentRate: unit.currentRate || 120,
    suggestedRate: Math.round((unit.currentRate || 120) * (1 + (Math.random() * 0.3 - 0.1))),
    occupancyLast30: Math.round(60 + Math.random() * 35)
  }))

  // Mock rate rules
  const rateRules: RateRule[] = [
    { id: '1', name: 'Weekend Premium', type: 'weekend', multiplier: 1.25, active: true },
    { id: '2', name: 'Summer Peak', type: 'seasonal', multiplier: 1.40, active: true },
    { id: '3', name: 'Winter Low', type: 'seasonal', multiplier: 0.85, active: false },
    { id: '4', name: 'Local Event', type: 'event', multiplier: 1.50, active: false },
    { id: '5', name: 'Last Minute Deal', type: 'base', multiplier: 0.90, active: true },
  ]

  // AI Suggestions
  const aiSuggestions = [
    {
      id: '1',
      title: 'Increase Standard Doubles by 12%',
      reason: 'High demand detected for next 2 weeks based on booking velocity',
      impact: '+£340/week estimated',
      confidence: 92
    },
    {
      id: '2',
      title: 'Apply Weekend Surge (+£25)',
      reason: 'Local festival driving 78% occupancy on Saturday',
      impact: '+£200 this weekend',
      confidence: 88
    },
    {
      id: '3',
      title: 'Reduce Suite Rate by 8%',
      reason: 'Suite occupancy at 45% vs 72% target. Stimulate demand.',
      impact: '+3 bookings expected',
      confidence: 75
    }
  ]

  const toggleRoomSelection = (unitId: string) => {
    setSelectedRooms(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

  const selectAll = () => {
    if (selectedRooms.length === roomRates.length) {
      setSelectedRooms([])
    } else {
      setSelectedRooms(roomRates.map(r => r.unitId))
    }
  }

  const applyBulkRate = () => {
    if (bulkRate && selectedRooms.length > 0) {
      alert(`Applied £${bulkRate} to ${selectedRooms.length} rooms`)
      setBulkRate('')
      setSelectedRooms([])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Rate Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-primary)]">
          {[
            { id: 'rates', label: 'Room Rates', icon: DollarSign },
            { id: 'rules', label: 'Pricing Rules', icon: Calendar },
            { id: 'ai', label: 'AI Suggestions', icon: Sparkles }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'rates' && (
            <div className="space-y-4">
              {/* Bulk Actions */}
              {selectedRooms.length > 0 && (
                <div className="p-3 bg-[var(--accent)]/10 rounded-lg flex items-center gap-4">
                  <span className="text-sm text-[var(--accent)]">
                    {selectedRooms.length} rooms selected
                  </span>
                  <input
                    type="number"
                    value={bulkRate}
                    onChange={(e) => setBulkRate(e.target.value)}
                    placeholder="New rate (£)"
                    className="px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-sm w-32"
                  />
                  <button
                    onClick={applyBulkRate}
                    className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-sm"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setSelectedRooms([])}
                    className="px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Room Rates Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-primary)]">
                      <th className="p-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedRooms.length === roomRates.length}
                          onChange={selectAll}
                          className="rounded border-[var(--border-primary)]"
                        />
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-[var(--text-muted)]">Room</th>
                      <th className="p-3 text-left text-xs font-medium text-[var(--text-muted)]">Type</th>
                      <th className="p-3 text-right text-xs font-medium text-[var(--text-muted)]">Base Rate</th>
                      <th className="p-3 text-right text-xs font-medium text-[var(--text-muted)]">Current Rate</th>
                      <th className="p-3 text-right text-xs font-medium text-[var(--text-muted)]">AI Suggested</th>
                      <th className="p-3 text-right text-xs font-medium text-[var(--text-muted)]">Occ. (30d)</th>
                      <th className="p-3 text-center text-xs font-medium text-[var(--text-muted)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomRates.map(room => {
                      const diff = room.suggestedRate - room.currentRate
                      const diffPercent = ((diff / room.currentRate) * 100).toFixed(1)
                      return (
                        <tr key={room.unitId} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]/50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedRooms.includes(room.unitId)}
                              onChange={() => toggleRoomSelection(room.unitId)}
                              className="rounded border-[var(--border-primary)]"
                            />
                          </td>
                          <td className="p-3 text-sm font-medium text-[var(--text-primary)]">{room.unitNumber}</td>
                          <td className="p-3 text-sm text-[var(--text-muted)]">{room.type}</td>
                          <td className="p-3 text-right text-sm text-[var(--text-muted)]">{formatGBP(room.baseRate)}</td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              defaultValue={room.currentRate}
                              className="w-20 px-2 py-1 text-right text-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <span className={`flex items-center justify-end gap-1 text-sm ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                              {diff > 0 ? <TrendingUp className="w-3 h-3" /> : diff < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                              {formatGBP(room.suggestedRate)}
                              <span className="text-xs">({diff > 0 ? '+' : ''}{diffPercent}%)</span>
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${room.occupancyLast30 > 70 ? 'bg-green-500' : room.occupancyLast30 > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${room.occupancyLast30}%` }}
                                />
                              </div>
                              <span className="text-xs text-[var(--text-muted)]">{room.occupancyLast30}%</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <button className="px-2 py-1 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded hover:bg-[var(--accent)]/20 transition-colors">
                              Apply AI
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              {rateRules.map(rule => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    rule.active 
                      ? 'bg-[var(--bg-secondary)] border-[var(--accent)]/30' 
                      : 'bg-[var(--bg-primary)] border-[var(--border-primary)] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        rule.type === 'weekend' ? 'bg-purple-500/10' :
                        rule.type === 'seasonal' ? 'bg-blue-500/10' :
                        rule.type === 'event' ? 'bg-amber-500/10' : 'bg-gray-500/10'
                      }`}>
                        <Calendar className={`w-4 h-4 ${
                          rule.type === 'weekend' ? 'text-purple-500' :
                          rule.type === 'seasonal' ? 'text-blue-500' :
                          rule.type === 'event' ? 'text-amber-500' : 'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{rule.name}</p>
                        <p className="text-xs text-[var(--text-muted)] capitalize">{rule.type} pricing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-bold ${rule.multiplier > 1 ? 'text-green-500' : 'text-red-500'}`}>
                        {rule.multiplier > 1 ? '+' : ''}{((rule.multiplier - 1) * 100).toFixed(0)}%
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={rule.active} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full p-4 border-2 border-dashed border-[var(--border-primary)] rounded-lg text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
                + Add New Pricing Rule
              </button>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-[var(--text-primary)]">AI Revenue Optimizer</h3>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  Our AI analyzes booking patterns, local events, competitor pricing, and market demand to suggest optimal rates.
                </p>
              </div>

              {aiSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-[var(--text-primary)]">{suggestion.title}</h4>
                      <p className="text-sm text-[var(--text-muted)] mt-1">{suggestion.reason}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-500 font-medium">{suggestion.impact}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)]">Confidence:</span>
                      <div className="w-24 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--accent)] rounded-full"
                          style={{ width: `${suggestion.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{suggestion.confidence}%</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                        Dismiss
                      </button>
                      <button className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh AI Analysis
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-primary)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Last synced: Just now
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

