import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Database, Activity, PieChart, ArrowRight, ShieldCheck, Zap, Lightbulb, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('register') // 'login' | 'register' | 'forgot'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register, requestPasswordReset } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        const result = await login(form.email, form.password)
        if (!result.success) {
          toast.error(result.error)
          setLoading(false)
          return
        }
        toast.success(`Welcome back!`)
        navigate('/home')
      } else if (mode === 'forgot') {
        if (!form.email) {
          toast.error('Please enter your email')
          setLoading(false)
          return
        }
        const result = await requestPasswordReset(form.email)
        if (!result.success) {
          toast.error(result.error)
          setLoading(false)
          return
        }

        // Real email sent
        toast.success("Check your inbox! An email has been sent.", { duration: 6000 })
        setMode('login')
      } else {
        if (!form.name || !form.email || !form.password) {
          toast.error('Please fill in all fields')
          setLoading(false)
          return
        }
        const result = await register(form.name, form.email, form.password)
        if (!result.success) {
          toast.error(result.error)
          setLoading(false)
          return
        }
        toast.success('Account created! Welcome to Forecastify 🎉')
        navigate('/onboarding')
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex font-body">
      {/* Left Column: Authentication */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-teal-500 rounded-xl shadow-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold font-display">F</span>
            </div>
            <span className="text-2xl font-display font-bold text-slate-900 tracking-tight">Forecastify</span>
          </div>

          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 mb-2">
              {mode === 'register' ? 'Create an account' : mode === 'forgot' ? 'Reset password' : 'Welcome back'}
            </h1>
            <p className="text-slate-500 mb-8">
              {mode === 'register'
                ? 'Start forecasting your business future today.'
                : mode === 'forgot'
                  ? 'Enter your email and we will send you a reset link.'
                  : 'Enter your credentials to access your dashboard.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                  required
                />
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot')} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                      required={mode !== 'forgot'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Role selection removed - admins are managed via Admin Panel */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-md shadow-primary-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group mt-2"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    {mode === 'login' ? 'Login' : mode === 'forgot' ? 'Send Reset Link' : 'Create Account'}
                    {mode !== 'forgot' && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              {mode === 'register' ? (
                <p className="text-slate-600 text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-all inline-block hover:scale-105"
                  >
                    Login
                  </button>
                </p>
              ) : mode === 'forgot' ? (
                <p className="text-slate-600 text-sm">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-all inline-block hover:scale-105"
                  >
                    Login
                  </button>
                </p>
              ) : (
                <p className="text-slate-600 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-all inline-block hover:scale-105"
                  >
                    Create one
                  </button>
                </p>
              )}
            </div>

            {mode === 'login' && (
              <p className="text-center text-xs text-slate-400 mt-4">
                Demo: Register an account first, then sign in.
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right Column: Workflow Visualization */}
      <div className="hidden lg:flex w-1/2 bg-[#080f1e] relative overflow-hidden items-center justify-center p-12">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-sky-400 rounded-full mix-blend-screen filter blur-[120px] opacity-[0.15]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-[0.15]"></div>

        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Unlock the Power of Your Data
            </h2>
            <p className="text-blue-100/70 text-lg">
              Our Business Analytics Suite provides an end-to-end flow for turning raw numbers into strategic advantages.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 relative"
          >
            {/* Connecting line */}
            <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-blue-900/30 overflow-hidden rounded-full">
              <motion.div
                className="w-full h-1/2 bg-gradient-to-b from-transparent via-sky-400 to-transparent opacity-60"
                animate={{ y: ["-100%", "300%"] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              />
            </div>

            {/* Step 1 */}
            <motion.div variants={itemVariants} className="flex gap-6 relative" whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
              <motion.div
                className="w-16 h-16 rounded-2xl bg-blue-900/30 backdrop-blur border border-blue-800/50 flex items-center justify-center shrink-0 z-10 shadow-xl shadow-black/20"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <Database className="text-blue-400" size={28} />
              </motion.div>
              <div className="pt-2">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  1. Connect Data <ShieldCheck size={16} className="text-emerald-400" />
                </h3>
                <p className="text-blue-200/60 leading-relaxed text-sm">
                  Seamlessly ingest historical sales and performance metrics. Your data is encrypted and securely stored.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={itemVariants} className="flex gap-6 relative" whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
              <motion.div
                className="w-16 h-16 rounded-2xl bg-blue-900/30 backdrop-blur border border-blue-800/50 flex items-center justify-center shrink-0 z-10 shadow-xl shadow-black/20"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
              >
                <Activity className="text-primary-400" size={28} />
              </motion.div>
              <div className="pt-2">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  2. Analyze & Forecast <Zap size={16} className="text-amber-400" />
                </h3>
                <p className="text-blue-200/60 leading-relaxed text-sm">
                  Leverage advanced machine learning models (like XGBoost) to detect hidden trends and accurately project future performance.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={itemVariants} className="flex gap-6 relative" whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
              <motion.div
                className="w-16 h-16 rounded-2xl bg-blue-900/30 backdrop-blur border border-blue-800/50 flex items-center justify-center shrink-0 z-10 shadow-xl shadow-black/20"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              >
                <PieChart className="text-teal-400" size={28} />
              </motion.div>
              <div className="pt-2">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  3. Discover Insights <Lightbulb size={16} className="text-teal-400" />
                </h3>
                <p className="text-blue-200/60 leading-relaxed text-sm">
                  Uncover actionable intelligence with dynamic, interactive dashboards designed for strategic decision-making.
                </p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  )
}
