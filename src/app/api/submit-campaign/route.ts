import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { placement, headline, body: adBody, cta, ctaUrl, accentColor,
            startDate, endDate, budget, email, companyName } = body;

    if (!placement || !headline || !email || !companyName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use service role key to bypass RLS for this insert
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        name: `${companyName} — ${placement.name}`,
        status: "active",
        total_budget: budget,
        total_spend: 0,
      })
      .select()
      .single();

    if (campaignError) throw new Error(campaignError.message);

    // Create ad
    const { data: ad, error: adError } = await supabase
      .from("ads")
      .insert({
        ad_type: "outreach",
        placement: placement.id,
        status: "pending_review",
        headline,
        body_copy: adBody,
        cta_label: cta,
        cta_url: ctaUrl,
        accent_color: accentColor,
        start_date: startDate,
        end_date: endDate,
        budget,
        admin_notes: `Submitted by ${companyName} <${email}>`,
      })
      .select()
      .single();

    if (adError) throw new Error(adError.message);

    // Link ad to campaign
    await supabase.from("campaign_ads").insert({
      campaign_id: campaign.id,
      ad_id: ad.id,
    });

    // Send admin notification email via Supabase (simple fetch to email service)
    // For now: log the submission. Real email will be wired in Phase 4.3.
    const adminEmailBody = `
New ad submission from The Daily Reporter website:

Company: ${companyName}
Email: ${email}
Placement: ${placement.name} (${placement.dims})
Headline: ${headline}
Body: ${adBody || "(none)"}
CTA: ${cta} → ${ctaUrl || "(no URL)"}
Schedule: ${startDate} to ${endDate}
Budget: $${budget}

Ad ID: ${ad.id}
Campaign ID: ${campaign.id}

Review at: https://the-daily-reporter.vercel.app/admin
    `.trim();

    // Attempt to send via a simple mailto-style notification
    // This will be replaced with a proper email service (Mailchimp/Resend) in Phase 4.3
    console.log("ADMIN NOTIFICATION:\n", adminEmailBody);

    // Also try Supabase auth admin email if configured
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          to: "CandSPublishing@gmail.com",
          subject: `New ad submission: ${companyName} — ${placement.name}`,
          text: adminEmailBody,
          adId: ad.id,
          campaignId: campaign.id,
        }),
      });
    } catch {
      // Edge function not deployed yet — that's ok, submission still succeeds
    }

    return NextResponse.json({ success: true, adId: ad.id, campaignId: campaign.id });
  } catch (err: unknown) {
    console.error("Campaign submission error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Submission failed" },
      { status: 500 }
    );
  }
}
