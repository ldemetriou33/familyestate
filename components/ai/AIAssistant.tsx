'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  Loader2,
  Maximize2,
  Minimize2,
  Brain,
  BarChart3,
  Zap
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  insights?: AIInsight[]
}

interface AIInsight {
  type: 'suggestion' | 'warning' | 'opportunity' | 'prediction'
  title: string
  description: string
  impact?: string
  action?: string
}

// Simulated AI responses based on context
const getAIResponse = async (query: string): Promise<{ content: string; insights?: AIInsight[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
  
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('occupancy') || lowerQuery.includes('hotel')) {
    return {
      content: "Based on current data, your hotel occupancy is at 78%. This is 5% above the seasonal average. I've identified a few opportunities to optimize further.",
      insights: [
        {
          type: 'opportunity',
          title: 'Dynamic Pricing Opportunity',
          description: 'Weekend demand is 23% higher than weekdays. Consider implementing dynamic pricing.',
          impact: '+£2,400/month estimated',
          action: 'Review rate proposals'
        },
        {
          type: 'prediction',
          title: 'Forecast: Next 14 Days',
          description: 'Expected occupancy to reach 85% due to upcoming local events.',
          impact: 'High demand period',
        }
      ]
    }
  }
  
  if (lowerQuery.includes('arrears') || lowerQuery.includes('rent') || lowerQuery.includes('tenant')) {
    return {
      content: "I've analyzed your rent collection. Total arrears stand at £4,250 across 3 tenants. Here's my assessment:",
      insights: [
        {
          type: 'warning',
          title: 'High Risk: Flat 4B',
          description: 'Sarah Connor is 45 days overdue (£1,350). Payment history shows this is unusual.',
          impact: 'Action needed within 7 days',
          action: 'Send reminder'
        },
        {
          type: 'suggestion',
          title: 'Preventive Measure',
          description: 'Consider setting up GoCardless direct debits for new tenants to reduce future arrears.',
          action: 'View Integrations'
        }
      ]
    }
  }
  
  if (lowerQuery.includes('cafe') || lowerQuery.includes('f&b') || lowerQuery.includes('sales')) {
    return {
      content: "The cafe is performing at 94% of target this week. I've noticed some patterns that could help:",
      insights: [
        {
          type: 'opportunity',
          title: 'Peak Hour Optimization',
          description: 'Your busiest period (11am-2pm) has 12% stockouts on popular items.',
          impact: 'Est. £180/week lost sales',
          action: 'Adjust inventory'
        },
        {
          type: 'prediction',
          title: 'Weather Impact',
          description: 'Rain forecast this weekend typically increases indoor cafe traffic by 18%.',
          impact: 'Staff accordingly',
        }
      ]
    }
  }
  
  if (lowerQuery.includes('cash') || lowerQuery.includes('money') || lowerQuery.includes('finance')) {
    return {
      content: "Current cash position is healthy at £125,450. Here's my financial overview:",
      insights: [
        {
          type: 'suggestion',
          title: 'Upcoming Outflows',
          description: 'Mortgage payments of £18,500 due in 8 days. Ensure operating account has coverage.',
          impact: 'Plan ahead',
        },
        {
          type: 'opportunity',
          title: 'Interest Optimization',
          description: 'You have £50,000 in a low-interest reserve account. Consider a notice account for +0.8% APY.',
          impact: '+£400/year',
        }
      ]
    }
  }
  
  if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
    return {
      content: "I'm Abbey AI, your intelligent property management assistant. Here's what I can help with:",
      insights: [
        {
          type: 'suggestion',
          title: '📊 Portfolio Analysis',
          description: 'Ask me about occupancy, revenue, arrears, or performance across any property.',
        },
        {
          type: 'suggestion',
          title: '🔮 Predictions & Forecasts',
          description: 'I can predict demand, cash flow, and identify upcoming issues.',
        },
        {
          type: 'suggestion',
          title: '💡 Recommendations',
          description: 'Get AI-powered suggestions for pricing, operations, and cost savings.',
        },
        {
          type: 'suggestion',
          title: '⚠️ Alerts & Risks',
          description: 'I proactively monitor for anomalies, risks, and urgent issues.',
        }
      ]
    }
  }
  
  // Default response
  return {
    content: "I've analyzed your portfolio data. Based on current metrics, your properties are performing well overall. Is there a specific area you'd like me to focus on - hotel occupancy, cafe sales, rental arrears, or cash flow?",
    insights: [
      {
        type: 'suggestion',
        title: 'Quick Actions Available',
        description: 'Try asking about specific metrics like "How is the hotel doing?" or "Show me arrears status"',
      }
    ]
  }
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  onAction?: (action: string) => void
}

export function AIAssistant({ isOpen, onClose, onAction }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Abbey AI, your intelligent property management assistant. I can help you analyze your portfolio, predict trends, and find opportunities. What would you like to know?",
      timestamp: new Date(),
      insights: [
        {
          type: 'suggestion',
          title: 'Try asking me:',
          description: '"How is the hotel performing?" or "Show me arrears" or "What should I focus on today?"',
        }
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await getAIResponse(input)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        insights: response.insights
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI response error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'prediction': return <BarChart3 className="w-4 h-4 text-purple-500" />
      default: return <Lightbulb className="w-4 h-4 text-blue-500" />
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed z-50 transition-all duration-300 ${
      isExpanded 
        ? 'inset-4' 
        : 'bottom-4 right-4 w-[420px] h-[600px]'
    }`}>
      <div className="w-full h-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl flex flex-col overflow-hidden ai-glow">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[var(--accent)] to-blue-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Abbey AI
                <Sparkles className="w-4 h-4" />
              </h3>
              <p className="text-xs text-white/70">Intelligent Property Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.role === 'user' ? 'user-bubble' : 'ai-bubble'} p-4`}>
                <p className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                  {message.content}
                </p>
                
                {/* AI Insights */}
                {message.insights && message.insights.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.insights.map((insight, idx) => (
                      <div 
                        key={idx}
                        className="p-3 bg-[var(--bg-primary)]/50 rounded-lg border border-[var(--border-primary)]"
                      >
                        <div className="flex items-start gap-2">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{insight.title}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{insight.description}</p>
                            {insight.impact && (
                              <p className="text-xs font-medium text-[var(--accent)] mt-1">{insight.impact}</p>
                            )}
                            {insight.action && onAction && (
                              <button
                                onClick={() => onAction(insight.action!)}
                                className="mt-2 text-xs px-3 py-1 bg-[var(--accent)] text-white rounded-full hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1"
                              >
                                <Zap className="w-3 h-3" />
                                {insight.action}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-[var(--text-muted)] mt-2">
                  {message.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="ai-bubble p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                <span className="text-sm text-[var(--text-muted)]">Analyzing...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-[var(--border-primary)] flex gap-2 overflow-x-auto">
          {['Hotel status', 'Arrears check', 'Cash flow', 'What should I focus on?'].map(action => (
            <button
              key={action}
              onClick={() => {
                setInput(action)
                setTimeout(handleSend, 100)
              }}
              className="px-3 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors whitespace-nowrap"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[var(--border-primary)]">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your portfolio..."
              className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Floating AI Button
export function AIFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[var(--accent)] to-blue-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40 ai-glow"
    >
      <Brain className="w-7 h-7 text-white" />
    </button>
  )
}

export default AIAssistant

