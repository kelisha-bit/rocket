import {
  Transaction as DBTransaction,
  TransactionType,
  IncomeCategory,
  ExpenseCategory,
  PaymentMethod,
  fetchTransactions,
  fetchTransactionsByType,
  fetchTransactionsByDateRange,
  fetchTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
  getCategoryBreakdown,
} from './supabase/transactions';

// Frontend Transaction interface (matches the finance page)
export interface FrontendTransaction {
  id: string;
  date: string;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  description: string;
  member?: string;
  memberId?: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  notes?: string;
  recordedBy?: string;
}

function getSupabaseErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Unknown error';
  const e = error as { message?: string; details?: string; hint?: string; code?: string };
  return [e.message, e.details, e.hint, e.code ? `code=${e.code}` : ''].filter(Boolean).join(' | ') || 'Unknown error';
}

// Transform database transaction to frontend format
export function adaptTransactionToFrontend(dbTransaction: DBTransaction): FrontendTransaction {
  return {
    id: dbTransaction.id,
    date: dbTransaction.date,
    type: dbTransaction.type,
    category: dbTransaction.category,
    description: dbTransaction.description,
    member: dbTransaction.member_name,
    memberId: dbTransaction.member_id,
    method: dbTransaction.method,
    amount: dbTransaction.amount,
    reference: dbTransaction.reference,
    notes: dbTransaction.notes,
    recordedBy: dbTransaction.recorded_by,
  };
}

// Transform frontend transaction to database format
export function adaptTransactionToDatabase(frontendTransaction: FrontendTransaction): Partial<DBTransaction> {
  return {
    date: frontendTransaction.date,
    type: frontendTransaction.type,
    category: frontendTransaction.category,
    description: frontendTransaction.description,
    // Only set member_id if it's a valid UUID, otherwise set to null
    member_id: frontendTransaction.memberId && frontendTransaction.memberId.trim() !== '' 
      ? frontendTransaction.memberId 
      : null,
    method: frontendTransaction.method,
    amount: frontendTransaction.amount,
    reference: frontendTransaction.reference,
    notes: frontendTransaction.notes,
    recorded_by: frontendTransaction.recordedBy,
  };
}

// Fetch all transactions and adapt to frontend format
export async function fetchFrontendTransactions(): Promise<FrontendTransaction[]> {
  try {
    const dbTransactions = await fetchTransactions();
    return dbTransactions.map(adaptTransactionToFrontend);
  } catch (error) {
    console.error('Error fetching frontend transactions:', error);
    throw error;
  }
}

// Fetch transactions by type
export async function fetchFrontendTransactionsByType(type: TransactionType): Promise<FrontendTransaction[]> {
  try {
    const dbTransactions = await fetchTransactionsByType(type);
    return dbTransactions.map(adaptTransactionToFrontend);
  } catch (error) {
    console.error('Error fetching frontend transactions by type:', error);
    throw error;
  }
}

// Fetch transactions by date range
export async function fetchFrontendTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<FrontendTransaction[]> {
  try {
    const dbTransactions = await fetchTransactionsByDateRange(startDate, endDate);
    return dbTransactions.map(adaptTransactionToFrontend);
  } catch (error) {
    console.error('Error fetching frontend transactions by date range:', error);
    throw error;
  }
}

// Fetch single transaction by ID
export async function fetchFrontendTransactionById(id: string): Promise<FrontendTransaction | null> {
  try {
    const dbTransaction = await fetchTransactionById(id);
    return dbTransaction ? adaptTransactionToFrontend(dbTransaction) : null;
  } catch (error) {
    console.error('Error fetching frontend transaction by ID:', error);
    throw error;
  }
}

// Create transaction from frontend format
export async function createFrontendTransaction(
  frontendTransaction: FrontendTransaction
): Promise<FrontendTransaction> {
  try {
    const dbData = adaptTransactionToDatabase(frontendTransaction);
    const createdDbTransaction = await createTransaction(dbData);
    return adaptTransactionToFrontend(createdDbTransaction);
  } catch (error) {
    console.error('Error creating frontend transaction:', error);
    throw new Error(`Create transaction failed: ${getSupabaseErrorMessage(error)}`);
  }
}

// Update transaction from frontend format
export async function updateFrontendTransaction(
  id: string,
  frontendTransaction: FrontendTransaction
): Promise<FrontendTransaction> {
  try {
    const dbData = adaptTransactionToDatabase(frontendTransaction);
    const updatedDbTransaction = await updateTransaction(id, dbData);
    return adaptTransactionToFrontend(updatedDbTransaction);
  } catch (error) {
    console.error('Error updating frontend transaction:', error);
    throw new Error(`Update transaction failed: ${getSupabaseErrorMessage(error)}`);
  }
}

// Delete transaction
export async function deleteFrontendTransaction(id: string): Promise<void> {
  try {
    await deleteTransaction(id);
  } catch (error) {
    console.error('Error deleting frontend transaction:', error);
    throw new Error(`Delete transaction failed: ${getSupabaseErrorMessage(error)}`);
  }
}

// Get financial summary
export async function getFrontendFinancialSummary(startDate?: string, endDate?: string) {
  try {
    return await getFinancialSummary(startDate, endDate);
  } catch (error) {
    console.error('Error fetching frontend financial summary:', error);
    throw error;
  }
}

// Get category breakdown
export async function getFrontendCategoryBreakdown(
  type: TransactionType,
  startDate?: string,
  endDate?: string
) {
  try {
    return await getCategoryBreakdown(type, startDate, endDate);
  } catch (error) {
    console.error('Error fetching frontend category breakdown:', error);
    throw error;
  }
}

// Export types for use in components
export type { TransactionType, IncomeCategory, ExpenseCategory, PaymentMethod };
