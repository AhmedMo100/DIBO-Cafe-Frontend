import { Container, Row, Col, Button } from "react-bootstrap";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../../assets/images/DIBO Logo.jpg";

// Define type for social links
interface SocialLink {
    name: string;
    url: string;
    icon: React.ReactElement;
}


// Social links configuration (Dynamic)
const socialLinks: SocialLink[] = [
    { name: "Facebook", url: "#", icon: <FaFacebookF /> },
    { name: "Instagram", url: "#", icon: <FaInstagram /> },
    { name: "Twitter", url: "#", icon: <FaTwitter /> },
];

/**
 * Footer Component
 *
 * Displays:
 * - Brand logo with description
 * - Navigation links (with active link highlight)
 * - Social media icons dynamically from config
 * - Contact button
 * - Copyright section with dynamic year
 *
 * Fully responsive and RTL (right-to-left) supported.
 */
const Footer: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Navigation links array (Dynamic + reusable)
    const navLinks = [
        { name: "الرئيسية", path: "/" },
        { name: "حولنا", path: "/about" },
        { name: "المنيو", path: "/menu" },
        { name: "الطلب/الحجز", path: "/reservation" },
    ];

    /**
     * Handles footer navigation
     * - Navigates to the given path
     * - Scrolls smoothly to top if same-page link
     *
     * @param path - The path to navigate to
     */
    const handleNavClick = (path: string) => {
        if (location.pathname === path) {
            window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to top
        } else {
            navigate(path); // Navigate to other page
        }
    };

    const currentYear = new Date().getFullYear(); // Dynamic year

    return (
        <footer className="custom-footer" dir="rtl">
            <Container>
                <Row>
                    {/* Brand logo and description */}
                    <Col md={4} className="footer-brand text-center text-md-end">
                        <img src={Logo} alt="Company Logo" className="footer-logo" />
                        <p className="footer-desc">
                            مكانك المفضل للقهوة والمشروبات المميزة، بنقدملك تجربة مختلفة تجمع
                            بين الطعم الأصيل والجو المريح، عشان كل زيارة تبقى أحلى من اللي قبلها
                        </p>
                    </Col>

                    {/* Navigation links */}
                    <Col md={4} className="footer-links text-center text-md-end">
                        <h5>روابط</h5>
                        <ul>
                            {navLinks.map((link) => (
                                <li key={link.path}>
                                    <a
                                        href={link.path}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick(link.path);
                                        }}
                                        className={location.pathname === link.path ? "active-link" : ""}
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Col>

                    {/* Social media and CTA button */}
                    <Col md={4} className="footer-social text-center text-md-end">
                        <h5>تابعنا</h5>
                        <div className="social-icons">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    aria-label={social.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                        <Button
                            className="contact-btn mt-3"
                            onClick={() => navigate("/contact")}
                        >
                            تواصل معنا
                        </Button>
                    </Col>
                </Row>

                {/* Copyright */}
                <Row>
                    <Col className="text-center mt-4">
                        <p className="copyright">
                            © {currentYear} جميع الحقوق محفوظة - كافيهك
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;