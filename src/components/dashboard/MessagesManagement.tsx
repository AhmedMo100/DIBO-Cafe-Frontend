import React, { useEffect, useState } from "react";
import {
    Button,
    Form,
    Modal,
    Table,
    Row,
    Col,
    Card,
} from "react-bootstrap";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// ---------------------------- Types ----------------------------
interface Message {
    id: string;
    name: string;
    message: string;
    category: string;
    createdAt: Date;
}

// ---------------------------- Component ----------------------------
const MessagesManagement: React.FC = () => {
    // ---------------------------- State ----------------------------
    const [messages, setMessages] = useState<Message[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [search, setSearch] = useState<string>("");

    // ---------------------------- Fetch Messages ----------------------------
    const fetchMessages = async () => {
        try {
            // ---------------- Firebase Example ----------------
            const querySnapshot = await getDocs(collection(db, "contactMessages"));
            const data: Message[] = querySnapshot.docs.map((docSnap) => {
                const d = docSnap.data() as DocumentData;
                return {
                    id: docSnap.id,
                    name: d.name ?? "مستخدم غير معروف",
                    message: d.message ?? "",
                    category: d.category ?? "عام",
                    createdAt: d.createdAt?.toDate?.() ?? new Date(),
                };
            });
            setMessages(data);
            setFilteredMessages(data);

            // ---------------- API Alternative ----------------
            /*
            // Example: Fetch messages from an external REST API
            const response = await fetch("https://api.example.com/messages");
            if (!response.ok) throw new Error("Failed to fetch messages");
            const result = await response.json();
            setMessages(result.messages);
            setFilteredMessages(result.messages);
            */
        } catch (err) {
            console.error("fetchMessages error:", err);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    // ---------------------------- Search Function ----------------------------
    useEffect(() => {
        const term = search.trim().toLowerCase();
        if (!term) {
            setFilteredMessages(messages);
        } else {
            const result = messages.filter(
                (msg) =>
                    msg.name.toLowerCase().includes(term) ||
                    msg.message.toLowerCase().includes(term) ||
                    msg.category.toLowerCase().includes(term)
            );
            setFilteredMessages(result);
        }
    }, [search, messages]);

    // ---------------------------- Modals ----------------------------
    const handleShowViewModal = (msg: Message) => {
        setCurrentMessage(msg);
        setShowViewModal(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            // ---------------- Firebase Delete ----------------
            await deleteDoc(doc(db, "contactMessages", deleteId));

            // ---------------- API Alternative ----------------
            /*
            await fetch(`https://api.example.com/messages/${deleteId}`, {
                method: "DELETE",
            });
            */

            setShowDeleteModal(false);
            fetchMessages();
        } catch (err) {
            console.error("handleDelete error:", err);
        }
    };

    // ---------------------------- Render ----------------------------
    return (
        <div className="messages-management p-3">
            {/* Search Row */}
            <Row className="mb-4 justify-content-center search-row">
                <Col md={8}>
                    <Form.Control
                        type="text"
                        placeholder="ابحث عن رسالة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="message-search-input"
                    />
                </Col>
            </Row>

            {/* Messages Table (Desktop) */}
            <div className="d-none d-md-block">
                <Table bordered hover responsive className="messages-table shadow-sm">
                    <thead>
                        <tr>
                            <th>المرسل</th>
                            <th>الرسالة</th>
                            <th>التصنيف</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMessages.map((msg) => (
                            <tr key={msg.id}>
                                <td>{msg.name}</td>
                                <td className="text-truncate" style={{ maxWidth: 250 }}>
                                    {msg.message.length > 50
                                        ? msg.message.slice(0, 50) + "..."
                                        : msg.message}
                                </td>
                                <td>{msg.category}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        className="me-1 view-btn"
                                        onClick={() => handleShowViewModal(msg)}
                                    >
                                        عرض
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="delete-btn"
                                        onClick={() => {
                                            setDeleteId(msg.id);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        حذف
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filteredMessages.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center text-muted">
                                    لا توجد رسائل
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="d-md-none message-card-grid">
                {filteredMessages.map((msg) => (
                    <Card key={msg.id} className="message-card mb-3">
                        <Card.Body>
                            <h6>{msg.name}</h6>
                            <p className="small">
                                {msg.message.length > 100
                                    ? msg.message.slice(0, 100) + "..."
                                    : msg.message}
                            </p>
                            <div className="card-actions">
                                <Button
                                    size="sm"
                                    variant="dark"
                                    onClick={() => handleShowViewModal(msg)}
                                >
                                    عرض
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => {
                                        setDeleteId(msg.id);
                                        setShowDeleteModal(true);
                                    }}
                                >
                                    حذف
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            {/* View Modal */}
            <Modal
                show={showViewModal}
                onHide={() => setShowViewModal(false)}
                centered
                className="message-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>عرض الرسالة</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <strong>المرسل:</strong> {currentMessage?.name}
                    </p>
                    <p>
                        <strong>الرسالة:</strong> {currentMessage?.message}
                    </p>
                    <p>
                        <strong>التصنيف:</strong> {currentMessage?.category}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        إغلاق
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Modal */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                centered
                className="confirm-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>تأكيد الحذف</Modal.Title>
                </Modal.Header>
                <Modal.Body>هل أنت متأكد أنك تريد حذف هذه الرسالة؟</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteModal(false)}
                    >
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

export default MessagesManagement;
