import { createContext } from "react";

export type UserRole = "organizer" | "admin";

export interface AuthUser {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
}

export interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    register: (fullName: string, email: string, password: string) => Promise<AuthUser>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);