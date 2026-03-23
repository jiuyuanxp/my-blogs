import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { login, setToken } from '@/lib/api';
import { apiErrorMessage } from '@/lib/errorMessage';
import { ErrorAlert } from '@/components/ErrorAlert';
import backgroundImage from '@/assets/images/logo-background.png';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { token } = await login(username, password, rememberMe);
      setToken(token);
      onLogin();
    } catch (err) {
      setError(apiErrorMessage(err, '登录失败，请检查用户名和密码。'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcfcfc] font-sans">
      {/* Left Pane - Brand & Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] overflow-hidden">
        <img
          src={backgroundImage}
          alt=""
          role="presentation"
          width={2070}
          height={1380}
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
            <Lock className="w-6 h-6 text-white" aria-hidden />
          </div>
          <div className="mt-auto">
            <h1 className="text-6xl font-serif font-bold mb-6 tracking-tight">博客管理</h1>
            <p className="text-xl text-zinc-400 max-w-md font-light leading-relaxed">
              记录思考，沉淀价值。极简、优雅的个人内容管理系统。
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-serif font-bold text-zinc-900 tracking-tight">欢迎回来</h2>
            <p className="mt-3 text-zinc-500">请输入用户名和密码以继续访问控制台</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? <ErrorAlert message={error} /> : null}
            <div className="space-y-2">
              <label htmlFor="admin-username" className="text-sm font-medium text-zinc-700">
                用户名
              </label>
              <input
                id="admin-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 focus:outline-none transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-zinc-900"
                placeholder="请输入用户名…"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium text-zinc-700">
                密码
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 focus:outline-none transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-zinc-900"
                placeholder="请输入密码…"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="admin-remember"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <label htmlFor="admin-remember" className="text-sm text-zinc-600">
                记住我
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group bg-[#0a0a0a] text-white py-3.5 rounded-xl font-medium hover:bg-zinc-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            >
              {isLoading ? '验证中…' : '进入系统'}
              {!isLoading && (
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  aria-hidden
                />
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-zinc-100 text-center lg:text-left">
            <p className="text-xs text-zinc-400 font-mono">
              &copy; {new Date().getFullYear()} 博客管理. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
