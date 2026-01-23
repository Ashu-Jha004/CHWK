import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact CHWK - Get Support & Business Inquiries",
  description: "Contact CHWK for customer support, business listings, partnerships, or feedback. We help you connect with the best local businesses in India. Call, email, or visit our office.",
  keywords: [
    "contact chwk",
    "chwk support",
    "chwk customer service",
    "chwk business inquiry",
    "chwk help",
    "chwk india contact",
    "list business on chwk",
  ],
  openGraph: {
    title: "Contact CHWK - Support & Business Inquiries",
    description: "Have questions about CHWK? Reach out to our team for customer support, business partnerships, or any feedback.",
    url: "https://chwk.vercel.app/contact",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact CHWK - Get in Touch",
    description: "Contact CHWK for support, business inquiries, or feedback. We're here to help!",
  },
  alternates: {
    canonical: "https://chwk.vercel.app/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

