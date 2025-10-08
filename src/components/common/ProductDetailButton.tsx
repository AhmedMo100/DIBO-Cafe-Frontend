import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { db } from "../../firebase/firebaseConfig";
import type { DocumentData } from "firebase/firestore"; // type-only import
import { doc, getDoc } from "firebase/firestore";

// ==============================
// Props for ProductDetailButton
// ==============================
interface ProductDetailButtonProps {
    productId: string; // Product ID from Firebase
}

// ==============================
// Product type definition
// Extend or adjust according to your Firestore document structure
// ==============================
interface Product {
    id?: string;
    name?: string;
    desc?: string;
    img?: string;
    category?: string;
    price?: number | string;
    details?: string | Record<string, unknown>;
    ingredients?: string | string[];
    size?: string | string[];
    [key: string]: unknown;
}

// ==============================
// Helper function to safely render values
// Handles Firebase Timestamp and objects
// ==============================
const renderValue = (value: unknown): string => {
    // Firebase Timestamp (checking structure)
    if (
        typeof value === "object" &&
        value !== null &&
        "seconds" in value &&
        "nanoseconds" in value
    ) {
        const timestamp = value as { seconds: number; nanoseconds: number };
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString();
    }

    // Other objects or arrays
    if (typeof value === "object" && value !== null) {
        return JSON.stringify(value);
    }

    // Numbers, strings, etc.
    return String(value ?? "");
};

// ==============================
// ProductDetailButton Component
// ==============================
const ProductDetailButton: React.FC<ProductDetailButtonProps> = ({
    productId,
}) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // ==============================
    // Fetch product details from Firebase when modal opens
    // ==============================
    const fetchProductDetails = async (): Promise<void> => {
        setLoading(true);
        try {
            // ===== FIREBASE VERSION =====
            const docRef = doc(db, "products", productId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProduct(docSnap.data() as DocumentData as Product);
            } else {
                console.log("No such product!");
            }

            /* ===== EXTERNAL API VERSION =====
            Example using fetch with your own backend API:
      
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error("Failed to fetch product");
            const data: Product = await response.json();
            setProduct(data);
            =================================== */
        } catch (err) {
            console.error("Failed to fetch product details:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                className="btn-main"
                onClick={() => {
                    setShowModal(true);
                    void fetchProductDetails(); // Explicitly mark as async call
                }}
            >
                تفاصيل
            </Button>

            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{product?.name || "Loading..."}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <p>Loading details...</p>
                    ) : product ? (
                        <>
                            {product.img && (
                                <img
                                    src={product.img}
                                    alt={product.name || ""}
                                    className="img-fluid mb-3"
                                />
                            )}
                            <p>
                                <strong>الوصف:</strong> {renderValue(product.desc)}
                            </p>
                            {product.details && (
                                <p>
                                    <strong>تفاصيل إضافية:</strong>{" "}
                                    {renderValue(product.details)}
                                </p>
                            )}
                            {product.ingredients && (
                                <p>
                                    <strong>المكونات:</strong> {renderValue(product.ingredients)}
                                </p>
                            )}
                            {product.size && (
                                <p>
                                    <strong>الحجم:</strong> {renderValue(product.size)}
                                </p>
                            )}
                            <p>
                                <strong>السعر:</strong>{" "}
                                {renderValue(product.price || "غير محدد")}
                            </p>
                            <p>
                                <strong>الفئة:</strong>{" "}
                                {renderValue(product.category || "غير محدد")}
                            </p>

                            {/* Dynamically render other fields */}
                            {Object.keys(product).map((key) => {
                                if (
                                    ![
                                        "id",
                                        "name",
                                        "desc",
                                        "img",
                                        "category",
                                        "price",
                                        "details",
                                        "ingredients",
                                        "size",
                                    ].includes(key)
                                ) {
                                    return (
                                        <p key={key}>
                                            <strong>{key}:</strong> {renderValue(product[key])}
                                        </p>
                                    );
                                }
                                return null;
                            })}
                        </>
                    ) : (
                        <p>Product details not available.</p>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ProductDetailButton;
