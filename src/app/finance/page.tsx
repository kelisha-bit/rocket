'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricCard from '@/components/ui/MetricCard';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  HandCoins, TrendingUp, TrendingDown, CreditCard, Receipt, Download, 
  Trash2, Edit2, Search, Filter, X, Calendar, DollarSign, PieChart,
  ArrowUpCircle, ArrowDownCircle, Wallet, Building2
} from 'lucide-react';
import { fetchFrontendMembers } from '@/lib/member-adapter';
import { Member } from '@/app/member-management/components/memberData';
import { toast } from 'sonner';
import {
  fetchFrontendTransactions,
  createFrontendTransaction,
  updateFrontendTransaction,
  deleteFrontendTransaction,
  type FrontendTransaction as Transaction,
  type TransactionType,
  type IncomeCategory,
  type ExpenseCategory,
  type PaymentMethod,
} from '@/lib/transaction-adapter';

export default function FinancePage() {
  const { useSupabaseAuth, loading, session, user } = useAuth();
  const router = useRouter();
  
  // Get display name from user metadata or email
  const recordedByName = user?.user_metadata?.full_name || user?.email || 'Staff';

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [method, setMethod] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'income' | 'expense' | 'summary'>('all');

  const sortedMemberList = useMemo(() => {
    return [...memberList].sort((a, b) =>
      (a.name ?? '').localeCompare((b.name ?? ''), undefined, { sensitivity: 'base' }),
    );
  }, [memberList]);

  // Fetch members from database
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        const members = await fetchFrontendMembers();
        setMemberList(members);
      } catch (error) {
        console.error('Failed to load members:', error);
        toast.error('Failed to load members');
      } finally {
        setLoadingMembers(false);
      }
    };
    
    loadMembers();
  }, []);

  // Fetch transactions from database
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const fetchedTransactions = await fetchFrontendTransactions();
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transactions', { description: 'Please check your connection and try again.' });
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter(t => (typeFilter ? t.type === typeFilter : true))
      .filter(t => (category ? t.category === category : true))
      .filter(t => (method ? t.method === method : true))
      .filter(t => {
        if (dateFrom && t.date < dateFrom) return false;
        if (dateTo && t.date > dateTo) return false;
        return true;
      })
      .filter(t => {
        if (!q) return true;
        return (
          t.description.toLowerCase().includes(q) ||
          t.member?.toLowerCase().includes(q) ||
          t.reference?.toLowerCase().includes(q) ||
          t.date.includes(q)
        );
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, query, typeFilter, category, method, dateFrom, dateTo]);

  const metrics = useMemo(() => {
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = income - expense;
    
    const tithe = filtered.filter(t => t.type === 'income' && t.category === 'Tithe').reduce((sum, t) => sum + t.amount, 0);
    const offering = filtered.filter(t => t.type === 'income' && t.category === 'Offering').reduce((sum, t) => sum + t.amount, 0);
    const buildingFund = filtered.filter(t => t.type === 'income' && t.category === 'Building Fund').reduce((sum, t) => sum + t.amount, 0);
    
    const salaries = filtered.filter(t => t.type === 'expense' && t.category === 'Salaries').reduce((sum, t) => sum + t.amount, 0);
    const utilities = filtered.filter(t => t.type === 'expense' && t.category === 'Utilities').reduce((sum, t) => sum + t.amount, 0);
    const events = filtered.filter(t => t.type === 'expense' && t.category === 'Events').reduce((sum, t) => sum + t.amount, 0);
    
    const incomeCount = filtered.filter(t => t.type === 'income').length;
    const expenseCount = filtered.filter(t => t.type === 'expense').length;
    
    return { 
      income, expense, netBalance, tithe, offering, buildingFund,
      salaries, utilities, events, incomeCount, expenseCount
    };
  }, [filtered]);

  const categoryBreakdown = useMemo(() => {
    const incomeCategories = ['Tithe', 'Offering', 'Seed', 'Pledge', 'Special Offering', 'Building Fund', 'Donation'] as const;
    const expenseCategories = ['Utilities', 'Salaries', 'Maintenance', 'Events', 'Outreach', 'Supplies', 'Transport', 'Other'] as const;
    
    const incomeData = incomeCategories.map(cat => ({
      name: cat,
      type: 'income' as const,
      amount: filtered.filter(t => t.type === 'income' && t.category === cat).reduce((sum, t) => sum + t.amount, 0),
      count: filtered.filter(t => t.type === 'income' && t.category === cat).length,
    })).filter(item => item.amount > 0);
    
    const expenseData = expenseCategories.map(cat => ({
      name: cat,
      type: 'expense' as const,
      amount: filtered.filter(t => t.type === 'expense' && t.category === cat).reduce((sum, t) => sum + t.amount, 0),
      count: filtered.filter(t => t.type === 'expense' && t.category === cat).length,
    })).filter(item => item.amount > 0);
    
    return { income: incomeData, expense: expenseData };
  }, [filtered]);

  const handleSaveTransaction = async () => {
    if (!selected) return;
    
    if (!selected.description) {
      toast.error('Please enter a description');
      return;
    }
    if (!selected.amount || selected.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (selected.id === 'new') {
        // Find member ID if member is selected
        let memberId: string | undefined;
        if (selected.member) {
          const member = memberList.find(m => m.name === selected.member);
          memberId = member?.id;
        }

        const newTransaction: Transaction = {
          ...selected,
          memberId,
          recordedBy: recordedByName,
        };
        
        const createdTransaction = await createFrontendTransaction(newTransaction);
        setTransactions(prev => [createdTransaction, ...prev]);
        toast.success(`${selected.type === 'income' ? 'Income' : 'Expense'} record added`, { 
          description: `₵${selected.amount.toLocaleString()} - ${selected.description}` 
        });
      } else {
        // Find member ID if member is selected
        let memberId: string | undefined;
        if (selected.member) {
          const member = memberList.find(m => m.name === selected.member);
          memberId = member?.id;
        }

        const updatedTransaction = await updateFrontendTransaction(selected.id, {
          ...selected,
          memberId,
        });
        setTransactions(prev => prev.map(t => t.id === selected.id ? updatedTransaction : t));
        toast.success('Transaction updated');
      }
      
      setSelected(null);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      toast.error('Failed to save transaction', { description: 'Please try again.' });
    }
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!window.confirm(`Delete ${transaction.type} record of ₵${transaction.amount.toLocaleString()}?`)) return;
    
    try {
      await deleteFrontendTransaction(transaction.id);
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      toast.success('Transaction deleted');
      setSelected(null);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast.error('Failed to delete transaction', { description: 'Please try again.' });
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.info(`Exporting ${filtered.length} transactions as ${format.toUpperCase()}`, { 
      description: 'Download will start shortly.' 
    });
  };

  const clearFilters = () => {
    setQuery('');
    setTypeFilter('');
    setCategory('');
    setMethod('');
    setDateFrom('');
    setDateTo('');
    toast.success('Filters cleared');
  };

  const hasActiveFilters = query || typeFilter || category || method || dateFrom || dateTo;

  if (useSupabaseAuth && (loading || !session)) {
    return null;
  }

  const getCategoryColor = (category: string, type: TransactionType) => {
    if (type === 'income') {
      const colors: Record<string, string> = {
        'Tithe': 'bg-emerald-100 text-emerald-700 border-emerald-300',
        'Offering': 'bg-blue-100 text-blue-700 border-blue-300',
        'Building Fund': 'bg-purple-100 text-purple-700 border-purple-300',
        'Seed': 'bg-amber-100 text-amber-700 border-amber-300',
        'Pledge': 'bg-pink-100 text-pink-700 border-pink-300',
        'Special Offering': 'bg-indigo-100 text-indigo-700 border-indigo-300',
        'Donation': 'bg-cyan-100 text-cyan-700 border-cyan-300',
      };
      return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
    } else {
      const colors: Record<string, string> = {
        'Utilities': 'bg-orange-100 text-orange-700 border-orange-300',
        'Salaries': 'bg-red-100 text-red-700 border-red-300',
        'Maintenance': 'bg-yellow-100 text-yellow-700 border-yellow-300',
        'Events': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
        'Outreach': 'bg-teal-100 text-teal-700 border-teal-300',
        'Supplies': 'bg-lime-100 text-lime-700 border-lime-300',
        'Transport': 'bg-sky-100 text-sky-700 border-sky-300',
        'Other': 'bg-slate-100 text-slate-700 border-slate-300',
      };
      return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string, type: TransactionType) => {
    if (type === 'income') {
      const icons: Record<string, string> = {
        'Tithe': '🙏',
        'Offering': '🎁',
        'Building Fund': '🏗️',
        'Seed': '🌱',
        'Pledge': '🤝',
        'Special Offering': '💝',
        'Donation': '💰',
      };
      return icons[category] || '💵';
    } else {
      const icons: Record<string, string> = {
        'Utilities': '⚡',
        'Salaries': '👥',
        'Maintenance': '🔧',
        'Events': '🎉',
        'Outreach': '🌍',
        'Supplies': '📦',
        'Transport': '🚗',
        'Other': '📋',
      };
      return icons[category] || '💳';
    }
  };

  return (
    <AppLayout currentPath="/finance">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loadingTransactions 
              ? 'Loading transactions...' 
              : `Track income, expenses, and manage church finances with comprehensive reporting. ${transactions.length} total transactions.`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTransactions}
            disabled={loadingTransactions}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
          >
            <Download size={16} /> CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
          >
            <Download size={16} /> PDF
          </button>
          <button
            onClick={() => {
              setSelected({ 
                id: 'new', 
                date: new Date().toISOString().split('T')[0], 
                type: 'income',
                category: 'Offering', 
                description: '',
                method: 'Cash', 
                amount: 0 
              });
              setEditMode(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-card"
          >
            <ArrowUpCircle size={16} /> Add Income
          </button>
          <button
            onClick={() => {
              setSelected({ 
                id: 'new', 
                date: new Date().toISOString().split('T')[0], 
                type: 'expense',
                category: 'Other', 
                description: '',
                method: 'Cash', 
                amount: 0 
              });
              setEditMode(true);
            }}
            className="flex items-center gap-2 bg-red-600 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-red-700 active:scale-[0.99] transition-all shadow-card"
          >
            <ArrowDownCircle size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <MetricCard 
          label="Total Income" 
          value={`₵${metrics.income.toLocaleString()}`} 
          subValue={`${metrics.incomeCount} transactions`}
          icon={<ArrowUpCircle size={18} />} 
          iconBg="bg-emerald-500/10"
        />
        <MetricCard 
          label="Total Expenses" 
          value={`₵${metrics.expense.toLocaleString()}`} 
          subValue={`${metrics.expenseCount} transactions`}
          icon={<ArrowDownCircle size={18} />} 
          iconBg="bg-red-500/10"
        />
        <MetricCard 
          label="Net Balance" 
          value={`₵${metrics.netBalance.toLocaleString()}`} 
          subValue={metrics.netBalance >= 0 ? 'Surplus' : 'Deficit'}
          icon={<Wallet size={18} />} 
          iconBg={metrics.netBalance >= 0 ? 'bg-blue-500/10' : 'bg-orange-500/10'}
          hero
        />
        <MetricCard 
          label="Building Fund" 
          value={`₵${metrics.buildingFund.toLocaleString()}`} 
          subValue="Dedicated funds"
          icon={<Building2 size={18} />} 
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Loading State */}
      {loadingTransactions && (
        <div className="bg-white rounded-xl border border-border shadow-card p-8 mt-5 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading transactions...</p>
        </div>
      )}

      {/* Error State - No transactions */}
      {!loadingTransactions && transactions.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-12 mt-5 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="text-white" size={40} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No transactions yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Start tracking your church finances by adding your first income or expense transaction.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelected({ 
                  id: 'new', 
                  date: new Date().toISOString().split('T')[0], 
                  type: 'income',
                  category: 'Offering', 
                  description: '',
                  method: 'Cash', 
                  amount: 0 
                });
                setEditMode(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-emerald-700 transition-all shadow-md"
            >
              <ArrowUpCircle size={16} /> Add Income
            </button>
            <button
              onClick={() => {
                setSelected({ 
                  id: 'new', 
                  date: new Date().toISOString().split('T')[0], 
                  type: 'expense',
                  category: 'Other', 
                  description: '',
                  method: 'Cash', 
                  amount: 0 
                });
                setEditMode(true);
              }}
              className="flex items-center gap-2 bg-red-600 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-red-700 transition-all shadow-md"
            >
              <ArrowDownCircle size={16} /> Add Expense
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Only show if not loading and has transactions */}
      {!loadingTransactions && transactions.length > 0 && (
        <>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-between gap-3 mt-5 flex-wrap">
        <div className="flex items-center gap-2 bg-white rounded-lg border border-border p-1 shadow-card">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'all' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setViewMode('income')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'income' 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Income Only
          </button>
          <button
            onClick={() => setViewMode('expense')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'expense' 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Expenses Only
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'summary' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <PieChart size={16} className="inline mr-1" />
            Summary
          </button>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {[query, typeFilter, category, method, dateFrom, dateTo].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl border border-blue-200 shadow-lg p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Filter size={16} className="text-blue-600" />
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Description, member..."
                  className="w-full text-sm border-2 border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All categories</option>
                <optgroup label="Income">
                  <option value="Tithe">Tithe</option>
                  <option value="Offering">Offering</option>
                  <option value="Seed">Seed</option>
                  <option value="Pledge">Pledge</option>
                  <option value="Special Offering">Special Offering</option>
                  <option value="Building Fund">Building Fund</option>
                  <option value="Donation">Donation</option>
                </optgroup>
                <optgroup label="Expenses">
                  <option value="Utilities">Utilities</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Events">Events</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Method</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All methods</option>
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Transaction Table Views */}
      {(viewMode === 'all' || viewMode === 'income' || viewMode === 'expense') && (
        <div className="bg-white rounded-xl border border-border shadow-lg overflow-hidden mt-4">
          <div className="p-5 border-b border-border bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">{filtered.filter(t => viewMode === 'all' || t.type === viewMode).length} Transactions</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {viewMode === 'all' && `Income: ₵${metrics.income.toLocaleString()} • Expenses: ₵${metrics.expense.toLocaleString()}`}
                {viewMode === 'income' && `Total Income: ₵${metrics.income.toLocaleString()}`}
                {viewMode === 'expense' && `Total Expenses: ₵${metrics.expense.toLocaleString()}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {viewMode === 'all' && (
                <>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <ArrowUpCircle size={14} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">{metrics.incomeCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                    <ArrowDownCircle size={14} className="text-red-600" />
                    <span className="text-xs font-semibold text-red-700">{metrics.expenseCount}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {filtered.filter(t => viewMode === 'all' || t.type === viewMode).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                <DollarSign className="text-blue-600" size={32} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No transactions found</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {hasActiveFilters ? 'Try adjusting your filters to see more results' : 'Add your first transaction to get started with financial tracking'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-4 whitespace-nowrap">Date</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap">Type</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap">Description</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap">Category</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap hidden lg:table-cell">Method</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap">Amount</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-4 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.filter(t => viewMode === 'all' || t.type === viewMode).map((t, idx) => (
                    <tr key={t.id} className={`hover:bg-gradient-to-r ${t.type === 'income' ? 'hover:from-emerald-50/50 hover:to-transparent' : 'hover:from-red-50/50 hover:to-transparent'} transition-all group`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="font-mono text-[12px] text-gray-600">{t.date}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {t.type === 'income' ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-lg border border-emerald-200 w-fit">
                            <ArrowUpCircle size={14} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700">Income</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-red-100 to-red-50 rounded-lg border border-red-200 w-fit">
                            <ArrowDownCircle size={14} className="text-red-600" />
                            <span className="text-xs font-bold text-red-700">Expense</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div>
                          <p className="text-foreground font-semibold text-[13px]">{t.description}</p>
                          {t.member && (
                            <p className="text-xs text-gray-500 mt-0.5">from {t.member}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getCategoryColor(t.category, t.type)}`}>
                          <span>{getCategoryIcon(t.category, t.type)}</span>
                          {t.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 text-[12px] hidden lg:table-cell">{t.method}</td>
                      <td className="px-3 py-3 text-right">
                        <span className={`font-mono font-bold tabular-nums text-[15px] ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : '-'}₵{t.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelected(t);
                              setEditMode(false);
                            }}
                            title="View details"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 hover:text-blue-600 text-gray-400 transition-all"
                          >
                            <Search size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setSelected(t);
                              setEditMode(true);
                            }}
                            title="Edit transaction"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-100 hover:text-amber-600 text-gray-400 transition-all"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(t)}
                            title="Delete transaction"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 hover:text-red-600 text-gray-400 transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary View */}
      {viewMode === 'summary' && (
        <div className="space-y-4 mt-4">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp size={24} />
                </div>
                <ArrowUpCircle size={32} className="opacity-20" />
              </div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Total Income</p>
              <p className="text-3xl font-bold mb-2">₵{metrics.income.toLocaleString()}</p>
              <p className="text-emerald-100 text-xs">{metrics.incomeCount} transactions</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingDown size={24} />
                </div>
                <ArrowDownCircle size={32} className="opacity-20" />
              </div>
              <p className="text-red-100 text-sm font-medium mb-1">Total Expenses</p>
              <p className="text-3xl font-bold mb-2">₵{metrics.expense.toLocaleString()}</p>
              <p className="text-red-100 text-xs">{metrics.expenseCount} transactions</p>
            </div>

            <div className={`bg-gradient-to-br ${metrics.netBalance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Wallet size={24} />
                </div>
                <DollarSign size={32} className="opacity-20" />
              </div>
              <p className={`${metrics.netBalance >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm font-medium mb-1`}>Net Balance</p>
              <p className="text-3xl font-bold mb-2">₵{Math.abs(metrics.netBalance).toLocaleString()}</p>
              <p className={`${metrics.netBalance >= 0 ? 'text-blue-100' : 'text-orange-100'} text-xs font-semibold`}>
                {metrics.netBalance >= 0 ? '✓ Surplus' : '⚠ Deficit'}
              </p>
            </div>
          </div>

          {/* Income & Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Income Breakdown */}
            <div className="bg-white rounded-xl border border-border shadow-lg p-6">
              <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <ArrowUpCircle size={16} className="text-white" />
                </div>
                Income by Category
              </h3>
              <div className="space-y-3">
                {categoryBreakdown.income.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No income records found</p>
                ) : (
                  categoryBreakdown.income.map(item => (
                    <div key={item.name} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${getCategoryColor(item.name, 'income')}`}>
                            {getCategoryIcon(item.name, 'income')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.count} transaction{item.count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold tabular-nums text-emerald-600 text-[15px]">₵{item.amount.toLocaleString()}</p>
                          <p className="text-xs font-semibold text-emerald-600">{((item.amount / metrics.income) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${(item.amount / metrics.income) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl border border-border shadow-lg p-6">
              <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <ArrowDownCircle size={16} className="text-white" />
                </div>
                Expenses by Category
              </h3>
              <div className="space-y-3">
                {categoryBreakdown.expense.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No expense records found</p>
                ) : (
                  categoryBreakdown.expense.map(item => (
                    <div key={item.name} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${getCategoryColor(item.name, 'expense')}`}>
                            {getCategoryIcon(item.name, 'expense')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.count} transaction{item.count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold tabular-nums text-red-600 text-[15px]">₵{item.amount.toLocaleString()}</p>
                          <p className="text-xs font-semibold text-red-600">{((item.amount / metrics.expense) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                          style={{ width: `${(item.amount / metrics.expense) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6 shadow-lg">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <PieChart size={18} className="text-purple-600" />
              Key Financial Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border-2 border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-emerald-600 mb-1">Tithes</p>
                <p className="text-xl font-bold text-foreground">₵{metrics.tithe.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{((metrics.tithe / metrics.income) * 100 || 0).toFixed(1)}% of income</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-blue-600 mb-1">Offerings</p>
                <p className="text-xl font-bold text-foreground">₵{metrics.offering.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{((metrics.offering / metrics.income) * 100 || 0).toFixed(1)}% of income</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-red-600 mb-1">Salaries</p>
                <p className="text-xl font-bold text-foreground">₵{metrics.salaries.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{((metrics.salaries / metrics.expense) * 100 || 0).toFixed(1)}% of expenses</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-orange-600 mb-1">Utilities</p>
                <p className="text-xl font-bold text-foreground">₵{metrics.utilities.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{((metrics.utilities / metrics.expense) * 100 || 0).toFixed(1)}% of expenses</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End of conditional content wrapper */}
      </>
      )}

      {/* Modal for Add/Edit/View */}
      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setEditMode(false);
        }}
        title={
          selected?.id === 'new' 
            ? `Add ${selected.type === 'income' ? 'Income' : 'Expense'} Record`
            : editMode 
            ? 'Edit Transaction' 
            : 'Transaction Details'
        }
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            {(selected.id === 'new' || editMode) ? (
              // Edit/Add Form
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Transaction Type</label>
                    <select
                      value={selected.type}
                      onChange={e => setSelected({ 
                        ...selected, 
                        type: e.target.value as TransactionType,
                        category: e.target.value === 'income' ? 'Offering' : 'Other'
                      })}
                      disabled={selected.id !== 'new'}
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={selected.date}
                      onChange={e => setSelected({ ...selected, date: e.target.value })}
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Description *</label>
                    <input
                      value={selected.description}
                      onChange={e => setSelected({ ...selected, description: e.target.value })}
                      placeholder="Enter transaction description"
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {selected.type === 'income' && (
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Member (Optional)</label>
                      <select
                        value={selected.member || ''}
                        onChange={e => setSelected({ ...selected, member: e.target.value })}
                        className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select a member (optional)</option>
                        {loadingMembers ? (
                          <option value="">Loading members...</option>
                        ) : (
                          sortedMemberList.map(member => (
                            <option key={member.id} value={member.name}>
                              {member.name} ({member.memberId})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Category *</label>
                    <select
                      value={selected.category}
                      onChange={e => setSelected({ ...selected, category: e.target.value as any })}
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {selected.type === 'income' ? (
                        <>
                          <option value="Tithe">Tithe</option>
                          <option value="Offering">Offering</option>
                          <option value="Seed">Seed</option>
                          <option value="Pledge">Pledge</option>
                          <option value="Special Offering">Special Offering</option>
                          <option value="Building Fund">Building Fund</option>
                          <option value="Donation">Donation</option>
                        </>
                      ) : (
                        <>
                          <option value="Utilities">Utilities</option>
                          <option value="Salaries">Salaries</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Events">Events</option>
                          <option value="Outreach">Outreach</option>
                          <option value="Supplies">Supplies</option>
                          <option value="Transport">Transport</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Payment Method *</label>
                    <select
                      value={selected.method}
                      onChange={e => setSelected({ ...selected, method: e.target.value as any })}
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Amount (₵) *</label>
                    <input
                      type="number"
                      value={selected.amount || ''}
                      onChange={e => setSelected({ ...selected, amount: Number(e.target.value) || 0 })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Reference (Optional)</label>
                    <input
                      value={selected.reference || ''}
                      onChange={e => setSelected({ ...selected, reference: e.target.value })}
                      placeholder="Transaction reference"
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Notes (Optional)</label>
                  <textarea
                    value={selected.notes || ''}
                    onChange={e => setSelected({ ...selected, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            ) : (
              // View Mode
              <div className="space-y-4">
                <div className={`bg-gradient-to-br ${selected.type === 'income' ? 'from-emerald-50 to-emerald-100' : 'from-red-50 to-red-100'} rounded-xl p-5 border-2 ${selected.type === 'income' ? 'border-emerald-200' : 'border-red-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {selected.type === 'income' ? (
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                          <ArrowUpCircle size={20} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                          <ArrowDownCircle size={20} className="text-white" />
                        </div>
                      )}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border ${getCategoryColor(selected.category, selected.type)}`}>
                        <span>{getCategoryIcon(selected.category, selected.type)}</span>
                        {selected.category}
                      </span>
                    </div>
                    <span className={`text-3xl font-bold ${selected.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {selected.type === 'income' ? '+' : '-'}₵{selected.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-lg font-semibold ${selected.type === 'income' ? 'text-emerald-900' : 'text-red-900'}`}>{selected.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-1">Date</p>
                    <p className="text-sm font-mono text-foreground">{selected.date}</p>
                  </div>
                  {selected.member && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-1">Member</p>
                      <p className="text-sm font-semibold text-foreground">{selected.member}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-1">Payment Method</p>
                    <p className="text-sm text-foreground">{selected.method}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-1">Reference</p>
                    <p className="text-sm font-mono text-foreground">{selected.reference || '—'}</p>
                  </div>
                </div>

                {selected.notes && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-1">Notes</p>
                    <p className="text-sm text-foreground bg-gray-50 rounded-lg p-3 border border-gray-200">{selected.notes}</p>
                  </div>
                )}

                {selected.recordedBy && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-gray-200">
                    Recorded by {selected.recordedBy}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between gap-2 pt-4 border-t-2 border-gray-200">
              {!editMode && selected.id !== 'new' && (
                <button
                  onClick={() => handleDeleteTransaction(selected)}
                  className="px-4 py-2.5 rounded-lg border-2 border-red-300 bg-red-50 text-red-700 text-sm font-bold hover:bg-red-100 transition-all shadow-sm hover:shadow"
                >
                  <Trash2 size={14} className="inline mr-1" />
                  Delete
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  className="px-5 py-2.5 rounded-lg border-2 border-gray-300 bg-white text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow"
                  onClick={() => {
                    setSelected(null);
                    setEditMode(false);
                  }}
                >
                  {editMode || selected.id === 'new' ? 'Cancel' : 'Close'}
                </button>
                {!editMode && selected.id !== 'new' && (
                  <button
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm hover:shadow"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit2 size={14} className="inline mr-1" />
                    Edit
                  </button>
                )}
                {(editMode || selected.id === 'new') && (
                  <button
                    className={`px-5 py-2.5 rounded-lg bg-gradient-to-r ${selected.type === 'income' ? 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' : 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'} text-white text-sm font-bold transition-all shadow-sm hover:shadow`}
                    onClick={handleSaveTransaction}
                  >
                    {selected.id === 'new' ? 'Add Transaction' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
