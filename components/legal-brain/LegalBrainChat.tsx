'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Sparkles, 
  Scale, 
  FileText,
  Building2,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Brain,
  Target,
  Hammer,
  Calendar,
  Shield
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  askQuestion, 
  runRefinanceAnalysis, 
  runExpansionAnalysis, 
  runLeaseReviewScan,
  runCovenantCheck,
  getQuickSuggestions,
  QuickSuggestion
} from '@/actions/legal-brain-query'
import { LegalBrainResponse } from '@/lib/legal-brain'
import { properties } from '@/lib/mock-data/seed'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: LegalBrainResponse['citations']
  confidence?: number
  timestamp: Date
}

interface Agent {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  action: (params: any) => Promise<LegalBrainResponse>
  requiresProperty?: boolean
  requiresInput?: string
}

const AGENTS: Agent[] = [
  {
    id: 'refinance',
    name: 'Refinance Hawk',
    description: 'Analyze mortgage terms for refinancing opportunities',
    icon: Target,
    color: 'text-emerald-500',
    action: (params) => runRefinanceAnalysis(params.propertyId),
    requiresProperty: true,
  },
  {
    id: 'expansion',
    name: 'Expansion Scout',
    description: 'Check planning permissions and covenants for development',
    icon: Hammer,
    color: 'text-amber-500',
    action: (params) => runExpansionAnalysis(params.propertyId, params.proposedWork),
    requiresProperty: true,
    requiresInput: 'Describe the proposed work (e.g., "Add a floor to the hotel")',
  },
  {
    id: 'lease',
    name: 'Lease Guardian',
    description: 'Scan for upcoming rent reviews and key dates',
    icon: Calendar,
    color: 'text-blue-500',
    action: () => runLeaseReviewScan(90),
  },
  {
    id: 'covenant',
    name: 'Covenant Checker',
    description: 'Quick check if an action is permitted',
    icon: Shield,
    color: 'text-purple-500',
    action: (params) => runCovenantCheck(params.propertyId, params.proposedAction),
    requiresProperty: true,
    requiresInput: 'What action do you want to check?',
  },
]

