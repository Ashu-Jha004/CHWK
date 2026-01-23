import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Local Businesses | CHWK - Find Services Near You",
  description: "Search for restaurants, salons, doctors, plumbers, electricians, and more on CHWK. Find verified local businesses near you with reviews, ratings, and contact details across India.",
  keywords: [
    "chwk search",
    "find businesses chwk",
    "local search chwk",
    "chwk near me",
    "search services chwk",
    "find restaurants near me",
    "find salons near me",
    "local services India",
  ],
  openGraph: {
    title: "Search Local Businesses on CHWK",
    description: "Discover and connect with verified local businesses across India. Search restaurants, salons, healthcare, home services, and more.",
    url: "https://chwk.vercel.app/search",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Local Businesses on CHWK",
    description: "Find the best local services near you with CHWK search.",
  },
  alternates: {
    canonical: "https://chwk.vercel.app/search",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
