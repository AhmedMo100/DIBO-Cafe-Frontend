import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

// ====================================
// Type Definitions
// ====================================

// Form data type for input fields
interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

// Contact info card structure
interface ContactInfoItem {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

const Contact: React.FC = () => {
    // ====================================
    // Component States
    // ====================================
    const [formData, setFormData] = useState<ContactFormData>({
        name: "",
        email: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // ====================================
    // Handle input changes
    // ====================================
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ====================================
    // Handle form submission
    // ====================================
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try {
            // -------------------------------
            // Save contact message in Firebase
            // -------------------------------
            await addDoc(collection(db, "contactMessages"), {
                name: formData.name,
                email: formData.email,
                message: formData.message,
                createdAt: Timestamp.now(),
            });

            // -------------------------------
            // Example: Send message via external API instead of Firebase
            // (Uncomment and adjust if you want to use your backend API)
            // -------------------------------
            /*
            const response = await fetch("https://api.example.com/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to send message");
            const data = await response.json();
            console.log("API response:", data);
            */

            // Reset form and show success message
            setSubmitted(true);
            setFormData({ name: "", email: "", message: "" });
        } catch (err) {
            console.error("Error submitting message:", err);
        } finally {
            setLoading(false);
        }
    };

    // ====================================
    // Contact Information Cards Data
    // ====================================
    const contactInfo: ContactInfoItem[] = [
        {
            icon: <FaMapMarkerAlt />,
            title: "العنوان",
            desc: "شارع الحرية، المنصورة، مصر",
        },
        {
            icon: <FaPhoneAlt />,
            title: "الهاتف",
            desc: "+20 101 234 5678\n+20 112 345 6789",
        },
        {
            icon: <FaEnvelope />,
            title: "البريد الإلكتروني",
            desc: "info@cafename.com",
        },
    ];

    return (
        <div className="contact-page">
            {/* ============================== */}
            {/* Contact Header */}
            {/* ============================== */}
            <section className="contact-header text-center">
                <Container>
                    <h1 className="section-title mb-2">تواصل معنا</h1>
                    <p className="section-subtitle">
                        تقدر توصل لينا بسهولة سواء عايز تزورنا أو تكلمنا
                    </p>
                </Container>
            </section>

            {/* ============================== */}
            {/* Contact Info Section */}
            {/* ============================== */}
            <section className="contact-info section-divider">
                <Container>
                    <Row className="g-3 text-center">
                        {contactInfo.map((item, idx) => (
                            <Col md={4} key={idx}>
                                <Card className="contact-card p-3 text-center">
                                    <div className="contact-icon mb-2">{item.icon}</div>
                                    <h6 className="contact-title">{item.title}</h6>
                                    <p
                                        className="contact-desc"
                                        style={{ whiteSpace: "pre-line" }}
                                    >
                                        {item.desc}
                                    </p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ============================== */}
            {/* Contact Body: Map + Form */}
            {/* ============================== */}
            <section className="contact-body section-divider">
                <Container>
                    <Row className="align-items-center">
                        {/* Map Section */}
                        <Col md={6} className="mb-4">
                            <h5 className="section-title mb-3 text-center">موقعنا على الخريطة</h5>
                            <div className="map-container rounded shadow-sm overflow-hidden">
                                <iframe
                                    title="Cafe Location"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3418.561357140859!2d31.35975557573175!3d31.038468570792393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f79d6b997373a5%3A0x5f7b53c45ab42dae!2sDIBO%20CAFE!5e0!3m2!1sen!2seg!4v1757552665748!5m2!1sen!2seg"
                                    width="100%"
                                    height="350"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </Col>

                        {/* Form Section */}
                        <Col md={6}>
                            <h5 className="section-title mb-3 text-center">ابعتلنا رسالة</h5>
                            <Form onSubmit={handleSubmit} className="contact-form">
                                <Row>
                                    <Col md={6} className="mb-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="الاسم"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Col>
                                    <Col md={6} className="mb-2">
                                        <Form.Control
                                            type="email"
                                            placeholder="البريد الإلكتروني"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Col>
                                </Row>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    placeholder="رسالتك"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="mb-2"
                                    required
                                />
                                <div className="text-center">
                                    <Button
                                        type="submit"
                                        className="btn-main btn-sm"
                                        disabled={loading}
                                    >
                                        {loading ? "جاري الإرسال..." : "إرسال"}
                                    </Button>
                                </div>
                                {submitted && (
                                    <p className="text-success mt-2">تم إرسال رسالتك بنجاح!</p>
                                )}
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Contact;
