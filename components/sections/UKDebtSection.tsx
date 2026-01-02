'use client'

import { CreditCard, AlertTriangle, Calendar, TrendingDown } from 'lucide-react'

export default function UKDebtSection() {
  const metrics = [
    { label: 'Total Debt', value: '£45.2M', change: '-£2.1M', trend: 'down', icon: CreditCard },
    { label: 'Outstanding', value: '£38.7M', change: '-£1.8M', trend: 'down', icon: TrendingDown },
    { label: 'Due This Month', value: '£2.4M', change: '+£0.3M', trend: 'up', icon: Calendar },
    { label: 'Overdue', value: '£125K', change: '-£45K', trend: 'down', icon: AlertTriangle },
  ]

  const debtItems = [
    { creditor: 'Barclays Bank', type: 'Term Loan', principal: 12500000, outstanding: 10250000, rate: 4.25, dueDate: '2025-06-15', status: 'Current' },
    { creditor: 'HSBC Commercial', type: 'Revolving Credit', principal: 8500000, outstanding: 7200000, rate: 3.75, dueDate: '2024-12-31', status: 'Current' },
    { creditor: 'Lloyds Banking', type: 'Mortgage', principal: 15200000, outstanding: 12800000, rate: 5.10, dueDate: '2026-03-20', status: 'Current' },
    { creditor: 'NatWest Group', type: 'Term Loan', principal: 6800000, outstanding: 5500000, rate: 4.50, dueDate: '2025-09-10', status: 'Current' },
    { creditor: 'Santander UK', type: 'Equipment Finance', principal: 2400000, outstanding: 1850000, rate: 6.25, dueDate: '2024-11-30', status: 'Due Soon' },
    { creditor: 'Various Suppliers', type: 'Trade Credit', principal: 125000, outstanding: 125000, rate: 0.00, dueDate: '2024-10-15', status: 'Overdue' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Current':
        return 'text-bloomberg-success'
      case 'Due Soon':
        return 'text-bloomberg-warning'
      case 'Overdue':
        return 'text-bloomberg-danger'
      default:
        return 'text-bloomberg-textMuted'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          // For debt metrics, 'down' trend is positive (less debt is good)
          // For "Due This Month", an increase is negative (more debt due is bad)
          const isPositive = metric.trend === 'down'
          
          return (
            <div
              key={index}
              className="bg-bloomberg-panel border border-bloomberg-border rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${isPositive ? 'text-bloomberg-success' : 'text-bloomberg-warning'}`} />
                <span className={`text-xs font-medium ${
                  isPositive ? 'text-bloomberg-success' : 'text-bloomberg-warning'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-sm text-bloomberg-textMuted mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-bloomberg-text">{metric.value}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-bloomberg-panel border border-bloomberg-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-bloomberg-border">
          <h3 className="text-lg font-semibold text-bloomberg-text">Debt Obligations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bloomberg-darker">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Creditor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Principal</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Outstanding</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bloomberg-border">
              {debtItems.map((item, index) => (
                <tr key={index} className="hover:bg-bloomberg-darker transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-bloomberg-text">{item.creditor}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-bloomberg-textMuted">{item.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-mono text-bloomberg-text">£{(item.principal / 1000000).toFixed(2)}M</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-mono text-bloomberg-text">£{(item.outstanding / 1000000).toFixed(2)}M</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-mono text-bloomberg-text">{item.rate.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-mono text-bloomberg-text">{item.dueDate}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

