import { Form, useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";


export const meta = () => {
    return [{ title: "Reset Password | AnimeShelf" }];
};

export async function action({ request }) {
    const formData = await request.formData();
    const email = formData.get("email");
    const newPassword = formData.get("password");

    const response = await fetch("http://localhost:4000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
    });

    const result = await response.json();
    return json(result);
}

export default function ResetPassword() {
    const actionData = useActionData();

    return (
        <main style={{ padding: "2rem", textAlign: "center" }}>
            <h1>Reset Password</h1>
            {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
            {actionData?.message && <p style={{ color: "green" }}>{actionData.message}</p>}

            <Form method="post">
                <div style={{ marginBottom: "1rem" }}>
                    <input type="email" name="email" placeholder="Your email" required />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <input type="password" name="password" placeholder="New password" required />
                </div>
                <button type="submit">Reset</button>
            </Form>
        </main>
    );
}