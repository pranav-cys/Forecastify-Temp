import React from 'react'

export default function LoadingSpinner({ message = 'Processing your data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <style>{`
        @keyframes drawLine {
          0%, 15% { stroke-dashoffset: 80; }
          85%, 100% { stroke-dashoffset: 0; }
        }
        @keyframes fadeArrow {
          0%, 75% { opacity: 0; transform: translate(-3px, 3px); }
          85%, 100% { opacity: 1; transform: translate(0px, 0px); }
        }
        @keyframes fadeFill {
          0%, 50% { opacity: 0; }
          85%, 100% { opacity: 1; }
        }
        .trend-line {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: drawLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
        .trend-arrow {
          opacity: 0;
          animation: fadeArrow 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
        .trend-fill {
          opacity: 0;
          animation: fadeFill 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
      `}</style>
      
      <div className="relative w-28 h-28 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <svg width="70" height="70" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Subtle grid lines */}
          <path d="M 10 50 L 70 50" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" />
          <path d="M 10 30 L 70 30" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" />
          
          {/* Axis */}
          <path d="M 10 70 L 70 70" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
          <path d="M 10 70 L 10 10" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
          
          {/* Gradient Fill under the line */}
          <path 
            d="M 15 60 L 30 45 L 45 50 L 65 20 L 65 68 L 15 68 Z"
            fill="url(#trend-gradient)"
            className="trend-fill"
          />

          {/* Trend Line (Green) */}
          <path 
            d="M 15 60 L 30 45 L 45 50 L 65 20" 
            stroke="#10b981" 
            strokeWidth="4.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
            className="trend-line"
          />
          
          {/* Arrow Head */}
          <path 
            d="M 51 20 L 65 20 L 65 34"
            stroke="#10b981"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="trend-arrow"
          />
        </svg>
      </div>
      
      <div className="text-center animate-fade-in">
        <p className="font-medium text-slate-600 tracking-wide">{message}</p>
      </div>
    </div>
  )
}
