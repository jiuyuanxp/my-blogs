/**
 * 路由配置：path 与 menuPermission 一一对应，便于后续权限管理设计
 */
import {
  LayoutDashboard,
  FolderTree,
  FileText,
  MessageSquare,
  Users,
  Shield,
  Key,
  Palette,
  Info,
  type LucideIcon,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Articles from './pages/Articles';
import Comments from './pages/Comments';
import UsersPage from './pages/Users';
import RolesPage from './pages/Roles';
import PermissionsPage from './pages/Permissions';
import DesignSystem from './pages/DesignSystem';
import ProjectInfo from './pages/ProjectInfo';

export type RouteId =
  | 'dashboard'
  | 'categories'
  | 'articles'
  | 'comments'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'design'
  | 'about';

export const ROUTES: {
  id: RouteId;
  path: string;
  label: string;
  icon: LucideIcon;
  menuPermission: string;
  element: React.ReactNode;
}[] = [
  {
    id: 'dashboard',
    path: '/',
    label: '仪表盘',
    icon: LayoutDashboard,
    menuPermission: 'dashboard',
    element: <Dashboard />,
  },
  {
    id: 'categories',
    path: '/categories',
    label: '分类管理',
    icon: FolderTree,
    menuPermission: 'categories',
    element: <Categories />,
  },
  {
    id: 'articles',
    path: '/articles',
    label: '文章管理',
    icon: FileText,
    menuPermission: 'articles',
    element: <Articles />,
  },
  {
    id: 'comments',
    path: '/comments',
    label: '评论管理',
    icon: MessageSquare,
    menuPermission: 'comments',
    element: <Comments />,
  },
  {
    id: 'users',
    path: '/users',
    label: '用户管理',
    icon: Users,
    menuPermission: 'users',
    element: <UsersPage />,
  },
  {
    id: 'roles',
    path: '/roles',
    label: '角色管理',
    icon: Shield,
    menuPermission: 'roles',
    element: <RolesPage />,
  },
  {
    id: 'permissions',
    path: '/permissions',
    label: '权限管理',
    icon: Key,
    menuPermission: 'permissions',
    element: <PermissionsPage />,
  },
  {
    id: 'design',
    path: '/design',
    label: '设计规范',
    icon: Palette,
    menuPermission: 'design',
    element: <DesignSystem />,
  },
  {
    id: 'about',
    path: '/about',
    label: '项目说明',
    icon: Info,
    menuPermission: 'about',
    element: <ProjectInfo />,
  },
];
