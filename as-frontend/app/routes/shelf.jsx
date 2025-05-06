import { useEffect, useState } from "react";
import axios from "axios";

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
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [shelf, setShelf] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser({ email: payload.email });

            axios.get("http://localhost:4000/api/shelf", {
                headers: { token },
            })
                .then((res) => setShelf(res.data.shelf))
                .catch((err) => console.error("Failed to fetch shelf:", err));

        } catch (err) {
            console.error("Invalid token", err);
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;

        setLoading(true);
        setResults([]);

        try {
            const response = await axios.get(
                `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&limit=10`
            );
            setResults(response.data.data);
        } catch (err) {
            console.error("Search Failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/"
    };

    if (!user) return <p>Loading your shelf...</p>;

    return (
        <main style={{ padding: "2rem", textAlign: "center" }}>
            <h1>My Shelf</h1>
            <p>Welcome, {user.email}!</p>

            <form onSubmit={handleSearch} style={{ marginTop: "2rem" }}>
                <input
                    type="text"
                    placeholder="Search for anime..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: "0.5rem", width: "250px", fontSize: "1rem" }}
                />
                <button type="submit" style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
                    Search
                </button>
            </form>

            {loading && <p>Searching...</p>}

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginTop: "2rem",
                    gap: "1rem",
                }}
            >
                {results.map((anime) => (
                    <div key={anime.mal_id} style={{ width: "150px", textAlign: "center" }}>
                        <img
                            src={anime.images.jpg.image_url}
                            alt={anime.title}
                            style={{ width: "100%", borderRadius: "8px" }}
                        />
                        <p>{anime.title_english || anime.title}</p>
                        <button
                            onClick={async () => {
                                const token = localStorage.getItem("token");
                                if (!token) return alert("You must be logged in");

                                try {
                                    const res = await axios.post("http://localhost:4000/api/shelf", {
                                        malId: anime.mal_id,
                                        title: anime.title_english || anime.title,
                                        imageUrl: anime.images.jpg.image_url,
                                    }, {
                                        headers: { token },
                                    });

                                    alert("Added to your shelf!");
                                } catch (err) {
                                    console.error(err);
                                    alert("Failed to add.");
                                }
                            }}
                            style={{
                                marginTop: "0.5rem",
                                padding: "0.3rem 0.6rem",
                                fontSize: "0.8rem",
                                borderRadius: "6px",
                                backgroundColor: "#34D399",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            Add to Shelf
                        </button>
                    </div>
                ))}
            </div>
            <section style={{ marginTop: "3rem" }}>
                <h2>Your Shelf</h2>

                {shelf.length === 0 ? (
                    <p>You haven't added any anime yet.</p>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: "1rem",
                            marginTop: "1rem",
                        }}
                    >
                        {shelf.map((anime) => (
                            <div key={anime.id} style={{ width: "150px", textAlign: "center" }}>
                                <img
                                    src={anime.imageUrl}
                                    alt={anime.title}
                                    style={{ width: "100%", borderRadius: "8px" }}
                                />
                                <p>{anime.title}</p>
                                <p style={{ fontSize: "0.8rem", color: "#555" }}>{anime.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <button
                onClick={handleLogout}
                style={{
                    marginTop: "3rem",
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
        </main>
    );
}