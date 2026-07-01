import type { Metadata } from "next";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin — The Daily Reporter",
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center", padding: 22 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "var(--font-fraunces)", fontWeight: 900, fontSize: 28, color: "#f6f1e8", letterSpacing: "-.02em", marginBottom: 6 }}>
            The Daily <span style={{ color: "var(--red-bright)" }}>Reporter</span>
          </div>
          <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#6b6d75", fontWeight: 600 }}>ADMIN ACCESS</div>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
