import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layouts
import CommonLayout from "./layouts/CommonLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Common Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Reservation from "./pages/Reservation";
import Login from "./pages/AdminLogin";

// Dashboard Pages
import DashboardHome from "./components/dashboard/DashboardHome";
import ProductsManagement from "./components/dashboard/ProductsManagement";
import OffersManagement from "./components/dashboard/OffersManagement";
import OrdersManagement from "./components/dashboard/OrdersManagement";
import ReservationsManagement from "./components/dashboard/ReservationsManagement";
import MessagesManagement from "./components/dashboard/MessagesManagement";
import QuestionsManagement from "./components/dashboard/QuestonsManagement";
import ReviewsManagement from "./components/dashboard/ReviewsManagement";
import StatisticsManagement from "./components/dashboard/StatisticsManagement";

// Protected Route
import ProtectedRoute from "./ProtectedRoute";

/**
 * Main App Component
 * Handles routing for the entire application.
 * It separates the public pages and protected dashboard pages.
 */
const App = () => {
  return (
    <Router>
      <Routes>
        {/* ===================== */}
        {/* Public Route: Login */}
        {/* ===================== */}
        <Route path="/login" element={<Login />} />

        {/* ===================== */}
        {/* Public Website Layout */}
        {/* ===================== */}
        <Route element={<CommonLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reservation" element={<Reservation />} />
        </Route>

        {/* ===================== */}
        {/* Protected Dashboard Layout */}
        {/* ===================== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard child routes */}
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="offers" element={<OffersManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="reservations" element={<ReservationsManagement />} />
          <Route path="messages" element={<MessagesManagement />} />
          <Route path="questions" element={<QuestionsManagement />} />
          <Route path="reviews" element={<ReviewsManagement />} />
          <Route path="statistics" element={<StatisticsManagement />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
