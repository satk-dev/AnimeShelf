import { useEffect } from "react";
import { useActionData } from "@remix-run/react"; // <-- new import!
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const meta = () => {
    return [
        { title: "Register | AnimeShelf" },
        { name: "description", content: "Create a new account on AnimeShelf." },
    ];
};

export async function action({ request }) {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    // Can be deleted later on, just testing {
    console.log("Form submitted!");
    console.log("Email:", email);
    console.log("Password:", password);
    // }

    const response = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    console.log("Backend Response:", result);



    return redirect("/"); // required, even if not redirecting yet
}


export default function Register() {
    const actionData = useActionData(); // <-- get the result of action()

    return (
        <main style={{ padding: "2rem", textAlign: "center" }}>
            <h1>Register</h1>
            {actionData?.success && (
                <p style={{ color: "green" }}>Account created successfully!</p>
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
                    <button type="submit">Create Account</button>
                </div>
            </form>
        </main>
    );
}

