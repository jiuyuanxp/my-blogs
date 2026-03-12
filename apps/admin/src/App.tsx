import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderTree,
  FileText,
  MessageSquare,
  LogOut,
  Palette,
  Info,
  Menu,
  X,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Articles from './pages/Articles';
import Comments from './pages/Comments';
import Login from './pages/Login';
import DesignSystem from './pages/DesignSystem';
import ProjectInfo from './pages/ProjectInfo';
import { cn } from './lib/utils';
import { getToken, logout as apiLogout, checkAuth } from './lib/api';

type Tab =
  | 'dashboard'
  | 'categories'
  | 'articles'
  | 'comments'
  | 'design'
  | 'about';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(typeof window !== 'undefined' && getToken())
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState(isAuthenticated);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && getToken()) {
      checkAuth().then(valid => {
        setIsCheckingAuth(false);
        if (!valid) setIsAuthenticated(false);
      });
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await apiLogout();
    setIsAuthenticated(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
        <p className="text-zinc-500">验证登录状态…</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard' as const, label: '仪表盘', icon: LayoutDashboard },
    { id: 'categories' as const, label: '分类管理', icon: FolderTree },
    { id: 'articles' as const, label: '文章管理', icon: FileText },
    { id: 'comments' as const, label: '评论管理', icon: MessageSquare },
    { id: 'design' as const, label: '设计规范', icon: Palette },
    { id: 'about' as const, label: '项目说明', icon: Info },
  ];

  return (
    <div className="flex h-screen bg-[#fcfcfc] text-zinc-900 font-sans overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] text-white flex items-center justify-between px-4 z-40 border-b border-zinc-900">
        <h1 className="text-xl font-serif font-bold tracking-tight">
          博客管理
        </h1>
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
          onKeyDown={e => e.key === 'Escape' && setIsMobileMenuOpen(false)}
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
          <h1 className="text-2xl font-serif font-bold tracking-tight text-white">
            博客管理
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-16 lg:mt-0">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
                  activeTab === item.id
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden />
                {item.label}
              </button>
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
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'articles' && <Articles />}
          {activeTab === 'comments' && <Comments />}
          {activeTab === 'design' && <DesignSystem />}
          {activeTab === 'about' && <ProjectInfo />}
        </div>
      </main>
    </div>
  );
}
