import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store'
import { Check } from 'lucide-react'

const STEPS = [
  {
    id: 'role',
    title: 'What best describes your role?',
    type: 'radio',
    options: [
      'Data Scientist / Analyst',
      'Business Executive / Owner',
      'Product Manager',
      'Student / Intern',
      'Consultant / Freelancer',
      'Other'
    ]
  },
  {
    id: 'experience',
    title: 'What is your experience with sales forecasting?',
    type: 'radio',
    options: [
      'I need guidance for forecasting tasks',
      'I can build basic models independently',
      'I am an advanced ML practitioner',
      'Not sure yet'
    ]
  },
  {
    id: 'goals',
    title: 'What are your primary forecasting goals?',
    subtitle: 'Select one or several options:',
    type: 'checkbox',
    options: [
      'Revenue Forecasting',
      'Inventory Optimization',
      'Financial Planning',
      'Anomaly Detection',
      'Competitor and Market Analysis',
      'Not sure'
    ]
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({
    role: '',
    experience: '',
    goals: []
  })
  
  const { completeOnboarding } = useAuthStore()
  const navigate = useNavigate()

  const step = STEPS[currentStep]

  const handleSelect = (option) => {
    if (step.type === 'radio') {
      setAnswers(prev => ({ ...prev, [step.id]: option }))
    } else if (step.type === 'checkbox') {
      setAnswers(prev => {
        const currentSelected = prev[step.id]
        if (currentSelected.includes(option)) {
          return { ...prev, [step.id]: currentSelected.filter(item => item !== option) }
        } else {
          return { ...prev, [step.id]: [...currentSelected, option] }
        }
      })
    }
  }

  const isNextDisabled = () => {
    if (step.type === 'radio') {
      return !answers[step.id]
    }
    if (step.type === 'checkbox') {
      return answers[step.id].length === 0
    }
    return false
  }

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Finish onboarding
      await completeOnboarding(answers)
      navigate('/home')
    }
  }

  // Animation variants
  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-24 pb-12 px-4 font-body relative overflow-hidden">
      
      {/* Background blobs for aesthetic similar to SEMrush screenshot */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 pointer-events-none"></div>

      {/* Logo Header */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-teal-500 rounded-lg shadow-md flex items-center justify-center">
          <span className="text-white font-bold font-display text-sm">F</span>
        </div>
        <span className="text-xl font-display font-bold text-slate-900 tracking-tight">Forecastify</span>
      </div>

      <div className="w-full max-w-lg z-10">
        {/* Progress Tracker */}
        <div className="mb-12">
          <p className="text-sm font-semibold text-slate-500 mb-3 text-center">Let's customize your experience</p>
          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary-600"
              initial={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <h1 className="text-3xl font-display font-bold text-slate-900 mb-6 text-center">
                {step.title}
              </h1>
              {step.subtitle && (
                <p className="text-slate-500 text-center mb-6">{step.subtitle}</p>
              )}

              <div className="space-y-3">
                {step.options.map((option, idx) => {
                  const isSelected = step.type === 'radio' 
                    ? answers[step.id] === option 
                    : answers[step.id].includes(option)
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 mr-4 flex items-center justify-center border transition-colors ${
                        step.type === 'radio' ? 'rounded-full' : 'rounded'
                      } ${
                        isSelected 
                          ? 'border-primary-600 bg-primary-600' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && step.type === 'radio' && <div className="w-2 h-2 bg-white rounded-full" />}
                        {isSelected && step.type === 'checkbox' && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="font-medium text-[15px]">{option}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleNext}
            disabled={isNextDisabled()}
            className={`w-full max-w-sm py-3.5 px-4 rounded-xl font-semibold shadow-md transition-all ${
              isNextDisabled()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20 hover:shadow-lg'
            }`}
          >
            {currentStep === STEPS.length - 1 ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
