import { Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { readAuthSession, isAdminSession } from '../utils/authSession';

/**
 * Chỉ cho phép user đã đăng nhập và role_id = 2 (admin) vào /admin/*.
 */
export default function AdminRoute() {
  const session = readAuthSession();
  if (!session) {
    return <Navigate to="/" replace />;
  }
  if (!isAdminSession(session)) {
    return <Navigate to="/" replace />;
  }
  return <AdminLayout />;
}
