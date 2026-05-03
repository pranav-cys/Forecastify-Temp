import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { Bot, LineChart, Zap, BarChart2, Download, Shield, Rocket, Activity, Sparkles, Brain, Target, Calendar } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'Multiple ML Models',
    desc: 'Automatically selects the best model from XGBoost, ARIMA, Prophet, and more based on your data characteristics.',
    color: 'bg-blue-50 border-blue-100 text-blue-600',
    badge: 'AutoML',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: LineChart,
    title: 'Time Series Analysis',
    desc: 'Deep historical analysis with trend decomposition, seasonality detection, and anomaly identification.',
    color: 'bg-teal-50 border-teal-100 text-teal-600',
    badge: 'Analytics',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
  {
    icon: Zap,
    title: 'Real-time Forecasting',
    desc: 'Upload your CSV and get forecasts for up to 90 days in seconds. No configuration needed.',
    color: 'bg-amber-50 border-amber-100 text-amber-600',
    badge: 'Fast',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    icon: BarChart2,
    title: 'Interactive Charts',
    desc: 'Rich visualizations with Plotly and ECharts — line, bar, pie, heatmap, and combined forecast charts.',
    color: 'bg-violet-50 border-violet-100 text-violet-600',
    badge: 'Charts',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    icon: Download,
    title: 'PDF Reports',
    desc: 'Export professional PDF reports with charts, KPIs, and model insights for stakeholder presentations.',
    color: 'bg-rose-50 border-rose-100 text-rose-600',
    badge: 'Export',
    badgeColor: 'bg-rose-100 text-rose-700',
  },
  {
    icon: Shield,
    title: 'Role-based Access',
    desc: 'Secure authentication with user and admin roles. Full upload history tracking per account.',
    color: 'bg-slate-50 border-slate-200 text-slate-600',
    badge: 'Secure',
    badgeColor: 'bg-slate-200 text-slate-700',
  },
]

const models = [
  { name: 'XGBoost', type: 'Gradient Boosting', icon: Rocket, acc: '94%', color: 'text-blue-500' },
  { name: 'ARIMA', type: 'Statistical', icon: Activity, acc: '89%', color: 'text-teal-500' },
  { name: 'Prophet', type: 'Bayesian', icon: Sparkles, acc: '91%', color: 'text-violet-500' },
]

const steps = [
  { step: '01', title: 'Upload CSV', desc: 'Upload your time series data as a CSV file via the Analysis page.' },
  { step: '02', title: 'Model Training', desc: 'Our backend automatically trains multiple ML models and selects the best one.' },
  { step: '03', title: 'Visualize', desc: 'Explore historical trends and forecast projections through interactive charts.' },
  { step: '04', title: 'Export Report', desc: 'Download a professional PDF report with KPIs and model details.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-800 text-lg">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back, {user?.name || 'User'}</p>
        </div>
        <button onClick={() => navigate('/analysis')} className="btn-primary flex items-center gap-2">
          <span>Start Analysis</span> <span>→</span>
        </button>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 rounded-3xl p-10 mb-10 overflow-hidden shadow-lg">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full translate-x-20 -translate-y-20" />
            <div className="absolute bottom-0 left-20 w-60 h-60 bg-teal-300 opacity-10 rounded-full translate-y-20" />
            {/* Grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 shadow-sm border border-white/10">
              <span className="w-2 h-2 bg-teal-300 rounded-full animate-pulse-soft" />
              <span className="text-white text-xs font-semibold uppercase tracking-wider">AI-Powered Forecasting Platform</span>
            </div>
            <h1 className="text-5xl font-display font-bold text-white leading-tight mb-4">
              Predict the Future,<br />
              <span className="text-teal-300">Drive Decisions.</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Forecastify uses state-of-the-art machine learning to transform your historical data into actionable forecasts — with zero ML expertise required.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/analysis')}
                className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm"
              >
                Upload & Forecast →
              </button>
              <button
                onClick={() => navigate('/about')}
                className="bg-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-all text-sm backdrop-blur-sm border border-white/20"
              >
                Meet the Team
              </button>
            </div>
          </div>

          {/* Floating stats */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3">
            {[
              { label: 'Accuracy', value: '94%', icon: Target },
              { label: 'Models', value: '3', icon: Bot },
              { label: 'Max Days', value: '90', icon: Calendar },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 text-white border border-white/10 shadow-xl flex items-center gap-4">
                <div className="p-2 bg-white/20 rounded-xl">
                  <stat.icon className="w-6 h-6 text-teal-200" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold">{stat.value}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-display font-bold text-slate-800">Platform Capabilities</h2>
            <span className="badge bg-blue-100 text-blue-700 shadow-sm border border-blue-200">6 Features</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className={`rounded-2xl border p-6 bg-white hover:shadow-lg transition-all duration-300 group`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${f.color}`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <span className={`badge text-xs shadow-sm border ${f.badgeColor}`}>{f.badge}</span>
                </div>
                <h3 className="font-display font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-10">
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={s.step} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-5 w-10 h-0.5 bg-slate-200 z-10" />
                )}
                <div className="text-3xl font-display font-black text-slate-200 mb-4">{s.step}</div>
                <h3 className="font-display font-bold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ML Models */}
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-6">Supported ML Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {models.map(m => (
              <div key={m.name} className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
                <div className={`mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 ${m.color}`}>
                  <m.icon className="w-6 h-6" />
                </div>
                <div className="font-display font-bold text-slate-800 text-lg mb-1">{m.name}</div>
                <div className="text-xs text-slate-500 mb-4">{m.type}</div>
                <div className="text-xs bg-green-50 text-green-700 font-semibold px-3 py-1.5 rounded-lg inline-block border border-green-100">
                  ~{m.acc} avg accuracy
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl text-white text-center py-12 relative overflow-hidden shadow-xl border border-slate-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h2 className="text-3xl font-display font-bold mb-4 relative z-10">Ready to forecast?</h2>
          <p className="text-slate-400 mb-8 relative z-10 max-w-md mx-auto">Upload your CSV and get AI-powered predictions in seconds. Start making data-driven decisions today.</p>
          <button
            onClick={() => navigate('/analysis')}
            className="btn-primary relative z-10 px-8 py-3.5 shadow-lg"
          >
            Open Analysis →
          </button>
        </div>
      </div>
    </div>
  )
}
