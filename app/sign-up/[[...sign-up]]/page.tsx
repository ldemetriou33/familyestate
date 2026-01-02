import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bloomberg-dark">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-bloomberg-text mb-2">Abbey OS</h1>
          <p className="text-bloomberg-textMuted">Strategic Core v2.0</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-bloomberg-panel border border-bloomberg-border',
              headerTitle: 'text-bloomberg-text',
              headerSubtitle: 'text-bloomberg-textMuted',
              socialButtonsBlockButton: 'bg-bloomberg-darker border border-bloomberg-border text-bloomberg-text hover:bg-bloomberg-panel',
              formButtonPrimary: 'bg-bloomberg-accent hover:bg-bloomberg-accentHover',
              formFieldInput: 'bg-bloomberg-darker border-bloomberg-border text-bloomberg-text',
              formFieldLabel: 'text-bloomberg-textMuted',
              footerActionLink: 'text-bloomberg-accent hover:text-bloomberg-accentHover',
            },
          }}
        />
      </div>
    </div>
  )
}

