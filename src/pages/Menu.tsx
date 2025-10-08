import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

// ===================================================
// Types
// ===================================================
interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    img: string;
    price: number;
}

interface Category {
    id: string;
    name: string;
}

// ===================================================
// Menu Component
// ===================================================
const Menu: React.FC = () => {
    // -----------------------------
    // States
    // -----------------------------
    const [filter, setFilter] = useState<string>("all");
    const [menuItems, setMenuItems] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    // ===================================================
    // ✅ Fetch Products & Categories (Firebase + API Example)
    // ===================================================
    useEffect(() => {
        // -----------------------------
        // Fetch products from Firebase
        // -----------------------------
        const fetchProducts = async (): Promise<void> => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const data: Product[] = querySnapshot.docs.map(
                    (doc: QueryDocumentSnapshot<DocumentData>) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    } as Product)
                );
                setMenuItems(data);
            } catch (err) {
                console.error("❌ Failed to fetch products from Firebase:", err);
            }
        };

        // 🔁 Equivalent example using external API (instead of Firebase)
        /*
        const fetchProductsFromAPI = async (): Promise<void> => {
        try {
            const response = await fetch("https://api.example.com/products");
            if (!response.ok) throw new Error("Failed to fetch products");
            const data: Product[] = await response.json();
            setMenuItems(data);
        } catch (err) {
            console.error("❌ Failed to fetch products from API:", err);
        }
        };
        */

        // -----------------------------
        // Fetch categories from Firebase
        // -----------------------------
        const fetchCategories = async (): Promise<void> => {
            try {
                const querySnapshot = await getDocs(collection(db, "categories"));
                const data: Category[] = querySnapshot.docs.map(
                    (doc: QueryDocumentSnapshot<DocumentData>) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    } as Category)
                );
                setCategories(data);
            } catch (err) {
                console.error("❌ Failed to fetch categories from Firebase:", err);
            }
        };

        // 🔁 Equivalent example using external API:
        /*
        const fetchCategoriesFromAPI = async (): Promise<void> => {
        try {
            const response = await fetch("https://api.example.com/categories");
            if (!response.ok) throw new Error("Failed to fetch categories");
            const data: Category[] = await response.json();
            setCategories(data);
        } catch (err) {
            console.error("❌ Failed to fetch categories from API:", err);
        }
        };
        */

        // Run Firebase fetchers
        fetchProducts();
        fetchCategories();
    }, []);

    // ===================================================
    // ✅ Filter items by selected category
    // ===================================================
    const filteredItems: Product[] =
        filter === "all"
            ? menuItems
            : menuItems.filter((item) => item.category === filter);

    // ===================================================
    // ✅ Modal handlers
    // ===================================================
    const handleOpenModal = (product: Product): void => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleCloseModal = (): void => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    // ===================================================
    // ✅ Render UI
    // ===================================================
    return (
        <div className="menu-page">
            {/* ============================= */}
            {/* Menu Header & Filters */}
            {/* ============================= */}
            <section className="menu-header text-center">
                <Container>
                    <h1 className="section-title mb-4">منيو الكافيه</h1>

                    <div className="menu-filters mb-5">
                        <Button
                            className={`filter-btn ${filter === "all" ? "active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            الكل
                        </Button>

                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                className={`filter-btn ${filter === cat.name ? "active" : ""}`}
                                onClick={() => setFilter(cat.name)}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ============================= */}
            {/* Menu Items */}
            {/* ============================= */}
            <section className="menu-items">
                <Container>
                    <Row>
                        {filteredItems.map((item) => (
                            <Col md={4} sm={6} key={item.id} className="mb-4">
                                <Card className="menu-card unified-card">
                                    {/* Product Image */}
                                    <div className="menu-card-img-wrapper">
                                        <Card.Img
                                            variant="top"
                                            src={item.img}
                                            alt={item.name}
                                            className="menu-card-img"
                                        />
                                    </div>

                                    {/* Card Body */}
                                    <Card.Body className="menu-card-body">
                                        {/* Product Name */}
                                        <Card.Title>{item.name}</Card.Title>

                                        {/* Product Info: Price + Category */}
                                        <Card.Subtitle className="mb-2 text-muted">
                                            {item.price ? `السعر: ${item.price}` : ""}
                                            {item.category ? ` | الفئة: ${item.category}` : ""}
                                        </Card.Subtitle>

                                        {/* Detail Button to open modal */}
                                        <Button variant="dark" onClick={() => handleOpenModal(item)}>
                                            تفاصيل
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ============================= */}
            {/* Product Details Modal */}
            {/* ============================= */}
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                className="product-detail-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{selectedProduct?.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedProduct && (
                        <>
                            <img
                                src={selectedProduct.img}
                                alt={selectedProduct.name}
                                className="img-fluid mb-3"
                            />
                            <p>{selectedProduct.description}</p>
                            <p className="price">السعر: {selectedProduct.price} جنيه</p>
                            <p>الفئة: {selectedProduct.category}</p>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        إغلاق
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Menu;
