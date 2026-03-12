import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Eye, FilePlus, MessageCircle, Trash2 } from 'lucide-react';
import {
  fetchStatsSummary,
  fetchPopularViews,
  fetchPopularComments,
  isApiError,
} from '@/lib/api';

export default function Dashboard() {
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('day');
  const [stats, setStats] = useState<{
    views: { date: string; count: number }[];
    adds: { date: string; count: number }[];
    deletes: { date: string; count: number }[];
    comments: { date: string; count: number }[];
  } | null>(null);
  const [popularViews, setPopularViews] = useState<
    { id: string; title: string; views: number }[]
  >([]);
  const [popularComments, setPopularComments] = useState<
    { id: string; title: string; commentCount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summary, views, comments] = await Promise.all([
          fetchStatsSummary(period),
          fetchPopularViews(10),
          fetchPopularComments(10),
        ]);
        setStats(summary);
        setPopularViews(views);
        setPopularComments(comments);
      } catch (err) {
        setError(isApiError(err) || err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
    }
    };
    load();
  }, [period]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    type ChartPoint = {
      date: string;
      views?: number;
      adds?: number;
      deletes?: number;
      comments?: number;
    };
    const map = new Map<string, ChartPoint>();
    const process = (
      series: { date: string; count: number }[],
      key: keyof Omit<ChartPoint, 'date'>
    ) => {
      series.forEach(item => {
        const existing = map.get(item.date) || { date: item.date };
        existing[key] = item.count;
        map.set(item.date, existing);
      });
    };
    process(stats.views, 'views');
    process(stats.adds, 'adds');
    process(stats.deletes, 'deletes');
    process(stats.comments, 'comments');
    return Array.from(map.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [stats]);

  const totals = useMemo(
    () =>
      chartData.reduce(
        (acc, curr) => ({
          views: acc.views + (curr.views || 0),
          adds: acc.adds + (curr.adds || 0),
          deletes: acc.deletes + (curr.deletes || 0),
          comments: acc.comments + (curr.comments || 0),
        }),
        { views: 0, adds: 0, deletes: 0, comments: 0 }
      ),
    [chartData]
  );

  const formatXAxis = (val: string) => {
    if (!val) return '';
    if (period === 'day') return format(parseISO(val), 'MMM d');
    if (period === 'month') return format(parseISO(val + '-01'), 'MMM yyyy');
    return val;
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length && label) {
      return (
        <div
          className="bg-white p-3 border border-zinc-200 shadow-lg rounded-xl"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-zinc-900 mb-2">
            {formatXAxis(label)}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-zinc-600">{entry.name}:</span>
              <span className="font-medium text-zinc-900 tabular-nums">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !stats) {
    return (
      <div className="space-y-8">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">
          仪表盘
        </h2>
        <p className="text-zinc-500">加载中…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">
          仪表盘
        </h2>
        <label htmlFor="period-select" className="sr-only">
          统计周期
        </label>
        <select
          id="period-select"
          value={period}
          onChange={e => setPeriod(e.target.value as 'day' | 'month' | 'year')}
          className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900"
          aria-label="选择统计周期"
        >
          <option value="day">按日统计</option>
          <option value="month">按月统计</option>
          <option value="year">按年统计</option>
        </select>
      </div>

      {error && (
        <div
          className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Eye className="w-6 h-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-500">总浏览量</p>
            <p className="text-2xl font-semibold text-zinc-900 tabular-nums">
              {totals.views}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <FilePlus className="w-6 h-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-500">新增文章</p>
            <p className="text-2xl font-semibold text-zinc-900 tabular-nums">
              {totals.adds}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <MessageCircle className="w-6 h-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-500">新增评论</p>
            <p className="text-2xl font-semibold text-zinc-900 tabular-nums">
              {totals.comments}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
            <Trash2 className="w-6 h-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-500">删除文章</p>
            <p className="text-2xl font-semibold text-zinc-900 tabular-nums">
              {totals.deletes}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
          aria-labelledby="views-chart-title"
        >
          <h3
            id="views-chart-title"
            className="text-base font-medium mb-6 text-zinc-800"
          >
            浏览量趋势
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e4e7"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="浏览量"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
          aria-labelledby="adds-chart-title"
        >
          <h3
            id="adds-chart-title"
            className="text-base font-medium mb-6 text-zinc-800"
          >
            新增文章趋势
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e4e7"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="adds"
                  name="新增文章"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
          aria-labelledby="comments-chart-title"
        >
          <h3
            id="comments-chart-title"
            className="text-base font-medium mb-6 text-zinc-800"
          >
            新增评论趋势
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorComments"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e4e7"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="comments"
                  name="新增评论"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComments)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
          aria-labelledby="deletes-chart-title"
        >
          <h3
            id="deletes-chart-title"
            className="text-base font-medium mb-6 text-zinc-800"
          >
            删除文章趋势
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e4e7"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="deletes"
                  name="删除文章"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
          aria-labelledby="popular-views-title"
        >
          <h3 id="popular-views-title" className="text-lg font-medium mb-4">
            热门文章浏览排行
          </h3>
          <div className="space-y-4">
            {popularViews.length > 0 ? (
              popularViews.map((article, i) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-mono text-zinc-400 w-4 shrink-0 tabular-nums">
                      {i + 1}.
                    </span>
                    <span className="font-medium text-zinc-700 truncate">
                      {article.title}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md shrink-0 tabular-nums">
                    {article.views} 次浏览
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">暂无数据</p>
            )}
          </div>
        </section>

        <section
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
          aria-labelledby="popular-comments-title"
        >
          <h3 id="popular-comments-title" className="text-lg font-medium mb-4">
            热门文章评论排行
          </h3>
          <div className="space-y-4">
            {popularComments.length > 0 ? (
              popularComments.map((article, i) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-mono text-zinc-400 w-4 shrink-0 tabular-nums">
                      {i + 1}.
                    </span>
                    <span className="font-medium text-zinc-700 truncate">
                      {article.title}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md shrink-0 tabular-nums">
                    {article.commentCount} 条评论
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">暂无数据</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
