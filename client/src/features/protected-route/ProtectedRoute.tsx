import {useAuthStore} from "../../shared/user/model/store";
import {Navigate, Outlet} from "react-router-dom";

export const ProtectedRoute = () => {
  const status = useAuthStore(state => state.status)

  switch (status) {
    case "loading":
      return <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }} />
    case "idle":
      return <Navigate to={'/login'} replace/>
    case "unauthenticated":
      return <Navigate to={'/login'} replace/>
    case "authenticated":
      return <Outlet/>
    default:
      return <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }} />
  }
}