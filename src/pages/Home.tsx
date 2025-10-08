import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Modal,
    Carousel,
} from "react-bootstrap";
import { FaQuoteLeft } from "react-icons/fa";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, where, QueryDocumentSnapshot } from "firebase/firestore";

// Components
import ReviewWidget from "../components/common/ReviewWidget";

// Images
import Dibo1 from "../assets/images/dibo1.jpg";
import Dibo2 from "../assets/images/dibo2.jpg";
import Dibo3 from "../assets/images/dibo3.jpg";
import Dibo4 from "../assets/images/dibo4.jpg";
import Dibo5 from "../assets/images/dibo5.jpg";
import Dibo6 from "../assets/images/dibo6.jpg";

/**
 * =============================
 * Types
 * =============================
 */

/**
 * Firestore date representation used in this project:
 * - could be a plain ISO string,
 * - or a Firestore Timestamp-like object with a `toDate()` method.
 */
type FirestoreDate = string | { toDate: () => Date };

/** Product model used in UI */
interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    featured: boolean;
    img: string;
    price: number;
}

/** Offer model used in UI */
interface Offer {
    id: string;
    title: string;
    description: string;
    discountPercentage: number;
    status: string;
    startDate?: FirestoreDate;
    endDate?: FirestoreDate;
}

/** Review model used in UI */
interface Review {
    id: string;
    productName?: string;
    cafeName?: string;
    username: string;
    type: string;
    rating: number;
    comment: string;
    featured: boolean;
}

/**
 * =============================
 * Home Page Component
 * =============================
 */
