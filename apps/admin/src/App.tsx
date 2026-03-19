import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import Login from './pages/Login';
import { cn } from '@blog/utils';
import { getToken, logout as apiLogout } from './lib/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ROUTES } from './routes';

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, refresh, hasMenu } = useAuth();

  const navItems = ROUTES.filter((item) => hasMenu(item.menuPermission));
  const defaultPath = navItems[0]?.path ?? '/';

  // 登录后或访问根路径时，重定向到有权限的第一个菜单（必须在所有 return 之前调用，遵守 Hooks 规则）
  useEffect(() => {
    if (location.pathname === '/' && defaultPath !== '/') {
      navigate(defaultPath, { replace: true });
    }
  }, [location.pathname, defaultPath, navigate]);

  const handleLogin = async () => {
    await refresh();
  };

  const handleLogout = async () => {
    await apiLogout();
    window.location.reload();
  };

  if (!getToken()) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
        <p className="text-zinc-500">验证登录状态…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fcfcfc] text-zinc-900 font-sans overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] text-white flex items-center justify-between px-4 z-40 border-b border-zinc-900">
        <h1 className="text-xl font-serif font-bold tracking-tight">博客管理</h1>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" aria-hidden />
          ) : (
            <Menu className="w-6 h-6" aria-hidden />
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsMobileMenuOpen(false)}
          role="presentation"
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] text-zinc-400 flex flex-col border-r border-zinc-900 transition-transform duration-300 ease-out lg:relative lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label="主导航"
      >
        <div className="p-6 border-b border-white/5 hidden lg:block">
          <h1 className="text-2xl font-serif font-bold tracking-tight text-white">博客管理</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-16 lg:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
                    isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            <LogOut className="w-5 h-5 shrink-0" aria-hidden />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0" id="main-content">
        <div className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto">
          <Routes>
            {ROUTES.map((route) => (
              <Route key={route.id} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
