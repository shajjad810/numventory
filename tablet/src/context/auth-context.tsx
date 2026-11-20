import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { login, validateToken } from "../lib/auth";
import { getToken, saveToken, removeToken } from "../lib/session";

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const savedToken = await getToken();

        if (!savedToken) {
          return;
        }

        const isValid = await validateToken(savedToken);

        if (cancelled) return;

        if (isValid) {
          setToken(savedToken);
        } else {
          await removeToken();
          setToken(null);
        }
      } catch (error) {
        console.error("Failed to validate saved session:", error);

        // A network error does not mean the token is invalid.
        // Keep the token stored so it can be checked again later.
        if (!cancelled) {
          setToken(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn(email: string, password: string) {
    const newToken = await login(email, password);

    await saveToken(newToken);
    setToken(newToken);
  }

  async function signOut() {
    await removeToken();
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoading,
        isAuthenticated: token !== null,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
