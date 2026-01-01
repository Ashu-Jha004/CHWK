import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Star,
  MapPin,
  CheckCircle2,
  Phone,
  Clock,
  ShieldCheck,
  Share2,
  Heart,
  IndianRupee,
  Globe,
  MessageSquare,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/LandingPage/layout/header";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessServicePage({ params }: PageProps) {
  // FIX: In Next.js 15, params must be awaited
  const { slug } = await params;

  if (!slug) notFound();

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      categories: {
        include: { category: true },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!business) notFound();

  const primaryCategory =
    business.categories.find((c) => c.isPrimary)?.category.name ||
    business.categories[0]?.category.name ||
    "Service";

  const priceSymbols = {
    BUDGET: "₹",
    MODERATE: "₹₹",
    EXPENSIVE: "₹₹₹",
    LUXURY: "₹₹₹₹",
  };

  return (
    <main className="min-h-screen bg-slate-50/50">
      <Header  />
      {/* Dynamic Hero Section */}
      <div className="relative h-[45vh] w-full bg-slate-900">
        <Image
          src={business.coverImage || "/api/placeholder/1200/600"}
          alt={business.name}
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {business.isVerified && (
                  <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-none px-3 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Verified
                    Business
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-white border-white/40 bg-white/10 backdrop-blur-md"
                >
                  {primaryCategory}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                {business.name}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-yellow-400 text-slate-900 px-2 py-0.5 rounded font-bold text-sm">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    {business.averageRating?.toFixed(1) || "N/A"}
                  </div>
                  <span className="text-sm font-medium">
                    ({business.totalReviews} Reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-400 font-mono">
                    {business.priceRange
                      ? priceSymbols[business.priceRange]
                      : "₹"}
                  </span>
                  <span className="text-sm opacity-80 capitalize">
                    {business.priceRange?.toLowerCase()} Price Range
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pb-2">
              <Button
                variant="outline"
                className="rounded-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button
                variant="outline"
                className="rounded-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white"
              >
                <Heart className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> About
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {business.description ||
                  business.shortDescription ||
                  "No description provided."}
              </p>
            </section>

            <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Business Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg h-fit">
                      <MapPin className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Address</h4>
                      <p className="text-slate-600 leading-snug mt-1">
                        {business.addressLine1},{" "}
                        {business.addressLine2 && `${business.addressLine2}, `}
                        {business.area}, {business.city}
                        <br />
                        {business.state} - {business.pincode}
                      </p>
                    </div>
                  </div>

                  {business.website && (
                    <div className="flex gap-4">
                      <div className="p-3 bg-slate-100 rounded-lg h-fit">
                        <Globe className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Website</h4>
                        <a
                          href={business.website}
                          target="_blank"
                          className="text-primary hover:underline break-all"
                        >
                          {business.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg h-fit">
                      <Phone className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Contact</h4>
                      <p className="text-slate-600 mt-1">{business.phone}</p>
                      {business.email && (
                        <p className="text-slate-600">{business.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg h-fit">
                      <Clock className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Hours</h4>
                      <p className="text-slate-600 mt-1">
                        {business.is24x7 ? "Open 24/7" : "View Schedule Below"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Interaction Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="shadow-xl border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                  <span className="text-sm font-medium">Quick Connect</span>
                  <Badge className="bg-emerald-500 hover:bg-emerald-500 border-none">
                    Active
                  </Badge>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20">
                      Book Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 font-semibold"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" /> Send Inquiry
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="bg-emerald-50 p-1.5 rounded-full">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      Secure and Verified Payment
                    </div>
                    {business.acceptsUPI && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="bg-blue-50 p-1.5 rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        </div>
                        Accepts UPI / Cards / Cash
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {business.hasEmergencyService && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-red-900 font-bold text-sm">
                      Emergency Service Available
                    </h4>
                    <p className="text-red-700 text-xs mt-0.5">
                      {business.emergencyContactNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
