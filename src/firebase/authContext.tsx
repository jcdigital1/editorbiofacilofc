import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import { handleFirestoreError, OperationType } from './errors';

export const ADMIN_EMAILS = [
  'jeannmkt2@gmail.com',
  'jeanncarllostk00@gmail.com',
  'jccaricaturasmkt@gmail.com',
  'jeannleticia00@gmail.com',
];

export const isDesignatedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase().trim());
};

export type UserStatus = 'pending' | 'approved' | 'blocked';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  createdAt?: any;
  approvedAt?: any;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isApproved: boolean;
  isPending: boolean;
  isBlocked: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Monitor auth state changes
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      const email = user.email || '';
      const isDesignatedAdmin = isDesignatedAdminEmail(email);

      // Hydrate from localStorage first for zero-latency session restore
      try {
        const cached = localStorage.getItem(`bio_studio_profile_${user.uid}`);
        if (cached) {
          const parsed = JSON.parse(cached) as UserProfile;
          setUserProfile(parsed);
          setLoading(false);
        } else if (isDesignatedAdmin) {
          setUserProfile({
            uid: user.uid,
            email: email,
            status: 'approved',
            role: 'admin',
          });
          setLoading(false);
        }
      } catch (cacheErr) {
        console.warn('Erro ao ler cache de perfil:', cacheErr);
      }

      try {
        // Check if user profile already exists
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          // Document does not exist yet, bootstrap it safely
          const initialStatus: UserStatus = isDesignatedAdmin ? 'approved' : 'pending';
          const initialRole: UserRole = isDesignatedAdmin ? 'admin' : 'user';

          const newProfileData: any = {
            uid: user.uid,
            email: email,
            status: initialStatus,
            role: initialRole,
            createdAt: serverTimestamp(),
          };

          if (isDesignatedAdmin) {
            newProfileData.approvedAt = serverTimestamp();
          }

          await setDoc(userDocRef, newProfileData);

          // If designated admin, also register in admins/{uid}
          if (isDesignatedAdmin) {
            try {
              await setDoc(doc(db, 'admins', user.uid), {
                email: email,
                assignedAt: serverTimestamp(),
              });
            } catch (admErr) {
              console.warn('Registro em admins:', admErr);
            }
          }
        } else if (isDesignatedAdmin) {
          // If designated admin had an existing document that was not admin/approved, ensure admin rights
          const existingData = userSnap.data() as UserProfile;
          if (existingData.status !== 'approved' || existingData.role !== 'admin') {
            await setDoc(
              userDocRef,
              { status: 'approved', role: 'admin', approvedAt: serverTimestamp() },
              { merge: true }
            );
          }
          // Ensure admins/{uid} exists
          try {
            await setDoc(doc(db, 'admins', user.uid), {
              email: email,
              assignedAt: serverTimestamp(),
            });
          } catch (admErr) {
            console.warn('Registro em admins:', admErr);
          }
        }

        // Attach real-time listener to user's profile document so status changes take effect immediately
        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              const resolvedProfile: UserProfile = {
                uid: data.uid || user.uid,
                email: data.email || user.email || '',
                status: data.status || (isDesignatedAdmin ? 'approved' : 'pending'),
                role: data.role || (isDesignatedAdmin ? 'admin' : 'user'),
                createdAt: data.createdAt,
                approvedAt: data.approvedAt,
              };
              setUserProfile(resolvedProfile);
              try {
                localStorage.setItem(`bio_studio_profile_${user.uid}`, JSON.stringify(resolvedProfile));
              } catch {}
            }
            setLoading(false);
          },
          (err) => {
            console.error('Erro no snapshot do perfil:', err);
            if (isDesignatedAdmin) {
              setUserProfile({
                uid: user.uid,
                email: email,
                status: 'approved',
                role: 'admin',
              });
            }
            setLoading(false);
          }
        );
      } catch (fetchErr) {
        console.error('Falha ao sincronizar perfil do Firestore:', fetchErr);
        if (isDesignatedAdmin) {
          setUserProfile({
            uid: user.uid,
            email: email,
            status: 'approved',
            role: 'admin',
          });
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // Format Firebase Auth errors into Portuguese
  const translateAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/operation-not-allowed':
        return 'O login por E-mail/Senha não está ativado no Firebase Console. Acesse o Firebase Console > Authentication > Sign-in method (Provedores de login) e ative "E-mail/senha".';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'E-mail ou senha incorretos.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado. Tente entrar com sua senha.';
      case 'auth/invalid-email':
        return 'Informe um endereço de e-mail válido.';
      case 'auth/weak-password':
        return 'A senha deve conter pelo menos 6 caracteres.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas sem sucesso. Aguarde alguns instantes antes de tentar novamente.';
      case 'auth/network-request-failed':
        return 'Falha de conexão com a internet. Verifique sua rede.';
      default:
        return err?.message || 'Ocorreu um erro durante a autenticação.';
    }
  };

  // Login handler
  const login = async (email: string, pass: string) => {
    setError(null);
    const cleanEmail = email.trim();
    const isDesignatedAdmin = isDesignatedAdminEmail(cleanEmail);

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (err: any) {
      // If designated admin tries to log in directly without prior registration,
      // auto-create their administrator account with the password they provided!
      if (
        isDesignatedAdmin &&
        (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential')
      ) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          const user = userCredential.user;

          // Bootstrap admin profile in Firestore
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: cleanEmail,
            status: 'approved',
            role: 'admin',
            createdAt: serverTimestamp(),
            approvedAt: serverTimestamp(),
          });

          try {
            await setDoc(doc(db, 'admins', user.uid), {
              email: cleanEmail,
              assignedAt: serverTimestamp(),
            });
          } catch (admErr) {
            console.warn('Registro em admins:', admErr);
          }

          return;
        } catch (createErr: any) {
          if (createErr?.code === 'auth/email-already-in-use') {
            const msg = 'Senha incorreta para a conta administradora.';
            setError(msg);
            throw new Error(msg);
          }
          const msg = translateAuthError(createErr);
          setError(msg);
          throw new Error(msg);
        }
      }

      const msg = translateAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  // Register handler
  const register = async (email: string, pass: string) => {
    setError(null);
    const cleanEmail = email.trim();
    const isDesignatedAdmin = isDesignatedAdminEmail(cleanEmail);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const user = userCredential.user;

      // Create user record in Firestore immediately
      const initialStatus: UserStatus = isDesignatedAdmin ? 'approved' : 'pending';
      const initialRole: UserRole = isDesignatedAdmin ? 'admin' : 'user';

      const newProfileData: any = {
        uid: user.uid,
        email: cleanEmail,
        status: initialStatus,
        role: initialRole,
        createdAt: serverTimestamp(),
      };

      if (isDesignatedAdmin) {
        newProfileData.approvedAt = serverTimestamp();
      }

      await setDoc(doc(db, 'users', user.uid), newProfileData);

      if (isDesignatedAdmin) {
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            email: cleanEmail,
            assignedAt: serverTimestamp(),
          });
        } catch (admErr) {
          console.warn('Erro ao criar registro admin:', admErr);
        }
      }
    } catch (err: any) {
      const msg = translateAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  // Logout handler
  const logout = async () => {
    setError(null);
    try {
      if (currentUser?.uid) {
        try {
          localStorage.removeItem(`bio_studio_profile_${currentUser.uid}`);
        } catch {}
      }
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Erro ao sair:', err);
    }
  };

  // Password reset email handler
  const sendPasswordReset = async (targetEmail: string) => {
    setError(null);
    const cleanEmail = targetEmail.trim();
    if (!cleanEmail) {
      const msg = 'Informe seu e-mail para redefinir a senha.';
      setError(msg);
      throw new Error(msg);
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: any) {
      const msg = translateAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (!currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    }
  };

  const isAdmin =
    userProfile?.role === 'admin' ||
    (isDesignatedAdminEmail(currentUser?.email) && userProfile?.status === 'approved');

  const isApproved = userProfile?.status === 'approved';
  const isPending = userProfile?.status === 'pending';
  const isBlocked = userProfile?.status === 'blocked';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        error,
        isAdmin,
        isApproved,
        isPending,
        isBlocked,
        login,
        register,
        sendPasswordReset,
        logout,
        clearError,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
