import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store'
import {
  User, Code, Palette, Server, FlaskConical, Settings, Briefcase,
  GraduationCap, Brush, Rocket, Users, Code2, Zap, BarChart2, LineChart, Mail
} from 'lucide-react'

const team = [
  {
    name: 'Dravina S',
    role: 'Project Lead- Requirement Analysis and System Architechture',
    avatar: Code,
    email: 'dravinasdravina@gmail.com',
    tags: ['SDLC', 'Data Flow', 'Tech Stack Selection'],
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    name: 'Srikruthi Kulkarni',
    role: 'Data Collection and Exploration',
    avatar: Palette,
    email: 'kulkarnisrikruthi78@gmail.com',
    tags: ['CSV Handling', 'EDA', 'Data Preprocessing'],
    gradient: 'from-teal-500 to-teal-700',
  },
  {
    name: 'Chinmai R Hallikar',
    role: 'Data Preprocessing and Feature Engineering',
    avatar: Server,
    email: 'chinmaihallikar@gmail.com',
    tags: ['Feature Engineering', 'Outlier Detection', 'Data Transformation'],
    gradient: 'from-violet-500 to-violet-700',
  },
  {
    name: 'Parikshith C',
    role: 'Machine Learning Model Development',
    avatar: FlaskConical,
    email: 'prajwalparikshithc@gmail.com',
    tags: ['Model Selection', 'Model Training','Model Evaluation'],
    gradient: 'from-amber-500 to-amber-700',
  },
  {
    name: 'Chethan B S',
    role: 'Backend Development',
    avatar: Settings,
    email: 'chethanbs2502@gmail.com',
    tags: ['KPI', 'CRUD Operations', 'JSON Handling'],
    gradient: 'from-rose-500 to-rose-700',
  },
  {
    name: 'Harish B A',
    role: 'Backend Development',
    avatar: Briefcase,
    email: 'harishba231@gmail.com',
    tags: ['Swagger', 'FastAPI', 'MySQL'],
    gradient: 'from-cyan-500 to-cyan-700',
  },
  {
    name: 'Pranav S Bharadwaj',
    role: 'Frontend Development',
    avatar: GraduationCap,
    email: 'prnvsb728@gmail.com',
    tags: ['UI Design', 'API Integration', 'HTML', 'CSS', 'JavaScript'],
    gradient: 'from-emerald-500 to-emerald-700',
  },
  {
    name: 'Jayanth A',
    role: 'LLM integration and Insight generation',
    avatar: Brush,
    email: 'jayantha6604@gmail.com',
    tags: ['AI Dashboard', 'Prompt Templates', 'Generative AI'],
    gradient: 'from-pink-500 to-pink-700',
  },
  {
    name: 'Hemanth Kumar K M',
    role: 'LLM integration and Insight generation',
    avatar: Rocket,
    email: 'hemanthkumarkm291204@gmail.com',
    tags: ['LLM Integration', 'AI Insights', 'Text Summarization'],
    gradient: 'from-indigo-500 to-indigo-700',
  },
  {
    name: 'Syed Mohammed Anwarullah Khadri',
    role: 'Testing, Optimization and Documentation',
    avatar: User,
    email: 'smak2676@gmail.com',
    tags: ['Quality Assurance', 'Technical Documentation', 'System Testing'],
    gradient: 'from-orange-500 to-orange-700',
  },
]



export default function AboutPage() {
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({ name: user?.name || '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.message) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('http://localhost:8000/contact-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: user?.email || 'anonymous@forecastify.com',
          message: formData.message
        })
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Message sent! Our team will review it shortly.')
        setFormData({ name: user?.name || '', message: '' })
      } else {
        toast.error('Failed to send message: ' + (data.error || 'Server error'))
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error. Failed to send message.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-slate-100 px-8 py-4">
        <h1 className="font-display font-bold text-slate-800 text-lg">About the Team</h1>
        <p className="text-slate-500 text-sm">The minds behind Forecastify</p>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-10 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500 opacity-10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-center mb-4"><Users className="w-12 h-12 text-teal-300" /></div>
            <h2 className="text-3xl font-display font-bold mb-3">Meet the Team</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Forecastify is built by a cross-functional team of ML engineers, data scientists, frontend developers,
              and designers passionate about making AI-powered forecasting accessible to everyone.
            </p>
          </div>
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
          {team.map((member, i) => (
            <div
              key={member.name}
              className="card hover:shadow-card-hover transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Avatar */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <member.avatar className="w-6 h-6" />
              </div>

              {/* Info */}
              <h3 className="font-display font-bold text-slate-800 text-base">{member.name}</h3>
              <p className="text-blue-600 text-xs font-semibold mt-0.5 mb-2">{member.role}</p>


              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {member.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Social links */}
              <div className="flex pt-3 border-t border-slate-100">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-xs font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact via Email
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Tech stack section */}
        <div className="card">
          <h2 className="font-display font-bold text-slate-800 text-xl mb-6">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'React', icon: Code2, desc: 'Frontend UI' },
              { name: 'FastAPI', icon: Zap, desc: 'Backend API' },
              { name: 'XGBoost', icon: Rocket, desc: 'ML Models' },
              { name: 'Plotly', icon: BarChart2, desc: 'Charts' },
              { name: 'ECharts', icon: LineChart, desc: 'Visualizations' },
              { name: 'Tailwind', icon: Palette, desc: 'Styling' },
            ].map(tech => (
              <div key={tech.name} className="bg-slate-50 rounded-xl p-4 text-center hover:bg-blue-50 transition-colors">
                <div className="flex justify-center mb-3">
                  <tech.icon className="w-8 h-8 text-blue-500" />
                </div>
                <div className="font-semibold text-slate-800 text-sm">{tech.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Team Section */}
        <div className="mt-10 card max-w-2xl mx-auto bg-gradient-to-br from-white to-slate-50 border border-slate-200">
          <div className="text-center mb-6">
            <h2 className="font-display font-bold text-slate-800 text-2xl">Contact the Team</h2>
            <p className="text-slate-500 text-sm mt-2">
              Have a feature request, bug report, or just want to say hi? Send us a message!
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Your Name / Username
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Message / Issue
              </label>
              <textarea
                rows={4}
                placeholder="Describe your issue or feedback..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Sending...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
