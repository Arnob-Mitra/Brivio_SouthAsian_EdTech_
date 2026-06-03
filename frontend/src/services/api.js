import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? 'http://localhost:5000' : '')

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

export function saveGrowthPlan(planData) {
  return apiClient.post('/api/plans', planData)
}

export function getGrowthPlansByEmail(email) {
  return apiClient.get('/api/plans', {
    params: { email },
  })
}