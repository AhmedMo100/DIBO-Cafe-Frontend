// src/pages/ReviewsManagement.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Button, Card, Form, Modal, Row, Col, Dropdown } from "react-bootstrap";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { Star } from "lucide-react"; // Elegant icon for featured

/** Type Definitions */
interface Review {
    id: string;
    name: string;
    comment: string;
    rating: number;
    type?: string;
    username?: string;
    productName?: string;
    cafeName?: string;
    createdAt: Date;
    featured: boolean;
}

const ReviewsManagement: React.FC = () => {
    /** State */
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    /** Helper: Parse Firestore Timestamp */
    const parseDate = (v: any) => {
        if (!v) return new Date();
        if (v.toDate) return v.toDate();
        return new Date(v);
    };

    /** Fetch all reviews from Firestore */
    const fetchReviews = async () => {
        setLoading(true);
        try {
            // ---------------- Firebase Fetch ----------------
            const snap = await getDocs(collection(db, "reviews"));
            const data = snap.docs.map((d) => ({
                id: d.id,
                name: d.data().name || "",
                comment: d.data().comment || "",
                rating: Number(d.data().rating || 5),
                type: d.data().type,
                username: d.data().username,
                productName: d.data().productName,
                cafeName: d.data().cafeName,
                createdAt: parseDate(d.data().createdAt),
                featured: Boolean(d.data().featured || false),
            }));
            setReviews(data);

            // ---------------- API Alternative ----------------
            /*
            const res = await fetch("https://api.example.com/reviews");
            if (!res.ok) throw new Error("Failed to fetch reviews");
            const data = await res.json();
            setReviews(data.reviews);
            */

        } catch (err) {
            console.error("fetchReviews error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    /** Toggle featured status with a max of 3 */
    const toggleFeatured = async (review: Review) => {
        const currentFeatured = reviews.filter((r) => r.featured);
        const newFeatured = !review.featured;

        if (newFeatured && currentFeatured.length >= 6) {
            alert("يمكنك اختيار ٣ مميزة فقط");
            return;
        }

        try {
            // ---------------- Firebase Update ----------------
            await updateDoc(doc(db, "reviews", review.id), { featured: newFeatured });
            setReviews((prev) =>
                prev.map((r) => (r.id === review.id ? { ...r, featured: newFeatured } : r))
            );

            // ---------------- API Alternative ----------------
            /*
            await fetch(`https://api.example.com/reviews/${review.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ featured: newFeatured }),
            });
            setReviews((prev) =>
                prev.map((r) => (r.id === review.id ? { ...r, featured: newFeatured } : r))
            );
            */

        } catch (err) {
            console.error("toggleFeatured error:", err);
        }
    };

    /** Filter + Search */
    const filteredReviews = useMemo(() => {
        let data = reviews;
        if (filter === "featured") data = data.filter((r) => r.featured);
        if (filter === "none") data = data.filter((r) => !r.featured);

        return data.filter(
            (r) =>
                r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.comment.toLowerCase().includes(search.toLowerCase()) ||
                (r.username && r.username.toLowerCase().includes(search.toLowerCase())) ||
                (r.productName && r.productName.toLowerCase().includes(search.toLowerCase())) ||
                (r.cafeName && r.cafeName.toLowerCase().includes(search.toLowerCase()))
        );
    }, [reviews, search, filter]);

    /** Truncate comment for card view */
    const truncate = (text: string, length = 50) =>
        text.length > length ? text.substring(0, length) + "..." : text;

    /** Render single review card */
    const renderReviewCard = (review: Review) => (
        <Col md={4} key={review.id}>
            <Card className="review-card shadow-sm h-100">
                <Card.Body className="review-card-body d-flex flex-column justify-content-between">
                    <div>
                        <div className="review-card-header d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <strong>{review.name}</strong>
                                <div className="review-date text-muted">
                                    {review.createdAt.toLocaleDateString("ar-EG")}
                                </div>
                            </div>
                            <div className="text-end">
                                <span className="review-badge badge bg-info me-2">{review.rating} ★</span>
                                {review.featured && (
                                    <Star size={20} color="#c49a6c" fill="#c49a6c" />
                                )}
                            </div>
                        </div>
                        <p className="review-comment mb-2">{truncate(review.comment)}</p>
                    </div>
                    <Button size="sm" className="review-btn" onClick={() => setSelectedReview(review)}>
                        التفاصيل
                    </Button>
                </Card.Body>
            </Card>
        </Col>
    );

    return (
        <div className="reviews-container container my-4">
            <div className="search-filter-bar mb-4">
                <Row className="g-2 align-items-center justify-content-center">
                    <Col md={8}>
                        {/* Search bar */}
                        <Form.Control
                            type="text"
                            placeholder="ابحث عن مراجعة..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="review-search-input"
                        />
                    </Col>
                    <Col md={4}>
                        {/* Filter Dropdown */}
                        <Dropdown className="review-filter-dropdown w-100">
                            <Dropdown.Toggle variant="outline-dark" className="review-filter-toggle w-100">
                                {filter === "all" && "الكل"}
                                {filter === "featured" && "مميزة"}
                                {filter === "none" && "غير مميزة"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="review-filter-menu w-100">
                                <Dropdown.Item onClick={() => setFilter("all")}>الكل</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilter("featured")}>مميزة</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilter("none")}>غير مميزة</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
            </div>


            {loading ? (
                <p>جار التحميل...</p>
            ) : (
                <Row>{filteredReviews.map(renderReviewCard)}</Row>
            )}

            {/* Modal for review details */}
            <Modal show={!!selectedReview} onHide={() => setSelectedReview(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>تفاصيل المراجعة</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && (
                        <>
                            <h5>{selectedReview.name}</h5>
                            {selectedReview.username && <p><strong>اسم المستخدم:</strong> {selectedReview.username}</p>}
                            {selectedReview.type && <p><strong>النوع:</strong> {selectedReview.type}</p>}
                            {selectedReview.productName && <p><strong>المنتج:</strong> {selectedReview.productName}</p>}
                            {selectedReview.cafeName && <p><strong>المقهى:</strong> {selectedReview.cafeName}</p>}
                            <p><strong>التقييم:</strong> {selectedReview.rating} ★</p>
                            <p>{selectedReview.comment}</p>
                            <small className="text-muted">{selectedReview.createdAt.toLocaleString("ar-EG")}</small>
                            <div className="mt-3">
                                <Button
                                    variant={selectedReview.featured ? "danger" : "success"}
                                    className="review-featured-btn"
                                    onClick={() => {
                                        toggleFeatured(selectedReview);
                                        setSelectedReview(null);
                                    }}
                                >
                                    {selectedReview.featured ? "إزالة من المميزة" : "إضافة كمميزة"}
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className="review-close-btn" onClick={() => setSelectedReview(null)}>
                        إغلاق
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReviewsManagement;
