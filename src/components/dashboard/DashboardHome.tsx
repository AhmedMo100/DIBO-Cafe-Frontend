import { Card, Row, Col, Container } from "react-bootstrap";
import { FaBoxOpen, FaShoppingCart, FaEnvelope, FaCog } from "react-icons/fa";
import DashboardImage from "../../assets/images/dashboard.svg";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// ====================== Types ====================== //
// Strong typing for each dashboard statistic item
interface StatItem {
    title: string;
    value: number | string;
    icon: React.ReactElement;
    color: "beige" | "gray" | "white" | "dark";
}

/**
 * DashboardHome Component
 * ----------------------------------
 * This is the main overview page of the dashboard.
 * It fetches statistics (products, orders, messages, etc.)
 * from Firebase and displays them in styled statistic cards.
 * Each Firebase fetch operation has a commented example
 * showing how to fetch the same data from an external API.
 */
const DashboardHome: React.FC = () => {
    // -------------------------------
    // State: Dashboard statistics
    // -------------------------------
    const [stats, setStats] = useState<StatItem[]>([
        { title: "المنتجات", value: 0, icon: <FaBoxOpen />, color: "beige" },
        { title: "الطلبات", value: 0, icon: <FaShoppingCart />, color: "gray" },
        { title: "الرسائل", value: 0, icon: <FaEnvelope />, color: "white" },
        { title: "الإعدادات", value: "—", icon: <FaCog />, color: "dark" },
    ]);

    // -------------------------------
    // Fetch statistics from Firebase
    // -------------------------------
    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                // -------------------------------
                // Fetch Products count from Firebase
                // -------------------------------
                const productsSnapshot = await getDocs(collection(db, "products"));
                const productsCount: number = productsSnapshot.size;

                // -------------------------------
                // Fetch Orders count from Firebase
                // -------------------------------
                const ordersSnapshot = await getDocs(collection(db, "orders"));
                const ordersCount: number = ordersSnapshot.size;

                // -------------------------------
                // Fetch Messages count from Firebase
                // -------------------------------
                const messagesSnapshot = await getDocs(collection(db, "contactMessages"));
                const messagesCount: number = messagesSnapshot.size;

                // -------------------------------
                // Update dashboard stats state
                // -------------------------------
                setStats([
                    { title: "المنتجات", value: productsCount, icon: <FaBoxOpen />, color: "beige" },
                    { title: "الطلبات", value: ordersCount, icon: <FaShoppingCart />, color: "gray" },
                    { title: "الرسائل", value: messagesCount, icon: <FaEnvelope />, color: "white" },
                    { title: "الإعدادات", value: "—", icon: <FaCog />, color: "dark" },
                ]);

                // -------------------------------
                // Example: Fetch same statistics from an external API (commented)
                // Replace "https://api.example.com/stats" with a real endpoint
                // -------------------------------
                /*
                const response = await fetch("https://api.example.com/stats");
                if (!response.ok) throw new Error("External API request failed");
                const data: { productsCount: number; ordersCount: number; messagesCount: number } = await response.json();
                console.log("External API stats:", data);

                // Update dashboard stats with API data
                setStats([
                    { title: "المنتجات", value: data.productsCount, icon: <FaBoxOpen />, color: "beige" },
                    { title: "الطلبات", value: data.ordersCount, icon: <FaShoppingCart />, color: "gray" },
                    { title: "الرسائل", value: data.messagesCount, icon: <FaEnvelope />, color: "white" },
                    { title: "الإعدادات", value: "—", icon: <FaCog />, color: "dark" },
                ]);
                */
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <Container
            fluid
            className="dashboard-home d-flex flex-column justify-content-center align-items-center py-4"
        >
            {/* ============================== */}
            {/* Welcome Box */}
            {/* ============================== */}
            <div className="welcome-box mb-5 text-center">
                <img src={DashboardImage} alt="Dashboard Overview" className="mb-3" />
                <p className="px-3">
                    من هنا تقدر تدير كل تفاصيل شغلك بسهولة. تقدر تضيف منتجات جديدة وتعدل على الموجودة، وتتابع
                    الطلبات اللي بتوصلك لحظة بلحظة عشان تضمن إن عملاءك راضيين ومفيش أي حاجة واقفة. كمان هتلاقي
                    كل الرسائل والاستفسارات اللي بيبعتها العملاء في مكان واحد، بحيث ترد عليهم بشكل أسرع وتبني معاهم
                    علاقة أقوى. ولو حابب تغير أي إعدادات أو تخصص شكل المتجر، هتلاقي الإعدادات كلها متاحة قدامك.
                </p>
            </div>

            {/* ============================== */}
            {/* Statistics Cards */}
            {/* ============================== */}
            <Row className="justify-content-center w-100">
                {stats.map((stat, index) => (
                    <Col xs={12} md={6} lg={3} key={index} className="mb-4">
                        <Card
                            className={`stat-card ${stat.color} border-0 shadow-sm text-center`}
                            onMouseEnter={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.transform = "translateY(-5px)";
                                target.style.boxShadow = "0 10px 20px rgba(0,0,0,0.12)";
                            }}
                            onMouseLeave={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.transform = "translateY(0)";
                                target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.08)";
                            }}
                        >
                            <Card.Body>
                                <div className="stat-icon mb-3">{stat.icon}</div>
                                <h5 className="mb-2">{stat.title}</h5>
                                <h3 className="fw-bold">{stat.value}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default DashboardHome;
