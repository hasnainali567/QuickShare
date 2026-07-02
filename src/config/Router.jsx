import React from 'react'
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { Home, Landing, Auth } from '../pages';
import { AppLayout } from '../components';
import { useAuth } from '../context/AuthContext.jsx';

const RootRoute = () => {
  const [searchParams] = useSearchParams()
  const hasSharedContent = Boolean(searchParams.get('id') || searchParams.get('protected'))
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return null
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
    return null
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
