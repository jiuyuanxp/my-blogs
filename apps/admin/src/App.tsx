import { useState } from 'react';
import {
  LayoutDashboard,
  FolderTree,
  FileText,
  MessageSquare,
  Users,
  Shield,
  Key,
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
import UsersPage from './pages/Users';
import RolesPage from './pages/Roles';
import PermissionsPage from './pages/Permissions';
import Login from './pages/Login';
import DesignSystem from './pages/DesignSystem';
import ProjectInfo from './pages/ProjectInfo';
import { cn } from './lib/utils';
import { getToken, logout as apiLogout } from './lib/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type Tab =
  | 'dashboard'
  | 'categories'
  | 'articles'
  | 'comments'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'design'
  | 'about';

const ALL_NAV_ITEMS: {
  id: Tab;
  label: string;
  icon: typeof LayoutDashboard;
  menuPermission: string;
}[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, menuPermission: 'dashboard' },
  { id: 'categories', label: '分类管理', icon: FolderTree, menuPermission: 'categories' },
  { id: 'articles', label: '文章管理', icon: FileText, menuPermission: 'articles' },
  { id: 'comments', label: '评论管理', icon: MessageSquare, menuPermission: 'comments' },
  { id: 'users', label: '用户管理', icon: Users, menuPermission: 'users' },
  { id: 'roles', label: '角色管理', icon: Shield, menuPermission: 'roles' },
  { id: 'permissions', label: '权限管理', icon: Key, menuPermission: 'permissions' },
  { id: 'design', label: '设计规范', icon: Palette, menuPermission: 'design' },
  { id: 'about', label: '项目说明', icon: Info, menuPermission: 'about' },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, refresh, hasMenu } = useAuth();

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

  const navItems = ALL_NAV_ITEMS.filter((item) => hasMenu(item.menuPermission));

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
          {activeTab === 'users' && <UsersPage />}
          {activeTab === 'roles' && <RolesPage />}
          {activeTab === 'permissions' && <PermissionsPage />}
          {activeTab === 'design' && <DesignSystem />}
          {activeTab === 'about' && <ProjectInfo />}
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
