import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortalWizard from "./PortalWizard";

export const metadata: Metadata = {
  title: "Run an Ad — The Daily Reporter",
  description: "Launch a GFE outreach ad to 13,000+ California construction firms.",
};

export default function PortalPage() {
  return (
    <>
      <Header />
      <PortalWizard />
      <Footer />
    </>
  );
}
