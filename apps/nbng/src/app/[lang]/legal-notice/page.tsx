import { LegalPage, legalMetadata } from "@/components/legal/legal-page";

export const generateMetadata = () => legalMetadata("legal-notice");

export default function Page() {
  return <LegalPage page="legal-notice" />;
}
