import { Link } from "@remix-run/react";

export default function NavBar() {
    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem 2rem",
                backgroundColor: "#282c34",
                color: "white",
            }}
        >
            <div>
                <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>
                    AnimeShelf
                </Link>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
                <Link to="/shelf" style={linkStyle}>Shelf</Link>
                <Link to="/profile" style={linkStyle}>Profile</Link>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                    }}
                    style={{ ...linkStyle, background: "none", border: "none", cursor: "pointer" }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: "bold",
};