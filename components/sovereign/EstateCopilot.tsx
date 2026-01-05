'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { useSovereignStore } from '@/lib/store/sovereign-store'
import { formatGBP } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function EstateCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Abbey, your estate copilot. Ask me anything about your portfolio, debts, or assets."
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { liabilities, assets, entities, getAssetsByEntity } = useSovereignStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const processQuery = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    // Total exposure to 5.5% rate
    if (lowerQuery.includes('5.5') || lowerQuery.includes('5.5%') || lowerQuery.includes('exposure')) {
      const rate55Liabilities = liabilities.filter((l) => l.rate === 5.5)
      const total = rate55Liabilities.reduce((sum, l) => sum + l.amount, 0)
      const assetNames = rate55Liabilities
        .map((l) => assets.find((a) => a.id === l.asset_id)?.name)
        .filter(Boolean)
        .join(', ')

      return `Your total fixed-rate debt at 5.5% is ${formatGBP(total)} across ${assetNames}.`
    }

    // Assets in entity
    if (lowerQuery.includes('mad ltd') || lowerQuery.includes('dem bro')) {
      const entityName = lowerQuery.includes('mad') ? 'MAD Ltd' : 'Dem Bro Ltd'
      const entity = entities.find((e) => e.name === entityName)
      if (entity) {
        const entityAssets = getAssetsByEntity(entity.id)
        const assetNames = entityAssets.map((a) => a.name).join(', ')
        return `${entityName} owns: ${assetNames}`
      }
    }

    // Debts maturing in next year
    if (lowerQuery.includes('matur') || lowerQuery.includes('next year') || lowerQuery.includes('upcoming')) {
      const now = new Date()
      const twelveMonths = new Date()
      twelveMonths.setMonth(twelveMonths.getMonth() + 12)
      const upcoming = liabilities.filter((l) => {
        const maturity = new Date(l.maturity_date)
        return maturity <= twelveMonths && maturity >= now
      })

      if (upcoming.length === 0) {
        return 'No debts are maturing in the next 12 months.'
      }

      const details = upcoming
        .map((l) => {
          const asset = assets.find((a) => a.id === l.asset_id)
          return `${asset?.name || 'Unknown'}: ${formatGBP(l.amount)} (${l.maturity_date})`
        })
        .join('\n')

      return `The following debts are maturing in the next 12 months:\n${details}`
    }

    // Total debt
    if (lowerQuery.includes('total debt') || lowerQuery.includes('how much debt')) {
      const total = liabilities.reduce((sum, l) => sum + l.amount, 0)
      return `Your total debt across all assets is ${formatGBP(total)}.`
    }

    // Total assets
    if (lowerQuery.includes('total asset') || lowerQuery.includes('total value') || lowerQuery.includes('aum')) {
      const total = assets.reduce((sum, a) => sum + a.valuation, 0)
      return `Your total assets under management (AUM) is ${formatGBP(total)}.`
    }

    // Default response
    return "I can help you with:\n- Total exposure to specific interest rates\n- Assets by entity (MAD Ltd, Dem Bro Ltd)\n- Debts maturing in the next year\n- Total debt and asset values\n\nTry asking: 'What is my total exposure to the 5.5% rate?'"
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response delay
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: processQuery(input)
      }
      setMessages((prev) => [...prev, response])
    }, 500)

    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="Open Estate Copilot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white border border-slate-200 rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">Ask Abbey</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-blue-700 rounded p-1 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your estate..."
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

