'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface OwnershipStructureProps {
  principalEquity: number
  minorityEquity: number
  debt: number
  totalValue: number
}

export default function OwnershipStructure({
  principalEquity,
  minorityEquity,
  debt,
  totalValue,
}: OwnershipStructureProps) {
  const principalPercentage = (principalEquity / totalValue) * 100
  const minorityPercentage = (minorityEquity / totalValue) * 100
  const debtPercentage = (debt / totalValue) * 100

  const data = [
    { name: 'Principal', value: principalPercentage, amount: principalEquity },
    { name: 'Minority Interest', value: minorityPercentage, amount: minorityEquity },
    { name: 'Debt', value: debtPercentage, amount: debt },
  ]

  const COLORS = ['#2563eb', '#64748b', '#475569']

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-slate-900">{data.name}</p>
          <p className="text-xs text-slate-600">
            {data.value.toFixed(1)}% • £{data.payload.amount.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Equity Structure</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-slate-600">{item.name}</span>
            </div>
            <span className="font-medium text-slate-900">
              {item.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

