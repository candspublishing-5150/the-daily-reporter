"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
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
