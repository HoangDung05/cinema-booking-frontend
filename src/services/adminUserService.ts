import apiClient from './apiClient';

export type BackendRole = {
  id: number;
  name: string;
};

export type BackendUser = {
  id: number;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  createdAt?: string | null;
  status?: string | null;
  role?: BackendRole | null;
};

export async function adminListUsers() {
  const res = await apiClient.get<BackendUser[]>('/admin/users');
  return res.data;
}

export async function adminUpdateUser(id: number, payload: { fullName?: string; phone?: string }) {
  const res = await apiClient.put<BackendUser>(`/admin/users/${id}`, payload);
  return res.data;
}

export async function adminDeleteUser(id: number) {
  const res = await apiClient.delete<string>(`/admin/users/${id}`);
  return res.data;
}

export async function adminChangeUserRole(id: number, role: 'ADMIN' | 'CUSTOMER') {
  const res = await apiClient.put<BackendUser>(`/admin/users/${id}/role`, {}, { params: { role } });
  return res.data;
}

export async function adminChangeUserStatus(id: number, status: 'ACTIVE' | 'LOCKED') {
  const res = await apiClient.put<string>(`/admin/user/${id}/status`, {}, { params: { status } });
  return res.data;
}

