import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending_review: ["approved", "draft"],
  approved: ["live", "draft"],
  live: ["ended"],
  draft: ["pending_review"],
  ended: [],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin token
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status: newStatus } = await request.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get current status
  const { data: ad } = await supabase.from("ads").select("status").eq("id", id).single();
  if (!ad) return NextResponse.json({ error: "Ad not found" }, { status: 404 });

  const allowed = VALID_TRANSITIONS[ad.status] || [];
  if (!allowed.includes(newStatus)) {
    return NextResponse.json({ error: `Cannot transition from ${ad.status} to ${newStatus}` }, { status: 400 });
  }

  const { error } = await supabase
    .from("ads")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, status: newStatus });
}
