import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart as PieIcon,
  ArrowRight,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getDashboardSummary, resetData, seedDemoData } from '../api/dashboard';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';

const PRESET_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#64748B'];

export default function DashboardPage() {
  const { showToast, refreshTrigger, setRefreshTrigger } = useOutletContext();

  const [filterType, setFilterType] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [filterType, startDate, endDate, refreshTrigger]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const params = { filter_type: filterType };
      if (filterType === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      const data = await getDashboardSummary(params);
      setSummary(data);
    } catch (err) {
      showToast(err.message || 'Failed to load dashboard summary', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      const res = await resetData();
      showToast(res.message || 'All data reset.');
      setShowResetConfirm(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Failed to reset data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      const res = await seedDemoData();
      showToast(res.message || 'Demo data loaded.');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Failed to load demo data', 'error');
    }
  };

  if (loading && !summary) {
    return <LoadingSpinner text="Computing financial analytics..." />;
  }

  // Format currency tooltip for Recharts
  const customTooltipFormatter = (value) => [formatCurrency(value), ''];

  return (
    <div className="space-y-6">
      {/* Top Filter & Actions Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Filter:
          </span>
          {[
            { id: 'this_month', label: 'Current Month' },
            { id: 'last_month', label: 'Previous Month' },
            { id: 'all', label: 'All Time' },
            { id: 'custom', label: 'Custom Range' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterType === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Custom date range inputs */}
        {filterType === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
            />
          </div>
        )}

        {/* Action Pills */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleSeedDemo}
            title="Load sample transactions for instant demo"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Data</span>
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Clear all transactions to start fresh"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Current Balance"
          value={formatCurrency(summary?.current_balance || 0)}
          subtext="Total Income − Total Expenses"
          icon={Wallet}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(summary?.monthly_income || 0)}
          subtext="Filtered Period Earnings"
          icon={TrendingUp}
          colorScheme="blue"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.monthly_expenses || 0)}
          subtext="Filtered Period Outflow"
          icon={TrendingDown}
          colorScheme="rose"
        />
        <StatCard
          title="Monthly Savings"
          value={formatCurrency(summary?.monthly_savings || 0)}
          subtext={`Savings Rate: ${formatPercentage(summary?.savings_rate || 0)}`}
          icon={PiggyBank}
          colorScheme="purple"
        />
        <StatCard
          title="Budget Usage"
          value={
            summary?.overall_budget
              ? formatPercentage(summary?.overall_budget_percentage || 0)
              : 'No Limit'
          }
          subtext={
            summary?.overall_budget
              ? `${formatCurrency(summary?.overall_budget_spent)} / ${formatCurrency(summary?.overall_budget)}`
              : 'Set budget in Budgets page'
          }
          icon={PieIcon}
          colorScheme={
            summary?.overall_budget_status === 'exceeded'
              ? 'rose'
              : summary?.overall_budget_status === 'warning'
              ? 'amber'
              : 'indigo'
          }
        />
      </div>

      {/* Budget Warning Banner if Exceeded or Warning */}
      {summary?.overall_budget_status === 'exceeded' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Monthly Budget Limit Exceeded!</p>
              <p className="text-xs text-rose-700">
                You have spent {formatCurrency(summary.overall_budget_spent)}, exceeding your monthly budget of{' '}
                {formatCurrency(summary.overall_budget)} ({formatPercentage(summary.overall_budget_percentage)} used).
              </p>
            </div>
          </div>
          <Link
            to="/budgets"
            className="text-xs font-bold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors whitespace-nowrap"
          >
            Manage Budget
          </Link>
        </div>
      )}

      {summary?.overall_budget_status === 'warning' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Budget Warning: 80% Threshold Reached</p>
              <p className="text-xs text-amber-700">
                You have reached {formatPercentage(summary.overall_budget_percentage)} of your monthly budget (
                {formatCurrency(summary.overall_budget_spent)} / {formatCurrency(summary.overall_budget)}).
              </p>
            </div>
          </div>
          <Link
            to="/budgets"
            className="text-xs font-bold px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            Review Budget
          </Link>
        </div>
      )}

      {/* Charts Row: Category Breakdown Donut & Income vs Expense Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Expense Category Breakdown</h3>
              <p className="text-xs text-slate-400">Distribution of expenditures by category</p>
            </div>
            <span className="text-xs font-bold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
              {summary?.category_breakdown?.length || 0} Categories
            </span>
          </div>

          <div className="h-72 w-full flex-1 flex items-center justify-center">
            {summary?.category_breakdown?.length === 0 ? (
              <div className="text-center text-slate-400 text-xs">
                <PieIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No expenses recorded for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary?.category_breakdown}
                    dataKey="amount"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {summary?.category_breakdown?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PRESET_COLORS[index % PRESET_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={customTooltipFormatter} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Income vs Expenses</h3>
              <p className="text-xs text-slate-400">Cashflow comparison across recent months</p>
            </div>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary?.income_vs_expense || []}
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
      </div>

      {/* Spending Trends Line Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Monthly Spending Trends</h3>
            <p className="text-xs text-slate-400">Daily expense pattern in filtered period</p>
          </div>
        </div>

        <div className="h-64 w-full">
          {summary?.monthly_trends?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <Calendar className="w-8 h-8 text-slate-300 mb-2" />
              No daily transactions in this period to plot trend
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={summary?.monthly_trends || []}
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip formatter={customTooltipFormatter} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Daily Expense"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#3B82F6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest recorded financial entries</p>
          </div>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {summary?.recent_transactions?.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent transactions recorded yet.
            </div>
          ) : (
            summary?.recent_transactions?.map((tx) => {
              const isExpense = tx.type === 'Expense';
              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isExpense ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600">{tx.category_name}</span>
                        <span>•</span>
                        <span>{tx.payment_method}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-extrabold text-sm ${
                      isExpense ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {isExpense ? '- ' : '+ '}
                    {formatCurrency(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Resetting Data */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset All Data"
        message="Are you sure you want to delete all transactions and custom categories? You can reload sample demo data anytime."
        confirmText="Reset Everything"
        isLoading={isResetting}
      />
    </div>
  );
}
