export const CURRENT_USER_STORAGE_KEY = 'currentUser';

/** Dữ liệu sau đăng nhập — roleId do backend trả về (bảng users.role_id) */
export type AuthSession = {
  token: string;
  type?: string;
  id?: number;
  email: string;
  fullName?: string;
  role?: string;
  roleId?: number;
  /** Một số cấu hình Jackson có thể trả snake_case */
  role_id?: number;
  phone?: string;
  avatarUrl?: string;
};

/** Chuẩn hóa role id từ payload API (số hoặc chuỗi, camelCase hoặc snake_case) */
export function resolveRoleId(session: Partial<AuthSession> | null | undefined): number | undefined {
  if (!session) return undefined;
  const raw = session.roleId ?? session.role_id;
  if (raw === undefined || raw === null) return undefined;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function readAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (typeof parsed.token !== 'string' || typeof parsed.email !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isAdminSession(session: AuthSession | null): boolean {
  return resolveRoleId(session) === 2;
}
