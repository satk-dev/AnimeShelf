import { useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useEffect } from "react";

export const meta = () => {
    return [{ title: "Login | AnimeShelf" }];
};

export async function action({ request }) {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    try {
        const response = await fetch("http://localhost:4000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            return json({ error: result.error || "Login Failed." });
        }

        console.log("Login successful. Returning token.");
        return json({ token: result.token });

    } catch (err) {
        return json({ error: "Unexpected error. Try again." });
    }
}

export default function Login() {
    const actionData = useActionData();

    useEffect(() => {

        console.log("useEffect triggered");
        console.log("actionData:", actionData);

        if (actionData?.token) {
            console.log("Storing token and redirecting...");
            localStorage.setItem("token", actionData.token);
            window.location.href = "/shelf"; // redirect manually after storing token
        }
    }, [actionData]);

    return (
        <main style={{ padding: "2rem", textAlign: "center" }}>
            <h1>Login</h1>
            {actionData?.error && (
                <p style={{ color: "red" }}>{actionData.error}</p>
            )}
            <form method="post">
                <div>
                    <label>
                        Email:
                        <input type="email" name="email" required />
                    </label>
                </div>
                <div style={{ marginTop: "1rem" }}>
                    <label>
                        Password:
                        <input type="password" name="password" required />
                    </label>
                </div>
                <div style={{ marginTop: "1.5rem" }}>
                    <button type="submit">Log In</button>
                </div>
            </form>
        </main>
    );
}