import { createClient } from './client';

export type TransactionType = 'income' | 'expense';
export type IncomeCategory = 'Tithe' | 'Offering' | 'Seed' | 'Pledge' | 'Special Offering' | 'Building Fund' | 'Donation';
export type ExpenseCategory = 'Utilities' | 'Salaries' | 'Maintenance' | 'Events' | 'Outreach' | 'Supplies' | 'Transport' | 'Other';
export type PaymentMethod = 'Cash' | 'Mobile Money' | 'Bank Transfer' | 'Cheque';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  description: string;
  member_id?: string;
  member_name?: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

// Transform database record to frontend format
export function transformTransaction(dbTransaction: any): Transaction {
  return {
    id: dbTransaction.id,
    date: dbTransaction.date,
    type: dbTransaction.type,
    category: dbTransaction.category,
    description: dbTransaction.description,
    member_id: dbTransaction.member_id,
    member_name: dbTransaction.member?.full_name,
    method: dbTransaction.method,
    amount: dbTransaction.amount,
    reference: dbTransaction.reference,
    notes: dbTransaction.notes,
    recorded_by: dbTransaction.recorded_by,
    created_at: dbTransaction.created_at,
    updated_at: dbTransaction.updated_at,
  };
}

// Fetch all transactions
export async function fetchTransactions(): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('giving_transactions')
    .select(`
      *,
      member:member_id(id, full_name)
    `)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  return data ? data.map(transformTransaction) : [];
}

// Fetch transactions by type
export async function fetchTransactionsByType(type: TransactionType): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('giving_transactions')
    .select(`
      *,
      member:member_id(id, full_name)
    `)
    .eq('type', type)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions by type:', error);
    throw error;
  }

  return data ? data.map(transformTransaction) : [];
}

// Fetch transactions by date range
export async function fetchTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('giving_transactions')
    .select(`
      *,
      member:member_id(id, full_name)
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions by date range:', error);
    throw error;
  }

  return data ? data.map(transformTransaction) : [];
}

// Fetch a single transaction by ID
export async function fetchTransactionById(id: string): Promise<Transaction | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('giving_transactions')
    .select(`
      *,
      member:member_id(id, full_name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching transaction:', error);
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data ? transformTransaction(data) : null;
}

// Create a new transaction
export async function createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
  const supabase = createClient();
  
  // Prepare data for database
  const dbData = {
    date: transactionData.date,
    type: transactionData.type,
    category: transactionData.category,
    description: transactionData.description,
    member_id: transactionData.member_id,
    method: transactionData.method,
    amount: transactionData.amount,
    reference: transactionData.reference,
    notes: transactionData.notes,
    recorded_by: transactionData.recorded_by,
  };

  const { data, error } = await supabase
    .from('giving_transactions')
    .insert(dbData)
    .select(`
      *,
      member:member_id(id, full_name)
    `)
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }

  return transformTransaction(data);
}

// Update an existing transaction
export async function updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<Transaction> {
  const supabase = createClient();
  
  // Prepare data for database
  const dbData = {
    date: transactionData.date,
    type: transactionData.type,
    category: transactionData.category,
    description: transactionData.description,
    member_id: transactionData.member_id,
    method: transactionData.method,
    amount: transactionData.amount,
    reference: transactionData.reference,
    notes: transactionData.notes,
  };

  const { data, error } = await supabase
    .from('giving_transactions')
    .update(dbData)
    .eq('id', id)
    .select(`
      *,
      member:member_id(id, full_name)
    `)
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }

  return transformTransaction(data);
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('giving_transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

// Get financial summary
export async function getFinancialSummary(startDate?: string, endDate?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('giving_transactions')
    .select('type, amount');

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching financial summary:', error);
    throw error;
  }

  const income = data?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const expense = data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

  return {
    income,
    expense,
    netBalance: income - expense,
  };
}

// Get category breakdown
export async function getCategoryBreakdown(type: TransactionType, startDate?: string, endDate?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('giving_transactions')
    .select('category, amount')
    .eq('type', type);

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching category breakdown:', error);
    throw error;
  }

  // Group by category
  const breakdown = data?.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = { amount: 0, count: 0 };
    }
    acc[t.category].amount += t.amount;
    acc[t.category].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  return breakdown || {};
}
