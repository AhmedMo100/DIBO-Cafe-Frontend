import { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { db } from "../firebase/firebaseConfig";
import {
    collection,
    addDoc,
    Timestamp,
    query,
    where,
    getDocs,
} from "firebase/firestore";

// ====================================
// Define reservation form data type
// ====================================
interface ReservationData {
    name: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
}

const Reservation: React.FC = () => {
    // ====================================
    // Component States
    // ====================================
    const [formData, setFormData] = useState<ReservationData>({
        name: "",
        phone: "",
        date: "",
        time: "",
        guests: 1,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    // ====================================
    // Handle form field changes
    // ====================================
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ): void => {
        const { name, value, type } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    // ====================================
    // Check availability before booking
    // ====================================
    const checkAvailability = async (): Promise<boolean> => {
        if (!formData.date || !formData.time) return true;
        try {
            const q = query(
                collection(db, "reservations"),
                where("date", "==", formData.date),
                where("time", "==", formData.time)
            );
            const snapshot = await getDocs(q);
            return snapshot.empty; // empty → available
        } catch (err) {
            console.error("Error checking availability:", err);
            return false;
        }

        /**
         * ------------------------------------
         * Alternative API Example:
         * ------------------------------------
         * Replace Firebase query with an API call:
         * 
         * const res = await fetch(`https://api.example.com/reservations/check?date=${formData.date}&time=${formData.time}`);
         * const data = await res.json();
         * return data.isAvailable;
         */
    };

    // ====================================
    // Handle form submission
    // ====================================
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSubmitted(false);

        const isAvailable = await checkAvailability();

        if (!isAvailable) {
            setErrorMsg("عذرًا، الوقت ده محجوز بالفعل. جرب وقت تاني.");
            setLoading(false);
            return;
        }

        try {
            // -------------------------------
            // Save reservation in Firebase
            // -------------------------------
            await addDoc(collection(db, "reservations"), {
                ...formData,
                createdAt: Timestamp.now(),
            });

            /**
             * ------------------------------------
             * Alternative API Example:
             * ------------------------------------
             * Save reservation using external API instead of Firebase
             * 
             * await fetch("https://api.example.com/reservations", {
             *   method: "POST",
             *   headers: { "Content-Type": "application/json" },
             *   body: JSON.stringify(formData),
             * });
             */

            setSubmitted(true);
            setFormData({
                name: "",
                phone: "",
                date: "",
                time: "",
                guests: 1,
            });
        } catch (err) {
            console.error("Error submitting reservation:", err);
            setErrorMsg("حصل خطأ أثناء الحجز. حاول تاني.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reservation-page">
            {/* ============================== */}
            {/* Reservation Header */}
            {/* ============================== */}
            <section className="reservation-header text-center">
                <Container>
                    <h1 className="section-title mb-2">الحجز المسبق</h1>
                    <p className="section-subtitle">
                        احجز مكانك بكل سهولة علشان تضمن أفضل تجربة عندنا
                    </p>
                </Container>
            </section>

            {/* ============================== */}
            {/* Reservation Form */}
            {/* ============================== */}
            <section className="reservation-form-section section-divider">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={6}>
                            <Form onSubmit={handleSubmit} className="reservation-form">
                                {/* Name Field */}
                                <Form.Group className="mb-3 form-group">
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        placeholder="الاسم الكامل"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                {/* Phone Field */}
                                <Form.Group className="mb-3 form-group">
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        placeholder="رقم الهاتف"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                {/* Date & Time Fields */}
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Control
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Control
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Col>
                                </Row>

                                {/* Guests Field */}
                                <Form.Group className="mb-4 form-group">
                                    <Form.Control
                                        type="number"
                                        name="guests"
                                        min={1}
                                        value={formData.guests}
                                        onChange={handleChange}
                                        placeholder="عدد الأشخاص"
                                        required
                                    />
                                </Form.Group>

                                {/* Error / Success Messages */}
                                {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                                {submitted && (
                                    <Alert variant="success">تم الحجز بنجاح! 🎉</Alert>
                                )}

                                {/* Submit Button */}
                                <div className="text-center">
                                    <Button
                                        className="btn-main btn-lg"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? "جاري الحجز..." : "احجز الآن"}
                                    </Button>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Reservation;
