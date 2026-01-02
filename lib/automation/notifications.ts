// Abbey OS - Notification System
// Handles email, SMS, and webhook notifications

import { Alert, AlertSeverity } from '../types/abbey-os'
import { PredictiveAlert } from '../ai/predictive-alerts'
import { AutomatedAction } from './action-engine'

export type NotificationChannel = 'email' | 'sms' | 'push' | 'webhook' | 'slack'

export interface NotificationPreferences {
  userId: string
  channels: {
    email: boolean
    sms: boolean
    push: boolean
    slack: boolean
  }
  alertTypes: {
    critical: NotificationChannel[]
    warning: NotificationChannel[]
    info: NotificationChannel[]
    predictive: NotificationChannel[]
  }
  quietHours: {
    enabled: boolean
    start: string // "22:00"
    end: string   // "07:00"
    exceptCritical: boolean
  }
  digest: {
    enabled: boolean
    frequency: 'daily' | 'weekly'
    time: string // "09:00"
  }
}

export interface Notification {
  id: string
  type: 'ALERT' | 'ACTION' | 'DIGEST' | 'SYSTEM'
  channel: NotificationChannel
  recipient: string
  subject: string
  body: string
  htmlBody?: string
  priority: 'high' | 'normal' | 'low'
  status: 'pending' | 'sent' | 'failed' | 'delivered'
  sentAt?: Date
  metadata?: Record<string, any>
}

export interface WebhookPayload {
  event: string
  timestamp: string
  data: Record<string, any>
  signature?: string
}

// Default notification preferences
export const DEFAULT_PREFERENCES: NotificationPreferences = {
  userId: 'default',
  channels: {
    email: true,
    sms: false,
    push: true,
    slack: false,
  },
  alertTypes: {
    critical: ['email', 'push'],
    warning: ['email'],
    info: [],
    predictive: ['email'],
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
    exceptCritical: true,
  },
  digest: {
    enabled: true,
    frequency: 'daily',
    time: '09:00',
  },
}

/**
 * Create notification from alert
 */
export function createAlertNotification(
  alert: Alert,
  channel: NotificationChannel,
  recipient: string
): Notification {
  const priorityMap: Record<AlertSeverity, 'high' | 'normal' | 'low'> = {
    CRITICAL: 'high',
    WARNING: 'normal',
    INFO: 'low',
  }

  return {
    id: `notif-${alert.id}-${channel}`,
    type: 'ALERT',
    channel,
    recipient,
    subject: `[Abbey OS] ${alert.severity}: ${alert.title}`,
    body: formatAlertBody(alert),
    htmlBody: formatAlertHtml(alert),
    priority: priorityMap[alert.severity],
    status: 'pending',
    metadata: { alertId: alert.id, severity: alert.severity },
  }
}

/**
 * Create notification from predictive alert
 */
export function createPredictiveNotification(
  alert: PredictiveAlert,
  channel: NotificationChannel,
  recipient: string
): Notification {
  return {
    id: `notif-pred-${alert.id}-${channel}`,
    type: 'ALERT',
    channel,
    recipient,
    subject: `[Abbey OS] 🔮 Prediction: ${alert.title}`,
    body: formatPredictiveBody(alert),
    htmlBody: formatPredictiveHtml(alert),
    priority: alert.severity === 'CRITICAL' ? 'high' : 'normal',
    status: 'pending',
    metadata: { 
      predictiveAlertId: alert.id, 
      daysUntil: alert.daysUntil,
      confidence: alert.confidence,
    },
  }
}

/**
 * Create daily digest notification
 */
export function createDigestNotification(
  recipient: string,
  summary: {
    criticalAlerts: number
    warnings: number
    pendingActions: number
    totalImpact: number
    healthScore: number
  }
): Notification {
  return {
    id: `notif-digest-${Date.now()}`,
    type: 'DIGEST',
    channel: 'email',
    recipient,
    subject: `[Abbey OS] Daily Summary - Health Score: ${summary.healthScore}/100`,
    body: formatDigestBody(summary),
    htmlBody: formatDigestHtml(summary),
    priority: summary.criticalAlerts > 0 ? 'high' : 'normal',
    status: 'pending',
  }
}

