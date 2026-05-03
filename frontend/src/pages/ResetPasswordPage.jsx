import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { KeyRound, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { resetPassword } = useAuthStore()

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token')
      navigate('/')
    }
  }, [token, navigate])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const result = resetPassword(token, form.password)
      if (result.success) {
        toast.success('Password successfully reset! Please log in.')
        navigate('/')
      } else {
        toast.error(result.error || 'Failed to reset password')
      }
    } catch (err) {
      toast.error('Something went wrong')
    }
    setLoading(false)
  }

  if (!token) return null

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center font-body p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
      >
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
          <KeyRound size={24} />
        </div>
        
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">Reset Password</h1>
        <p className="text-slate-500 mb-8 text-sm">
          Please enter your new password below. Make sure it's at least 6 characters long.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-md shadow-primary-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
