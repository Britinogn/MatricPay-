import type { UserRole, UserStatus } from "./enums";

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

/** What the frontend actually stores / uses after login */
export interface AuthUser {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    fullName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}