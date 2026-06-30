import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In — The Daily Reporter",
  description: "Sign in to manage your advertising campaigns.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "52px 22px 80px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--gold)", fontWeight: 700, marginBottom: 10 }}>
            ADVERTISER PORTAL
          </div>
          <h1 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 30, margin: "0 0 10px" }}>
            Sign in to your account
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
            Enter your email and we&rsquo;ll send you a magic link — no password needed.
          </p>
        </div>

        <LoginForm />

        <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--muted)", marginTop: 28, lineHeight: 1.6 }}>
          Don&rsquo;t have an account? Just enter your email above — we&rsquo;ll create one automatically.
          <br />
          By signing in you agree to our{" "}
          <a href="/privacy" style={{ color: "var(--red)" }}>privacy policy</a>.
        </p>
      </main>
      <Footer />
    </>
  );
}
