import type { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = {
  title: "Privacy — AgriSaarthi 360",
  description:
    "How AgriSaarthi 360 handles your farm information: what stays on your device, what leaves it, and what is never collected.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
