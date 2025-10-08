import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// =============================
// Admin Login Component
// =============================
const Login: React.FC = () => {
    // =============================
    // State Management
    // =============================
    const [email, setEmail] = useState<string>("");           // Stores admin email input
    const [password, setPassword] = useState<string>("");     // Stores admin password input
    const [loading, setLoading] = useState<boolean>(false);   // Loading state during login
    const [error, setError] = useState<string | null>(null);  // Error message for failed login

    const navigate = useNavigate();
    const auth = getAuth();

    // =============================
    // Handle Admin Login (Firebase)
    // =============================
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 🔹 Firebase Authentication Sign-In
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("✅ Firebase Login Success:", user);

            // =============================
            // External API Example (Commented)
            // =============================
            // 🔹 Replace this section with your API if you want to authenticate
            // directly against a backend instead of Firebase.
            /*
            fetch("https://example.com/api/admin-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })
                .then(res => {
                    if (!res.ok) throw new Error("API login failed");
                    return res.json();
                })
                .then(data => {
                    console.log("✅ API Login Success:", data);
                    // Navigate to dashboard if API login is successful
                    navigate("/dashboard");
                })
                .catch(err => {
                    console.error("❌ API Login Error:", err);
                    setError("You are not authorized to access this page.");
                });
            */

            // Navigate to dashboard after successful Firebase login
            navigate("/dashboard");

        } catch (err: unknown) {
            // Unified professional error message for all login failures
            const errorMessage = "You are not authorized to access this page.";

            // Log the original error for debugging (developers only)
            console.error("❌ Firebase Login Error:", err);

            // Display user-friendly message
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* ============================= */}
            {/* Admin Login Form */}
            {/* ============================= */}
            <form className="login-form" onSubmit={handleLogin}>
                <h2 className="login-title">Admin Login</h2>

                {/* Error Message */}
                {error && <p className="error-message">{error}</p>}

                {/* Email Field */}
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your admin email"
                    />
                </div>

                {/* Password Field */}
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                    />
                </div>

                {/* Submit Button */}
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
