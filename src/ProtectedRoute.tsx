import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * Ensures that only authenticated users can access protected routes.
 * Fixes the refresh issue by listening to Firebase Auth state.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const auth = getAuth();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);   // update state with user (or null if not logged in)
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    // Still checking authentication state
    if (loading) {
        return <div className="loading-screen">جارِ التحقق من تسجيل الدخول...</div>;
    }

    // Not logged in → redirect
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in → render children
    return <>{children}</>;
};

export default ProtectedRoute;
