'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Plus, 
  Cloud, 
  Sun, 
  CloudRain, 
  Snowflake,
  Wind,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  X
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getDailyLogs, createDailyLog } from '@/actions/portfolio'

type DailyLog = Awaited<ReturnType<typeof getDailyLogs>>[0]

const weatherOptions = [
  { value: 'sunny', icon: Sun, label: 'Sunny', color: 'text-amber-500' },
  { value: 'cloudy', icon: Cloud, label: 'Cloudy', color: 'text-gray-400' },
  { value: 'rainy', icon: CloudRain, label: 'Rainy', color: 'text-blue-400' },
  { value: 'snowy', icon: Snowflake, label: 'Snowy', color: 'text-cyan-300' },
  { value: 'windy', icon: Wind, label: 'Windy', color: 'text-slate-400' },
]

const moodOptions = [
  { value: 'great', emoji: '😊', label: 'Great', color: 'text-emerald-500' },
  { value: 'good', emoji: '🙂', label: 'Good', color: 'text-green-400' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'text-gray-400' },
  { value: 'challenging', emoji: '😤', label: 'Challenging', color: 'text-amber-500' },
  { value: 'difficult', emoji: '😓', label: 'Difficult', color: 'text-red-400' },
]

export function DailyLogWidget() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [newNote, setNewNote] = useState('')
  const [selectedWeather, setSelectedWeather] = useState<string>('')
  const [selectedMood, setSelectedMood] = useState<string>('')

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      const data = await getDailyLogs(undefined, 7)
      setLogs(data)
    } catch (error) {
      console.error('Failed to load daily logs:', error)
    }
    setLoading(false)
  }

  const handleAddLog = async () => {
    if (!newNote.trim()) return

    setSaving(true)
    try {
      await createDailyLog({
        date: new Date(),
        notes: newNote,
        weather: selectedWeather || undefined,
        mood: selectedMood || undefined,
      })
      
      // Refresh logs
      await loadLogs()
      
      // Reset form
      setNewNote('')
      setSelectedWeather('')
      setSelectedMood('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add log:', error)
    }
    setSaving(false)
  }

  const todayLog = logs.find(log => {
    const logDate = new Date(log.date)
    const today = new Date()
    return logDate.toDateString() === today.toDateString()
  })

  const getWeatherIcon = (weather: string | null | undefined) => {
    const option = weatherOptions.find(w => w.value === weather)
    if (!option) return null
    const Icon = option.icon
    return <Icon className={`w-4 h-4 ${option.color}`} />
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <Card className="border-[var(--border-primary)]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
            Daily Context
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              {showAddForm ? (
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              ) : (
                <Plus className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-[var(--bg-secondary)] rounded-lg space-y-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What's happening today? (e.g., 'Rainy day, slow footfall' or 'Boiler broke in Flat 4')"
              rows={2}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
            />
            
            <div className="flex flex-wrap gap-4">
              {/* Weather Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">Weather:</span>
                <div className="flex gap-1">
                  {weatherOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSelectedWeather(selectedWeather === option.value ? '' : option.value)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedWeather === option.value
                            ? 'bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]'
                            : 'hover:bg-[var(--bg-tertiary)]'
                        }`}
                        title={option.label}
                      >
                        <Icon className={`w-4 h-4 ${option.color}`} />
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Mood Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">Mood:</span>
                <div className="flex gap-1">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedMood(selectedMood === option.value ? '' : option.value)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedMood === option.value
                          ? 'bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]'
                          : 'hover:bg-[var(--bg-tertiary)]'
                      }`}
                      title={option.label}
                    >
                      <span className="text-sm">{option.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleAddLog}
                disabled={!newNote.trim() || saving}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 text-sm"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                Add Note
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && (
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-muted)]">No context notes yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-sm text-[var(--accent)] hover:underline"
            >
              Add your first note
            </button>
          </div>
        )}

        {/* Today's Log (Compact View) */}
        {!loading && !expanded && todayLog && (
          <div className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
            {todayLog.weatherNote && getWeatherIcon(todayLog.weatherNote)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)]">{todayLog.notes}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Today</p>
            </div>
          </div>
        )}

        {/* No Today's Log */}
        {!loading && !expanded && !todayLog && logs.length > 0 && (
          <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-dashed border-[var(--border-primary)]">
            <p className="text-sm text-[var(--text-muted)] text-center">
              No note for today yet.{' '}
              <button
                onClick={() => setShowAddForm(true)}
                className="text-[var(--accent)] hover:underline"
              >
                Add one
              </button>
            </p>
          </div>
        )}

        {/* Expanded View - All Logs */}
        {!loading && expanded && logs.length > 0 && (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg"
              >
                {log.weatherNote && getWeatherIcon(log.weatherNote)}
                {!log.weatherNote && (
                  <div className="w-4 h-4" /> 
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">{log.notes}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(log.date)}</p>
                    {log.property && (
                      <span className="text-xs px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[var(--text-muted)]">
                        {log.property.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

