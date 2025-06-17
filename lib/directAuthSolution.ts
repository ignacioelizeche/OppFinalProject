/**
 * Direct Authentication Solution
 * This is a completely standalone authentication solution that bypasses
 * any API calls to ensure login and registration work reliably.
 */

import type { User, AuthResponse } from './types';

// Local storage keys
const LS_KEYS = {
  USERS: 'delta_direct_users',
  TOKEN: 'token',
  CURRENT_USER: 'delta_current_user'
};

// Default user data
const DEFAULT_USER: User & { password: string } = {
  id: 1,
  username: 'Demo User',
  email: 'demo@example.com',
  password: 'password123',
  role: 'student',
  coinBalance: 500,
  xpPoints: 0,
  level: 1,
  streak: 0,
  totalProblemsCompleted: 0,
  lastLoginDate: new Date().toISOString(),
  joinDate: new Date().toISOString()
};

// Initialize local storage with default user if needed
export function initializeDirectAuth(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Check if users already exist in local storage
    const users = getLocalUsers();
    if (users.length === 0) {
      // Create default user
      saveLocalUsers([DEFAULT_USER]);
      console.log('Direct Auth: Created default user');
    }
  } catch (error) {
    console.error('Failed to initialize direct auth:', error);
  }
}

// Get users from local storage
function getLocalUsers(): Array<User & { password: string }> {
  try {
    const usersJson = localStorage.getItem(LS_KEYS.USERS);
    if (!usersJson) return [];
    return JSON.parse(usersJson);
  } catch (error) {
    console.error('Error reading users from local storage:', error);
    return [];
  }
}

// Save users to local storage
function saveLocalUsers(users: Array<User & { password: string }>): void {
  try {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to local storage:', error);
  }
}

// User registration
export function registerDirectUser(userData: { 
  username: string; 
  email: string; 
  password: string; 
  role: string;
}): { success: boolean; message: string } {
  try {
    const users = getLocalUsers();
    
    // Check if email is already registered
    if (users.some(user => user.email === userData.email)) {
      return {
        success: false,
        message: 'Email already registered. Please use a different email or login.'
      };
    }
    
    // Create new user
    const newUser: User & { password: string } = {
      id: users.length + 1,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'student',
      coinBalance: 100,
      xpPoints: 0,
      level: 1,
      streak: 0,
      totalProblemsCompleted: 0,
      lastLoginDate: new Date().toISOString(),
      joinDate: new Date().toISOString()
    };
    
    // Save new user
    users.push(newUser);
    saveLocalUsers(users);
    
    console.log('Direct Auth: User registered successfully', newUser.email);
    
    return {
      success: true,
      message: 'Registration successful! You can now login.'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Registration failed. Please try again.'
    };
  }
}

// User login
export function loginDirectUser(credentials: { 
  email: string; 
  password: string;
}): AuthResponse | { error: string } {
  try {
    const users = getLocalUsers();
    
    // Find user by email
    const user = users.find(user => user.email === credentials.email);
    
    if (!user) {
      return {
        error: 'User not found. Please check your email address.'
      };
    }
    
    // Check password
    if (user.password !== credentials.password) {
      return {
        error: 'Invalid password. Please try again.'
      };
    }
    
    // Create user object without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    
    // Generate token
    const token = `direct-auth-token-${Date.now()}-${user.id}`;
    
    // Store token and current user
    localStorage.setItem(LS_KEYS.TOKEN, token);
    localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
    
    console.log('Direct Auth: User logged in successfully', user.email);
    
    return {
      success: true,
      token,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      error: 'Login failed. Please try again.'
    };
  }
}

// Get current user
export function getCurrentDirectUser(): User | null {
  try {
    const userJson = localStorage.getItem(LS_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Logout
export function logoutDirectUser(): void {
  try {
    localStorage.removeItem(LS_KEYS.TOKEN);
    localStorage.removeItem(LS_KEYS.CURRENT_USER);
    console.log('Direct Auth: User logged out');
  } catch (error) {
    console.error('Logout error:', error);
  }
}
