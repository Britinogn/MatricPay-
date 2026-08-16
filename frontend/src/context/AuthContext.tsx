import {useState, type ReactNode } from "react";
import { api } from "../lib/api";
import { AuthContext, type AuthUser } from "./auth-context";

export type UserRole = "organizer" | "admin";

const TOKEN_KEY = "matricpay_token";
const USER_KEY = "matricpay_user";

function readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser
    } catch  {
        return null
    }
}

export function AuthProvider({children }: { children: ReactNode}) {
    const [user, setUser] = useState<AuthUser | null >(readStoredUser);
    const [isLoading, setIsLoading] =  useState(false);

    function persistSession(token: string , authUser: AuthUser) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
        setUser(authUser)
    }

    async function login(email:string, password:string): Promise<AuthUser> {
        setIsLoading(true);
        try {
            const {data} = await api.post("/auth/login", {email, password});
            persistSession(data.token, data.user);
            return data.user as AuthUser;
        } finally{
            setIsLoading(false)
        }
    }

    async function register(
        fullName: string,
        email: string,
        password: string
    ): Promise<AuthUser> {
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/register", {
                fullName,
                email,
                password,
            });
            persistSession(data.token, data.user);
            return data.user as AuthUser;
        } finally {
            setIsLoading(false);
        }
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}