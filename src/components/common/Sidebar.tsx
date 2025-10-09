// src/components/layouts/Sidebar.tsx
import React, { useMemo, useState } from "react";
import { Nav, Button, Offcanvas } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import {
    FaFacebookF,
    FaInstagram,
    FaBars,
    FaTiktok,
    FaYoutube,
} from "react-icons/fa";
import logo from "../../assets/images/DIBO Logo.jpg";

/**
 * Sidebar.tsx
 *
 * Responsive sidebar component for Dashboard.
 * - Desktop: fixed vertical sidebar.
 * - Mobile: offcanvas sidebar that opens from the end (right).
 *
 * Key goals:
 *  - Strong TypeScript types for safety.
 *  - Clear, professional English comments for maintainability.
 *  - Accessibility (aria attributes).
 *  - Example comment blocks that show how to replace Firebase usage with external APIs.
 */

/** Interface describing a single navigation item */
interface NavItem {
    path: string;
    label: string;
}

/** Sidebar functional component (no props) */
const Sidebar: React.FC = () => {
    const location = useLocation();
    const [show, setShow] = useState<boolean>(false);

    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);

    /**
     * navItems
     * - Defined with a typed array so TypeScript knows structure.
     * - useMemo to avoid recreation on each render (minor perf benefit).
     */
    const navItems: NavItem[] = useMemo(
        () => [
            { path: "/dashboard", label: "الرئيسية" },
            { path: "/dashboard/products", label: "المنتجات" },
            { path: "/dashboard/offers", label: "العروض" },
            { path: "/dashboard/orders", label: "الطلبات" },
            { path: "/dashboard/reservations", label: "الحجوزات" },
            { path: "/dashboard/messages", label: "الرسائل" },
            { path: "/dashboard/questions", label: "الأسئلة" },
            { path: "/dashboard/reviews", label: "أرآء العملاء" },
            { path: "/dashboard/statistics", label: "الإحصائيات" },
        ],
        []
    );

    /**
     * SidebarContent (inner component)
     * - Shared structure used by both the fixed sidebar (desktop) and offcanvas (mobile).
     * - Kept as an inner component for clarity and to share closures like handleClose.
     */
    const SidebarContent = () => (
        <div className="dashboard-sidebar d-flex flex-column justify-content-between align-items-center h-100">
            {/* Top Section: Logo + Navigation */}
            <div className="w-100 d-flex flex-column align-items-center">
                {/* Logo: ensure alt text for a11y */}
                <div className="sidebar-logo mb-5" aria-hidden={false}>
                    <img src={logo} alt="Dibo Cafe logo" className="img-fluid" />
                </div>

                {/* Navigation Links */}
                <Nav className="flex-column text-center w-100" role="navigation" aria-label="Dashboard navigation">
                    {navItems.map((item) => (
                        <Nav.Item key={item.path}>
                            {/* Use react-router Link for SPA navigation.
                  Add 'active' class based on exact pathname match for clear highlighting. */}
                            <Link
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
                                onClick={handleClose}
                                aria-current={location.pathname === item.path ? "page" : undefined}
                            >
                                {item.label}
                            </Link>
                        </Nav.Item>
                    ))}
                </Nav>
            </div>

            {/* Footer Section: Social Icons */}
            <div className="sidebar-footer text-center mt-4" aria-hidden={false}>
                <div className="d-flex justify-content-center gap-3">
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                        <FaFacebookF className="social-icon" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                        <FaInstagram className="social-icon" />
                    </a>
                    <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
                        <FaTiktok className="social-icon" />
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                        <FaYoutube className="social-icon" />
                    </a>
                </div>

                <div className="divider mt-3 mb-2" />
            </div>
        </div>
    );

    /**
     * NOTE: If you later load nav items from a remote source (e.g., Firebase or external API),
     * put the fetching logic here and set local state instead of using the hard-coded navItems.
     *
     * Example: Using Firebase (pseudo-code)
     * ---------------------------------------------------------
     * // import { getDocs } from "firebase/firestore";
     * async function fetchNavFromFirebase() {
     *   try {
     *     const snapshot = await getDocs(collection(db, "dashboard-nav"));
     *     // map snapshot to nav item array and set state
     *   } catch (err) {
     *     // handle error
     *   }
     * }
     *
     * Example: Equivalent using external REST API (professional example)
     * ---------------------------------------------------------
     * // Using fetch or axios to get nav items from an external service:
     * async function fetchNavFromExternalAPI(): Promise<NavItem[]> {
     *   try {
     *     const res = await fetch("https://api.example.com/dashboard/nav", {
     *       method: "GET",
     *       headers: {
     *         "Content-Type": "application/json",
     *         "Authorization": `Bearer ${YOUR_API_TOKEN}`, // if needed
     *       },
     *     });
     *     if (!res.ok) throw new Error(`Failed to fetch nav: ${res.status}`);
     *     const data = await res.json();
     *     // Validate and transform external shape into NavItem[]
     *     return data.items.map((it: any) => ({ path: it.path, label: it.title }));
     *   } catch (error) {
     *     // Log / report error, return fallback / empty array
     *     console.error("fetchNavFromExternalAPI error:", error);
     *     return [];
     *   }
     * }
     *
     * The above external-API example shows common best practices:
     *  - Proper error handling
     *  - Explicit Content-Type and Authorization headers
     *  - Validation/normalization of external data shape
     */

    return (
        <>
            {/* Desktop: fixed sidebar visible on md+ */}
            <div className="d-none d-md-block sidebar-fixed" aria-hidden={false}>
                <SidebarContent />
            </div>

            {/* Mobile toggle button (visible on small screens) */}
            <Button
                variant="dark"
                className={`d-md-none mobile-toggle-btn ${show ? "active" : ""}`}
                onClick={handleShow}
                aria-label="Open menu"
                aria-controls="mobile-dashboard-offcanvas"
            >
                <FaBars />
            </Button>

            {/* Offcanvas for mobile devices */}
            <Offcanvas
                id="mobile-dashboard-offcanvas"
                show={show}
                onHide={handleClose}
                placement="end"
                aria-labelledby="offcanvas-dashboard-label"
            >
                <Offcanvas.Header closeButton className="mobile-offcanvas-header">
                    <Offcanvas.Title id="offcanvas-dashboard-label" className="ms-auto">
                        القائمة
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <SidebarContent />
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default Sidebar;
