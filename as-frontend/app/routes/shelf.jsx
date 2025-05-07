import { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";

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
    const [profileUrl, setProfileUrl] = useState(null);


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

            axios.get("http://localhost:4000/api/users/me", {
                headers: { token },
            })
                .then((res) => setProfileUrl(res.data.profilePicture))
                .catch((err) => console.error("Failed to load profile pic", err));


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

    const groupedShelf = {
        Watching: shelf.filter((anime) => anime.status === "Watching"),
        Completed: shelf.filter((anime) => anime.status === "Completed"),
        Dropped: shelf.filter((anime) => anime.status === "Dropped"),
    };


    return (
        <>
            <NavBar />
            <main style={{ padding: "2rem", textAlign: "center" }}>
                <h1>My Shelf</h1>
                <p>Welcome, {user.email}!</p>
                <a href="/profile">Profile</a>

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
                            {Object.entries(groupedShelf).map(([status, items]) => (
                                <section key={status} style={{ marginTop: "2rem" }}>
                                    <h2>{status}</h2>

                                    {items.length === 0 ? (
                                        <p style={{ fontSize: "0.9rem", color: "#888" }}>No anime in this category.</p>
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
                                            {items.map((anime) => (
                                                <div key={anime.id} style={{ width: "150px", textAlign: "center" }}>
                                                    <img
                                                        src={anime.imageUrl}
                                                        alt={anime.title}
                                                        style={{ width: "100%", borderRadius: "8px" }}
                                                    />
                                                    <p>{anime.title}</p>

                                                    <select
                                                        value={anime.status}
                                                        onChange={async (e) => {
                                                            const newStatus = e.target.value;
                                                            const token = localStorage.getItem("token");
                                                            try {
                                                                await axios.patch(`http://localhost:4000/api/shelf/${anime.id}`, {
                                                                    status: newStatus,
                                                                }, {
                                                                    headers: { token },
                                                                });
                                                                setShelf((prev) =>
                                                                    prev.map((item) =>
                                                                        item.id === anime.id ? { ...item, status: newStatus } : item
                                                                    )
                                                                );
                                                            } catch (err) {
                                                                console.error("Failed to update status:", err);
                                                            }
                                                        }}
                                                        style={{ marginTop: "0.5rem", padding: "0.3rem", borderRadius: "4px" }}
                                                    >
                                                        <option value="Watching">Watching</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Dropped">Dropped</option>
                                                    </select>

                                                    <button
                                                        onClick={async () => {
                                                            const token = localStorage.getItem("token");
                                                            try {
                                                                await axios.delete(`http://localhost:4000/api/shelf/${anime.id}`, {
                                                                    headers: { token },
                                                                });
                                                                setShelf((prev) => prev.filter((item) => item.id !== anime.id));
                                                            } catch (err) {
                                                                console.error("Failed to delete item:", err);
                                                            }
                                                        }}
                                                        style={{
                                                            marginTop: "0.5rem",
                                                            padding: "0.3rem 0.6rem",
                                                            fontSize: "0.8rem",
                                                            borderRadius: "6px",
                                                            backgroundColor: "#F87171",
                                                            color: "white",
                                                            border: "none",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
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
        </>
    );
}