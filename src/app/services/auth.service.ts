import { Injectable, inject, signal, computed } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  user,
  updateProfile,
  User as FirebaseUser
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, from, of, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { User, LoginCredentials, RegisterCredentials, UserRole, AuthState } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Signals for reactive state management
  private userSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(true);
  private errorSignal = signal<string | null>(null);

  // Computed properties
  user = this.userSignal.asReadonly();
  isLoading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  isAuthenticated = computed(() => this.user() !== null);
  isAdmin = computed(() => this.user()?.role === 'admin');

  // Observable for components that need it
  user$ = user(this.auth).pipe(
    switchMap(firebaseUser => {
      if (firebaseUser) {
        return this.getUserData(firebaseUser.uid);
      } else {
        return of(null);
      }
    }),
    tap(user => {
      this.userSignal.set(user);
      this.loadingSignal.set(false);
    })
  );

  constructor() {
    // Initialize auth state
    this.user$.subscribe();
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const userCredential = await signInWithEmailAndPassword(
        this.auth, 
        credentials.email, 
        credentials.password
      );

      const userData = await this.getUserData(userCredential.user.uid).toPromise();
      if (userData) {
        this.userSignal.set(userData);
        
        // Redirect based on role
        if (userData.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      }
    } catch (error: any) {
      this.errorSignal.set(this.getErrorMessage(error));
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      // Update Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: credentials.name
      });

      // Create user document in Firestore
      const userData: User = {
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        email: credentials.email,
        name: credentials.name,
        role: 'user', // Default role
        addresses: [],
        isEmailVerified: userCredential.user.emailVerified,
        createdAt: new Date()
      };

      await this.createUserDocument(userData);
      this.userSignal.set(userData);
      
      // Redirect to home for regular users
      this.router.navigate(['/']);
      
    } catch (error: any) {
      this.errorSignal.set(this.getErrorMessage(error));
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.userSignal.set(null);
      this.errorSignal.set(null);
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorSignal.set(this.getErrorMessage(error));
    }
  }

  /**
   * Get user data from Firestore
   */
  private getUserData(uid: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userDocRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          const data = doc.data();
          return {
            id: doc.id,
            uid: data['uid'],
            email: data['email'],
            name: data['name'],
            phone: data['phone'],
            avatar: data['avatar'],
            company: data['company'],
            role: data['role'] || 'user',
            addresses: data['addresses'] || [],
            isEmailVerified: data['isEmailVerified'] || false,
            isPhoneVerified: data['isPhoneVerified'] || false,
            createdAt: data['createdAt']?.toDate() || new Date(),
            lastLogin: data['lastLogin']?.toDate()
          } as User;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error getting user data:', error);
        return of(null);
      })
    );
  }

  /**
   * Create user document in Firestore
   */
  private async createUserDocument(user: User): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', user.uid);
    
    // Only include defined fields
    const userData: any = {
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      addresses: user.addresses || [],
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: false,
      createdAt: user.createdAt || new Date(),
      lastLogin: new Date()
    };

    // Only add optional fields if they have values
    if (user.phone) userData.phone = user.phone;
    if (user.avatar) userData.avatar = user.avatar;
    if (user.company) userData.company = user.company;
    if (user.taxCode) userData.taxCode = user.taxCode;

    await setDoc(userDocRef, userData);
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    if (!this.isAdmin()) {
      throw new Error('Chỉ admin mới có thể thay đổi quyền người dùng');
    }

    const userDocRef = doc(this.firestore, 'users', userId);
    await setDoc(userDocRef, { role }, { merge: true });
  }

  /**
   * Create admin account (for initial setup)
   */
  async createAdminAccount(credentials: RegisterCredentials): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      await updateProfile(userCredential.user, {
        displayName: credentials.name
      });

      const userData: User = {
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        email: credentials.email,
        name: credentials.name,
        role: 'admin', // Admin role
        addresses: [],
        isEmailVerified: userCredential.user.emailVerified,
        createdAt: new Date()
      };

      await this.createUserDocument(userData);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Check if email already exists
   */
  async isEmailExists(email: string): Promise<boolean> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Get error message from Firebase error
   */
  private getErrorMessage(error: any): string {
    console.error('Auth error details:', error);
    
    switch (error.code) {
      case 'auth/user-not-found':
        return 'Không tìm thấy tài khoản với email này';
      case 'auth/wrong-password':
        return 'Mật khẩu không chính xác';
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu (tối thiểu 6 ký tự)';
      case 'auth/invalid-email':
        return 'Email không hợp lệ';
      case 'auth/too-many-requests':
        return 'Quá nhiều lần thử, vui lòng thử lại sau';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      case 'auth/internal-error':
        return 'Lỗi hệ thống. Vui lòng thử lại sau.';
      case 'permission-denied':
        return 'Không có quyền truy cập. Vui lòng liên hệ admin.';
      case 'unavailable':
        return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
      default:
        return error.message || `Đã xảy ra lỗi không xác định: ${error.code || 'unknown'}`;
    }
  }
}
