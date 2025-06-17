/**
 * Hybrid Authentication Service
 * This service can switch between local authentication (current) and AWS Cognito
 * based on environment configuration
 */

import type { User, AuthResponse } from './types';
import { 
  initializeDirectAuth, 
  registerDirectUser, 
  loginDirectUser, 
  getCurrentDirectUser,
  logoutDirectUser
} from './directAuthSolution';
import { AWSCognitoAuth } from './aws-cognito-auth';

// Configuration flag to determine which auth service to use
const USE_AWS_COGNITO = process.env.NEXT_PUBLIC_USE_AWS_COGNITO === 'true';

export class HybridAuthService {
  private static instance: HybridAuthService;
  private awsCognitoAuth: AWSCognitoAuth;
  private isAwsInitialized = false;

  constructor() {
    this.awsCognitoAuth = AWSCognitoAuth.getInstance();
  }

  static getInstance(): HybridAuthService {
    if (!HybridAuthService.instance) {
      HybridAuthService.instance = new HybridAuthService();
    }
    return HybridAuthService.instance;
  }

  async initialize(): Promise<void> {
    if (USE_AWS_COGNITO) {
      try {
        this.isAwsInitialized = await this.awsCognitoAuth.initialize();
        if (!this.isAwsInitialized) {
          console.warn('AWS Cognito initialization failed, falling back to local auth');
        }
      } catch (error) {
        console.warn('AWS Cognito not available, using local auth:', error);
      }
    }
    
    // Always initialize local auth as fallback
    if (typeof window !== 'undefined') {
      // Check and migrate old user format if needed
      this.migrateUserDataIfNeeded();
      initializeDirectAuth();
    }
  }

  /**
   * Migrate old user data format to new format with additional fields
   */
  private migrateUserDataIfNeeded(): void {
    try {
      const currentUser = localStorage.getItem('delta_current_user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        // Check if user has new fields, if not, clear storage to regenerate
        if (!user.hasOwnProperty('xpPoints') || !user.hasOwnProperty('level')) {
          console.log('Migrating user data to new format...');
          localStorage.removeItem('delta_current_user');
          localStorage.removeItem('delta_local_users');
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.warn('Error during user data migration:', error);
      // Clear corrupted data
      localStorage.removeItem('delta_current_user');
      localStorage.removeItem('delta_local_users');
      localStorage.removeItem('token');
    }
  }

  async register(userData: { 
    username: string; 
    email: string; 
    password: string; 
    role: string;
  }): Promise<{ success: boolean; message: string }> {
    if (USE_AWS_COGNITO && this.isAwsInitialized) {
      try {
        const result = await this.awsCognitoAuth.signUp(
          userData.username, 
          userData.email, 
          userData.password
        );
        
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        return {
          success: true,
          message: 'Registration successful! Please check your email for verification.'
        };
      } catch (error) {
        console.error('AWS Cognito registration failed, falling back to local:', error);
        // Fall back to local auth
      }
    }
    
    // Use local authentication
    return registerDirectUser(userData);
  }

  async login(credentials: { 
    email: string; 
    password: string;
  }): Promise<AuthResponse | { error: string }> {
    if (USE_AWS_COGNITO && this.isAwsInitialized) {
      try {
        const result = await this.awsCognitoAuth.signIn(credentials.email, credentials.password);
        
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        return result;
      } catch (error) {
        console.error('AWS Cognito login failed, falling back to local:', error);
        // Fall back to local auth
      }
    }
    
    // Use local authentication
    return loginDirectUser(credentials);
  }

  async logout(): Promise<void> {
    if (USE_AWS_COGNITO && this.isAwsInitialized) {
      try {
        await this.awsCognitoAuth.signOut();
      } catch (error) {
        console.error('AWS Cognito logout failed:', error);
      }
    }
    
    // Always clear local storage
    logoutDirectUser();
  }

  async getCurrentUser(): Promise<User | null> {
    if (USE_AWS_COGNITO && this.isAwsInitialized) {
      try {
        const user = await this.awsCognitoAuth.getCurrentUser();
        if (user) return user;
      } catch (error) {
        console.error('AWS Cognito getCurrentUser failed:', error);
      }
    }
    
    // Fall back to local auth
    return getCurrentDirectUser();
  }

  async refreshToken(): Promise<string | null> {
    if (USE_AWS_COGNITO && this.isAwsInitialized) {
      try {
        return await this.awsCognitoAuth.refreshToken();
      } catch (error) {
        console.error('AWS Cognito token refresh failed:', error);
      }
    }
    
    // For local auth, just return the existing token
    return localStorage.getItem('token');
  }

  isUsingAWS(): boolean {
    return USE_AWS_COGNITO && this.isAwsInitialized;
  }

  // Auto-login helper for development
  async autoLoginWithRandomEmail(): Promise<User | null> {
    try {
      // Generate random email
      const randomId = Math.random().toString(36).substring(2, 8);
      const randomEmail = `user_${randomId}@delta-edu.com`;
      
      // Create and login with random user
      const randomUser = {
        username: `DeltaUser${randomId}`,
        email: randomEmail,
        password: 'auto-generated',
        role: 'student'
      };
      
      // Register the user first
      const registerResult = await this.register(randomUser);
      
      if (!registerResult.success) {
        throw new Error(registerResult.message);
      }
      
      // Then login
      const loginResult = await this.login({ 
        email: randomEmail, 
        password: 'auto-generated' 
      });
      
      if ('error' in loginResult) {
        throw new Error(loginResult.error);
      }
      
      console.log('Auto-logged in with random email:', randomEmail);
      return loginResult.user;
    } catch (error) {
      console.error('Auto-login failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const hybridAuth = HybridAuthService.getInstance();
