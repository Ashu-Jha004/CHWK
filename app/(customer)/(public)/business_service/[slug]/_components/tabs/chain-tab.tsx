// app/business_service/[slug]/_components/tabs/chain-tab.tsx

"use client";

import { useMemo } from "react";
import { BusinessDetail } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Building2,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Navigation,
  Star,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPhoneNumber } from "@/lib/utils/business-detail-utils";
import { cn } from "@/lib/utils";

interface ChainTabProps {
  business: BusinessDetail;
}

export function ChainTab({ business }: ChainTabProps) {
  const chain = business.chain;

  if (!chain) {
    return (
      <Card className="p-12 text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Chain Information</h3>
        <p className="text-muted-foreground">
          This business is not part of a chain.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chain Header */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Chain Logo */}
          {chain.logo && (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-border shadow-lg flex-shrink-0 mx-auto md:mx-0">
              <Image
                src={chain.logo}
                alt={`${chain.name} logo`}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          )}

          {/* Chain Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{chain.name}</h2>
              <Badge variant="secondary" className="gap-1">
                <Store className="h-3 w-3" />
                {chain.totalBranches} {chain.totalBranches === 1 ? "Location" : "Locations"}
              </Badge>
            </div>

            {chain.description && (
              <p className="text-muted-foreground leading-relaxed">
                {chain.description}
              </p>
            )}

            {/* Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chain.corporatePhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={`tel:${chain.corporatePhone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {formatPhoneNumber(chain.corporatePhone)}
                  </a>
                </div>
              )}

              {chain.corporateEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={`mailto:${chain.corporateEmail}`}
                    className="hover:text-primary transition-colors truncate"
                  >
                    {chain.corporateEmail}
                  </a>
                </div>
              )}

              {chain.headquarters && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{chain.headquarters}</span>
                </div>
              )}

              {chain.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={chain.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors truncate flex items-center gap-1"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Current Location Highlight */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold mb-1">You are viewing:</p>
            <p className="text-lg font-bold text-primary">
              {business.branchName || business.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {business.area}, {business.city}
            </p>
          </div>
        </div>
      </Card>

      {/* All Locations Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            All Locations
          </h3>
          <Badge variant="outline">{chain.totalBranches} branches</Badge>
        </div>

        <Separator />

        {/* Placeholder for branch list */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Showing all {chain.name} locations. Visit any branch for the same quality service.
          </p>

          {/* Note: Actual branch data would need to be fetched separately */}
          <BranchListPlaceholder
            chainId={chain.id}
            currentBusinessId={business.id}
            currentCity={business.city}
          />
        </div>
      </Card>

      {/* Why Choose This Chain */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Why Choose {chain.name}?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/30 border border-border">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium mb-1">Multiple Locations</p>
              <p className="text-sm text-muted-foreground">
                {chain.totalBranches} convenient locations to serve you better
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/30 border border-border">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium mb-1">Consistent Quality</p>
              <p className="text-sm text-muted-foreground">
                Same high standards across all branches
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/30 border border-border">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium mb-1">Established Brand</p>
              <p className="text-sm text-muted-foreground">
                Trusted name with proven track record
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/30 border border-border">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium mb-1">Easy Access</p>
              <p className="text-sm text-muted-foreground">
                Find a branch near you in multiple cities
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Branch List Placeholder Component
// In a real implementation, this would fetch and display actual branch data
function BranchListPlaceholder({
  chainId,
  currentBusinessId,
  currentCity,
}: {
  chainId: string;
  currentBusinessId: string;
  currentCity: string;
}) {
  // This would be an actual API call in production
  // For now, showing a placeholder message

  return (
    <div className="space-y-3 py-4">
      {/* Placeholder cards */}
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className="p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-muted rounded w-48 animate-pulse" />
                {i === 1 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Current Location
                  </Badge>
                )}
              </div>
              <div className="h-3 bg-muted rounded w-64 animate-pulse" />
              <div className="flex items-center gap-4 text-sm">
                <div className="h-3 bg-muted rounded w-20 animate-pulse" />
                <div className="h-3 bg-muted rounded w-24 animate-pulse" />
              </div>
            </div>

            <Button variant="outline" size="sm" disabled>
              <Navigation className="h-4 w-4 mr-2" />
              Directions
            </Button>
          </div>
        </Card>
      ))}

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Note: Complete branch listing requires additional data fetching.
        </p>
      </div>
    </div>
  );
}
