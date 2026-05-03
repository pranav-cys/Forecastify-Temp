import React from 'react'
import { Package, ShoppingCart, DollarSign, TrendingUp, Tag, Users } from 'lucide-react'

function formatNumber(n) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatCurrency(n) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return '₹' + (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return '₹' + (n / 1_000).toFixed(1) + 'K'
  return '₹' + n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export default function KPICards({ metrics }) {
  if (!metrics || Object.keys(metrics).length === 0) return null

  const cards = [
    {
      label: 'TOTAL ORDERS',
      value: formatNumber(metrics.total_orders),
      icon: Package,
    },
    {
      label: 'QUANTITY',
      value: formatNumber(metrics.total_quantity),
      icon: ShoppingCart,
    },
    {
      label: 'REVENUE',
      value: formatCurrency(metrics.total_revenue),
      icon: DollarSign,
    },
    {
      label: 'PROFIT',
      value: formatCurrency(metrics.total_profit),
      icon: TrendingUp,
    },
    {
      label: 'AVG UNIT PRICE',
      value: formatCurrency(metrics.total_quantity ? metrics.total_revenue / metrics.total_quantity : 0),
      icon: Tag,
    },
    {
      label: 'CUSTOMERS',
      value: formatNumber(metrics.total_customers),
      icon: Users,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <div 
          key={card.label} 
          className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-2 hover:shadow-md transition-all duration-300 animate-slide-up shadow-sm"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-center gap-2 mb-1">
            <card.icon className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
          </div>
          <div className="text-2xl font-display font-bold text-slate-800">{card.value}</div>
        </div>
      ))}
    </div>
  )
}
