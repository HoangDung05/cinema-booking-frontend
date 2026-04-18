import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { movieService, MovieDto } from '../../services/movieService';
import { AuthSession, CURRENT_USER_STORAGE_KEY } from '../../utils/authSession';

type LoginForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

const getNavClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-primary font-headline font-semibold'
    : 'text-on-surface-variant hover:text-primary font-headline font-medium transition-colors';

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<MovieDto[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const rawCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (rawCurrentUser) {
      try {
        const parsedUser = JSON.parse(rawCurrentUser) as AuthSession;
        if (parsedUser?.token && parsedUser?.email) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    function handleOpenLogin() {
      setIsRegisterOpen(false);
      setLoginError('');
      setIsLoginOpen(true);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('open-login-modal', handleOpenLogin);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('open-login-modal', handleOpenLogin);
    };
  }, []);

  useEffect(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) {
      setSearchResults([]);
      setIsSearchOpen(false);
      setIsSearchLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        const data = await movieService.searchMovies(keyword);
        setSearchResults(data);
        setIsSearchOpen(true);
      } catch {
        setSearchResults([]);
        setIsSearchOpen(true);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoginLoading(true);
    setLoginError('');

    try {
      const data = (await authService.login(loginForm)) as AuthSession & { role_id?: string | number };
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(data));
      setUser(data);
      setIsLoginOpen(false);
      setLoginForm({ email: '', password: '' });

      const raw = data.roleId ?? data.role_id;
      const roleId = Number(raw);

      if (roleId === 2) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      setLoginError(error.response?.data || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRegisterLoading(true);
    setRegisterError('');
    const phone = registerForm.phone.trim();
    const password = registerForm.password;

    if (!/^\d{10}$/.test(phone)) {
      setRegisterError('Số điện thoại phải gồm đúng 10 chữ số.');
      setIsRegisterLoading(false);
      return;
    }
    if (password.length < 6) {
      setRegisterError('Mật khẩu phải có ít nhất 6 ký tự.');
      setIsRegisterLoading(false);
      return;
    }

    try {
      await authService.register({
        fullName: registerForm.fullName.trim(),
        email: registerForm.email.trim(),
        phone,
        password,
      });
      setRegisterForm({ fullName: '', email: '', phone: '', password: '' });
      setIsRegisterOpen(false);
      setIsLoginOpen(true);
    } catch (error: any) {
      setRegisterError(error.response?.data || 'Tạo tài khoản thất bại. Email có thể đã tồn tại.');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    setUser(null);
    setIsUserMenuOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <>
      <nav className="fixed w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-2xl font-headline font-bold text-primary tracking-tight">Group3 Cinema</Link>
            <div className="hidden md:flex gap-8">
                <NavLink to="/" end className={getNavClassName}>Trang chủ</NavLink>
                <NavLink to="/about" className={getNavClassName}>Giới thiệu</NavLink>
                <NavLink to="/tickets" className={getNavClassName}>Vé của tôi</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative flex-grow md:w-64" ref={searchRef}>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                onFocus={() => {
                  if (searchKeyword.trim()) setIsSearchOpen(true);
                }}
                placeholder="Tìm kiếm phim..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline"
              />
              {isSearchOpen ? (
                <div className="absolute top-full mt-2 w-full max-h-80 overflow-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-xl z-50">
                  {isSearchLoading ? (
                    <p className="px-4 py-3 text-sm text-on-surface-variant">Đang tìm kiếm...</p>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((movie) => (
                      <Link
                        key={movie.id}
                        to={`/movie/${movie.id}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchKeyword('');
                        }}
                        className="block px-4 py-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 last:border-b-0"
                      >
                        <p className="font-headline font-semibold text-on-surface line-clamp-1">{movie.title}</p>
                        <p className="text-xs text-on-surface-variant">
                          {movie.duration} phút
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-on-surface-variant">Không tìm thấy phim phù hợp.</p>
                  )}
                </div>
              ) : null}
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </button>

            {!user ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterOpen(false);
                    setLoginError('');
                    setIsLoginOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginOpen(false);
                    setRegisterError('');
                    setIsRegisterOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
                >
                  Đăng ký
                </button>
              </div>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-primary/20 overflow-hidden cursor-pointer block"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-outline-variant/30 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Hồ sơ cá nhân
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/change-password');
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Đổi mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {isLoginOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">Đăng nhập</h2>
              <button
                type="button"
                onClick={() => {
                  setIsLoginOpen(false);
                  setLoginError('');
                }}
                className="text-on-surface-variant"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Email"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                className="w-full border border-outline-variant/40 rounded-lg px-3 py-2"
              />
              <input
                type="password"
                required
                placeholder="Mật khẩu"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                className="w-full border border-outline-variant/40 rounded-lg px-3 py-2"
              />
              {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
              <button type="submit" disabled={isLoginLoading} className="w-full bg-primary text-white rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50">
                {isLoginLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isRegisterOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">Đăng ký</h2>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterOpen(false);
                  setRegisterError('');
                }}
                className="text-on-surface-variant"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Họ tên"
                value={registerForm.fullName}
                onChange={(event) => setRegisterForm({ ...registerForm, fullName: event.target.value })}
                className="w-full border border-outline-variant/40 rounded-lg px-3 py-2"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                className="w-full border border-outline-variant/40 rounded-lg px-3 py-2"
              />
              <input
                type="tel"
                required
                placeholder="Số điện thoại"
                value={registerForm.phone}
                onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })}
                className="w-full border border-outline-variant/40 rounded-lg px-3 py-2"
              />
              <input
                type="password"
                required
                placeholder="Mật khẩu"
                value={registerForm.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                className="w-full border border-outline-variant/40 rounded-lg px-3 py-2"
              />
              {registerError ? <p className="text-sm text-red-600">{registerError}</p> : null}
              <button type="submit" disabled={isRegisterLoading} className="w-full bg-primary text-white rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50">
                {isRegisterLoading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
