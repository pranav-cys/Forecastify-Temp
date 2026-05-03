import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, usePlatformStore, useAdminSettingsStore } from '../store'
import toast from 'react-hot-toast'
import {
  ShieldAlert, Users, ShieldCheck, UserMinus, Search,
  Activity, Settings, Database, Clock, HardDrive,
  AlertCircle, BarChart2, FileText, Bot
} from 'lucide-react'

export default function AdminDashboard() {
  const { user, getAllUsers, deleteUserByAdmin, updateUserRole, cleanupAdmins } = useAuthStore()
  const { activityFeed, stats, getPeakUsageHours } = usePlatformStore()
  const {
    rateLimit, userStorageLimit, adminStorageLimit, featureToggles,
    updateSettings, updateFeatureToggle
  } = useAdminSettingsStore()

  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('users') // 'users', 'analytics', 'settings'

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/home')
      toast.error('Unauthorized access')
      return
    }

    const fetchUsers = async () => {
      // Perform cleanup to ensure only authorized admins exist
      cleanupAdmins()
      const data = await getAllUsers()
      setUsers(data || [])
    }

    fetchUsers()
  }, [user, navigate, getAllUsers, cleanupAdmins])

  const handleUpdateRole = async (email, newRole) => {
    const res = await updateUserRole(email, newRole)
    if (res.success) {
      toast.success(`User role updated to ${newRole}`)
      const data = await getAllUsers()
      setUsers(data || [])
    } else {
      toast.error(res.error || 'Failed to update role')
    }
  }

  const handleDeleteUser = async (email) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      const res = await deleteUserByAdmin(email)
      if (res.success) {
        toast.success('User deleted successfully')
        const data = await getAllUsers()
        setUsers(data || []) // Refresh list
      } else {
        toast.error(res.error || 'Failed to delete user')
      }
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalAdmins = users.filter(u => u.role === 'admin').length
  const totalRegular = users.length - totalAdmins

  const renderTabs = () => (
    <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl w-full max-w-md mx-auto sm:mx-0">
      <button
        onClick={() => setActiveTab('users')}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <div className="flex items-center justify-center gap-2">
          <Users className="w-4 h-4" /> Users
        </div>
      </button>
      <button
        onClick={() => setActiveTab('analytics')}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <div className="flex items-center justify-center gap-2">
          <Activity className="w-4 h-4" /> Analytics
        </div>
      </button>
      <button
        onClick={() => setActiveTab('settings')}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <div className="flex items-center justify-center gap-2">
          <Settings className="w-4 h-4" /> Governance
        </div>
      </button>
    </div>
  )

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-slate-800" /> Admin Dashboard
        </h1>
        {renderTabs()}
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <p className="text-2xl font-bold text-slate-800">{users.length}</p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Admins</p>
                <p className="text-2xl font-bold text-slate-800">{totalAdmins}</p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Regular Users</p>
                <p className="text-2xl font-bold text-slate-800">{totalRegular}</p>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">User Management</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.onboardingCompleted ? (
                          <span className="text-emerald-600 font-medium">Onboarded</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {u.email.toLowerCase() !== 'admin@gmail.com' && u.email !== user.email && (
                            <>
                              {u.role === 'user' ? (
                                <button
                                  onClick={() => handleUpdateRole(u.email, 'admin')}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-2"
                                  title="Promote to Admin"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                  <span className="sr-only">Promote</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateRole(u.email, 'user')}
                                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors inline-flex items-center gap-2"
                                  title="Demote to User"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                  <span className="sr-only">Demote</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteUser(u.email)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-2"
                                title="Delete User"
                              >
                                <UserMinus className="w-4 h-4" />
                                <span className="sr-only">Delete User</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Datasets Uploaded</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalDatasetsUploaded}</p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Data Points Processed</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalDataPointsProcessed.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Peak Usage Times */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-500" /> Peak Usage Times
            </h3>
            <div className="h-64 flex items-end gap-2 mt-4">
              {getPeakUsageHours().map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {item.hour}: {item.count} actions
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full bg-blue-500 rounded-t-md hover:bg-blue-400 transition-colors"
                    style={{
                      height: `${item.count === 0 ? 4 : Math.max(10, (item.count / Math.max(...getPeakUsageHours().map(h => h.count))) * 100)}%`,
                      opacity: item.count === 0 ? 0.2 : 1
                    }}
                  />
                  {/* Label every 3 hours for cleanliness */}
                  <span className="text-[10px] text-slate-400 -rotate-45 origin-top-left mt-2">
                    {idx % 3 === 0 ? item.hour : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" /> Global Activity Feed
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {activityFeed.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No recent activity</div>
              ) : (
                <div className="space-y-1">
                  {activityFeed.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-slate-50 rounded-xl transition-colors flex items-start gap-4">
                      <div className="mt-1">
                        {item.action === 'FORECAST_GENERATED' && <BarChart2 className="w-5 h-5 text-blue-500" />}
                        {item.action === 'REPORT_SHARED' && <FileText className="w-5 h-5 text-amber-500" />}
                        {item.action === 'USER_REGISTERED' && <Users className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {item.action === 'FORECAST_GENERATED' && `User generated a forecast`}
                          {item.action === 'REPORT_SHARED' && `User shared a PDF report`}
                          {item.action === 'USER_REGISTERED' && `New user registered`}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.userEmail}</p>
                        {item.details?.points && (
                          <p className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded">
                            {item.details.points.toLocaleString()} points processed
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
          {/* Rate Limiting */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-800" /> Rate Limiting
            </h3>
            <p className="text-sm text-slate-500">Restrict the number of forecasts regular users can generate per month.</p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                value={rateLimit}
                onChange={(e) => updateSettings({ rateLimit: parseInt(e.target.value) || 1 })}
                className="w-32 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">forecasts / month</span>
            </div>
          </div>

          {/* Storage Limits */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-slate-800" /> Storage Limits
            </h3>
            <p className="text-sm text-slate-500">Maximum allowed CSV file upload sizes.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Regular Users (MB)</label>
                <input
                  type="number"
                  min="1"
                  value={userStorageLimit}
                  onChange={(e) => updateSettings({ userStorageLimit: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Administrators (MB)</label>
                <input
                  type="number"
                  min="1"
                  value={adminStorageLimit}
                  onChange={(e) => updateSettings({ adminStorageLimit: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-800" /> Global Feature Toggles
              </h3>
              <p className="text-sm text-slate-500 mt-1">Enable or disable specific platform capabilities for regular users globally.</p>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">PDF Report Sharing</h4>
                    <p className="text-sm text-slate-500 mt-0.5">Allow users to download and share analysis reports via email.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={featureToggles.pdfSharing}
                    onChange={(e) => updateFeatureToggle('pdfSharing', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Advanced AI Models</h4>
                    <p className="text-sm text-slate-500 mt-0.5">Allow users to utilize advanced ML forecasting algorithms.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={featureToggles.advancedModels}
                    onChange={(e) => updateFeatureToggle('advancedModels', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5" />
              <p className="text-sm text-slate-500">
                Note: Administrators bypass all governance limits and feature restrictions. Changes made here apply immediately to all regular user sessions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
