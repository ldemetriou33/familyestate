'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Building2, DollarSign, FileText, CheckCircle2 } from 'lucide-react'

interface OnboardingData {
  step: number
  familyName: string
  currency: 'USD' | 'GBP' | 'EUR'
  entities: Array<{ name: string; type: string }>
  assets: Array<{
    name: string
    location: string
    currency: string
    valuation: number
    principalOwnership: number
    minorityOwnership: number
  }>
  debts: Array<{
    creditorName: string
    principal: number
    interestRate: number
    debtType: string
    currency: string
  }>
}

export default function OnboardingPage() {
  const router = useRouter()
  const [data, setData] = useState<OnboardingData>({
    step: 1,
    familyName: '',
    currency: 'GBP',
    entities: [],
    assets: [],
    debts: [],
  })
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (data.step < 4) {
      setData({ ...data, step: data.step + 1 })
    }
  }

  const handleBack = () => {
    if (data.step > 1) {
      setData({ ...data, step: data.step - 1 })
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Create family
      const familyResponse = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.familyName,
          currency: data.currency,
        }),
      })

      if (!familyResponse.ok) throw new Error('Failed to create family')
      const { family } = await familyResponse.json()

      // Create entities
      for (const entity of data.entities) {
        await fetch('/api/entities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            family_id: family.id,
            name: entity.name,
            type: entity.type,
          }),
        })
      }

      // Create assets and debts
      for (const asset of data.assets) {
        const assetResponse = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            family_id: family.id,
            ...asset,
          }),
        })

        if (assetResponse.ok) {
          const { asset: createdAsset } = await assetResponse.json()
          // Link debts to assets
          const assetDebts = data.debts.filter((_, index) => index < data.assets.length)
          for (const debt of assetDebts) {
            await fetch('/api/debts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                family_id: family.id,
                asset_id: createdAsset.id,
                ...debt,
              }),
            })
          }
        }
      }

      router.push('/?family=' + family.id)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Failed to complete onboarding. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step <= data.step
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 text-slate-400'
                  }`}
                >
                  {step < data.step ? <CheckCircle2 className="w-6 h-6" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-24 h-0.5 mx-2 ${
                      step < data.step ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Family Info</span>
            <span>Entities</span>
            <span>Assets</span>
            <span>Review</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {data.step === 1 && <Step1FamilyInfo data={data} setData={setData} />}
          {data.step === 2 && <Step2Entities data={data} setData={setData} />}
          {data.step === 3 && <Step3Assets data={data} setData={setData} />}
          {data.step === 4 && <Step4Review data={data} />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={data.step === 1}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {data.step < 4 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step1FamilyInfo({
  data,
  setData,
}: {
  data: OnboardingData
  setData: (data: OnboardingData) => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Family Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Family/Estate Name
          </label>
          <input
            type="text"
            value={data.familyName}
            onChange={(e) => setData({ ...data, familyName: e.target.value })}
            placeholder="e.g., The Smith Family Trust"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Portfolio Currency
          </label>
          <select
            value={data.currency}
            onChange={(e) => setData({ ...data, currency: e.target.value as 'USD' | 'GBP' | 'EUR' })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="GBP">GBP (£)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function Step2Entities({
  data,
  setData,
}: {
  data: OnboardingData
  setData: (data: OnboardingData) => void
}) {
  const addEntity = () => {
    setData({
      ...data,
      entities: [...data.entities, { name: '', type: 'LTD' }],
    })
  }

  const updateEntity = (index: number, field: string, value: string) => {
    const entities = [...data.entities]
    entities[index] = { ...entities[index], [field]: value }
    setData({ ...data, entities })
  }

  const removeEntity = (index: number) => {
    setData({
      ...data,
      entities: data.entities.filter((_, i) => i !== index),
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Legal Entities</h2>
      <p className="text-slate-600 mb-4">
        Add the legal entities that hold your assets (companies, trusts, etc.)
      </p>
      <div className="space-y-4">
        {data.entities.map((entity, index) => (
          <div key={index} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                value={entity.name}
                onChange={(e) => updateEntity(index, 'name', e.target.value)}
                placeholder="e.g., MAD Ltd"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
              <select
                value={entity.type}
                onChange={(e) => updateEntity(index, 'type', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="LTD">LTD</option>
                <option value="TRUST">Trust</option>
                <option value="PERSONAL">Personal</option>
                <option value="FOUNDATION">Foundation</option>
              </select>
            </div>
            <button
              onClick={() => removeEntity(index)}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addEntity}
          className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
        >
          + Add Entity
        </button>
      </div>
    </div>
  )
}

function Step3Assets({
  data,
  setData,
}: {
  data: OnboardingData
  setData: (data: OnboardingData) => void
}) {
  const addAsset = () => {
    setData({
      ...data,
      assets: [
        ...data.assets,
        {
          name: '',
          location: '',
          currency: data.currency,
          valuation: 0,
          principalOwnership: 100,
          minorityOwnership: 0,
        },
      ],
    })
  }

  const updateAsset = (index: number, field: string, value: any) => {
    const assets = [...data.assets]
    assets[index] = { ...assets[index], [field]: value }
    setData({ ...data, assets })
  }

  const removeAsset = (index: number) => {
    setData({
      ...data,
      assets: data.assets.filter((_, i) => i !== index),
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Assets</h2>
      <p className="text-slate-600 mb-4">Add your properties and assets</p>
      <div className="space-y-6">
        {data.assets.map((asset, index) => (
          <div key={index} className="border border-slate-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={asset.name}
                  onChange={(e) => updateAsset(index, 'name', e.target.value)}
                  placeholder="e.g., Abbey Point Hotel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={asset.location}
                  onChange={(e) => updateAsset(index, 'location', e.target.value)}
                  placeholder="e.g., London, UK"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Valuation</label>
                <input
                  type="number"
                  value={asset.valuation || ''}
                  onChange={(e) => updateAsset(index, 'valuation', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                <select
                  value={asset.currency}
                  onChange={(e) => updateAsset(index, 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Principal Ownership (%)
                </label>
                <input
                  type="number"
                  value={asset.principalOwnership}
                  onChange={(e) => updateAsset(index, 'principalOwnership', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minority Ownership (%)
                </label>
                <input
                  type="number"
                  value={asset.minorityOwnership}
                  onChange={(e) => updateAsset(index, 'minorityOwnership', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => removeAsset(index)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove Asset
            </button>
          </div>
        ))}
        <button
          onClick={addAsset}
          className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
        >
          + Add Asset
        </button>
      </div>
    </div>
  )
}

function Step4Review({ data }: { data: OnboardingData }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Review & Complete</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Family: {data.familyName}</h3>
          <p className="text-slate-600">Currency: {data.currency}</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">
            Entities ({data.entities.length})
          </h3>
          <ul className="list-disc list-inside text-slate-600">
            {data.entities.map((entity, index) => (
              <li key={index}>
                {entity.name} ({entity.type})
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Assets ({data.assets.length})</h3>
          <ul className="list-disc list-inside text-slate-600">
            {data.assets.map((asset, index) => (
              <li key={index}>
                {asset.name} - {asset.currency} {asset.valuation.toLocaleString()} (
                {asset.principalOwnership}% / {asset.minorityOwnership}%)
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

