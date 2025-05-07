import { Link, useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function NavBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);
        }
    }, [location.pathname]); // re-check on route change

    // Hide nav on login, register, and reset-password routes
    if (
        ["/login", "/register", "/reset-password"].includes(location.pathname) ||
        !isAuthenticated
    ) {
        return null;
    }

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem 2rem",
                backgroundColor: "#1f2937",
                color: "white",
            }}
        >
            <Link to="/" style={styles.title}>AnimeShelf</Link>
            <div style={styles.links}>
                <Link to="/shelf" style={styles.link}>Shelf</Link>
                <Link to="/profile" style={styles.link}>Profile</Link>
                <button onClick={logout} style={styles.button}>Logout</button>
            </div>
        </nav>
    );
}

const styles = {
    title: {
        color: "white",
        textDecoration: "none",
        fontWeight: "bold",
        fontSize: "1.2rem",
    },
    links: {
        display: "flex",
        gap: "1rem",
        alignItems: "center",
    },
    link: {
        color: "white",
        textDecoration: "none",
        fontWeight: "bold",
        fontSize: "1rem",
    },
    button: {
        color: "white",
        background: "none",
        border: "none",
        fontSize: "1rem",
        fontWeight: "bold",
        cursor: "pointer",
    },
};