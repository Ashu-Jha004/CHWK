import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CHWK - India's Trusted Local Business Discovery Platform",
  description: "Learn about CHWK's mission to revolutionize local business discovery in India. Meet our visionary founders and discover how CHWK connects customers with verified businesses across 25+ cities.",
  keywords: [
    "about chwk",
    "chwk team",
    "chwk founders",
    "chwk india",
    "chwk mission",
    "local business platform India",
    "chwk company",
  ],
  openGraph: {
    title: "About CHWK - Our Story & Team",
    description: "Discover the journey of CHWK, India's most trusted platform connecting local businesses with customers. Learn about our mission and the team behind it.",
    images: ["/images/about/hero.png"],
    url: "https://chwk.vercel.app/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About CHWK - India's Local Business Platform",
    description: "Learn about CHWK's mission to connect India's finest local businesses with customers.",
    images: ["/images/about/hero.png"],
  },
  alternates: {
    canonical: "https://chwk.vercel.app/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

