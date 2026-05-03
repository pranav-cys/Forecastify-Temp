import React, { useState, useEffect } from 'react'
import { useHistoryStore, useAuthStore, useForecastStore } from '../store'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function HistoryPage() {
  const { history, clearHistory, removeEntry, fetchHistory } = useHistoryStore()
  const { user } = useAuthStore()
  const { setForecastData, setFileName, setForecastDays } = useForecastStore()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (user?.email) {
      fetchHistory(user.email)
    }
  }, [user?.email, fetchHistory])

  const [searchQuery, setSearchQuery] = useState('')

  const safeHistory = Array.isArray(history) ? history : []
  const filteredHistory = safeHistory.filter(h => 
    h.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.bestModel?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleClear = () => {
    if (safeHistory.length === 0) return
    clearHistory(user?.email)
    toast.success('Upload history cleared')
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-slate-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-800 text-lg">Upload History</h1>
          <p className="text-slate-500 text-sm">
            {safeHistory.length} upload{safeHistory.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        {safeHistory.length > 0 && (
          <button onClick={handleClear} className="btn-secondary flex items-center gap-2 text-rose-600 hover:bg-rose-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
        )}
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto">
        {/* Search Bar */}
        {safeHistory.length > 0 && (
          <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search history by file name or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
            />
          </div>
        )}

        {safeHistory.length === 0 ? (
          <div className="card text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🕐</span>
            </div>
            <h2 className="font-display font-bold text-slate-800 mb-2">No uploads yet</h2>
            <p className="text-slate-500 text-sm">
              Your upload history will appear here after you run your first forecast.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.length === 0 && searchQuery ? (
              <div className="text-center py-10 text-slate-500">
                No results found for "{searchQuery}"
              </div>
            ) : (
              filteredHistory.map((entry, i) => (
                <div
                  key={entry.id}
                  onClick={() => {
                    if (entry.forecastData) {
                      setForecastData(entry.forecastData)
                      setFileName(entry.fileName)
                      if (entry.forecastDays) setForecastDays(entry.forecastDays)
                      navigate('/analysis')
                      toast.success('Analysis restored')
                    } else {
                      toast.error('Detailed analysis data not found for this entry')
                    }
                  }}
                  className="card hover:shadow-card-hover transition-all duration-300 flex items-center gap-4 animate-slide-up cursor-pointer group"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {/* Icon */}
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 text-sm truncate">{entry.fileName}</p>
                    {entry.bestModel && (
                      <span className="badge bg-teal-100 text-teal-700 font-mono text-xs">
                        {entry.bestModel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-400">{timeAgo(entry.timestamp)}</span>
                    {entry.dataPoints && (
                      <>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{entry.dataPoints} data points</span>
                      </>
                    )}
                    {entry.forecastPoints && (
                      <>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{entry.forecastPoints} forecast periods</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeEntry(entry.id, user?.email)
                    toast.success('Entry removed')
                  }}
                  className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0 p-1 z-10 relative"
                  title="Remove entry"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )))}
          </div>
        )}

        {safeHistory.length > 0 && (
          <div className="mt-6 text-center text-xs text-slate-400">
            Showing {safeHistory.length} upload{safeHistory.length !== 1 ? 's' : ''} • Stored securely in MySQL database
          </div>
        )}
      </div>
    </div>
  )
}
