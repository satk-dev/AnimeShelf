import { useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";

export const meta = () => {
    return [{ title: "My Profile | AnimeShelf" }];
};

export async function loader({ request }) {
    const cookie = request.headers.get("Cookie");
    return null;
}

export default function ProfilePage() {
    const [profileUrl, setProfileUrl] = useState(null);
    const [email, setEmail] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        axios.get("http://localhost:4000/api/users/me", { headers: { token } })
            .then((res) => {
                setProfileUrl(res.data.proilePicture);
                setEmail(res.data.email);
            })
            .catch(() => (window.location.href = "/login"));
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const file = e.target.elements.profile.files[0];

        const formData = new FormData();
        formData.append("profile", file);

        try {
            const res = await axios.post("http://localhost:4000/api/upload-profile", formData, {
                headers: { token },
            });
            setProfileUrl(res.data.imagePath);
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    return (
        <main style={{ padding: "2rem", textAlign: "center" }}>
            <h1>Profile</h1>
            <p>{email}</p>

            {profileUrl && (
                <img
                    src={`http://localhost:4000${profileUrl}`}
                    alt="Profile"
                    style={{ width: "100px", borderRadius: "50%", marginBottom: "1rem" }}
                />
            )}

            <form onSubmit={handleUpload} encType="multipart/form-data">
                <input type="file" name="profile" accept="image/*" required />
                <button type="submit" style={{ marginLeft: "1rem" }}>
                    Upload New Picture
                </button>
            </form>
        </main>
    );
}