import React, { useState } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import { Home, LineChart, History, Users, LogOut, ChevronLeft, ChevronRight, LayoutDashboard, Settings, X, AlertTriangle, ShieldAlert } from 'lucide-react'

const NavItem = ({ to, icon: Icon, label, sidebarOpen }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`
    }
    title={!sidebarOpen ? label : ""}
  >
    <Icon className={`w-5 h-5 flex-shrink-0 ${!sidebarOpen ? 'mx-auto' : ''}`} />
    {sidebarOpen && <span className="font-medium whitespace-nowrap">{label}</span>}
  </NavLink>
)

export default function Layout() {
  const { user, logout, updateProfile, deleteAccount } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newName, setNewName] = useState(user?.name || '')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const res = updateProfile(newName)
    if (res.success) {
      toast.success('Profile updated successfully')
      setIsSettingsOpen(false)
    } else {
      toast.error(res.error || 'Failed to update profile')
    }
  }

  const handleDeleteAccount = () => {
    const res = deleteAccount()
    if (res.success) {
      toast.success('Account deleted permanently')
      setIsSettingsOpen(false)
      navigate('/')
    } else {
      toast.error(res.error || 'Failed to delete account')
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-body">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex-shrink-0 bg-slate-900 border-r border-slate-800 shadow-xl flex flex-col transition-all duration-300 overflow-y-auto`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 h-[72px]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/20 mx-auto">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="font-display font-bold text-white text-lg tracking-wide truncate">
                Forecastify
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 hidden" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5">
          {sidebarOpen && (
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              Navigation
            </p>
          )}
          <NavItem to="/home" icon={Home} label="Home" sidebarOpen={sidebarOpen} />
          <NavItem to="/analysis" icon={LineChart} label="Analysis" sidebarOpen={sidebarOpen} />
          <NavItem to="/history" icon={History} label="History" sidebarOpen={sidebarOpen} />
          <NavItem to="/about" icon={Users} label="About Us" sidebarOpen={sidebarOpen} />
          {user?.role === 'admin' && (
            <>
              {sidebarOpen && (
                <div className="h-px bg-slate-800 my-2 mx-2"></div>
              )}
              <NavItem to="/admin" icon={ShieldAlert} label="Admin Panel" sidebarOpen={sidebarOpen} />
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800">
          <div className={`flex flex-col bg-slate-800/50 p-2 rounded-xl border border-slate-700/50`}>
            {sidebarOpen && (
              <div className="flex flex-col overflow-hidden px-2 mb-2">
                <span className="text-sm font-bold text-slate-200 truncate" title={user?.name || user?.email || 'User'}>
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{user?.role || 'Admin'}</span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-300 w-full`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
                {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
              </button>
              <button
                onClick={handleLogout}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 w-full`}
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                {sidebarOpen && <span className="text-sm font-medium">Log out</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin relative z-0 bg-slate-50">
        <div className="animate-fade-in pb-10">
          <Outlet />
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Account Settings</h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/30"
                >
                  Save Changes
                </button>
              </form>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-rose-800 mb-1">Danger Zone</h4>
                    <p className="text-xs text-rose-600/80 mb-3">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    {!isDeleting ? (
                      <button
                        onClick={() => setIsDeleting(true)}
                        className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        Delete Account
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDeleteAccount}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Yes, delete
                        </button>
                        <button
                          onClick={() => setIsDeleting(false)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
