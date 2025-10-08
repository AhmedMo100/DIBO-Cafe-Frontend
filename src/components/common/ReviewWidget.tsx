import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { db } from "../../firebase/firebaseConfig";
import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore";

// Types
interface Product {
    id: string;
    name: string;
}

type ReviewType = "product" | "cafe";

interface Review {
    id?: string;
    type: ReviewType;
    productId?: string;
    productName?: string;
    cafeName?: string;
    username: string;
    comment: string;
    rating: number;
    createdAt: Date;
}

const ReviewWidget: React.FC = () => {
    // Modal visibility state
    const [showModal, setShowModal] = useState(false);

    // Review form states
    const [reviewType, setReviewType] = useState<ReviewType>("product");
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [username, setUsername] = useState("");
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const cafeName = "DIBO CAFE"; // Static cafe name

    // Fetch products from Firestore
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const snap = await getDocs(collection(db, "products"));
                const data: Product[] = snap.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                }));
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
        };
        fetchProducts();
    }, []);

    // Submit review to Firestore
    const handleSubmit = async () => {
        if (!username || !comment || rating === 0 || (reviewType === "product" && !selectedProduct)) {
            alert("Please fill all fields and select a rating.");
            return;
        }

        const newReview: Review = {
            type: reviewType,
            username,
            comment,
            rating,
            createdAt: new Date(),
            ...(reviewType === "product"
                ? {
                    productId: selectedProduct,
                    productName: products.find((p) => p.id === selectedProduct)?.name,
                }
                : { cafeName }),
        };

        try {
            setLoading(true);
            await addDoc(collection(db, "reviews"), {
                ...newReview,
                createdAt: Timestamp.fromDate(newReview.createdAt),
            });

            // Reset form fields after successful submission
            setUsername("");
            setComment("");
            setRating(0);
            setSelectedProduct("");
            setShowModal(false);
        } catch (err) {
            console.error("Failed to save review", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Trigger button for opening the review modal */}
            <div className="text-center mb-4">
                <Button className="section-btn" onClick={() => setShowModal(true)}>
                    إضافة تقييم جديد
                </Button>
            </div>

            {/* Review Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>إضافة تقييم</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Review type selector */}
                        <Form.Group className="mb-3">
                            <Form.Label>نوع التقييم</Form.Label>
                            <Form.Select
                                value={reviewType}
                                onChange={(e) => setReviewType(e.target.value as ReviewType)}
                            >
                                <option value="product">منتج</option>
                                <option value="cafe">الكافية</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Product selection if review type is product */}
                        {reviewType === "product" && (
                            <Form.Group className="mb-3">
                                <Form.Label>اختر المنتج</Form.Label>
                                <Form.Select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                >
                                    <option value="">-- اختر المنتج --</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}

                        {/* Display cafe name if review type is cafe */}
                        {reviewType === "cafe" && <p className="fw-bold">تقييم الكافية: {cafeName}</p>}

                        {/* Username input */}
                        <Form.Group className="mb-3">
                            <Form.Label>اسمك</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Group>

                        {/* Comment input */}
                        <Form.Group className="mb-3">
                            <Form.Label>التعليق</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </Form.Group>

                        {/* Star rating */}
                        <Form.Group className="mb-3">
                            <Form.Label>التقييم</Form.Label>
                            <div>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setRating(star)}
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "1.5rem",
                                            color: star <= rating ? "#ffc107" : "#e4e5e9",
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "جاري الحفظ..." : "حفظ التقييم"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ReviewWidget;
