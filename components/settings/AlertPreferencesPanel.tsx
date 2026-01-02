'use client'

import { useState } from 'react'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Moon,
  Clock,
  Save,
  RotateCcw
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { NotificationPreferences, DEFAULT_PREFERENCES } from '@/lib/automation/notifications'

interface AlertPreferencesPanelProps {
  preferences?: NotificationPreferences
  onSave?: (preferences: NotificationPreferences) => void
}

export function AlertPreferencesPanel({ 
  preferences: initialPreferences,
  onSave 
}: AlertPreferencesPanelProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    initialPreferences || DEFAULT_PREFERENCES
  )
  const [hasChanges, setHasChanges] = useState(false)

  const handleChannelToggle = (channel: keyof typeof preferences.channels) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }))
    setHasChanges(true)
  }

  const handleQuietHoursToggle = () => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled: !prev.quietHours.enabled,
      },
    }))
    setHasChanges(true)
  }

  const handleDigestToggle = () => {
    setPreferences(prev => ({
      ...prev,
      digest: {
        ...prev.digest,
        enabled: !prev.digest.enabled,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave?.(preferences)
    setHasChanges(false)
  }

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES)
    setHasChanges(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-5 h-5 text-bloomberg-accent" />
            Alert Preferences
          </CardTitle>
          {hasChanges && (
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1 text-xs text-bloomberg-textMuted hover:text-bloomberg-text flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs bg-bloomberg-accent text-white rounded flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div>
          <h4 className="text-sm font-semibold text-bloomberg-text mb-3">Notification Channels</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleChannelToggle('email')}
              className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                preferences.channels.email
                  ? 'bg-bloomberg-accent/10 border-bloomberg-accent/30'
                  : 'bg-bloomberg-darker border-bloomberg-border hover:border-bloomberg-textMuted'
              }`}
            >
              <Mail className={`w-5 h-5 ${preferences.channels.email ? 'text-bloomberg-accent' : 'text-bloomberg-textMuted'}`} />
              <div className="text-left">
                <p className="text-sm font-medium text-bloomberg-text">Email</p>
                <p className="text-xs text-bloomberg-textMuted">
                  {preferences.channels.email ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </button>

            <button
              onClick={() => handleChannelToggle('sms')}
              className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                preferences.channels.sms
                  ? 'bg-bloomberg-accent/10 border-bloomberg-accent/30'
                  : 'bg-bloomberg-darker border-bloomberg-border hover:border-bloomberg-textMuted'
              }`}
            >
              <MessageSquare className={`w-5 h-5 ${preferences.channels.sms ? 'text-bloomberg-accent' : 'text-bloomberg-textMuted'}`} />
              <div className="text-left">
                <p className="text-sm font-medium text-bloomberg-text">SMS</p>
                <p className="text-xs text-bloomberg-textMuted">
                  {preferences.channels.sms ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </button>

            <button
              onClick={() => handleChannelToggle('push')}
              className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                preferences.channels.push
                  ? 'bg-bloomberg-accent/10 border-bloomberg-accent/30'
                  : 'bg-bloomberg-darker border-bloomberg-border hover:border-bloomberg-textMuted'
              }`}
            >
              <Smartphone className={`w-5 h-5 ${preferences.channels.push ? 'text-bloomberg-accent' : 'text-bloomberg-textMuted'}`} />
              <div className="text-left">
                <p className="text-sm font-medium text-bloomberg-text">Push</p>
                <p className="text-xs text-bloomberg-textMuted">
                  {preferences.channels.push ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </button>

            <button
              onClick={() => handleChannelToggle('slack')}
              className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                preferences.channels.slack
                  ? 'bg-bloomberg-accent/10 border-bloomberg-accent/30'
                  : 'bg-bloomberg-darker border-bloomberg-border hover:border-bloomberg-textMuted'
              }`}
            >
              <svg className={`w-5 h-5 ${preferences.channels.slack ? 'text-bloomberg-accent' : 'text-bloomberg-textMuted'}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-bloomberg-text">Slack</p>
                <p className="text-xs text-bloomberg-textMuted">
                  {preferences.channels.slack ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Alert Type Settings */}
        <div className="pt-4 border-t border-bloomberg-border">
          <h4 className="text-sm font-semibold text-bloomberg-text mb-3">Alert Types</h4>
          <div className="space-y-2">
            {[
              { key: 'critical', label: 'Critical Alerts', color: 'bloomberg-danger' },
              { key: 'warning', label: 'Warnings', color: 'bloomberg-warning' },
              { key: 'info', label: 'Information', color: 'bloomberg-accent' },
              { key: 'predictive', label: 'AI Predictions', color: 'purple-500' },
            ].map(type => (
              <div key={type.key} className="flex items-center justify-between p-3 bg-bloomberg-darker rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${type.color}`} />
                  <span className="text-sm text-bloomberg-text">{type.label}</span>
                </div>
                <div className="flex gap-1">
                  {['email', 'push'].map(channel => {
                    const isActive = preferences.alertTypes[type.key as keyof typeof preferences.alertTypes]?.includes(channel as any)
                    return (
                      <span
                        key={channel}
                        className={`px-2 py-0.5 text-xs rounded ${
                          isActive
                            ? 'bg-bloomberg-accent/20 text-bloomberg-accent'
                            : 'bg-bloomberg-panel text-bloomberg-textMuted'
                        }`}
                      >
                        {channel}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="pt-4 border-t border-bloomberg-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-bloomberg-textMuted" />
              <h4 className="text-sm font-semibold text-bloomberg-text">Quiet Hours</h4>
            </div>
            <button
              onClick={handleQuietHoursToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.quietHours.enabled ? 'bg-bloomberg-accent' : 'bg-bloomberg-darker'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  preferences.quietHours.enabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          {preferences.quietHours.enabled && (
            <div className="p-3 bg-bloomberg-darker rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-bloomberg-textMuted" />
                  <span className="text-bloomberg-textMuted">From</span>
                  <span className="font-mono text-bloomberg-text">{preferences.quietHours.start}</span>
                </div>
                <span className="text-bloomberg-textMuted">to</span>
                <span className="font-mono text-bloomberg-text">{preferences.quietHours.end}</span>
              </div>
              <p className="text-xs text-bloomberg-textMuted mt-2">
                Critical alerts will still come through
              </p>
            </div>
          )}
        </div>

        {/* Daily Digest */}
        <div className="pt-4 border-t border-bloomberg-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-bloomberg-textMuted" />
              <h4 className="text-sm font-semibold text-bloomberg-text">Daily Digest</h4>
            </div>
            <button
              onClick={handleDigestToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.digest.enabled ? 'bg-bloomberg-accent' : 'bg-bloomberg-darker'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  preferences.digest.enabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          {preferences.digest.enabled && (
            <p className="text-xs text-bloomberg-textMuted">
              Receive a summary email at {preferences.digest.time} every day
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

