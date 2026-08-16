import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { AuthResponse, AuthUser,LoginPayload, RegisterPayload } from "../types";

const TOKEN_KEY = "matricpay_token";

export function getToken(){
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("matricpay_user"); // clean old key too
}

/** Current user – the single source of truth for auth state */
export function useCurrentUser(){
    const token = getToken();

    return useQuery({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            const {data} = await api.get<{ data: AuthUser}>("/auth/me")
            return data.data
        },
        enabled: !!token,
        staleTime:1000 * 60 * 5, //5 minutes
        retry: false,
    })
}

export function useLogin(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: LoginPayload) =>{
            const { data } = await api.post<AuthResponse>("auth/login", payload);
            return data;
        },
        onSuccess: (data) => {
            setToken(data.token);
            queryClient.setQueryData(["auth", "me"], data.user);
        },
    });
}

export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: RegisterPayload) => {
            const { data } = await api.post<AuthResponse>("/auth/register", payload);
            return data;
        },
        onSuccess: (data) => {
            setToken(data.token);
            queryClient.setQueryData(["auth", "me"], data.user);
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return () => {
        clearToken();
        queryClient.removeQueries({ queryKey: ["auth"] });
        queryClient.clear();
        window.location.href = "/login";
    };
}