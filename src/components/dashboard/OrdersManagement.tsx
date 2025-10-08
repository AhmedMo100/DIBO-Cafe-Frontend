import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { Button, Modal, Form, Row, Col, Card, InputGroup } from "react-bootstrap";

/**
 * =============================
 * Types
 * =============================
 */
interface Product {
    id: string;
    name: string;
    price: number;
}

interface OrderItem {
    id: string;
    productId: string; // 🔑 product reference
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    customerName: string;
    items: OrderItem[];
    total: number;
    createdAt: Date;
    status: "pending" | "completed";
}

/**
 * =============================
 * Orders Management Component
 * =============================
 */
const OrdersManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(""); // 🔍 search input

    /**
     * Fetch orders & products from Firestore
     * (External API alternative commented)
     */
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const snap = await getDocs(collection(db, "orders"));
                const data: Order[] = snap.docs.map((d) => {
                    const raw = d.data();
                    return {
                        id: d.id,
                        customerName: raw.customerName ?? "",
                        items: raw.items ?? [],
                        total: Number(raw.total ?? 0),
                        createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate() : new Date(),
                        status: raw.status ?? "pending",
                    };
                });
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            }
        };

        // 📌 External API alternative:
        // const fetchOrders = async () => {
        //   const res = await fetch("/api/orders");
        //   const data: Order[] = await res.json();
        //   setOrders(data);
        // };

        const fetchProducts = async () => {
            try {
                const snap = await getDocs(collection(db, "products"));
                const data: Product[] = snap.docs.map((d) => {
                    const raw = d.data();
                    return { id: d.id, name: raw.name ?? "", price: Number(raw.price ?? 0) };
                });
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            }
        };

        // 📌 External API alternative:
        // const fetchProducts = async () => {
        //   const res = await fetch("/api/products");
        //   const data: Product[] = await res.json();
        //   setProducts(data);
        // };

        fetchOrders();
        fetchProducts();
    }, []);

    /** Open modal for add/edit */
    const handleShowModal = (order?: Order) => {
        if (order) {
            setEditingOrder(order);
        } else {
            setEditingOrder({
                id: "",
                customerName: "",
                items: [],
                total: 0,
                createdAt: new Date(),
                status: "pending",
            });
        }
        setShowModal(true);
    };

    /** Add new item to order */
    const addItem = () => {
        if (!editingOrder) return;
        const newItem: OrderItem = {
            id: Date.now().toString(),
            productId: "",
            name: "",
            price: 0,
            quantity: 1,
        };
        setEditingOrder({ ...editingOrder, items: [...editingOrder.items, newItem] });
    };

    /** Remove item */
    const removeItem = (itemId: string) => {
        if (!editingOrder) return;
        setEditingOrder({
            ...editingOrder,
            items: editingOrder.items.filter((i) => i.id !== itemId),
        });
    };

    /** Update item fields */
    const updateItem = <K extends keyof OrderItem>(itemId: string, field: K, value: OrderItem[K]) => {
        if (!editingOrder) return;
        setEditingOrder({
            ...editingOrder,
            items: editingOrder.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
        });
    };

    /** Calculate total dynamically */
    const calculateTotal = (items: OrderItem[]): number => {
        return items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    };

    /** Save order (Firestore) */
    const handleSave = async () => {
        if (!editingOrder) return;

        const payload = {
            customerName: editingOrder.customerName,
            items: editingOrder.items,
            total: calculateTotal(editingOrder.items),
            createdAt: new Date(),
            status: editingOrder.status,
        };

        try {
            if (editingOrder.id) {
                await updateDoc(doc(db, "orders", editingOrder.id), payload);
                setOrders((o) =>
                    o.map((ord) => (ord.id === editingOrder.id ? { ...editingOrder, ...payload } : ord))
                );
            } else {
                const docRef = await addDoc(collection(db, "orders"), payload);
                setOrders((o) => [...o, { ...payload, id: docRef.id } as Order]);
            }
            setShowModal(false);
            setEditingOrder(null);
        } catch (err) {
            console.error("Failed to save order:", err);
        }

        // 📌 External API alternative:
        // if (editingOrder.id) {
        //   await fetch(`/api/orders/${editingOrder.id}`, { method: "PUT", body: JSON.stringify(payload) });
        // } else {
        //   await fetch("/api/orders", { method: "POST", body: JSON.stringify(payload) });
        // }
    };

    /** Delete order (with confirmation modal) */
    const confirmDelete = (id: string) => {
        setDeleteOrderId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!deleteOrderId) return;
        try {
            await deleteDoc(doc(db, "orders", deleteOrderId));
            setOrders((o) => o.filter((ord) => ord.id !== deleteOrderId));
        } catch (err) {
            console.error("Failed to delete order:", err);
        }
        setShowDeleteModal(false);
        setDeleteOrderId(null);

        // 📌 External API alternative:
        // await fetch(`/api/orders/${deleteOrderId}`, { method: "DELETE" });
    };

    /** Filter orders by customer name */
    const filteredOrders = orders.filter((order) =>
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="orders-management">
            {/* 🔍 Search & Add Button */}
            <Row className="mb-3">
                <Col md={10}>
                    <Form.Control
                        type="text"
                        className="orders-search"
                        placeholder="ابحث باسم العميل..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Col>
                <Col md={2}>
                    <Button onClick={() => handleShowModal()} className="orders-add-btn w-100">
                        + إضافة طلب
                    </Button>
                </Col>
            </Row>

            {/* ============================ */}
            {/* Orders Cards Wrapper */}
            {/* ============================ */}
            <Row className="orders-cards-wrapper g-3">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <Col key={order.id} xs={12} sm={6} md={4}>
                            <Card className="order-card shadow-sm h-100">
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <div>
                                        <Card.Title className="mb-2">{order.customerName}</Card.Title>
                                        <Card.Text className="mb-2">
                                            <strong>المنتجات:</strong>{" "}
                                            {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                                        </Card.Text>
                                        <Card.Text className="mb-2">
                                            <strong>الإجمالي:</strong> {order.total.toFixed(2)} ج.م
                                        </Card.Text>
                                        <Card.Text className="mb-2">
                                            <strong>الحالة:</strong>{" "}
                                            {order.status === "pending" ? "قيد الانتظار" : "مكتمل"}
                                        </Card.Text>
                                    </div>
                                    <div className="d-flex gap-2 mt-2 flex-wrap">
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            className="order-edit-btn flex-grow-1"
                                            onClick={() => handleShowModal(order)}
                                        >
                                            تعديل
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-info"
                                            className="order-view-btn flex-grow-1"
                                            onClick={() => {
                                                setViewingOrder(order);
                                                setShowViewModal(true);
                                            }}
                                        >
                                            عرض
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            className="order-delete-btn flex-grow-1"
                                            onClick={() => confirmDelete(order.id)}
                                        >
                                            حذف
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col xs={12}>
                        <p className="text-center text-muted">لا توجد طلبات مطابقة</p>
                    </Col>
                )}
            </Row>

            {/* ============================ */}
            {/* Modal Add/Edit */}
            {/* ============================ */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingOrder?.id ? "تعديل الطلب" : "إضافة طلب جديد"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Customer Name */}
                        <Form.Group className="mb-3 order-customer">
                            <Form.Label>اسم العميل</Form.Label>
                            <Form.Control
                                type="text"
                                value={editingOrder?.customerName ?? ""}
                                onChange={(e) =>
                                    editingOrder &&
                                    setEditingOrder({ ...editingOrder, customerName: e.target.value })
                                }
                            />
                        </Form.Group>

                        {/* Order Items */}
                        {editingOrder?.items.map((item) => (
                            <InputGroup className="mb-2 order-item" key={item.id}>
                                <Form.Select
                                    className="order-item-select"
                                    value={item.productId}
                                    onChange={(e) => {
                                        const selected = products.find((p) => p.id === e.target.value);
                                        if (selected) {
                                            updateItem(item.id, "productId", selected.id);
                                            updateItem(item.id, "name", selected.name);
                                            updateItem(item.id, "price", selected.price);
                                        }
                                    }}
                                >
                                    <option value="">اختر المنتج...</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </Form.Select>

                                <Form.Control
                                    type="number"
                                    className="order-item-quantity"
                                    placeholder="الكمية"
                                    value={item.quantity}
                                    min={1}
                                    onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                                />

                                {/* Fixed Price (EGP - not editable) */}
                                <Form.Control
                                    type="text"
                                    className="order-item-price"
                                    value={`${item.price.toFixed(2)} ج.م`}
                                    readOnly
                                />

                                <Button variant="danger" className="order-item-remove" onClick={() => removeItem(item.id)}>
                                    ×
                                </Button>
                            </InputGroup>
                        ))}
                        <Button size="sm" className="order-add-item" onClick={addItem}>
                            + إضافة منتج
                        </Button>

                        {/* Total */}
                        <div className="order-total mt-3">
                            <strong>الإجمالي: </strong>
                            {editingOrder ? `${calculateTotal(editingOrder.items).toFixed(2)} ج.م` : "0.00 ج.م"}
                        </div>

                        {/* Status */}
                        <Form.Group className="mt-2 order-status">
                            <Form.Label>الحالة</Form.Label>
                            <Form.Select
                                value={editingOrder?.status ?? "pending"}
                                onChange={(e) =>
                                    editingOrder &&
                                    setEditingOrder({ ...editingOrder, status: e.target.value as "pending" | "completed" })
                                }
                            >
                                <option value="pending">قيد الانتظار</option>
                                <option value="completed">مكتمل</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        {editingOrder?.id ? "حفظ التعديلات" : "إضافة الطلب"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ============================ */}
            {/* Modal View */}
            {/* ============================ */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>تفاصيل الطلب</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {viewingOrder && (
                        <div className="order-view">
                            <p>
                                <strong>اسم العميل:</strong> {viewingOrder.customerName}
                            </p>
                            <p>
                                <strong>الحالة:</strong> {viewingOrder.status === "pending" ? "قيد الانتظار" : "مكتمل"}
                            </p>
                            <p>
                                <strong>المنتجات:</strong>
                            </p>
                            <ul>
                                {viewingOrder.items.map((item) => (
                                    <li key={item.id}>
                                        {item.name} ×{item.quantity} - {item.price.toFixed(2)} ج.م
                                    </li>
                                ))}
                            </ul>
                            <p>
                                <strong>الإجمالي:</strong> {viewingOrder.total.toFixed(2)} ج.م
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        إغلاق
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ============================ */}
            {/* Modal Confirm Delete */}
            {/* ============================ */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>تأكيد الحذف</Modal.Title>
                </Modal.Header>
                <Modal.Body>هل أنت متأكد أنك تريد حذف هذا الطلب؟</Modal.Body>
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

export default OrdersManagement;
