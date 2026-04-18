import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { CURRENT_USER_STORAGE_KEY, readAuthSession } from '../utils/authSession';

export default function Layout() { // Bỏ { children }
  const location = useLocation();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('Admin');

  useEffect(() => {
    const session = readAuthSession();
    const name = session?.fullName?.trim() || session?.email?.trim() || 'Admin';
    setDisplayName(name);
  }, []);

  const avatarUrl = useMemo(() => {
    const enc = encodeURIComponent(displayName);
    return `https://ui-avatars.com/api/?name=${enc}&background=0ea5e9&color=fff`;
  }, [displayName]);
  // Cập nhật lại đường dẫn để có tiền tố /admin
  const navItems = [
    { name: 'Phim', path: '/admin/movies', icon: 'movie' },
    { name: 'Suất chiếu', path: '/admin/showtimes', icon: 'schedule' },
    { name: 'Mã Giảm Giá', path: '/admin/vouchers', icon: 'confirmation_number' },
    { name: 'Người Dùng', path: '/admin/users', icon: 'group' },
    { name: 'Phòng', path: '/admin/rooms', icon: 'meeting_room'},
    { name: 'Vé', path: '/admin/tickets', icon: 'confirmation_number' },
  ];

  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    navigate('/', { replace: true });
  };
  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-body">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full flex flex-col py-8 bg-white dark:bg-gray-950 w-64 border-r border-gray-100 dark:border-gray-900 shadow-sm z-50">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-black text-sky-600 dark:text-sky-400 tracking-tight font-headline">Trang Quản Lý</h1>
          <p className="font-manrope text-sm font-medium text-gray-500 mt-1">Quản Lý Thông Tin</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-headline text-sm font-medium transition-colors duration-200 ${isActive
                    ? 'text-sky-600 dark:text-sky-400 font-bold border-r-4 border-sky-500 bg-sky-50 dark:bg-sky-900/20 translate-x-1'
                    : 'text-gray-500 dark:text-gray-400 hover:text-sky-500 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="px-6 pt-6 border-t border-gray-100 dark:border-gray-900">
          <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border-2 border-white">
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-on-surface">{displayName}</p>
              <p className="text-[10px] text-on-surface-variant">Quản trị viên</p>
            </div>
          </div>
          {/* Nút logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="relative z-[999] pointer-events-auto mt-3 w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 transition-colors font-medium cursor-pointer"
          >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="flex items-center justify-between px-8 h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-4">
            <h2 className="font-headline font-extrabold text-lg tracking-tight text-on-surface">
            
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-gray-600">
              <button className="hover:text-sky-500 transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="hover:text-sky-500 transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {/* CỰC KỲ QUAN TRỌNG: Dùng Outlet thay cho {children} */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}