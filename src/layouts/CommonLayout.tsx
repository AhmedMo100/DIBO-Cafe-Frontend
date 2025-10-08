import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

/**
 * CommonLayout component
 *
 * This layout wraps around all pages that share a common structure:
 * - Header at the top
 * - Dynamic page content (via React Router's <Outlet />)
 * - Footer at the bottom
 * - Persistent floating ReviewWidget (sticks at bottom of viewport but stops above footer)
 *
 * Using a common layout ensures consistent design and functionality across all routes.
 */
const CommonLayout: React.FC = () => {
    return (
        <div className="layout-container">
            {/* Global header visible on all pages */}
            <Header />

            {/* Main content area where routed pages are rendered */}
            <main className="page-content">
                <Outlet />
            </main>

            {/* Global footer visible on all pages */}
            <Footer />
        </div>
    );
};

export default CommonLayout;