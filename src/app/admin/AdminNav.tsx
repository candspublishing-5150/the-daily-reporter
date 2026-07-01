"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const path = usePathname();

  return (
    <div style={{ background: "var(--dark)", borderBottom: "2px solid var(--red)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/admin" style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 16, color: "#f6f1e8", textDecoration: "none", padding: "14px 0" }}>
            TDR Admin
          </Link>
          <span style={{ opacity: .3, color: "#fff" }}>|</span>
          {[
            ["Dashboard", "/admin"],
            ["Ads", "/admin/ads"],
            ["Editions", "/admin/editions"],
            ["Subscribers", "/admin/subscribers"],
          ].map(([label, href]) => {
            const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
            return (
              <Link key={href} href={href} style={{
                padding: "14px 4px", fontSize: 13.5, fontFamily: "var(--font-zilla)", fontWeight: 600,
                color: active ? "#fff" : "#9a968c",
                textDecoration: "none",
                borderBottom: active ? "2px solid var(--red)" : "2px solid transparent",
              }}>
                {label}
              </Link>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/" target="_blank" style={{ fontSize: 12, color: "#6b6d75", textDecoration: "none" }} className="hover:text-white transition-colors">
            View site ↗
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" style={{ fontSize: 12, color: "#6b6d75", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