const Home: React.FC = () => {
    // -----------------------------
    // States Management
    // -----------------------------
    const [products, setProducts] = useState<Product[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);

    // Carousel sliding indices
    const [productStartIndex, setProductStartIndex] = useState<number>(0);
    const [offerStartIndex, setOfferStartIndex] = useState<number>(0);
    const [reviewStartIndex, setReviewStartIndex] = useState<number>(0);

    // Cards per view (responsive)
    const [productCardsPerView, setProductCardsPerView] = useState<number>(3);
    const [offerCardsPerView, setOfferCardsPerView] = useState<number>(2);
    const [reviewCardsPerView, setReviewCardsPerView] = useState<number>(3);

    // -----------------------------
    // Responsive Cards Per View
    // -----------------------------
    useEffect(() => {
        /**
         * Updates number of visible cards according to window width.
         * Keeps logic simple and deterministic for server/client rendering.
         */
        const handleResize = (): void => {
            const width = window.innerWidth;
            setProductCardsPerView(width < 768 ? 1 : 3);
            setOfferCardsPerView(width < 768 ? 1 : 2);
            setReviewCardsPerView(width < 768 ? 1 : 3);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return (): void => window.removeEventListener("resize", handleResize);
    }, []);

    // -----------------------------
    // Helpers
    // -----------------------------
    /**
     * Safely convert a Firestore-like date to a localized string.
     * Accepts either a string or an object with toDate().
     */
    const formatDate = (value?: FirestoreDate): string => {
        if (!value) return "-";
        if (typeof value === "string") {
            // Try to produce a readable date from string; fallback to the string itself
            const parsed = Date.parse(value);
            if (!Number.isNaN(parsed)) {
                return new Date(parsed).toLocaleDateString();
            }
            return value;
        }
        try {
            return value.toDate().toLocaleDateString();
        } catch {
            return "-";
        }
    };

    /**
     * Map QueryDocumentSnapshot to typed object.
     * Keeps casting localized and explicit.
     */
    const mapDocData = <T,>(doc: QueryDocumentSnapshot): T & { id: string } => {
        return { id: doc.id, ...(doc.data() as T) } as T & { id: string };
    };

    // -----------------------------
    // Fetch Featured Products (Firebase)
    // -----------------------------
    useEffect(() => {
        const fetchProducts = async (): Promise<void> => {
            try {
                const q = query(collection(db, "products"), where("featured", "==", true));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc) => mapDocData<Omit<Product, "id">>(doc));
                setProducts(data as Product[]);
            } catch (error: unknown) {
                // Log unknown typed error in an informative way
                console.error("Failed to fetch featured products (Firebase):", error);
            }
        };

        fetchProducts();

        /**
         * =============================
         * Static External API Example (replacement for Firebase)
         * =============================
         * This example demonstrates how the same UI data can be populated
         * by a plain REST API. Keep it as a static example per request.
         *
         * fetch("https://api.example.com/products?featured=true")
         *   .then((res) => {
         *     if (!res.ok) throw new Error(`HTTP ${res.status}`);
         *     return res.json();
         *   })
         *   .then((payload: Product[]) => {
         *     // Payload is assumed to match the Product type contract
         *     setProducts(payload);
         *   })
         *   .catch((err) => {
         *     console.error("Failed to fetch products from external API:", err);
         *   });
         */
    }, []);

    // -----------------------------
    // Fetch Active Offers (Firebase)
    // -----------------------------
    useEffect(() => {
        const fetchOffers = async (): Promise<void> => {
            try {
                const q = query(collection(db, "offers"), where("status", "==", "active"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc) => mapDocData<Omit<Offer, "id">>(doc));
                setOffers(data as Offer[]);
            } catch (error: unknown) {
                console.error("Failed to fetch active offers (Firebase):", error);
            }
        };

        fetchOffers();

        /**
         * =============================
         * Static External API Example (replacement for Firebase)
         * =============================
         * fetch("https://api.example.com/offers?status=active")
         *   .then((res) => {
         *     if (!res.ok) throw new Error(`HTTP ${res.status}`);
         *     return res.json();
         *   })
         *   .then((payload: Offer[]) => setOffers(payload))
         *   .catch((err) => console.error("Failed to fetch offers from external API:", err));
         */
    }, []);

    // -----------------------------
    // Fetch Featured Reviews (Firebase)
    // -----------------------------
    useEffect(() => {
        const fetchReviews = async (): Promise<void> => {
            try {
                const q = query(collection(db, "reviews"), where("featured", "==", true));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc) => mapDocData<Omit<Review, "id">>(doc));
                setReviews(data as Review[]);
            } catch (error: unknown) {
                console.error("Failed to fetch featured reviews (Firebase):", error);
            }
        };

        fetchReviews();

        /**
         * =============================
         * Static External API Example (replacement for Firebase)
         * =============================
         * fetch("https://api.example.com/reviews?featured=true")
         *   .then((res) => {
         *     if (!res.ok) throw new Error(`HTTP ${res.status}`);
         *     return res.json();
         *   })
         *   .then((payload: Review[]) => setReviews(payload))
         *   .catch((err) => console.error("Failed to fetch reviews from external API:", err));
         */
    }, []);

    // -----------------------------
    // Modal Handlers
    // -----------------------------
    const openProductModal = (product: Product): void => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };

    const closeProductModal = (): void => {
        setShowProductModal(false);
        setSelectedProduct(null);
    };

    const openOfferModal = (offer: Offer): void => {
        setSelectedOffer(offer);
        setShowOfferModal(true);
    };

    const closeOfferModal = (): void => {
        setShowOfferModal(false);
        setSelectedOffer(null);
    };

    // -----------------------------
    // Hero Carousel Slides
    // -----------------------------
    const heroSlides = [
        {
            image: Dibo1,
            title: "أفضل كافيه في مدينتك",
            desc: "نكهات أصلية وجودة ما تتنسيش",
            btnText: "اطلب الآن",
            btnLink: "/menu",
        },
        {
            image: Dibo2,
            title: "أجواء دافئة ومريحة",
            desc: "جلسات مثالية لكل لحظة",
            btnText: "شوف المنيو",
            btnLink: "/menu",
        },
        {
            image: Dibo3,
            title: "جلسات مثالية لكل لحظة",
            desc: "طعم بيكمل متعة قهوتك",
            btnText: "اعرف المزيد",
            btnLink: "/about",
        },
        {
            image: Dibo4,
            title: "تجربة كافيه مختلفة",
            desc: "عصرية، مميزة، وقريبة منك",
            btnText: "اعرف المزيد",
            btnLink: "/about",
        },
        {
            image: Dibo5,
            title: "وجبات خفيفة لذيذة",
            desc: "تناسب كل الأوقات والأذواق",
            btnText: "اعرف المزيد",
            btnLink: "/menu",
        },
        {
            image: Dibo6,
            title: "وقتك أحلى مع أصحابك",
            desc: "كافيه يجمع بين الطعم واللمة",
            btnText: "اعرف المزيد",
            btnLink: "/about",
        },
    ];

    // Utility guards for carousel navigation (prevents negative ranges)
    const maxProductStart = Math.max(0, products.length - productCardsPerView);
    const maxOfferStart = Math.max(0, offers.length - offerCardsPerView);
    const maxReviewStart = Math.max(0, reviews.length - reviewCardsPerView);

    return (
        <div className="home-page">
            {/* ============================= */}
            {/* Hero Section */}
            {/* ============================= */}
            <section className="hero-carousel home-hero">
                <Carousel fade interval={2500} controls>
                    {heroSlides.map((slide, idx) => (
                        <Carousel.Item key={idx}>
                            <div
                                className="hero-slide"
                                style={{ backgroundImage: `url(${slide.image})` }}
                            >
                                <div className="overlay hero-overlay">
                                    <Container className="text-center hero-content">
                                        <h1>{slide.title}</h1>
                                        <p>{slide.desc}</p>
                                        <Button href={slide.btnLink} className="hero-btn">
                                            {slide.btnText}
                                        </Button>
                                    </Container>
                                </div>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </section>

            {/* ============================= */}
            {/* About Preview Section */}
            {/* ============================= */}
            <section className="about-preview section-divider home-about-preview">
                <Container className="text-center">
                    <h2 className="section-title mb-4">نبذة سريعة عنّا</h2>
                    <p className="about-text mb-4">
                        من أول فنجان قهوة لآخر قطعة حلوى، إحنا في كافيهك بنهتم بالتفاصيل
                        الصغيرة اللي بتخلي تجربتك مختلفة. أجواء مريحة، نكهات فريدة، وخدمة
                        دايمًا في انتظارك.
                    </p>
                    <Button href="/about" className="about-btn">
                        اعرف المزيد
                    </Button>
                    <hr />
                </Container>
            </section>

            {/* ============================= */}
            {/* Quick Menu Section (Featured Products) */}
            {/* ============================= */}
            <section className="quick-menu section-divider home-quick-menu">
                <Container>
                    <h2 className="section-title text-center mb-4">أشهر اختياراتنا</h2>
                    <div className="custom-carousel">
                        <Row>
                            {products
                                .slice(productStartIndex, productStartIndex + productCardsPerView)
                                .map((product) => (
                                    <Col
                                        md={productCardsPerView === 1 ? 12 : 4}
                                        key={product.id}
                                    >
                                        <Card className="menu-card home-menu-card">
                                            <Card.Img variant="top" src={product.img} />
                                            <Card.Body>
                                                <Card.Title>{product.name}</Card.Title>
                                                <Card.Text>{product.description}</Card.Text>
                                                <Button
                                                    variant="outline-dark"
                                                    onClick={() => openProductModal(product)}
                                                >
                                                    تفاصيل المنتج
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                        </Row>

                        <div className="carousel-controls text-center mt-3">
                            <Button
                                variant="outline-dark"
                                onClick={() =>
                                    setProductStartIndex((prev) => Math.max(prev - 1, 0))
                                }
                                disabled={productStartIndex === 0}
                            >
                                &lt;
                            </Button>
                            <Button
                                variant="outline-dark"
                                onClick={() =>
                                    setProductStartIndex((prev) =>
                                        Math.min(prev + 1, maxProductStart)
                                    )
                                }
                                disabled={productStartIndex >= maxProductStart}
                            >
                                &gt;
                            </Button>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <Button href="/menu" className="btn-main section-btn">
                            المزيد من المنتجات
                        </Button>
                    </div>
                </Container>
            </section>

            {/* ============================= */}
            {/* Quote Section */}
            {/* ============================= */}
            <section className="quote-section home-quote">
                <div className="overlay quote-overlay">
                    <Container className="text-center">
                        <blockquote className="quote-text">
                            "القهوة مش مجرد مشروب... دي لحظة هدوء وسط الزحمة."
                        </blockquote>
                        <p className="quote-author">DIBO Cafe -</p>
                    </Container>
                </div>
            </section>

            {/* ============================= */}
            {/* Featured Offers Section */}
            {/* ============================= */}
            <section className="offers section-divider home-offers">
                <Container>
                    <h2 className="section-title text-center mb-4">عروضنا المميزة</h2>
                    <div className="custom-carousel">
                        <Row>
                            {offers.slice(offerStartIndex, offerStartIndex + offerCardsPerView).map((offer) => (
                                <Col md={offerCardsPerView === 1 ? 12 : 6} key={offer.id}>
                                    <div className="offer-box home-offer-box">
                                        <h3>{offer.title}</h3>
                                        <p>{offer.description}</p>
                                        <Button variant="outline-dark" onClick={() => openOfferModal(offer)}>
                                            تفاصيل العرض
                                        </Button>
                                    </div>
                                </Col>
                            ))}
                        </Row>

                        <div className="carousel-controls text-center mt-3">
                            <Button
                                variant="outline-dark"
                                onClick={() => setOfferStartIndex((prev) => Math.max(prev - 1, 0))}
                                disabled={offerStartIndex === 0}
                            >
                                &lt;
                            </Button>
                            <Button
                                variant="outline-dark"
                                onClick={() =>
                                    setOfferStartIndex((prev) => Math.min(prev + 1, maxOfferStart))
                                }
                                disabled={offerStartIndex >= maxOfferStart}
                            >
                                &gt;
                            </Button>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <Button href="/menu" className="btn-main section-btn">
                            المزيد من المنتجات
                        </Button>
                    </div>
                </Container>
            </section>

            {/* ============================= */}
            {/* Customer Reviews Section */}
            {/* ============================= */}
            <section className="testimonials section-divider home-testimonials">
                <div className="overlay testimonials-overlay">
                    <Container>
                        <h2 className="section-title text-center mb-5">آراء عملائنا</h2>

                        <div className="custom-carousel">
                            <Row>
                                {reviews
                                    .slice(reviewStartIndex, reviewStartIndex + reviewCardsPerView)
                                    .map((review) => (
                                        <Col md={reviewCardsPerView === 1 ? 12 : 4} key={review.id}>
                                            <Card className="testimonial-card home-testimonial-card">
                                                <Card.Body>
                                                    <FaQuoteLeft className="quote-icon" />
                                                    <Card.Text>{review.comment}</Card.Text>
                                                    <h6>- {review.username}</h6>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                            </Row>

                            <div className="carousel-controls text-center mt-3">
                                <Button
                                    variant="outline-dark"
                                    onClick={() => setReviewStartIndex((prev) => Math.max(prev - 1, 0))}
                                    disabled={reviewStartIndex === 0}
                                >
                                    &lt;
                                </Button>
                                <Button
                                    variant="outline-dark"
                                    onClick={() => setReviewStartIndex((prev) => Math.min(prev + 1, maxReviewStart))}
                                    disabled={reviewStartIndex >= maxReviewStart}
                                >
                                    &gt;
                                </Button>
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <ReviewWidget />
                        </div>
                    </Container>
                </div>
            </section>

            {/* ============================= */}
            {/* Product Modal */}
            {/* ============================= */}
            <Modal show={showProductModal} onHide={closeProductModal} centered className="home-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedProduct?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProduct && (
                        <>
                            <img src={selectedProduct.img} alt={selectedProduct.name} className="img-fluid mb-3" />
                            <p><strong>الوصف:</strong> {selectedProduct.description}</p>
                            <p><strong>الفئة:</strong> {selectedProduct.category}</p>
                            <p><strong>السعر:</strong> {selectedProduct.price} جنيه</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeProductModal}>إغلاق</Button>
                </Modal.Footer>
            </Modal>

            {/* ============================= */}
            {/* Offer Modal */}
            {/* ============================= */}
            <Modal show={showOfferModal} onHide={closeOfferModal} centered className="home-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedOffer?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOffer && (
                        <>
                            <p><strong>الوصف:</strong> {selectedOffer.description}</p>
                            <p><strong>الخصم:</strong> {selectedOffer.discountPercentage}%</p>
                            <p><strong>بداية العرض:</strong> {formatDate(selectedOffer.startDate)}</p>
                            <p><strong>نهاية العرض:</strong> {formatDate(selectedOffer.endDate)}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeOfferModal}>إغلاق</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Home;
