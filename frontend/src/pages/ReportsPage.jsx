import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getReportsData } from '../api/reports';
import { exportTransactionsCSV } from '../api/transactions';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export default function ReportsPage() {
  const { showToast, refreshTrigger } = useOutletContext();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, refreshTrigger]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await getReportsData(params);
      setData(res);
    } catch (err) {
      showToast(err.message || 'Failed to generate financial reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    exportTransactionsCSV(startDate, endDate);
  };

  const customTooltipFormatter = (val) => [formatCurrency(val), ''];

  if (loading && !data) {
    return <LoadingSpinner text="Compiling financial analytics and statements..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filter and Export Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Financial Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive audit reports, periodic summaries, and CSV data export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date range picker */}
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              Clear
            </button>
          )}

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Transactions (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Period Income"
          value={formatCurrency(data?.total_income || 0)}
          icon={TrendingUp}
          colorScheme="emerald"
        />
        <StatCard
          title="Period Expenses"
          value={formatCurrency(data?.total_expenses || 0)}
          icon={TrendingDown}
          colorScheme="rose"
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(data?.net_savings || 0)}
          icon={PiggyBank}
          colorScheme="purple"
        />
        <StatCard
          title="Savings Rate"
          value={formatPercentage(data?.savings_rate || 0)}
          icon={Percent}
          colorScheme="blue"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-base">Monthly Cashflow Performance</h3>
            <p className="text-xs text-slate-400">Earnings compared to spending over time</p>
          </div>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.income_vs_expense || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip formatter={customTooltipFormatter} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Spending Area Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-base">Expense Curve & Volatility</h3>
            <p className="text-xs text-slate-400">Daily spending momentum throughout the active period</p>
          </div>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.daily_trends || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip formatter={customTooltipFormatter} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Expense"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Expense Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Category-Wise Expense Statement</h3>
          <p className="text-xs text-slate-400">Aggregate expenditures classified by category</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Entries</th>
                <th className="py-3 px-5 text-right">Total Amount</th>
                <th className="py-3 px-5 text-right">Share of Expense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data?.category_breakdown?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    No expense data found in the selected period.
                  </td>
                </tr>
              ) : (
                data?.category_breakdown?.map((item) => (
                  <tr key={item.category_name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5 font-bold text-slate-800 flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color || '#64748B' }}
                      />
                      <span>{item.category_name}</span>
                    </td>
                    <td className="py-3 px-5 text-slate-600 font-semibold text-xs">
                      {item.count} transactions
                    </td>
                    <td className="py-3 px-5 text-right font-extrabold text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                        {formatPercentage(item.percentage)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Periodic Summary Table (Monthly Breakdown) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Periodic Performance Summary</h3>
          <p className="text-xs text-slate-400">Monthly breakdown of income, expense, and net savings</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Period</th>
                <th className="py-3 px-5 text-right">Income</th>
                <th className="py-3 px-5 text-right">Expenses</th>
                <th className="py-3 px-5 text-right">Net Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data?.periodic_summary?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    No periodic data available.
                  </td>
                </tr>
              ) : (
                data?.periodic_summary?.map((p) => (
                  <tr key={p.label} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5 font-bold text-slate-800">{p.label}</td>
                    <td className="py-3 px-5 text-right font-semibold text-emerald-600">
                      {formatCurrency(p.income)}
                    </td>
                    <td className="py-3 px-5 text-right font-semibold text-rose-600">
                      {formatCurrency(p.expense)}
                    </td>
                    <td
                      className={`py-3 px-5 text-right font-extrabold ${
                        p.net >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatCurrency(p.net)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

