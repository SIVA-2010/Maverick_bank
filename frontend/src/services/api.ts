// src/services/api.ts
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor - attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ===================== TYPES =====================
export interface ApiResponse<T> { success: boolean; message: string; data: T; }
export interface AuthResponse {
  accessToken: string; refreshToken: string; tokenType: string; expiresIn: number;
  user: User;
}
export interface User {
  id: number; firstName: string; lastName: string; email: string;
  phoneNumber: string; address: string; gender: string;
  dateOfBirth: string; age: number; aadharNumber: string; panNumber: string;
  role: 'CUSTOMER' | 'BANK_EMPLOYEE' | 'ADMIN'; status: string; createdAt: string;
}
export interface Account {
  id: number; accountNumber: string; accountType: string; balance: number;
  ifscCode: string; branchName: string; branchAddress: string;
  status: string; holderName: string; createdAt: string;
}
export interface Transaction {
  id: number; transactionId: string; type: string; amount: number;
  balanceAfter: number; description: string; destinationAccountNumber: string;
  destinationBankName: string; status: string; accountNumber: string; createdAt: string;
}
export interface LoanProduct {
  id: number; loanName: string; loanType: string; minimumAmount: number;
  maximumAmount: number; interestRate: number; minTenureMonths: number;
  maxTenureMonths: number; description: string;
}
export interface LoanApplication {
  id: number; applicationNumber: string; requestedAmount: number; tenureMonths: number;
  purpose: string; status: string; rejectionReason: string; approvedDate: string;
  disbursedDate: string; loanProduct: LoanProduct; applicantName: string;
  disbursementAccountNumber: string; createdAt: string;
}
export interface Beneficiary {
  id: number; accountHolderName: string; accountNumber: string;
  bankName: string; branchName: string; ifscCode: string; createdAt: string;
}
export interface BankBranch {
  id: number; bankName: string; branchName: string; ifscCode: string;
  address: string; city: string; state: string;
}

// ===================== AUTH APIS =====================
export const authAPI = {
  register: (data: any): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/register', data),
  login: (data: any): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/login', data),
};

// ===================== ACCOUNT APIS =====================
export const accountAPI = {
  openAccount: (data: any) => api.post<ApiResponse<Account>>('/customer/accounts/open', data),
  getMyAccounts: () => api.get<ApiResponse<Account[]>>('/customer/accounts'),
  getAccountDetails: (accountNumber: string) =>
    api.get<ApiResponse<Account>>(`/customer/accounts/${accountNumber}`),
  requestClosure: (accountNumber: string) =>
    api.post<ApiResponse<void>>(`/customer/accounts/${accountNumber}/close-request`),
};

// ===================== TRANSACTION APIS =====================
export const transactionAPI = {
  perform: (data: any) => api.post<ApiResponse<Transaction>>('/customer/transactions', data),
  getLast10: (accountNumber: string) =>
    api.get<ApiResponse<Transaction[]>>(`/customer/transactions/${accountNumber}/last10`),
  getLastMonth: (accountNumber: string) =>
    api.get<ApiResponse<Transaction[]>>(`/customer/transactions/${accountNumber}/last-month`),
  getByDateRange: (accountNumber: string, startDate: string, endDate: string) =>
    api.get<ApiResponse<Transaction[]>>(
      `/customer/transactions/${accountNumber}/by-date?startDate=${startDate}&endDate=${endDate}`),
  getSummary: (accountNumber: string) =>
    api.get(`/customer/transactions/${accountNumber}/summary`),
};

// ===================== LOAN APIS =====================
export const loanAPI = {
  getProducts: () => api.get<ApiResponse<LoanProduct[]>>('/customer/loans/products'),
  apply: (data: any) => api.post<ApiResponse<LoanApplication>>('/customer/loans/apply', data),
  getMyLoans: () => api.get<ApiResponse<LoanApplication[]>>('/customer/loans/my-loans'),
};

// ===================== BENEFICIARY APIS =====================
export const beneficiaryAPI = {
  add: (data: any) => api.post<ApiResponse<Beneficiary>>('/customer/beneficiaries', data),
  getAll: () => api.get<ApiResponse<Beneficiary[]>>('/customer/beneficiaries'),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/customer/beneficiaries/${id}`),
};

// ===================== BANK BRANCH APIS =====================
export const bankAPI = {
  getBankNames: () => api.get<ApiResponse<string[]>>('/banks'),
  getBranches: (bankName: string) => api.get<ApiResponse<BankBranch[]>>(`/banks/${bankName}/branches`),
  getByIfsc: (ifscCode: string) => api.get<ApiResponse<BankBranch>>(`/banks/ifsc/${ifscCode}`),
};

// ===================== EMPLOYEE APIS =====================
export const employeeAPI = {
  getPendingAccounts: () => api.get<ApiResponse<Account[]>>('/employee/accounts/pending'),
  getCloseRequests: () => api.get<ApiResponse<Account[]>>('/employee/accounts/close-requests'),
  approveAccount: (id: number) => api.put<ApiResponse<Account>>(`/employee/accounts/${id}/approve`),
  closeAccount: (id: number) => api.put<ApiResponse<Account>>(`/employee/accounts/${id}/close`),
  getPendingLoans: () => api.get<ApiResponse<LoanApplication[]>>('/employee/loans/pending'),
  loanDecision: (data: any) => api.post<ApiResponse<LoanApplication>>('/employee/loans/decision', data),
  disburseLoan: (id: number) => api.post<ApiResponse<LoanApplication>>(`/employee/loans/${id}/disburse`),
  getAllTransactions: (page = 0, size = 20) =>
    api.get<ApiResponse<Transaction[]>>(`/employee/reports/transactions?page=${page}&size=${size}`),
  getAllCustomers: () => api.get<ApiResponse<User[]>>('/employee/reports/customers'),
};

// ===================== ADMIN APIS =====================
export const adminAPI = {
  createEmployee: (data: any) => api.post<ApiResponse<User>>('/admin/employees', data),
  getEmployees: () => api.get<ApiResponse<User[]>>('/admin/employees'),
  getCustomers: () => api.get<ApiResponse<User[]>>('/admin/customers'),
  updateUserStatus: (userId: number, data: any) =>
    api.put<ApiResponse<User>>(`/admin/users/${userId}/status`, data),
  deactivateUser: (userId: number) => api.delete<ApiResponse<void>>(`/admin/users/${userId}`),
};

export default api;
