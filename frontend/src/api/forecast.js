import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
})

/**
 * Upload CSV file and get forecast results
 */
export const uploadForecast = async (file, steps = 30) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('steps', steps)   // ✅ send slider value

  try {
    const response = await api.post('/forecast', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data

  } catch (error) {
    console.error('API Error:', error)
    throw new Error(
      error?.response?.data?.error || 'Failed to fetch forecast from server'
    )
  }
}


/**
 * Validate and parse forecast response
 */
export const parseForecastResponse = (data) => {
  if (!data) throw new Error('Empty response from server')

  const required = ['best_model', 'dates', 'forecast', 'actual_dates', 'actual_values']
  for (const key of required) {
    if (!(key in data)) {
      throw new Error(`Missing field in response: ${key}`)
    }
  }

  const forecastDates = data.dates
    .map(d => new Date(d))
    .filter(d => !isNaN(d.getTime()))   // ✅ FIXED

  const actualDates = data.actual_dates
    .map(d => new Date(d))
    .filter(d => !isNaN(d.getTime()))   // ✅ FIXED

  const forecastValues = data.forecast
    .map(v => Number(v))
    .filter(v => !isNaN(v))

  const actualValues = data.actual_values
    .map(v => Number(v))
    .filter(v => !isNaN(v))

  if (!forecastDates.length || !forecastValues.length) {
    throw new Error('Invalid forecast data')
  }

  return {
    best_model: data.best_model,
    forecastDates,
    forecastValues,
    actualDates,
    actualValues,
    rawForecastDates: data.dates,
    rawActualDates: data.actual_dates,
    dashboardMetrics: data.dashboard_metrics || {}
  }
}

export default api