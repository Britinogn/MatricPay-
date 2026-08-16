import {Navigate , Outlet} from "react-router-dom";
import { useAuth } from "./useAuth";
import type { UserRole } from "./auth-context";

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

/**
 * Gates a set of nested routes behind authentication, and optionally a
 * specific role. Mirrors the backend's own two-layer check (§13): first
 * "is there a valid session at all", then "does this role belong here" —
 * an organizer hitting an admin-only route should bounce, not see a blank
 * page or a confusing 403 from the API.
 */

export function ProtectedRoute({allowedRoles }: ProtectedRouteProps){
    const {isAuthenticated, user} = useAuth();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}