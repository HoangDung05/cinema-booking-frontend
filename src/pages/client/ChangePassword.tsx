import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { CURRENT_USER_STORAGE_KEY } from '../../utils/authSession';

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  let authPayload: any = null;
  try {
    const rawCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (rawCurrentUser) authPayload = JSON.parse(rawCurrentUser);
  } catch {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }

  if (!authPayload?.email) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin mật khẩu.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await userService.changeMyPassword(authPayload.email, form.currentPassword, form.newPassword);
      setMessage('Đổi mật khẩu thành công.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-headline font-bold text-on-surface mb-8">Đổi mật khẩu</h1>
      <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/20 shadow-sm space-y-4">
        <div>
          <p className="text-sm text-on-surface-variant mb-1">Mật khẩu hiện tại</p>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            className="w-full border border-outline-variant/40 rounded-lg px-3 py-2 bg-surface"
          />
        </div>
        <div>
          <p className="text-sm text-on-surface-variant mb-1">Mật khẩu mới</p>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            className="w-full border border-outline-variant/40 rounded-lg px-3 py-2 bg-surface"
          />
        </div>
        <div>
          <p className="text-sm text-on-surface-variant mb-1">Xác nhận mật khẩu mới</p>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full border border-outline-variant/40 rounded-lg px-3 py-2 bg-surface"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-primary text-white font-headline font-bold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </div>
  );
}
