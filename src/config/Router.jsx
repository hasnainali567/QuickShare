import React from 'react'
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { Home, Landing, Auth } from '../pages';
import { AppLayout } from '../components';
import { useAuth } from '../context/AuthContext.jsx';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
  </div>
);

const RootRoute = () => {
  const [searchParams] = useSearchParams()
  const hasSharedContent = Boolean(searchParams.get('id') || searchParams.get('protected'))
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (hasSharedContent && !user) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return (
    <AppLayout>
      {hasSharedContent ? <Home /> : <Landing />}
    </AppLayout>
  )
}

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return children
}

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<RootRoute />} />
      <Route path='/auth' element={<AppLayout><Auth /></AppLayout>} />
      <Route path='/app' element={<RequireAuth><AppLayout><Home /></AppLayout></RequireAuth>} />
      <Route path='*' element={<RootRoute />} />
    </Routes>

  )
}

export default AppRouter;
