import type { Metadata } from "next";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = {
  title: "Terms — AgriSaarthi 360",
  description:
    "The terms of using AgriSaarthi 360: what the platform provides, what it does not, and how to use its guidance responsibly.",
};

export default function TermsPage() {
  return <TermsContent />;
}
