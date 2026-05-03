import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useForecastStore, useHistoryStore, useAuthStore, usePlatformStore, useAdminSettingsStore } from '../store'
import { uploadForecast, parseForecastResponse } from '../api/forecast'
import { BarChart2, Download, Bot, Share2, X, Send } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import LoadingSpinner from '../components/LoadingSpinner'
import KPICards from '../components/KPICards'
import { LineChart, ForecastCombinedChart } from '../components/PlotlyCharts'
import {
  BarChart,
  PieChart,
  CorrelationHeatmap,
  ScatterChart,
  HorizontalBarChart,
  CategoryRegionHeatmap,
  MultiLineChart
} from '../components/ECharts'
import { generatePDFReport, getPDFBlob } from '../components/PDFExport'
import ForaChatbot from '../components/ForaChatbot'
// Helper component to parse **text** into bold React elements safely
const HighlightText = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? <strong key={index} className="text-slate-800">{part}</strong> : part
      )}
    </>
  );
};

export default function AnalysisPage() {
  const {
    forecastData,
    isLoading,
    error,
    fileName,
    forecastDays,
    setForecastData,
    setLoading,
    setError,
    setFileName,
    setForecastDays,
    clearData
  } = useForecastStore()

  const { addEntry } = useHistoryStore()
  const { user } = useAuthStore()
  const { addActivity, getUserForecastsThisMonth } = usePlatformStore()
  const { rateLimit, userStorageLimit, adminStorageLimit, featureToggles } = useAdminSettingsStore()
  const [pdfLoading, setPdfLoading] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [shareLoading, setShareLoading] = useState(false)

  const handleFileAccepted = async (file) => {
    if (user?.role !== 'admin' && getUserForecastsThisMonth(user?.email) >= rateLimit) {
      toast.error(`Monthly limit reached (${rateLimit} forecasts). Please contact your administrator.`, { duration: 4000 });
      return;
    }

    setFileName(file.name)
    setLoading(true)
    setError(null)

    try {
      const raw = await uploadForecast(file, 90)
      const parsed = parseForecastResponse(raw)
      setForecastData(parsed)

      addEntry({
        fileName: file.name,
        bestModel: parsed.best_model,
        metrics: parsed.dashboardMetrics,
        forecastDays: 90,
        forecastData: parsed,
      }, user?.email)

      addActivity({
        userEmail: user?.email,
        action: 'FORECAST_GENERATED',
        details: { points: parsed.actualValues.length }
      })

      toast.success(`Forecast complete! Best model: ${parsed.best_model}`)

    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Backend not running or error in pipeline'

      setError(msg)
      toast.error('Forecast failed')
    }

    setLoading(false)
  }

  const handleDownloadPDF = async () => {
    if (!forecastData) return

    setPdfLoading(true)
    try {
      await generatePDFReport({ forecastData, fileName, forecastDays })
      toast.success('PDF downloaded')
    } catch {
      toast.error('PDF generation failed')
    }
    setPdfLoading(false)
  }

  const handleShareAnalysis = async (e) => {
    e.preventDefault()
    if (!shareEmail || !forecastData) return

    setShareLoading(true)
    try {
      const pdfBlob = await getPDFBlob({ forecastData, fileName, forecastDays })
      const formData = new FormData()
      formData.append("email", shareEmail)
      formData.append("file", pdfBlob, "Forecast_Analysis.pdf")

      const res = await fetch('http://localhost:8000/share-report', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Report shared successfully via email')
        addActivity({ userEmail: user?.email, action: 'REPORT_SHARED' })
        setIsShareOpen(false)
        setShareEmail('')
      } else {
        toast.error(data.error || 'Failed to share report')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to share report')
    }
    setShareLoading(false)
  }

  const dbm = forecastData?.dashboardMetrics || {}
  const maxSize = user?.role === 'admin' ? adminStorageLimit * 1024 * 1024 : userStorageLimit * 1024 * 1024;
  const canUsePdf = featureToggles.pdfSharing || user?.role === 'admin';
  const canUseAdvancedModels = featureToggles.advancedModels || user?.role === 'admin';

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-slate-800" /> Analysis Dashboard
        </h1>

        {forecastData && (
          <div className="flex gap-3">
            {canUsePdf && (
              <>
                <button onClick={() => setIsShareOpen(true)} className="btn-secondary px-4 py-2 text-xs flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button onClick={handleDownloadPDF} disabled={pdfLoading} className="btn-primary px-4 py-2 text-xs flex items-center gap-2">
                  {pdfLoading ? <span className="animate-pulse">Generating...</span> : <><Download className="w-4 h-4" /> Download PDF</>}
                </button>
              </>
            )}
            <button onClick={clearData} className="btn-secondary px-4 py-2 text-xs">
              Clear Data
            </button>
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* ================= UPLOAD SECTION ================= */}
      {!forecastData && !isLoading && (
        <div className="card space-y-4 max-w-xl mx-auto mt-10 shadow-lg">
          <h2 className="text-lg font-display font-semibold text-slate-800">Upload Dataset</h2>
          <FileUpload
            onFileAccepted={handleFileAccepted}
            fileName={fileName}
            disabled={isLoading}
            maxSize={maxSize}
          />
        </div>
      )}

      {/* LOADING */}
      {isLoading && <LoadingSpinner message="Running model..." />}

      {/* ================= DASHBOARD RESULTS ================= */}
      {!isLoading && forecastData && (
        <div className="space-y-6 animate-fade-in">

          {/* SLIDER & MODEL */}
          <div className="card flex items-center justify-between gap-6 p-4">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Best Model</div>
                <div className="text-sm font-bold text-cyan-400">
                  {canUseAdvancedModels ? forecastData.best_model : 'Basic Heuristic Model'}
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-md">
              <label className="flex justify-between mb-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <span>Forecast Horizon</span>
                <span className="text-slate-800 font-bold">{forecastDays} Days</span>
              </label>
              <input
                type="range"
                min={1}
                max={90}
                value={forecastDays}
                onChange={(e) => setForecastDays(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* KPI CARDS */}
          <KPICards metrics={dbm} />

          {/* MAIN FORECAST CHART (FULL WIDTH) */}
          <div className="card w-full" id="chart-forecast">
            <h3 className="font-display font-bold text-slate-800 mb-4">Revenue Over Time</h3>
            <ForecastCombinedChart
              actualDates={forecastData.actualDates}
              actualValues={forecastData.actualValues}
              forecastDates={forecastData.forecastDates.slice(0, forecastDays)}
              forecastValues={forecastData.forecastValues.slice(0, forecastDays)}
              bestModel={forecastData.best_model}
            />
            <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-semibold text-blue-700">Summary:</span> <HighlightText text="This visualization displays the historical data contiguous with the predicted values generated by the **XGBoost algorithm**. The model analyzes **recent trends** and **detrended seasonality** to project future performance." />
              </p>
            </div>
          </div>

          {/* DYNAMIC CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dbm.profit_vs_revenue?.length > 0 && (
              <div className="card" id="chart-scatter">
                <h3 className="font-display font-bold text-slate-800 mb-4">Profit vs Revenue by Category</h3>
                <ScatterChart data={dbm.profit_vs_revenue} />
                {dbm.summaries?.profit_vs_revenue && (
                  <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-semibold text-blue-700">Summary:</span> <HighlightText text={dbm.summaries.profit_vs_revenue} />
                    </p>
                  </div>
                )}
              </div>
            )}

            {dbm.quantity_by_category?.length > 0 && (
              <div className="card" id="chart-bar-cat">
                <h3 className="font-display font-bold text-slate-800 mb-4">Sales by Category</h3>
                <BarChart data={dbm.quantity_by_category} title="Quantity" />
                {dbm.summaries?.revenue_by_category && (
                  <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-semibold text-blue-700">Summary:</span> <HighlightText text={dbm.summaries.revenue_by_category} />
                    </p>
                  </div>
                )}
              </div>
            )}

            {dbm.top_products?.length > 0 && (
              <div className="card" id="chart-horiz-bar">
                <h3 className="font-display font-bold text-slate-800 mb-4">Top 10 Products by Revenue</h3>
                <HorizontalBarChart data={dbm.top_products} />
                {dbm.summaries?.top_products && (
                  <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-semibold text-blue-700">Summary:</span> <HighlightText text={dbm.summaries.top_products} />
                    </p>
                  </div>
                )}
              </div>
            )}

            {dbm.revenue_by_region?.length > 0 && (
              <div className="card" id="chart-pie">
                <h3 className="font-display font-bold text-slate-800 mb-4">Revenue by Region</h3>
                <PieChart data={dbm.revenue_by_region} />
                {dbm.summaries?.revenue_by_region && (
                  <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-semibold text-blue-700">Summary:</span> <HighlightText text={dbm.summaries.revenue_by_region} />
                    </p>
                  </div>
                )}
              </div>
            )}

            {forecastData.actualDates?.length > 0 && (
              <div className="card" id="chart-corr">
                <h3 className="font-display font-bold text-slate-800 mb-4">Correlation Heatmap</h3>
                <CorrelationHeatmap actualDates={forecastData.actualDates} actualValues={forecastData.actualValues} />
                <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-semibold text-blue-700">Summary:</span> <HighlightText text="Detailed view of the **concentration** of actual values over time." />
                  </p>
                </div>
              </div>
            )}

            {dbm.revenue_heatmap?.categories?.length > 0 && (
              <div className="card" id="chart-heat-reg">
                <h3 className="font-display font-bold text-slate-800 mb-4">Revenue: Category × Region</h3>
                <CategoryRegionHeatmap data={dbm.revenue_heatmap} />
                {dbm.summaries?.revenue_heatmap && (
                  <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-semibold text-blue-700">Summary:</span> <HighlightText text={dbm.summaries.revenue_heatmap} />
                    </p>
                  </div>
                )}
              </div>
            )}

            {dbm.monthly_revenue_by_category?.months?.length > 0 && (
              <div className="card" id="chart-multi-line">
                <h3 className="font-display font-bold text-slate-800 mb-4">Monthly Revenue by Category</h3>
                <MultiLineChart data={dbm.monthly_revenue_by_category} />
                {dbm.summaries?.monthly_revenue_by_category && (
                  <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-semibold text-blue-700">Summary:</span> <HighlightText text={dbm.summaries.monthly_revenue_by_category} />
                    </p>
                  </div>
                )}
              </div>
            )}

            {dbm.revenue_by_day_of_week?.length > 0 && (
              <div className="card" id="chart-bar-dow">
                <h3 className="font-display font-bold text-slate-800 mb-4">Revenue by Day of Week</h3>
                <BarChart data={dbm.revenue_by_day_of_week} title="Revenue" />
                {dbm.summaries?.revenue_by_day_of_week && (
                  <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-semibold text-blue-700">Summary:</span> <HighlightText text={dbm.summaries.revenue_by_day_of_week} />
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* SHARE MODAL */}
      {isShareOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" /> Share Analysis Report
              </h3>
              <button
                onClick={() => setIsShareOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleShareAnalysis} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    required
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="colleague@company.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={shareLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  {shareLoading ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Report</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot restricted to Analysis Page */}
      <ForaChatbot />
    </div>
  )
}