import { Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'

export function ProtectedRoute() {
  const { userId, loading, profile } = useAuthStore()
  const { load, loaded } = useDataStore()

  useEffect(() => {
    if (userId && !loaded) load(userId)
  }, [userId, loaded, load])

  if (loading) return <FullScreenSpinner />
  if (!userId) return <Navigate to="/login" replace />
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

export function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-petroleo border-t-transparent" />
    </div>
  )
}
