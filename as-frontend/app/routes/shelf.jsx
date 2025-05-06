import { useEffect, useState } from "react";

export const meta = () => {
    return [{ title: "My Shelf | AnimeShelf" }];
};

export const loader = async () => {
    return null;
    // TODO: verify token and fetch users anime shelf here

    // Simulating a fake user
    // const fakeUser = { email: "demo@animeshelf.com" };

    // return { user: fakeUser };
};

export default function ShelfPage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser({ email: payload.email });
        } catch (err) {
            console.error("Invalid token", err);
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/"
    };

    if (!user) return <p>Loading your shelf...</p>;

    return (
        <main style={{ padding: "2rem", textAlign: "center" }}>
            <h1>My Shelf</h1>
            <p>Welcome, {user.email}!</p>

            <section style={{ marginTop: "2rem" }}>
                <p>Your anime list will appear here soon.</p>

                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: "2rem",
                        padding: "0.5rem 1rem",
                        backgroundColor: "#F87171",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    Log Out
                </button>
            </section>
        </main>
    );
}