import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, PieChart, ArrowRight, Activity, Zap, Shield } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 text-slate-800 overflow-hidden font-body relative">
      {/* Background abstract shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[60%] bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navbar placeholder for brand */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-xl text-white">
            <TrendingUp size={24} />
          </div>
          <span className="text-xl font-display font-bold text-slate-900 tracking-tight">Forecastify</span>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="text-slate-600 hover:text-primary-600 font-medium transition-colors"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-12 pb-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4 border border-blue-100">
              Next-Generation Analytics
            </span>
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-tight">
              Predict the <span className="text-gradient">Future</span> of Your Business
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
              Transform your raw data into actionable insights with our advanced forecasting engine. Visualize trends, analyze performance, and make data-driven decisions with confidence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <button
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-2xl font-semibold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              View Demo
            </button>
          </motion.div>

          {/* Features short list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-slate-500 text-sm font-medium"
          >
            <div className="flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Fast Integration</div>
            <div className="flex items-center gap-2"><Shield size={16} className="text-teal-500" /> Secure Data</div>
            <div className="flex items-center gap-2"><Activity size={16} className="text-primary-500" /> Real-time</div>
          </motion.div>
        </div>

        {/* Animated Visuals */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative h-[400px] lg:h-[500px]">

          {/* Main Chart Card */}
          <motion.div
            className="absolute top-10 left-0 right-0 lg:right-auto lg:left-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 z-20 w-full lg:w-[450px]"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-slate-800">Revenue Forecast</h3>
                <p className="text-xs text-slate-400">Three-Month Trend Projection</p>
              </div>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
            </div>

            {/* Mock Chart Area */}
            <div className="h-48 flex items-end justify-between gap-2 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between z-0">
                <div className="border-b border-slate-100 w-full h-0"></div>
                <div className="border-b border-slate-100 w-full h-0"></div>
                <div className="border-b border-slate-100 w-full h-0"></div>
                <div className="border-b border-slate-100 w-full h-0"></div>
              </div>

              {/* Bars */}
              {[40, 55, 45, 70, 65, 85, 100].map((height, i) => (
                <motion.div
                  key={i}
                  className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-md z-10 relative group"
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ${height}k
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Floating Element 1 */}
          <motion.div
            className="absolute -bottom-10 -left-10 lg:-left-20 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 z-30 flex items-center gap-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
              <PieChart size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Accuracy Rate</p>
              <p className="text-xl font-bold text-slate-800">98.5%</p>
            </div>
          </motion.div>

          {/* Floating Element 2 */}
          <motion.div
            className="absolute top-0 -right-4 lg:-right-10 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 z-10 flex flex-col gap-2"
            initial={{ opacity: 0, x: 50, y: 0 }}
            animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
            transition={{ duration: 0.6, delay: 1.2, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-50 p-2 rounded-lg text-amber-500">
                <BarChart2 size={16} />
              </div>
              <p className="text-sm font-bold text-slate-800">Growth</p>
            </div>
            <div className="text-2xl font-display font-bold text-green-500">+24%</div>
          </motion.div>

          {/* Floating Element 3 (Profit) */}
          <motion.div
            className="absolute bottom-20 -right-6 lg:-right-12 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 flex flex-col gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, 8, 0] }}
            transition={{ duration: 0.6, delay: 1.4, y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-emerald-50 p-1.5 rounded-lg text-emerald-600">
                <TrendingUp size={14} />
              </div>
              <p className="text-xs font-bold text-slate-800">Profit Margin</p>
            </div>
            <div className="text-lg font-display font-bold text-slate-700">32.8%</div>
          </motion.div>

          {/* Floating Element 4 (Models) */}
          <motion.div
            className="absolute top-28 -left-6 lg:-left-12 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 z-30 flex items-center gap-3"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
            transition={{ duration: 0.6, delay: 1.6, y: { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
          >
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500">
              <Activity size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Engine</p>
              <p className="text-sm font-bold text-slate-800">XGBoost</p>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 bg-white border-t border-slate-100 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 mb-6">
              Everything you need to forecast with precision
            </h2>
            <p className="text-lg text-slate-600">
              Forecastify is designed to be the ultimate business analytics suite. From data ingestion to advanced predictive modeling, we handle the complex math so you can focus on strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <motion.div
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Real-time Analytics</h3>
              <p className="text-slate-600 leading-relaxed">
                Upload your historical sales data and instantly see trends, seasonality, and actionable insights across all your product categories.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Advanced Forecasting</h3>
              <p className="text-slate-600 leading-relaxed">
                Our machine learning models project your future revenue and sales volume, giving you a competitive edge in market planning.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PieChart size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Deep Insights</h3>
              <p className="text-slate-600 leading-relaxed">
                Understand the 'why' behind the numbers. We break down your data into visual, easy-to-understand metrics that drive growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
