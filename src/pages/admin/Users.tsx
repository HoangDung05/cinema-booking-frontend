import { useEffect, useMemo, useState } from 'react';
import { authService } from '../../services/authService';
import { adminChangeUserRole, adminChangeUserStatus, adminListUsers, type BackendUser } from '../../services/adminUserService';
import { readAuthSession } from '../../utils/authSession';

type UserRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'LOCKED';
  role: 'CUSTOMER' | 'ADMIN';
  joined: string;
  avatar: string;
};

type UserForm = {
  id: number | null;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  joined: string;
  avatar: string;
  password?: string;
};

const emptyForm: UserForm = {
  id: null,
  name: '',
  email: '',
  phone: '',
  role: 'CUSTOMER',
  joined: '',
  avatar: '',
  password: '',
};

function getErrorMessage(error: any, fallback: string): string {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallback;
}

function formatDateVN(value: string) {
  if (!value) return '';
  const normalized = value.includes('/') ? value.split('/').reverse().join('-') : value;
  const date = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

function mapBackendToRow(u: BackendUser): UserRow {
  const roleName = (u.role?.name || 'CUSTOMER').toUpperCase();
  const statusName = (u.status || 'ACTIVE').toUpperCase();
  return {
    id: u.id,
    name: u.fullName || '',
    email: u.email,
    phone: u.phone || '',
    status: statusName === 'LOCKED' ? 'LOCKED' : 'ACTIVE',
    role: roleName === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
    joined: (u.createdAt || '').slice(0, 10),
    avatar: '',
  };
}

export default function Users() {
  const session = readAuthSession();
  const currentUserEmail = session?.email?.trim().toLowerCase() || '';
  const [rows, setRows] = useState<UserRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isEdit = useMemo(() => editingId !== null, [editingId]);

  const reload = async () => {
    const data = await adminListUsers();
    setRows(data.map(mapBackendToRow));
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        await reload();
      } catch (e: any) {
        setError(getErrorMessage(e, 'Không tải được danh sách users'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      joined: new Date().toISOString().slice(0, 10),
    });
    setIsOpen(true);
  };

  const openEdit = (row: UserRow) => {
    setEditingId(row.id);
    setForm({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      joined: row.joined,
      avatar: row.avatar,
      password: '',
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveUser = async () => {
    if (!form.name.trim() || !form.email.trim()) return;

    try {
      setError('');

      // CREATE: dùng /auth/register => tạo CUSTOMER
      if (!isEdit) {
        if (!form.password || form.password.length < 4) {
          alert('Tạo mới cần mật khẩu (tối thiểu 4 ký tự).');
          return;
        }

        await authService.register({
          fullName: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        });

        // Nếu muốn tạo ADMIN: sau khi register xong, tìm user theo email rồi đổi role
        if (form.role === 'ADMIN') {
          const data = await adminListUsers();
          const created = data.find((u) => u.email?.toLowerCase?.() === form.email.trim().toLowerCase());
          if (created?.id) {
            await adminChangeUserRole(created.id, 'ADMIN');
          }
        }

        await reload();
        closeModal();
        return;
      }

      // UPDATE: Admin chỉ được phép sửa phân quyền
      if (editingId === null) return;

      const current = rows.find((r) => r.id === editingId);
      if (current && current.role !== form.role) {
        const targetEmail = current.email.trim().toLowerCase();
        if (targetEmail === currentUserEmail && form.role === 'CUSTOMER') {
          setError('Không thể tự hạ quyền tài khoản admin đang đăng nhập.');
          return;
        }
        await adminChangeUserRole(editingId, form.role);
      }

      await reload();
      closeModal();
    } catch (e: any) {
      setError(getErrorMessage(e, 'Lưu thất bại'));
    }
  };

  const toggleUserStatus = async (user: UserRow) => {
    const nextStatus: 'ACTIVE' | 'LOCKED' = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    const actionLabel = nextStatus === 'LOCKED' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} tài khoản ${user.email}?`)) return;
    try {
      setError('');
      await adminChangeUserStatus(user.id, nextStatus);
      await reload();
    } catch (e: any) {
      setError(getErrorMessage(e, 'Cập nhật trạng thái tài khoản thất bại'));
    }
  };

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-headline">Quản lý người dùng</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium">
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm người dùng
        </button>
      </div>

      {loading ? <div className="text-sm text-gray-500">Đang tải...</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm người dùng theo tên, email, SĐT, quyền"
          className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">STT</th>
                <th className="p-4 font-medium">Người dùng</th>
                <th className="p-4 font-medium">Liên hệ</th>
                <th className="p-4 font-medium">Phân quyền</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Ngày tham gia</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {filteredRows.map((u, idx) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-700">{idx + 1}</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{u.name}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-900">{u.email}</p>
                    <p className="text-xs text-gray-500">{u.phone}</p>
                  </td>
                  <td className="p-4">
                    {u.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                  </td>
                  <td className="p-4">
                    {u.status === 'LOCKED' ? 'Đã khóa' : 'Hoạt động'}
                  </td>
                  <td className="p-4 text-gray-600">{formatDateVN(u.joined)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(u)} className="px-3 py-1.5 text-xs rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100">
                        Sửa
                      </button>
                      <button
                        onClick={() => toggleUserStatus(u)}
                        className={`px-3 py-1.5 text-xs rounded-md ${
                          u.status === 'LOCKED'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {u.status === 'LOCKED' ? 'Mở khóa' : 'Khóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredRows.length && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    Chưa có người dùng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-bold">{isEdit ? 'Sửa người dùng' : 'Thêm người dùng'}</h3>
            <div className="space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nhập họ tên"
                className="w-full border rounded-lg px-3 py-2"
                disabled={isEdit}
              />
              <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Nhập email" className="w-full border rounded-lg px-3 py-2" disabled={isEdit} />
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Nhập số điện thoại"
                className="w-full border rounded-lg px-3 py-2"
                disabled={isEdit}
              />
              {!isEdit && (
                <input
                  value={form.password || ''}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Nhập mật khẩu (khi tạo mới)"
                  type="password"
                  className="w-full border rounded-lg px-3 py-2"
                />
              )}
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserForm['role'] }))} className="w-full border rounded-lg px-3 py-2">
                <option value="CUSTOMER">Khách hàng</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
              {isEdit ? (
                <p className="text-xs text-gray-500">
                  Chế độ sửa chỉ cho phép thay đổi phân quyền.
                </p>
              ) : null}
              {isEdit && form.email.trim().toLowerCase() === currentUserEmail ? (
                <p className="text-xs text-amber-700">
                  Bạn không thể đổi quyền tài khoản admin đang đăng nhập sang Khách hàng.
                </p>
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button onClick={saveUser} className="px-4 py-2 rounded-lg bg-sky-600 text-white">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}