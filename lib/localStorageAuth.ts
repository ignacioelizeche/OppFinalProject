/**
 * Temporary local storage authentication solution
 * This provides a fallback mechanism when the database connection is unavailable
 */

import type { User, AuthResponse } from './types';

const LOCAL_STORAGE_KEYS = {
  USERS: 'delta_local_users',
  CURRENT_USER: 'delta_current_user',
  TOKEN: 'token'
};

// User management functions
export const localAuthSystem = {
  /**
   * Register a new user in local storage
   */
  registerUser: (userData: { username: string; email: string; password: string; role: string }): { success: boolean; message: string } => {
    try {
      const users = getLocalUsers();
      
      // Check if email is already registered
      if (users.some(user => user.email === userData.email)) {
        return { success: false, message: 'Email already registered' };
      }
      
      // Create new user with ID
      const newUser = {
        id: users.length + 1,
        username: userData.username,
        email: userData.email,
        role: userData.role || 'student',
        coinBalance: 100,
        xpPoints: 0,
        level: 1,
        streak: 0,
        totalProblemsCompleted: 0,
        lastLoginDate: new Date().toISOString(),
        joinDate: new Date().toISOString(),
        // We store the password for local login, but in a real system we would hash it
        password: userData.password
      };
      
      // Add to local users
      users.push(newUser);
      saveLocalUsers(users);
      
      return { success: true, message: 'User registered successfully' };
    } catch (error) {
      console.error('Local registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  },
  
  /**
   * Login a user using local storage
   */
  loginUser: (credentials: { email: string; password: string }): AuthResponse | { error: string } => {
    try {
      const users = getLocalUsers();
      
      // Find user by email
      const user = users.find(user => user.email === credentials.email);
      
      if (!user) {
        return { error: 'User not found' };
      }
      
      // Check password (this is simplified, we would use proper hashing in a real app)
      if (user.password !== credentials.password) {
        return { error: 'Invalid credentials' };
      }
      
      // Create a user object without the password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      
      // Create a mock token
      const token = `local-auth-token-${Date.now()}-${user.id}`;
      
      // Save current user and token
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      
      return {
        success: true,
        token,
        user: userWithoutPassword as User
      };
    } catch (error) {
      console.error('Local login error:', error);
      return { error: 'Login failed' };
    }
  },
  
  /**
   * Get the current user from local storage
   */
  getCurrentUser: (): User | null => {
    try {
      const userJson = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  /**
   * Check if local authentication is available
   */
  isLocalAuthAvailable: (): boolean => {
    return typeof window !== 'undefined' && localStorage !== undefined;
  }
};

// Helper functions
function getLocalUsers(): Array<User & { password: string }> {
  try {
    const usersJson = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error('Error reading local users:', error);
    return [];
  }
}

function saveLocalUsers(users: Array<User & { password: string }>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving local users:', error);
  }
}

// Create default user if none exists
export function ensureDefaultUser(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const users = getLocalUsers();
    
    // Add a default user if no users exist
    if (users.length === 0) {
      users.push({
        id: 1,
        username: 'Demo User',
        email: 'demo@example.com',
        password: 'password123',
        role: 'student',
        coinBalance: 500,
        xpPoints: 120,
        level: 2,
        streak: 3,
        totalProblemsCompleted: 15,
        lastLoginDate: new Date().toISOString(),
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      });
      
      saveLocalUsers(users);
    }
  } catch (error) {
    console.error('Error ensuring default user:', error);
  }
}