/**
 * Create webhook payload
 */
export function createWebhookPayload(
  event: string,
  data: Record<string, any>
): WebhookPayload {
  return {
    event,
    timestamp: new Date().toISOString(),
    data,
    signature: generateWebhookSignature(event, data),
  }
}

/**
 * Check if notification should be sent based on preferences
 */
export function shouldSendNotification(
  severity: AlertSeverity,
  channel: NotificationChannel,
  preferences: NotificationPreferences
): boolean {
  // Check if channel is enabled
  if (!preferences.channels[channel as keyof typeof preferences.channels]) {
    return false
  }

  // Check alert type preferences
  const alertType = severity.toLowerCase() as keyof typeof preferences.alertTypes
  if (!preferences.alertTypes[alertType]?.includes(channel)) {
    return false
  }

  // Check quiet hours
  if (preferences.quietHours.enabled) {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const inQuietHours = isInQuietHours(currentTime, preferences.quietHours.start, preferences.quietHours.end)
    
    if (inQuietHours && !(severity === 'CRITICAL' && preferences.quietHours.exceptCritical)) {
      return false
    }
  }

  return true
}

/**
 * Format helpers
 */
function formatAlertBody(alert: Alert): string {
  return `
Abbey OS Alert

${alert.severity}: ${alert.title}

${alert.message}

Category: ${alert.category}
Time: ${new Date().toLocaleString('en-GB')}

---
Abbey OS - Family Estate Autopilot
  `.trim()
}

