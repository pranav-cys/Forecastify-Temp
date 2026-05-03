import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'

// Custom IndexedDB storage for large datasets (bypasses 5MB localStorage limit)
const idbStorage = {
  getItem: async (name) => {
    let value = await idbGet(name)
    if (!value) {
      // Fallback: Migrate old data from localStorage if it exists
      value = localStorage.getItem(name)
      if (value) {
        await idbSet(name, value)
      }
    }
    return value || null
  },
  setItem: async (name, value) => {
    await idbSet(name, value)
  },
  removeItem: async (name) => {
    await idbDel(name)
  },
}

// Auth store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const res = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })
          const data = await res.json()
          if (data.success) {
            set({ user: data.user, isAuthenticated: true })
            return { success: true }
          }
          return { success: false, error: data.error }
        } catch (err) {
          return { success: false, error: 'Server connection failed' }
        }
      },

      register: async (name, email, password) => {
        try {
          const res = await fetch('http://localhost:8000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          })
          const data = await res.json()
          if (data.success) {
            set({ user: data.user, isAuthenticated: true })
            return { success: true }
          }
          return { success: false, error: data.error }
        } catch (err) {
          return { success: false, error: 'Server connection failed' }
        }
      },

      updateUserRole: (targetEmail, newRole) => {
        const currentUser = get().user
        if (!currentUser || currentUser.role !== 'admin') return { success: false, error: 'Unauthorized' }
        if (targetEmail.toLowerCase() === 'admin@gmail.com') return { success: false, error: 'Cannot change primary admin role' }

        const users = JSON.parse(localStorage.getItem('forecastify_users') || '[]')
        const userIndex = users.findIndex(u => u.email === targetEmail)
        
        if (userIndex !== -1) {
          users[userIndex].role = newRole
          localStorage.setItem('forecastify_users', JSON.stringify(users))
          return { success: true }
        }
        return { success: false, error: 'User not found' }
      },

      cleanupAdmins: () => {
        // Keeps ONLY Admin@gmail.com as admin, demotes all others or deletes them? 
        // User said "delete all admin accounts" apart from Admin@gmail.com.
        const users = JSON.parse(localStorage.getItem('forecastify_users') || '[]')
        const filteredUsers = users.filter(u => {
           if (u.role === 'admin' && u.email.toLowerCase() !== 'admin@gmail.com') {
              return false // Delete other admins
           }
           return true
        })
        localStorage.setItem('forecastify_users', JSON.stringify(filteredUsers))
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        useForecastStore.getState().clearData()
        useHistoryStore.getState().clearLocalHistory()
      },

      completeOnboarding: async (onboardingData) => {
        const currentUser = get().user
        if (!currentUser) return { success: false }
        
        try {
          const formData = new FormData()
          formData.append('email', currentUser.email)
          await fetch('http://localhost:8000/onboarding/complete', {
            method: 'POST',
            body: formData
          })
        } catch (err) {
          console.error("Failed to sync onboarding state", err)
        }

        const updatedUser = { ...currentUser, onboardingCompleted: true, onboardingData }
        set({ user: updatedUser })
        return { success: true }
      },

      requestPasswordReset: async (email) => {
        const users = JSON.parse(localStorage.getItem('forecastify_users') || '[]')
        const user = users.find(u => u.email === email)
        if (!user) {
          return { success: false, error: 'No account found with that email' }
        }
        
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        const resetTokens = JSON.parse(localStorage.getItem('forecastify_reset_tokens') || '{}')
        resetTokens[token] = { email, expires: Date.now() + 15 * 60 * 1000 }
        localStorage.setItem('forecastify_reset_tokens', JSON.stringify(resetTokens))
        
        // Send actual email via backend
        const resetLink = `http://localhost:3000/reset-password?token=${token}`
        try {
          const res = await fetch('http://localhost:8000/send-reset-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, reset_link: resetLink })
          })
          const data = await res.json()
          if (!data.success) {
            return { success: false, error: data.error || 'Failed to send email' }
          }
        } catch (err) {
          console.error(err)
          return { success: false, error: 'Failed to connect to email server' }
        }
        
        return { success: true }
      },

      resetPassword: (token, newPassword) => {
        const resetTokens = JSON.parse(localStorage.getItem('forecastify_reset_tokens') || '{}')
        const tokenData = resetTokens[token]
        
        if (!tokenData || tokenData.expires < Date.now()) {
          return { success: false, error: 'Invalid or expired reset link' }
        }
        
        const users = JSON.parse(localStorage.getItem('forecastify_users') || '[]')
        const userIndex = users.findIndex(u => u.email === tokenData.email)
        
        if (userIndex === -1) {
          return { success: false, error: 'User not found' }
        }
        
        users[userIndex].password = newPassword
        localStorage.setItem('forecastify_users', JSON.stringify(users))
        
        delete resetTokens[token]
        localStorage.setItem('forecastify_reset_tokens', JSON.stringify(resetTokens))
        
        return { success: true }
      },

      updateProfile: (newName) => {
        const users = JSON.parse(localStorage.getItem('forecastify_users') || '[]')
        const currentUser = get().user
        if (!currentUser) return { success: false }
        
        const userIndex = users.findIndex(u => u.email === currentUser.email)
        if (userIndex !== -1) {
          users[userIndex].name = newName
          localStorage.setItem('forecastify_users', JSON.stringify(users))
        }
        
        const updatedUser = { ...currentUser, name: newName }
        set({ user: updatedUser })
        return { success: true }
      },

      deleteAccount: () => {
        const users = JSON.parse(localStorage.getItem('forecastify_users') || '[]')
        const currentUser = get().user
        if (!currentUser) return { success: false }
        
        const filteredUsers = users.filter(u => u.email !== currentUser.email)
        localStorage.setItem('forecastify_users', JSON.stringify(filteredUsers))
        
        set({ user: null, isAuthenticated: false })
        return { success: true }
      },

      getAllUsers: async () => {
        const currentUser = get().user
        if (!currentUser || currentUser.role !== 'admin') return []
        try {
          const res = await fetch(`http://localhost:8000/admin/users?admin_email=${currentUser.email}`)
          return await res.json()
        } catch (err) {
          console.error(err)
          return []
        }
      },

      deleteUserByAdmin: async (targetEmail) => {
        const currentUser = get().user
        if (!currentUser || currentUser.role !== 'admin') return { success: false, error: 'Unauthorized' }
        try {
          const res = await fetch(`http://localhost:8000/admin/users/${targetEmail}?admin_email=${currentUser.email}`, {
            method: 'DELETE'
          })
          return await res.json()
        } catch (err) {
          return { success: false, error: 'Server connection failed' }
        }
      },
    }),
    {
      name: 'forecastify_auth',
    }
  )
)

