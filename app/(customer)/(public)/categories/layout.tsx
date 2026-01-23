import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Categories | CHWK - Browse All Services",
  description: "Browse all business categories on CHWK. Find restaurants, salons, healthcare, education, home services, legal services, and more across India's top cities.",
  keywords: [
    "chwk categories",
    "chwk business types",
    "browse chwk",
    "chwk directory",
    "restaurants chwk",
    "salons chwk",
    "doctors chwk",
    "home services chwk",
    "business categories India",
  ],
  openGraph: {
    title: "Browse Business Categories on CHWK",
    description: "Explore all categories of local businesses on CHWK - from restaurants and salons to healthcare and professional services.",
    url: "https://chwk.vercel.app/categories",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Business Categories on CHWK",
    description: "Browse all types of local businesses and services available on CHWK.",
  },
  alternates: {
    canonical: "https://chwk.vercel.app/categories",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
