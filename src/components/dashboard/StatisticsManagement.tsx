import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

/** Types */
interface Order { id: string; status: "pending" | "completed" | "cancelled"; createdAt: Date; customerName: string; }
interface Reservation { id: string; status: "pending" | "confirmed" | "cancelled"; createdAt: Date; name: string; }
interface Message { id: string; createdAt: Date; name: string; }

/** Helper: parse Firestore timestamp safely */
const parseCreatedAt = (v: unknown): Date => {
    if (!v) return new Date(0);
    if (v instanceof Date) return v;
    if (typeof v === "number") return new Date(v);
    if (typeof v === "string") return new Date(v);
    if (typeof v === "object" && v !== null) {
        if ("toDate" in v && typeof (v as any).toDate === "function") return (v as any).toDate();
        if ("seconds" in v && typeof (v as any).seconds === "number") return new Date((v as any).seconds * 1000);
    }
    return new Date(0);
};

/** Status colors */
const STATUS_COLORS: Record<string, string> = {
    pending: "#f0ad4e",
    completed: "#5cb85c",
    confirmed: "#5cb85c",
    cancelled: "#d9534f"
};

const StatisticsManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    /** Fetch data from Firestore */
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // --- Fetch Orders ---
                const ordersSnap = await getDocs(collection(db, "orders"));
                // Map Firestore docs to Order objects
                setOrders(
                    ordersSnap.docs.map(d => ({
                        id: d.id,
                        status: (d.data().status as Order["status"]) ?? "pending",
                        createdAt: parseCreatedAt(d.data().createdAt),
                        customerName: d.data().customerName || "غير معروف"
                    }))
                );

                // --- Fetch Reservations ---
                const resSnap = await getDocs(collection(db, "reservations"));
                // Map Firestore docs to Reservation objects
                setReservations(
                    resSnap.docs.map(d => ({
                        id: d.id,
                        status: (d.data().status as Reservation["status"]) ?? "pending",
                        createdAt: parseCreatedAt(d.data().createdAt),
                        name: d.data().name || "غير معروف"
                    }))
                );

                // --- Fetch Messages ---
                const msgSnap = await getDocs(collection(db, "contactMessages"));
                // Map Firestore docs to Message objects
                setMessages(
                    msgSnap.docs.map(d => ({
                        id: d.id,
                        createdAt: parseCreatedAt(d.data().createdAt),
                        name: d.data().name || "غير معروف"
                    }))
                );
            } catch (err) {
                console.error("Failed to fetch statistics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    /* Fetch data from External API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // --- Fetch Orders from API ---
                const ordersRes = await fetch("https://api.example.com/orders");
                const ordersDataRaw = await ordersRes.json();
                const ordersData: Order[] = ordersDataRaw.map((o: any) => ({
                    id: o.id,
                    status: o.status ?? "pending",
                    createdAt: new Date(o.createdAt), // assuming API returns ISO date string
                    customerName: o.customerName || "غير معروف"
                }));
                setOrders(ordersData);

                // --- Fetch Reservations from API ---
                const reservationsRes = await fetch("https://api.example.com/reservations");
                const reservationsDataRaw = await reservationsRes.json();
                const reservationsData: Reservation[] = reservationsDataRaw.map((r: any) => ({
                    id: r.id,
                    status: r.status ?? "pending",
                    createdAt: new Date(r.createdAt),
                    name: r.name || "غير معروف"
                }));
                setReservations(reservationsData);

                // --- Fetch Messages from API ---
                const messagesRes = await fetch("https://api.example.com/messages");
                const messagesDataRaw = await messagesRes.json();
                const messagesData: Message[] = messagesDataRaw.map((m: any) => ({
                    id: m.id,
                    createdAt: new Date(m.createdAt),
                    name: m.name || "غير معروف"
                }));
                setMessages(messagesData);

            } catch (err) {
                console.error("Failed to fetch statistics from API", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    */

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            <Spinner animation="border" />
        </div>
    );

    /** Chart Data */
    const orderStatusData = [
        { name: "Pending", value: orders.filter(o => o.status === "pending").length },
        { name: "Completed", value: orders.filter(o => o.status === "completed").length },
        { name: "Cancelled", value: orders.filter(o => o.status === "cancelled").length },
    ];

    const reservationStatusData = [
        { name: "Pending", value: reservations.filter(r => r.status === "pending").length },
        { name: "Confirmed", value: reservations.filter(r => r.status === "confirmed").length },
        { name: "Cancelled", value: reservations.filter(r => r.status === "cancelled").length },
    ];

    const COLORS = ["#8884d8", "#82ca9d", "#ff8042"];

    /** Latest Items */
    const latestOrders = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
    const latestReservations = reservations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
    const latestMessages = messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

    return (
        <div className="statistics-management container my-4">

            {/* KPIs */}
            <Row className="mb-4 g-3">
                <Col md={4}>
                    <Card className="p-3 text-center shadow-sm hover-shadow">
                        <h5>الطلبات</h5>
                        <h2>{orders.length}</h2>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="p-3 text-center shadow-sm hover-shadow">
                        <h5>الحجوزات</h5>
                        <h2>{reservations.length}</h2>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="p-3 text-center shadow-sm hover-shadow">
                        <h5>الرسائل</h5>
                        <h2>{messages.length}</h2>
                    </Card>
                </Col>
            </Row>

            {/* Pie Charts */}
            <Row className="mb-4 g-3">
                <Col md={6}>
                    <Card className="p-3 shadow-sm hover-shadow">
                        <h5>حالة الطلبات</h5>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={orderStatusData} dataKey="value" nameKey="name" outerRadius={80} label>
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="p-3 shadow-sm hover-shadow">
                        <h5>حالة الحجوزات</h5>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={reservationStatusData} dataKey="value" nameKey="name" outerRadius={80} label>
                                    {reservationStatusData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Latest Items */}
            <Row className="mb-4 g-3">
                <Col md={4}>
                    <Card className="p-3 shadow-sm hover-shadow">
                        <h5>آخر ٥ طلبات</h5>
                        <ul>
                            {latestOrders.map(o => (
                                <li key={o.id}>
                                    <Badge bg={STATUS_COLORS[o.status]} className="me-2">{o.status}</Badge>
                                    {o.customerName} - {o.createdAt.toLocaleDateString("ar-EG")}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="p-3 shadow-sm hover-shadow">
                        <h5>آخر ٥ حجوزات</h5>
                        <ul>
                            {latestReservations.map(r => (
                                <li key={r.id}>
                                    <Badge bg={STATUS_COLORS[r.status]} className="me-2">{r.status}</Badge>
                                    {r.name} - {r.createdAt.toLocaleDateString("ar-EG")}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="p-3 shadow-sm hover-shadow">
                        <h5>آخر ٥ رسائل</h5>
                        <ul>
                            {latestMessages.map(m => (
                                <li key={m.id}>
                                    {m.name} - {m.createdAt.toLocaleDateString("ar-EG")}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StatisticsManagement;
