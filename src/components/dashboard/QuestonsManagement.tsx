import React, { useEffect, useState } from "react";
import {
    Button,
    Form,
    Modal,
} from "react-bootstrap";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    active: boolean;
    createdAt?: Date;
}

const FAQManagement: React.FC = () => {
    // ---------------------------- State ----------------------------
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentFAQ, setCurrentFAQ] = useState<Omit<FAQ, "id">>({
        question: "",
        answer: "",
        category: "عام",
        active: true,
    });
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [filterCategory, setFilterCategory] = useState<"all" | "عام" | "تقني" | "خدمات">("all");

    // ---------------------------- Fetch FAQs ----------------------------
    const fetchFAQs = async () => {
        try {
            // ---------------- Firebase Example ----------------
            const querySnapshot = await getDocs(collection(db, "faqs"));
            const data: FAQ[] = querySnapshot.docs.map((docSnap) => {
                const d = docSnap.data();
                return {
                    id: docSnap.id,
                    question: d.question || "",
                    answer: d.answer || "",
                    category: d.category || "عام",
                    active: d.active ?? true,
                    createdAt: d.createdAt?.toDate?.() ?? new Date(),
                };
            });
            setFaqs(data);

            // ---------------- API Alternative ----------------
            /*
            const response = await fetch("https://api.example.com/faqs");
            if (!response.ok) throw new Error("Failed to fetch FAQs");
            const data = await response.json();
            setFaqs(data.faqs);
            */

            filterData(data, filterStatus, filterCategory);
        } catch (err) {
            console.error("fetchFAQs error:", err);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, );

    // ---------------------------- Filter Function ----------------------------
    const filterData = (
        data: FAQ[],
        status: "all" | "active" | "inactive",
        category: "all" | "عام" | "تقني" | "خدمات"
    ) => {
        let result = data;
        if (status !== "all") result = result.filter(f => (status === "active" ? f.active : !f.active));
        if (category !== "all") result = result.filter(f => f.category === category);
        setFilteredFaqs(result);
    };

    useEffect(() => {
        filterData(faqs, filterStatus, filterCategory);
    }, [filterStatus, filterCategory, faqs]);

    // ---------------------------- Add/Edit Modal ----------------------------
    const handleShowAddEditModal = (faq?: FAQ) => {
        if (faq) {
            setCurrentFAQ({
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                active: faq.active,
            });
            setEditId(faq.id);
        } else {
            setCurrentFAQ({ question: "", answer: "", category: "عام", active: true });
            setEditId(null);
        }
        setShowAddEditModal(true);
    };

    // ---------------------------- View Modal ----------------------------
    const handleShowViewModal = (faq: FAQ) => {
        setCurrentFAQ(faq);
        setShowViewModal(true);
    };

    // ---------------------------- Save FAQ ----------------------------
    const handleSave = async () => {
        if (!currentFAQ.question || !currentFAQ.answer) return;

        try {
            if (editId) {
                // ---------------- Firebase Update ----------------
                const docRef = doc(db, "faqs", editId);
                await updateDoc(docRef, { ...currentFAQ });

                // ---------------- API Alternative ----------------
                /*
                await fetch(`https://api.example.com/faqs/${editId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(currentFAQ),
                });
                */
            } else {
                // ---------------- Firebase Add ----------------
                await addDoc(collection(db, "faqs"), {
                    ...currentFAQ,
                    createdAt: serverTimestamp(),
                });

                // ---------------- API Alternative ----------------
                /*
                await fetch("https://api.example.com/faqs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(currentFAQ),
                });
                */
            }

            setShowAddEditModal(false);
            fetchFAQs();
        } catch (err) {
            console.error("handleSave error:", err);
        }
    };

    // ---------------------------- Delete FAQ ----------------------------
    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            // ---------------- Firebase Delete ----------------
            await deleteDoc(doc(db, "faqs", deleteId));

            // ---------------- API Alternative ----------------
            /*
            await fetch(`https://api.example.com/faqs/${deleteId}`, {
                method: "DELETE",
            });
            */

            setShowDeleteModal(false);
            fetchFAQs();
        } catch (err) {
            console.error("handleDelete error:", err);
        }
    };

    // ---------------------------- Render ----------------------------
    return (
        <div className="faq-management-container p-3">
            {/* Filters + Add Button Row */}
            <div className="faq-actions-bar mb-3">
                <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                    className="faq-filter-select"
                >
                    <option value="all">الكل حسب الحالة</option>
                    <option value="active">مفعل</option>
                    <option value="inactive">معطل</option>
                </Form.Select>

                <Form.Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as "all" | "عام" | "تقني" | "خدمات")}
                    className="faq-filter-select"
                >
                    <option value="all">الكل حسب التصنيف</option>
                    <option value="عام">عام</option>
                    <option value="تقني">تقني</option>
                    <option value="خدمات">خدمات</option>
                </Form.Select>

                <Button className="btn-add-faq" onClick={() => handleShowAddEditModal()}>
                    + إضافة سؤال
                </Button>
            </div>

            {/* FAQ Cards Grid */}
            <div className="faq-cards-wrapper">
                <div className="row">
                    {filteredFaqs.map((faq) => (
                        <div className="col-md-6 col-lg-4 mb-4" key={faq.id}>
                            <div className="faq-card">
                                <h5 className="faq-card-question">{faq.question}</h5>
                                <p className="faq-card-answer">
                                    {faq.answer.length > 100 ? faq.answer.slice(0, 100) + "..." : faq.answer}
                                </p>
                                <div className="faq-card-actions">
                                    <Button size="sm" className="btn-edit-faq" onClick={() => handleShowAddEditModal(faq)}>تعديل</Button>
                                    <Button size="sm" className="btn-delete-faq" onClick={() => { setDeleteId(faq.id); setShowDeleteModal(true); }}>حذف</Button>
                                    <Button size="sm" className="btn-view-faq" onClick={() => handleShowViewModal(faq)}>عرض</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredFaqs.length === 0 && (
                        <div className="text-center text-muted mt-3">لا توجد نتائج</div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal show={showAddEditModal} onHide={() => setShowAddEditModal(false)} centered className="faq-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{editId ? "تعديل السؤال" : "إضافة سؤال جديد"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="faq-form">
                        <Form.Group className="faq-form-group mb-3">
                            <Form.Label>السؤال</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="أدخل السؤال هنا"
                                value={currentFAQ.question}
                                onChange={(e) => setCurrentFAQ({ ...currentFAQ, question: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="faq-form-group mb-3">
                            <Form.Label>الإجابة</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="أدخل الإجابة هنا"
                                value={currentFAQ.answer}
                                onChange={(e) => setCurrentFAQ({ ...currentFAQ, answer: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="faq-form-group mb-3">
                            <Form.Label>التصنيف</Form.Label>
                            <Form.Select
                                value={currentFAQ.category}
                                onChange={(e) => setCurrentFAQ({ ...currentFAQ, category: e.target.value })}
                            >
                                <option value="عام">عام</option>
                                <option value="تقني">تقني</option>
                                <option value="خدمات">خدمات</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="faq-form-group mb-3">
                            <Form.Check
                                type="switch"
                                label="مفعل"
                                checked={currentFAQ.active}
                                onChange={(e) => setCurrentFAQ({ ...currentFAQ, active: e.target.checked })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-cancel" onClick={() => setShowAddEditModal(false)}>إلغاء</Button>
                    <Button className="btn-save" onClick={handleSave}>{editId ? "حفظ التغييرات" : "إضافة السؤال"}</Button>
                </Modal.Footer>
            </Modal>

            {/* View Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered className="faq-modal">
                <Modal.Header closeButton>
                    <Modal.Title>عرض السؤال</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>السؤال:</strong> {currentFAQ.question}</p>
                    <p><strong>الإجابة:</strong> {currentFAQ.answer}</p>
                    <p><strong>التصنيف:</strong> {currentFAQ.category}</p>
                    <p><strong>الحالة:</strong> {currentFAQ.active ? "مفعل" : "معطل"}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-cancel" onClick={() => setShowViewModal(false)}>إغلاق</Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="delete-confirm-modal">
                <Modal.Header closeButton>
                    <Modal.Title>تأكيد الحذف</Modal.Title>
                </Modal.Header>
                <Modal.Body>هل أنت متأكد أنك تريد حذف هذا السؤال؟</Modal.Body>
                <Modal.Footer>
                    <Button className="btn-cancel-delete" onClick={() => setShowDeleteModal(false)}>إلغاء</Button>
                    <Button className="btn-confirm-delete" onClick={handleDelete}>حذف</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FAQManagement;