export function LegalBrainChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState('')
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>([])
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null)
  const [agentInput, setAgentInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load quick suggestions
    getQuickSuggestions().then(setSuggestions)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    }])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const question = input.trim()
    setInput('')

    // Add user message
    addMessage({ role: 'user', content: question })

    setIsLoading(true)
    try {
      const response = await askQuestion({
        question,
        propertyId: selectedProperty || undefined,
      })

      addMessage({
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        confidence: response.confidence,
      })
    } catch (error: any) {
      addMessage({
        role: 'assistant',
        content: `I encountered an error: ${error.message}. Please try again.`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickSuggestion = (question: string) => {
    setInput(question)
  }

  const handleAgentRun = async () => {
    if (!activeAgent || isLoading) return

    const params: any = {
      propertyId: selectedProperty,
      proposedWork: agentInput,
      proposedAction: agentInput,
    }

    // Add user message describing the agent action
    addMessage({
      role: 'user',
      content: `[${activeAgent.name}] ${activeAgent.requiresInput ? agentInput : `Analyzing ${selectedProperty ? properties.find(p => p.id === selectedProperty)?.name : 'all properties'}...`}`,
    })

    setIsLoading(true)
    setActiveAgent(null)
    setAgentInput('')

    try {
      const response = await activeAgent.action(params)

      addMessage({
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        confidence: response.confidence,
      })
    } catch (error: any) {
      addMessage({
        role: 'assistant',
        content: `Agent error: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Main Chat */}
      <Card className="lg:col-span-3 flex flex-col h-[700px]">
        <CardHeader className="border-b border-[var(--border-primary)]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="w-5 h-5 text-[var(--accent)]" />
              Ask the Estate
            </CardTitle>
            <div className="flex items-center gap-3">
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="px-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
              >
                <option value="">All Properties</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="w-16 h-16 text-[var(--accent)]/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Legal Brain Ready
                </h3>
                <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-6">
                  Ask questions about your estate documents - mortgages, leases, 
                  planning permissions, and more. I&apos;ll search through your indexed 
                  documents and provide cited answers.
                </p>
                
                {/* Quick Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {suggestions.slice(0, 4).map(suggestion => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleQuickSuggestion(suggestion.question)}
                      className="p-3 text-left bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent)] transition-colors"
                    >
                      <span className="text-lg mr-2">{suggestion.icon}</span>
                      <span className="text-sm text-[var(--text-primary)]">
                        {suggestion.question}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      message.role === 'user'
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-secondary)] border border-[var(--border-primary)]'
                    }`}
                  >
                    <p className={`text-sm whitespace-pre-wrap ${
                      message.role === 'user' ? 'text-white' : 'text-[var(--text-primary)]'
                    }`}>
                      {message.content}
                    </p>

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-primary)]">
                        <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                          📚 Sources ({message.citations.length})
                        </p>
                        <div className="space-y-1">
                          {message.citations.slice(0, 3).map((citation, i) => (
                            <div
                              key={i}
                              className="text-xs p-2 bg-[var(--bg-tertiary)] rounded"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-3 h-3 text-[var(--accent)]" />
                                <span className="font-medium text-[var(--text-primary)]">
                                  {citation.documentName}
                                </span>
                                {citation.pageNumber && (
                                  <span className="text-[var(--text-muted)]">
                                    p.{citation.pageNumber}
                                  </span>
                                )}
                                <span className={`ml-auto px-1.5 py-0.5 rounded text-xs ${
                                  citation.relevance > 0.8 ? 'bg-green-500/10 text-green-500' :
                                  citation.relevance > 0.7 ? 'bg-amber-500/10 text-amber-500' :
                                  'bg-gray-500/10 text-gray-500'
                                }`}>
                                  {Math.round(citation.relevance * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confidence indicator */}
                    {message.confidence !== undefined && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        {message.confidence > 0.8 ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : message.confidence > 0.6 ? (
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                        <span>
                          Confidence: {Math.round(message.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-[var(--accent)] animate-spin" />
                    <span className="text-sm text-[var(--text-muted)]">
                      Searching documents and reasoning...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Agent Modal */}
          {activeAgent && (
            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 mb-3">
                <activeAgent.icon className={`w-5 h-5 ${activeAgent.color}`} />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{activeAgent.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{activeAgent.description}</p>
                </div>
                <button
                  onClick={() => setActiveAgent(null)}
                  className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  ✕
                </button>
              </div>
              
              {activeAgent.requiresProperty && (
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full mb-3 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value="">Select property...</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}

              {activeAgent.requiresInput && (
                <input
                  type="text"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  placeholder={activeAgent.requiresInput}
                  className="w-full mb-3 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              )}

              <button
                onClick={handleAgentRun}
                disabled={isLoading || (activeAgent.requiresProperty && !selectedProperty)}
                className="w-full py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Run {activeAgent.name}
              </button>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-[var(--border-primary)] flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your legal documents..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Ask
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Agents Sidebar */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Strategic Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent)}
              className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent)] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--bg-tertiary)] rounded-lg">
                  <agent.icon className={`w-5 h-5 ${agent.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] text-sm">
                    {agent.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {agent.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </button>
          ))}

          {/* More Suggestions */}
          <div className="pt-4 border-t border-[var(--border-primary)]">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
              Quick Questions
            </p>
            <div className="space-y-2">
              {suggestions.slice(4).map(suggestion => (
                <button
                  key={suggestion.id}
                  onClick={() => handleQuickSuggestion(suggestion.question)}
                  className="w-full text-left text-xs p-2 bg-[var(--bg-secondary)] rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <span className="mr-1">{suggestion.icon}</span>
                  <span className="text-[var(--text-muted)]">{suggestion.question}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

