import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "AnimeShelf" },
    { name: "description", content: "Welcome to AnimeShelf!" },
  ];
}

export default function Index() {
  return (
    <section style={{ background: "#80CBC4", minHeight: "100vh" }}>
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          Welcome to AnimeShelf!
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          Track, organize, and enjoy your anime collection — the simple way.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <a
            href="/register"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#B4EBE6",
              color: "#FFB433",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            Register
          </a>

          <a
            href="/login"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#FFE5B4",
              color: "#333",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            Login
          </a>
        </div>
      </main>
    </section>
  );
}



