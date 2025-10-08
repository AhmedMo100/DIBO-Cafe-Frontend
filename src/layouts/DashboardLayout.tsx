import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../components/common/Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/**
 * DashboardLayout
 * This component serves as the main layout for the admin/dashboard panel.
 * It protects dashboard routes and ensures only authenticated users can access them.
 * It includes:
 * - Sidebar navigation
 * - A header with dynamic page titles
 * - Content area rendered via <Outlet />
 */
const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);   // Loading state while checking auth
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth state

    useEffect(() => {
        const auth = getAuth();

        // =============================
        // Firebase Authentication Listener
        // =============================
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // ✅ User is logged in
                setIsAuthenticated(true);
            } else {
                // ❌ No user found, redirect to login
                setIsAuthenticated(false);
                navigate("/login");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    // =============================
    // External API Example (Commented)
    // =============================
    // Replace this with your own backend authentication check if not using Firebase
    /*
    useEffect(() => {
        fetch("https://example.com/api/check-auth", {
            method: "GET",
            credentials: "include", // or send token in headers
        })
            .then(res => res.json())
            .then(data => {
                if (data.isAuthenticated) {
                    setIsAuthenticated(true);
                } else {
                    navigate("/login");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Auth Check Error:", err);
                navigate("/login");
            });
    }, [navigate]);
    */

    /**
     * getPageTitle
     * Determines the current page title based on the URL path.
     * Returns a localized Arabic title for each route.
     */
    const getPageTitle = () => {
        if (location.pathname.includes("products")) return "المنتجات";
        if (location.pathname.includes("offers")) return "العروض";
        if (location.pathname.includes("orders")) return "الطلبات";
        if (location.pathname.includes("reservations")) return "الحجوزات";
        if (location.pathname.includes("messages")) return "الرسائل";
        if (location.pathname.includes("questions")) return "الأسئلة";
        if (location.pathname.includes("reviews")) return "أرآء العملاء";
        if (location.pathname.includes("statistics")) return "الإحصائيات";
        return "الرئيسية";
    };

    // Show loading screen until auth is verified
    if (loading) {
        return <div className="loading-screen">Checking authentication...</div>;
    }

    // Prevent rendering if user is not authenticated
    if (!isAuthenticated) return null;

    return (
        <Container fluid className="dashboard-layout">
            <Row className="g-0">
                {/* Sidebar Column */}
                <Col xs={12} md={2} lg={2} className="p-0">
                    <Sidebar />
                </Col>

                {/* Main Content Column */}
                <Col xs={12} md={10} lg={10} className="dashboard-content">
                    {/* Header of the dashboard content */}
                    <div className="dashboard-header">
                        <h2>{getPageTitle()}</h2>
                    </div>

                    {/* Body where the routed pages will render */}
                    <div className="dashboard-body">
                        <Outlet />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardLayout;