function formatAlertHtml(alert: Alert): string {
  const severityColors = {
    CRITICAL: '#ef4444',
    WARNING: '#f59e0b',
    INFO: '#3b82f6',
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 8px; padding: 20px; }
    .header { border-left: 4px solid ${severityColors[alert.severity]}; padding-left: 12px; margin-bottom: 20px; }
    .severity { color: ${severityColors[alert.severity]}; font-weight: bold; font-size: 12px; text-transform: uppercase; }
    .title { font-size: 18px; font-weight: bold; margin-top: 4px; }
    .message { background: #0f0f23; padding: 16px; border-radius: 6px; margin: 16px 0; }
    .meta { font-size: 12px; color: #888; }
    .footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #333; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="severity">${alert.severity}</div>
      <div class="title">${alert.title}</div>
    </div>
    <div class="message">${alert.message}</div>
    <div class="meta">
      Category: ${alert.category}<br>
      Time: ${new Date().toLocaleString('en-GB')}
    </div>
    <div class="footer">
      Abbey OS - Family Estate Autopilot
    </div>
  </div>
</body>
</html>
  `.trim()
}

function formatPredictiveBody(alert: PredictiveAlert): string {
  return `
Abbey OS - Predictive Alert

🔮 ${alert.title}

${alert.message}

Days Until: ${alert.daysUntil}
Confidence: ${(alert.confidence * 100).toFixed(0)}%
Estimated Impact: £${alert.estimatedImpact.toLocaleString()}

Recommendation:
${alert.recommendation}

Preventative Actions:
${alert.preventativeActions.map(a => `• ${a}`).join('\n')}

---
Abbey OS - Family Estate Autopilot
  `.trim()
}

function formatPredictiveHtml(alert: PredictiveAlert): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 8px; padding: 20px; }
    .header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .icon { font-size: 24px; }
    .title { font-size: 18px; font-weight: bold; }
    .message { background: #0f0f23; padding: 16px; border-radius: 6px; margin: 16px 0; }
    .stats { display: flex; gap: 16px; margin: 16px 0; }
    .stat { background: #0f0f23; padding: 12px; border-radius: 6px; flex: 1; text-align: center; }
    .stat-value { font-size: 18px; font-weight: bold; color: #00d4ff; }
    .stat-label { font-size: 11px; color: #888; margin-top: 4px; }
    .actions { margin-top: 16px; }
    .action-item { padding: 8px 0; border-bottom: 1px solid #333; }
    .footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #333; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="icon">🔮</span>
      <span class="title">${alert.title}</span>
    </div>
    <div class="message">${alert.message}</div>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${alert.daysUntil}</div>
        <div class="stat-label">Days Until</div>
      </div>
      <div class="stat">
        <div class="stat-value">${(alert.confidence * 100).toFixed(0)}%</div>
        <div class="stat-label">Confidence</div>
      </div>
      <div class="stat">
        <div class="stat-value">£${alert.estimatedImpact.toLocaleString()}</div>
        <div class="stat-label">Est. Impact</div>
      </div>
    </div>
    <div class="actions">
      <strong>Preventative Actions:</strong>
      ${alert.preventativeActions.map(a => `<div class="action-item">• ${a}</div>`).join('')}
    </div>
    <div class="footer">
      Abbey OS - Family Estate Autopilot
    </div>
  </div>
</body>
</html>
  `.trim()
}

function formatDigestBody(summary: any): string {
  return `
Abbey OS Daily Summary

Portfolio Health Score: ${summary.healthScore}/100

Today's Overview:
• Critical Alerts: ${summary.criticalAlerts}
• Warnings: ${summary.warnings}
• Pending Actions: ${summary.pendingActions}
• Total Impact: £${summary.totalImpact.toLocaleString()}

View full dashboard: https://familyestate.vercel.app

---
Abbey OS - Family Estate Autopilot
  `.trim()
}

function formatDigestHtml(summary: any): string {
  const healthColor = summary.healthScore >= 80 ? '#22c55e' : summary.healthScore >= 60 ? '#f59e0b' : '#ef4444'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 8px; padding: 20px; }
    .health { text-align: center; margin-bottom: 24px; }
    .health-score { font-size: 48px; font-weight: bold; color: ${healthColor}; }
    .health-label { font-size: 14px; color: #888; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .stat { background: #0f0f23; padding: 16px; border-radius: 6px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; }
    .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
    .critical { color: #ef4444; }
    .warning { color: #f59e0b; }
    .cta { display: block; text-align: center; background: #00d4ff; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 24px; }
    .footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #333; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="health">
      <div class="health-score">${summary.healthScore}</div>
      <div class="health-label">Portfolio Health Score</div>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="stat-value critical">${summary.criticalAlerts}</div>
        <div class="stat-label">Critical Alerts</div>
      </div>
      <div class="stat">
        <div class="stat-value warning">${summary.warnings}</div>
        <div class="stat-label">Warnings</div>
      </div>
      <div class="stat">
        <div class="stat-value">${summary.pendingActions}</div>
        <div class="stat-label">Pending Actions</div>
      </div>
      <div class="stat">
        <div class="stat-value">£${Math.round(summary.totalImpact / 1000)}K</div>
        <div class="stat-label">Total Impact</div>
      </div>
    </div>
    <a href="https://familyestate.vercel.app" class="cta">View Dashboard</a>
    <div class="footer">
      Abbey OS - Family Estate Autopilot
    </div>
  </div>
</body>
</html>
  `.trim()
}

function isInQuietHours(current: string, start: string, end: string): boolean {
  if (start < end) {
    return current >= start && current < end
  } else {
    // Overnight quiet hours (e.g., 22:00 - 07:00)
    return current >= start || current < end
  }
}

function generateWebhookSignature(event: string, data: Record<string, any>): string {
  // Simple signature - in production, use HMAC with secret key
  const payload = JSON.stringify({ event, data })
  return Buffer.from(payload).toString('base64').slice(0, 32)
}

