import { useState } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../../assets/images/DIBO Logo.jpg";

// Define component type explicitly
const Header: React.FC = () => {
    // React Router hooks
    const location = useLocation(); // Used to detect the current route
    const navigate = useNavigate(); // Used for programmatic navigation

    // Local state to manage navbar collapse on mobile
    const [expanded, setExpanded] = useState<boolean>(false);

    /**
     * Handles navigation and ensures that
     * the mobile menu closes after a link is clicked.
     *
     * @param path - The path to navigate to
     */
    const handleNavClick = (path: string): void => {
        navigate(path);
        setExpanded(false); // Close menu after navigation (for mobile UX)
    };

    /**
     * Checks if the current path matches the given route.
     * Used to apply an "active" style to the correct nav link.
     *
     * @param path - The path to check against the current location
     * @returns boolean - True if the path is active
     */
    const isActive = (path: string): boolean => location.pathname === path;

    return (
        <Navbar
            expand="lg"
            className="custom-navbar"
            expanded={expanded} // Bind state to control collapse behavior
        >
            <Container>
                {/* Logo */}
                <Navbar.Brand href="/" className="logo">
                    <img src={Logo} alt="Company Logo" />
                </Navbar.Brand>

                {/* Mobile toggle button */}
                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    onClick={() => setExpanded(expanded ? false : true)}
                />

                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Navigation Links */}
                    <Nav className="mx-auto nav-links">
                        <Nav.Link
                            onClick={() => handleNavClick("/")}
                            className={isActive("/") ? "active-link" : ""}
                        >
                            الرئيسية
                        </Nav.Link>
                        <Nav.Link
                            onClick={() => handleNavClick("/about")}
                            className={isActive("/about") ? "active-link" : ""}
                        >
                            حولنا
                        </Nav.Link>
                        <Nav.Link
                            onClick={() => handleNavClick("/menu")}
                            className={isActive("/menu") ? "active-link" : ""}
                        >
                            المنيو
                        </Nav.Link>
                        <Nav.Link
                            onClick={() => handleNavClick("/reservation")}
                            className={isActive("/reservation") ? "active-link" : ""}
                        >
                            الحجز
                        </Nav.Link>
                    </Nav>

                    {/* CTA Button */}
                    <Button
                        className="contact-btn"
                        onClick={() => handleNavClick("/contact")}
                    >
                        تواصل معنا
                    </Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
