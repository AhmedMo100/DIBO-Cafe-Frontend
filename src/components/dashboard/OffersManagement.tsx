import React, { useEffect, useMemo, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { Button, Modal, Form, Card, Row, Col } from "react-bootstrap";

type OfferStatus = "active" | "inactive";

interface Offer {
    id: string;
    title: string;
    description?: string;
    discountPercentage?: number;
    startDate: Date;
    endDate: Date;
    status: OfferStatus;
}

interface EditingState {
    id?: string;
    data: Partial<Offer>;
}

const OffersManagement: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [statusFilter, setStatusFilter] = useState<"all" | OfferStatus>("all");
    const [editing, setEditing] = useState<EditingState | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const snap = await getDocs(collection(db, "offers"));
                const data: Offer[] = snap.docs.map((d) => {
                    const raw = d.data() as DocumentData;
                    return {
                        id: d.id,
                        title: raw.title ?? "",
                        description: raw.description ?? "",
                        discountPercentage: raw.discountPercentage ?? 0,
                        startDate: raw.startDate?.toDate?.() ?? new Date(raw.startDate),
                        endDate: raw.endDate?.toDate?.() ?? new Date(raw.endDate),
                        status: (raw.status as OfferStatus) || "inactive",
                    };
                });
                setOffers(data);
            } catch (err) {
                console.error("Failed to fetch offers", err);
            }

            // Alternative API fetch example
            /*
            const response = await fetch("https://api.example.com/offers");
            if (!response.ok) throw new Error("Failed to fetch offers");
            const result = await response.json();
            setOffers(result.offers);
            */
        };
        fetchOffers();
    }, []);

    const filtered = useMemo(() => {
        if (statusFilter === "all") return offers;
        return offers.filter((o) => o.status === statusFilter);
    }, [offers, statusFilter]);

    const handleSave = async () => {
        if (!editing) return;

        const payload: Omit<Offer, "id"> = {
            title: editing.data.title ?? "",
            description: editing.data.description ?? "",
            discountPercentage: editing.data.discountPercentage ?? 0,
            startDate: editing.data.startDate ?? new Date(),
            endDate: editing.data.endDate ?? new Date(),
            status: editing.data.status ?? "inactive",
        };

        try {
            if (editing.id) {
                await updateDoc(doc(db, "offers", editing.id), payload);
                setOffers((prev) =>
                    prev.map((o) => (o.id === editing.id ? { ...o, ...payload } : o))
                );
            } else {
                const docRef = await addDoc(collection(db, "offers"), payload);
                setOffers((prev) => [...prev, { ...payload, id: docRef.id }]);
            }
            setShowModal(false);
            setEditing(null);
        } catch (err) {
            console.error("Failed to save offer", err);
        }

        // Alternative API
        /*
        await fetch("https://api.example.com/offers", {
          method: editing.id ? "PUT" : "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" }
        });
        */
    };

    const handleDeleteConfirmed = async () => {
        if (!deleteTarget) return;
        try {
            await deleteDoc(doc(db, "offers", deleteTarget.id));
            setOffers((prev) => prev.filter((o) => o.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            console.error("Failed to delete offer", err);
        }

        // Alternative API
        /*
        await fetch(`https://api.example.com/offers/${deleteTarget.id}`, { method: "DELETE" });
        */
    };

    const toggleStatus = async (offer: Offer) => {
        const newStatus: OfferStatus = offer.status === "active" ? "inactive" : "active";
        try {
            await updateDoc(doc(db, "offers", offer.id), { status: newStatus });
            setOffers((prev) =>
                prev.map((o) => (o.id === offer.id ? { ...o, status: newStatus } : o))
            );
        } catch (err) {
            console.error("Failed to toggle status", err);
        }

        // Alternative API
        /*
        await fetch(`https://api.example.com/offers/${offer.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
          headers: { "Content-Type": "application/json" }
        });
        */
    };

    return (
        <div className="offers-management-container p-3">
            <Row className="offers-actions-bar d-flex justify-content-between align-items-center mb-3">
                <Col md={10}>
                    <Form.Select
                        className="offers-filter-select"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value as "all" | OfferStatus)
                        }
                    >
                        <option value="all">كل العروض</option>
                        <option value="active">العروض النشطة</option>
                        <option value="inactive">العروض غير النشطة</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Button
                        className="btn-add-offer"
                        onClick={() => {
                            setEditing({ data: {} });
                            setShowModal(true);
                        }}
                    >
                        + إضافة عرض
                    </Button>
                </Col>
            </Row>

            <div className="offers-cards-wrapper row g-3">
                {filtered.map((offer) => (
                    <div key={offer.id} className="col-12 col-md-6 col-lg-4">
                        <Card className="offer-card h-100">
                            <Card.Body>
                                <h5 className="offer-card-title">{offer.title}</h5>
                                <p className="offer-card-desc text-muted">{offer.description || "بدون وصف"}</p>
                                <p className="offer-card-discount">نسبة الخصم: {offer.discountPercentage ?? 0}%</p>
                                <p className="offer-card-dates">
                                    من {offer.startDate.toLocaleDateString()} إلى {offer.endDate.toLocaleDateString()}
                                </p>
                                <p className="offer-card-status">
                                    الحالة: <strong>{offer.status === "active" ? "نشط" : "غير نشط"}</strong>
                                </p>
                                <div className="d-flex gap-2 mt-3 offer-card-actions">
                                    <Button
                                        size="sm"
                                        className="btn-edit-offer"
                                        onClick={() => {
                                            setEditing({ id: offer.id, data: offer });
                                            setShowModal(true);
                                        }}
                                    >
                                        تعديل
                                    </Button>
                                    <Button size="sm" variant="danger" className="btn-delete-offer" onClick={() => setDeleteTarget(offer)}>
                                        حذف
                                    </Button>
                                    <Button size="sm" className="btn-toggle-status" onClick={() => toggleStatus(offer)}>
                                        {offer.status === "active" ? "إلغاء التفعيل" : "تفعيل"}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
                {filtered.length === 0 && <p className="text-center text-muted">لا يوجد عروض</p>}
            </div>

            {showModal && (
                <Modal show onHide={() => setShowModal(false)} centered className="offer-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>{editing?.id ? "تعديل العرض" : "إضافة عرض"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className="offer-form">
                            <Form.Group className="mb-2 offer-form-group">
                                <Form.Label>العنوان</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="offer-input"
                                    value={editing?.data.title ?? ""}
                                    onChange={(e) =>
                                        setEditing((prev) =>
                                            prev ? { ...prev, data: { ...prev.data, title: e.target.value } } : null
                                        )
                                    }
                                />
                            </Form.Group>
                            <Form.Group className="mb-2 offer-form-group">
                                <Form.Label>الوصف</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    className="offer-input"
                                    value={editing?.data.description ?? ""}
                                    onChange={(e) =>
                                        setEditing((prev) =>
                                            prev ? { ...prev, data: { ...prev.data, description: e.target.value } } : null
                                        )
                                    }
                                />
                            </Form.Group>
                            <Form.Group className="mb-2 offer-form-group">
                                <Form.Label>نسبة الخصم</Form.Label>
                                <Form.Control
                                    type="number"
                                    className="offer-input"
                                    value={editing?.data.discountPercentage ?? 0}
                                    onChange={(e) =>
                                        setEditing((prev) =>
                                            prev
                                                ? { ...prev, data: { ...prev.data, discountPercentage: Number(e.target.value) } }
                                                : null
                                        )
                                    }
                                />
                            </Form.Group>
                            <Form.Group className="mb-2 offer-form-group">
                                <Form.Label>تاريخ البداية</Form.Label>
                                <Form.Control
                                    type="date"
                                    className="offer-input"
                                    value={
                                        editing?.data.startDate
                                            ? editing.data.startDate.toISOString().split("T")[0]
                                            : ""
                                    }
                                    onChange={(e) =>
                                        setEditing((prev) =>
                                            prev ? { ...prev, data: { ...prev.data, startDate: new Date(e.target.value) } } : null
                                        )
                                    }
                                />
                            </Form.Group>
                            <Form.Group className="mb-2 offer-form-group">
                                <Form.Label>تاريخ النهاية</Form.Label>
                                <Form.Control
                                    type="date"
                                    className="offer-input"
                                    value={
                                        editing?.data.endDate
                                            ? editing.data.endDate.toISOString().split("T")[0]
                                            : ""
                                    }
                                    onChange={(e) =>
                                        setEditing((prev) =>
                                            prev ? { ...prev, data: { ...prev.data, endDate: new Date(e.target.value) } } : null
                                        )
                                    }
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>إلغاء</Button>
                        <Button variant="primary" onClick={handleSave}>{editing?.id ? "حفظ التعديلات" : "إضافة"}</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {deleteTarget && (
                <Modal show onHide={() => setDeleteTarget(null)} centered className="delete-confirm-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>تأكيد الحذف</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>هل أنت متأكد أنك تريد حذف العرض <strong>{deleteTarget.title}</strong>؟</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>إلغاء</Button>
                        <Button variant="danger" onClick={handleDeleteConfirmed}>حذف</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default OffersManagement;
