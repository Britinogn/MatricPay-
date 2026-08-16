import axios from 'axios'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ||  "http://localhost:5000/api",
});

// Attach the JWT to every authenticated request automatically.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("matricpay_token");
    if (token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
})

// A 401 anywhere means the token is invalid or expired (spec §13: no
// refresh tokens in MVP — user re-logs in after expiry). Clear the stale
// token and bounce to login rather than leaving the app in a broken
// half-authenticated state.

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // if (error.response?.status === 401){
        //     localStorage.removeItem("matricpay_token");
        //     localStorage.removeItem("matricpay_user");
        //     if (window.location.pathname !== "/login"){
        //         window.location.href = "/login"
        //     }
        // }
        return Promise.reject(error)
    }
)