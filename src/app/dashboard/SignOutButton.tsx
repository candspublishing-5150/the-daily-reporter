"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        padding: "10px 16px",
        border: "1px solid var(--border)",
        borderRadius: 2,
        background: "#fff",
        fontFamily: "var(--font-zilla)",
        fontWeight: 600,
        fontSize: 13.5,
        color: "var(--muted)",
        cursor: "pointer",
      }}
    >
      Sign out
    </button>
  );
}
