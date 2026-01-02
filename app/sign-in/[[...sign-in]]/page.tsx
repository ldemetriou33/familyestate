'use client'

import { SignIn } from '@clerk/nextjs'
import { Building2 } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bloomberg-darker via-bloomberg-panel to-bloomberg-darker flex flex-col items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #00d4ff 2px, transparent 0)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Logo */}
      <Link href="/" className="relative flex items-center gap-3 mb-8 group">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bloomberg-accent to-blue-600 flex items-center justify-center shadow-lg shadow-bloomberg-accent/30 group-hover:shadow-bloomberg-accent/50 transition-all">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-bloomberg-text">Abbey OS</h1>
          <p className="text-sm text-bloomberg-textMuted">Family Estate Autopilot</p>
        </div>
      </Link>

      {/* Sign In Component */}
      <div className="relative">
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-bloomberg-panel border border-bloomberg-border shadow-2xl shadow-black/50',
              headerTitle: 'text-bloomberg-text',
              headerSubtitle: 'text-bloomberg-textMuted',
              socialButtonsBlockButton: 'bg-bloomberg-darker border-bloomberg-border text-bloomberg-text hover:bg-bloomberg-panel',
              socialButtonsBlockButtonText: 'text-bloomberg-text',
              dividerLine: 'bg-bloomberg-border',
              dividerText: 'text-bloomberg-textMuted',
              formFieldLabel: 'text-bloomberg-textMuted',
              formFieldInput: 'bg-bloomberg-darker border-bloomberg-border text-bloomberg-text focus:border-bloomberg-accent focus:ring-bloomberg-accent',
              formButtonPrimary: 'bg-bloomberg-accent hover:bg-bloomberg-accentHover shadow-lg shadow-bloomberg-accent/30',
              footerActionLink: 'text-bloomberg-accent hover:text-bloomberg-accentHover',
              identityPreviewText: 'text-bloomberg-text',
              identityPreviewEditButton: 'text-bloomberg-accent',
              formFieldInputShowPasswordButton: 'text-bloomberg-textMuted hover:text-bloomberg-text',
              otpCodeFieldInput: 'bg-bloomberg-darker border-bloomberg-border text-bloomberg-text',
              formResendCodeLink: 'text-bloomberg-accent',
              alertText: 'text-bloomberg-text',
              footer: 'hidden',
            },
            variables: {
              colorPrimary: '#00d4ff',
              colorBackground: '#16213e',
              colorText: '#e0e0e0',
              colorTextSecondary: '#888888',
              colorInputBackground: '#0f0f23',
              colorInputText: '#e0e0e0',
              borderRadius: '0.75rem',
            },
          }}
          redirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>

      {/* Footer */}
      <p className="relative mt-8 text-sm text-bloomberg-textMuted">
        © 2026 Abbey OS • Family Estate Autopilot
      </p>
    </div>
  )
}
