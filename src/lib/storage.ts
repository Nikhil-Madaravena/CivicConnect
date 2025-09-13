import type { User, Report } from '../types';
import { mockUsers, mockReports } from './mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'civic_connect_current_user',
  USERS: 'civic_connect_users',
  REPORTS: 'civic_connect_reports'
};

// Initialize storage with mock data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(mockReports));
  }
};

// User management
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userJson ? JSON.parse(userJson) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const authenticateUser = (email: string, password: string): User | null => {
  initializeStorage();
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  
  // Simple authentication - in production, this would be properly secured
  const user = users.find(u => u.email === email);
  if (user && password.length > 0) {
    return user;
  }
  return null;
};

export const registerUser = (email: string, password: string, fullName?: string): User => {
  initializeStorage();
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    email,
    role: 'citizen',
    full_name: fullName,
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  return newUser;
};

// Reports management
export const getReports = (userId?: string): Report[] => {
  initializeStorage();
  const reports: Report[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
  
  if (userId) {
    return reports.filter(r => r.citizen_id === userId);
  }
  
  return reports;
};

export const addReport = (report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Report => {
  initializeStorage();
  const reports: Report[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
  
  const newReport: Report = {
    ...report,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  reports.push(newReport);
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  
  return newReport;
};

export const updateReport = (reportId: string, updates: Partial<Report>): Report | null => {
  initializeStorage();
  const reports: Report[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
  
  const reportIndex = reports.findIndex(r => r.id === reportId);
  if (reportIndex === -1) return null;
  
  reports[reportIndex] = {
    ...reports[reportIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  
  return reports[reportIndex];
};

// File upload simulation
export const uploadImage = async (file: File): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a blob URL for the image (this will work for the session)
  return URL.createObjectURL(file);
};