import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, QuerySnapshot } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore"; // ✅ type-only import (fixes verbatimModuleSyntax error)
import CountUp from "react-countup";

// =============================
// Assets
// =============================
import Cafe1 from "../assets/images/Cafe1.jpg";
import Cafe2 from "../assets/images/Cafe2.jpg";
import Cafe3 from "../assets/images/Cafe3.jpg";

// =============================
// Types
// =============================
interface TeamMember {
    id: string;
    name: string;
    role: string;
    description: string;
    image: string;
}

interface Stat {
    id: string;
    title: string;
    value: number;
    icon: string;
}

// =============================
// About Component
// =============================
const About: React.FC = () => {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [stats, setStats] = useState<Stat[]>([]);

    // =============================
    // Fetch Team Members from Firebase Firestore
    // =============================
    useEffect(() => {
        const fetchTeam = async (): Promise<void> => {
            try {
                const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, "team"));
                const data: TeamMember[] = querySnapshot.docs.map((doc) => {
                    const docData = doc.data() as Omit<TeamMember, "id">;
                    return { id: doc.id, ...docData };
                });
                setTeam(data);
            } catch (error) {
                console.error("Failed to fetch team from Firebase:", error);
            }
        };

        fetchTeam();

        /*
        ===========================================
        Alternative Example: Fetch Team via API
        ===========================================
        This demonstrates how you'd fetch the same data from an external REST API.
        
        const fetchTeamAPI = async (): Promise<void> => {
            try {
                const response = await fetch("https://api.example.com/team");
                if (!response.ok) throw new Error("Network response was not ok");
                const data: TeamMember[] = await response.json();
                setTeam(data);
            } catch (error) {
                console.error("Failed to fetch team from external API:", error);
            }
        };
        fetchTeamAPI();
        */
    }, []);

    // =============================
    // Fetch Stats from Firebase Firestore
    // =============================
    useEffect(() => {
        const fetchStats = async (): Promise<void> => {
            try {
                const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, "stats"));
                const data: Stat[] = querySnapshot.docs.map((doc) => {
                    const docData = doc.data() as Omit<Stat, "id">;
                    return { id: doc.id, ...docData };
                });
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats from Firebase:", error);
            }
        };

        fetchStats();

        /*
        ===========================================
        Alternative Example: Fetch Stats via API
        ===========================================
        Example of fetching the same "stats" data from an external REST API.
        
        const fetchStatsAPI = async (): Promise<void> => {
            try {
            const response = await fetch("https://api.example.com/stats");
                if (!response.ok) throw new Error("Network response was not ok");
                const data: Stat[] = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats from external API:", error);
            }
        };
        fetchStatsAPI();
        */
    }, []);

    return (
        <div className="about-page">

            {/* ============================= */}
            {/* Story Section */}
            {/* ============================= */}
            <section className="about-story section-divider story-section">
                <Container>
                    <Row className="align-items-center">
                        <Col md={5}>
                            <img src={Cafe1} alt="Cafe Story" className="img-fluid section-img story-img" />
                        </Col>
                        <Col md={7}>
                            <h2 className="section-title story-title">قصتنا</h2>
                            <p className="section-desc story-desc">
                                بدأت حكايتنا من شغف بسيط للقهوة وأجواء الجلسات المريحة...
                            </p>
                            <Button href="/menu" className="btn-main mt-3 story-btn">
                                اكتشف المنيو
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ============================= */}
            {/* Philosophy Section */}
            {/* ============================= */}
            <section className="about-philosophy section-divider philosophy-section">
                <Container>
                    <Row className="align-items-center">
                        <Col md={5} className="order-md-2">
                            <img src={Cafe2} alt="Cafe Philosophy" className="img-fluid section-img philosophy-img" />
                        </Col>
                        <Col md={7} className="order-md-1">
                            <h2 className="section-title philosophy-title">فلسفتنا وأجواؤنا</h2>
                            <p className="section-desc philosophy-desc">
                                إحنا مؤمنين إن الكافيه مش مجرد مكان...
                            </p>
                            <Button href="/contact" className="btn-main mt-3 philosophy-btn">
                                تواصل معنا
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ============================= */}
            {/* Video Tour Section */}
            {/* ============================= */}
            <section className="about-video section-divider video-section">
                <Container className="text-center">
                    <h2 className="section-title mb-4 video-title">جولة داخل الكافيه</h2>
                    <div className="video-wrapper">
                        <iframe
                            src="https://www.youtube.com/embed/_bNbada12iM"
                            width="100%"
                            height="450"
                            style={{ border: "none", overflow: "hidden", borderRadius: "1rem" }}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            allowFullScreen
                            title="Cafe Video Tour"
                        ></iframe>
                    </div>
                </Container>
            </section>

            {/* ============================= */}
            {/* Gallery Section */}
            {/* ============================= */}
            <section className="about-gallery section-divider gallery-section">
                <Container>
                    <h2 className="section-title text-center mb-5 gallery-title">لقطات من المكان</h2>
                    <Row>
                        {[Cafe1, Cafe2, Cafe3].map((img, idx) => (
                            <Col md={4} key={idx} className="mb-4 gallery-col">
                                <img src={img} alt={`Cafe View ${idx + 1}`} className="gallery-img" />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ============================= */}
            {/* Stats Section */}
            {/* ============================= */}
            <section className="about-stats section-divider stats-section">
                <Container>
                    <h2 className="section-title text-center mb-5 stats-title">أرقامنا المميزة</h2>
                    <Row className="text-center">
                        {stats.map((stat) => (
                            <Col md={3} sm={6} key={stat.id} className="mb-4 stats-col">
                                <Card className="stat-card p-3">
                                    <div className="stat-icon mb-2">{stat.icon}</div>
                                    <h3><CountUp end={stat.value} duration={2} /></h3>
                                    <p>{stat.title}</p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ============================= */}
            {/* Team Section */}
            {/* ============================= */}
            <section className="about-team section-divider team-section">
                <Container>
                    <h2 className="section-title text-center mb-5 team-title">فريقنا</h2>
                    <Row className="justify-content-center">
                        {team.map((member) => (
                            <Col md={4} key={member.id} className="mb-4 team-col">
                                <Card className="team-card">
                                    <Card.Img variant="top" src={member.image} className="team-img" />
                                    <Card.Body className="text-center team-body">
                                        <Card.Title className="team-name">
                                            {member.name} - {member.role}
                                        </Card.Title>
                                        <Card.Text className="team-desc">{member.description}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

        </div>
    );
};

export default About;
