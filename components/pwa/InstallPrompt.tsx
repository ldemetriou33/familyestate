'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if running on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (isIOS) {
      // Show iOS install prompt
      setShowPrompt(true)
      return
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS - show instructions
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-install-dismissed', 'true')
    }
  }

  // Don't show if dismissed this session
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')) {
      setShowPrompt(false)
    }
  }, [])

  if (isInstalled || !showPrompt) {
    return null
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50">
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4 flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Install Abbey OS</h3>
          {isIOS ? (
            <p className="text-xs text-slate-600 mb-2">
              Tap the Share button <span className="font-medium">→</span> Add to Home Screen
            </p>
          ) : (
            <p className="text-xs text-slate-600 mb-2">
              Install this app on your device for a better experience
            </p>
          )}
          {!isIOS && (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Install Now
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-slate-100 rounded transition-colors touch-manipulation"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  )
}