// Forecast data store
export const useForecastStore = create((set) => ({
  forecastData: null,
  isLoading: false,
  error: null,
  fileName: null,
  forecastDays: 30,

  setForecastData: (data) => set({ forecastData: data, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  setFileName: (name) => set({ fileName: name }),
  setForecastDays: (days) => set({ forecastDays: days }),
  clearData: () => set({ forecastData: null, error: null, fileName: null }),
}))

// Upload history store
export const useHistoryStore = create(
  persist(
    (set, get) => ({
      history: [],
      fetchHistory: async (email) => {
        try {
          const res = await fetch(`http://localhost:8000/history/${email}`)
          const data = await res.json()
          set({ history: data })
        } catch (err) {
          console.error("Failed to fetch history:", err)
        }
      },

      addEntry: async (entry, email) => {
        const current = get().history
        const newEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ...entry,
        }
        
        set({
          history: [newEntry, ...current].slice(0, 50),
        })

        // Save to MySQL
        try {
          const formData = new FormData()
          formData.append('entry', JSON.stringify(newEntry))
          formData.append('email', email)
          await fetch('http://localhost:8000/history/save', {
            method: 'POST',
            body: formData
          })
        } catch (err) {
          console.error("Failed to save history to DB:", err)
        }
      },

      clearHistory: async (email) => {
        set({ history: [] })
        if (email) {
          try {
            await fetch(`http://localhost:8000/history/clear/${email}`, { method: 'DELETE' })
          } catch (e) {
            console.error(e)
          }
        }
      },

      removeEntry: async (id, email) => {
        set({ history: get().history.filter(h => h.id !== id) })
        if (email) {
          try {
            await fetch(`http://localhost:8000/history/entry/${email}/${id}`, { method: 'DELETE' })
          } catch (e) {
            console.error(e)
          }
        }
      },

      clearLocalHistory: () => set({ history: [] }),
    }),
    {
      name: 'forecastify_history',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)

// Admin Settings Store
export const useAdminSettingsStore = create(
  persist(
    (set) => ({
      rateLimit: 50, // forecasts per month for regular users
      userStorageLimit: 5, // MB for regular users
      adminStorageLimit: 50, // MB for admins
      featureToggles: {
        pdfSharing: true,
        advancedModels: true,
      },
      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
      updateFeatureToggle: (key, value) => set((state) => ({
        featureToggles: { ...state.featureToggles, [key]: value }
      })),
    }),
    {
      name: 'forecastify_admin_settings',
    }
  )
)

// Platform Analytics Store
export const usePlatformStore = create(
  persist(
    (set, get) => ({
      activityFeed: [],
      stats: {
        totalDatasetsUploaded: 0,
        totalDataPointsProcessed: 0,
      },

      addActivity: (activity) => {
        const currentFeed = get().activityFeed
        
        // Update stats if necessary
        let newStats = { ...get().stats }
        if (activity.action === 'FORECAST_GENERATED') {
          newStats.totalDatasetsUploaded += 1
          if (activity.details?.points) {
            newStats.totalDataPointsProcessed += activity.details.points
          }
        }

        set({
          stats: newStats,
          activityFeed: [
            {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              ...activity,
            },
            ...currentFeed,
          ].slice(0, 500), // Keep last 500 actions
        })
      },

      getPeakUsageHours: () => {
        const feed = get().activityFeed
        const hoursCount = new Array(24).fill(0)
        feed.forEach(item => {
          const hour = new Date(item.timestamp).getHours()
          hoursCount[hour]++
        })
        return hoursCount.map((count, hour) => ({ hour: `${hour}:00`, count }))
      },
      
      getUserForecastsThisMonth: (email) => {
        const feed = get().activityFeed
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        
        return feed.filter(item => {
          if (item.userEmail !== email || item.action !== 'FORECAST_GENERATED') return false;
          const itemDate = new Date(item.timestamp)
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
        }).length
      }
    }),
    {
      name: 'forecastify_platform_stats',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
