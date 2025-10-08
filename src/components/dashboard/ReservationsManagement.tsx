import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { Table, Card, Row, Col, Form, Button, Modal, Spinner } from "react-bootstrap";

interface Reservation {
    id: string;
    name: string;
    phone?: string;
    date: string;
    time: string;
    guests: number;
    status: "pending" | "confirmed" | "cancelled";
    notes?: string;
}

const ReservationsManagement: React.FC = () => {
    // ---------------------------- State ----------------------------
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);

    // New states for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // ---------------------------- Fetch Reservations ----------------------------
    useEffect(() => {
        const fetchReservations = async () => {
            setLoading(true);
            try {
                // ---------------- Firebase Fetch ----------------
                const snap = await getDocs(collection(db, "reservations"));
                const firebaseData: Reservation[] = snap.docs.map((d) => ({
                    id: d.id,
                    ...(d.data() as Omit<Reservation, "id">),
                }));

                setReservations(
                    firebaseData.sort(
                        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                );

                // ---------------- API Alternative ----------------
                /*
                const res = await fetch("https://api.example.com/reservations");
                if (!res.ok) throw new Error("Failed to fetch reservations");
                const data = await res.json();
                setReservations(data.reservations);
                */

            } catch (err) {
                console.error("fetchReservations error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    // ---------------------------- Handle Status Change ----------------------------
    const handleStatusChange = async (id: string, newStatus: Reservation["status"]) => {
        try {
            // ---------------- Firebase Update ----------------
            await updateDoc(doc(db, "reservations", id), { status: newStatus });
            setReservations((s) =>
                s.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
            );

            // ---------------- API Alternative ----------------
            /*
            await fetch(`https://api.example.com/reservations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            setReservations((s) =>
                s.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
            );
            */

        } catch (err) {
            console.error("handleStatusChange error:", err);
        }
    };

    // ---------------------------- Handle Delete ----------------------------
    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            // ---------------- Firebase Delete ----------------
            await deleteDoc(doc(db, "reservations", deleteId));
            setReservations((s) => s.filter((r) => r.id !== deleteId));

            // ---------------- API Alternative ----------------
            /*
            await fetch(`https://api.example.com/reservations/${deleteId}`, {
                method: "DELETE",
            });
            setReservations((s) => s.filter((r) => r.id !== deleteId));
            */

            setShowDeleteModal(false);
            setDeleteId(null);
        } catch (err) {
            console.error("handleDelete error:", err);
        }
    };

    // ---------------------------- Filtered Reservations ----------------------------
    const filtered = useMemo(() => {
        if (!filter) return reservations;
        const today = new Date().toLocaleDateString();
        switch (filter) {
            case "today":
                return reservations.filter((r) => new Date(r.date).toLocaleDateString() === today);
            case "pending":
            case "confirmed":
            case "cancelled":
                return reservations.filter((r) => r.status === filter);
            default:
                return reservations;
        }
    }, [filter, reservations]);

    // ---------------------------- Analytics ----------------------------
    const total = reservations.length;
    const confirmed = reservations.filter((r) => r.status === "confirmed").length;
    const cancelled = reservations.filter((r) => r.status === "cancelled").length;

    // ---------------------------- Render ----------------------------
    return (
        <div className="reservations-management p-3">
            {/* Loading Spinner */}
            {loading && (
                <div className="text-center mb-3">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">جاري تحميل الحجوزات...</p>
                </div>
            )}

            <Row className="mb-4">
                <Col md={4}>
                    <Card className="analytics-card text-center">
                        <Card.Body>
                            <h5>إجمالي الحجوزات</h5>
                            <h3>{total}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="analytics-card text-center">
                        <Card.Body>
                            <h5>المؤكدة</h5>
                            <h3>{confirmed}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="analytics-card text-center">
                        <Card.Body>
                            <h5>الملغية</h5>
                            <h3>{cancelled}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filter */}
            <Row className="mb-3">
                <Col>
                    <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-reservations">
                        <option value="">عرض كل الحجوزات</option>
                        <option value="today">حجوزات اليوم</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="cancelled">ملغي</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* Desktop Table */}
            <div className="d-none d-md-block">
                <Table className="reservations-table" responsive>
                    <thead>
                        <tr>
                            <th>اسم العميل</th>
                            <th>رقم الهاتف</th>
                            <th>التاريخ</th>
                            <th>الساعة</th>
                            <th>عدد الأفراد</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((r) => (
                            <tr key={r.id}>
                                <td>{r.name}</td>
                                <td>{r.phone ?? "-"}</td>
                                <td>{new Date(r.date).toLocaleDateString()}</td>
                                <td>{r.time}</td>
                                <td>{r.guests}</td>
                                <td>
                                    <Form.Select
                                        value={r.status}
                                        onChange={(e) =>
                                            handleStatusChange(r.id, e.target.value as Reservation["status"])
                                        }
                                    >
                                        <option value="pending">قيد الانتظار</option>
                                        <option value="confirmed">مؤكد</option>
                                        <option value="cancelled">ملغي</option>
                                    </Form.Select>
                                </td>
                                <td>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            setDeleteId(r.id);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        حذف
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center text-muted">
                                    لا توجد حجوزات مطابقة
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="d-md-none">
                {filtered.map((r) => (
                    <Card className="mb-3" key={r.id}>
                        <Card.Body>
                            <h6>{r.name}</h6>
                            <p className="mb-1">رقم الهاتف: {r.phone ?? "-"}</p>
                            <p className="mb-1">
                                التاريخ: {new Date(r.date).toLocaleDateString()} - الساعة: {r.time}
                            </p>
                            <p className="mb-1">عدد الأفراد: {r.guests}</p>
                            <Form.Select
                                value={r.status}
                                onChange={(e) =>
                                    handleStatusChange(r.id, e.target.value as Reservation["status"])
                                }
                            >
                                <option value="pending">قيد الانتظار</option>
                                <option value="confirmed">مؤكد</option>
                                <option value="cancelled">ملغي</option>
                            </Form.Select>
                            <Button
                                variant="danger"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                    setDeleteId(r.id);
                                    setShowDeleteModal(true);
                                }}
                            >
                                حذف
                            </Button>
                        </Card.Body>
                    </Card>
                ))}
                {filtered.length === 0 && (
                    <p className="text-center text-muted">لا توجد حجوزات مطابقة</p>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>تأكيد الحذف</Modal.Title>
                </Modal.Header>
                <Modal.Body>هل أنت متأكد أنك تريد حذف هذا الحجز؟</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        حذف
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReservationsManagement;