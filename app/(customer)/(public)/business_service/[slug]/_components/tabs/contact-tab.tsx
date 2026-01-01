// app/business_service/[slug]/_components/tabs/contact-tab.tsx

"use client";

import { useMemo } from "react";
import { BusinessDetail } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Calendar,
  Navigation,
  MessageCircle,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  formatPhoneNumber,
  formatFullAddress,
  isBusinessOpenNow,
  getNextOpeningTime,
  generateWhatsAppURL,
  generateCallURL,
  generateGoogleMapsURL,
} from "@/lib/utils/business-detail-utils";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BusinessMap } from "./map/business-map";

interface ContactTabProps {
  business: BusinessDetail;
}

export function ContactTab({ business }: ContactTabProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isOpen = useMemo(
    () => isBusinessOpenNow(business, business.hours),
    [business]
  );

  const nextOpen = useMemo(
    () => getNextOpeningTime(business.hours),
    [business.hours]
  );

  const whatsappUrl = generateWhatsAppURL(business.phone, business.name);
  const callUrl = generateCallURL(business.phone);
  const mapsUrl = generateGoogleMapsURL({
    latitude: business.latitude,
    longitude: business.longitude,
    businessName: business.name,
    address: formatFullAddress(business),
  });

  // Handle copy to clipboard
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Day order for display
  const dayOrder = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const sortedHours = useMemo(() => {
    return [...business.hours].sort(
      (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
    );
  }, [business.hours]);

  return (
    <div className="space-y-6">
      {/* Contact Information Card */}
      <Card className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Phone className="h-6 w-6 text-primary" />
          Contact Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-medium">Phone Number</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={callUrl}
                className="text-lg font-semibold hover:text-primary transition-colors"
              >
                {formatPhoneNumber(business.phone)}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleCopy(business.phone, "phone")}
              >
                {copiedField === "phone" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" className="gap-2">
                <a href={callUrl}>
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              </Button>
              <Button asChild size="sm" variant="secondary" className="gap-2">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* Alternate Phone */}
          {business.alternatePhone && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">Alternate Phone</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${business.alternatePhone}`}
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  {formatPhoneNumber(business.alternatePhone)}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleCopy(business.alternatePhone!, "altPhone")}
                >
                  {copiedField === "altPhone" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Email */}
          {business.email && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">Email Address</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${business.email}`}
                  className="text-lg font-semibold hover:text-primary transition-colors break-all"
                >
                  {business.email}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => handleCopy(business.email!, "email")}
                >
                  {copiedField === "email" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Website */}
          {business.website && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">Website</span>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  Visit Website
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Address & Map Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Location & Address
          </h2>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-4 w-4" />
              Get Directions
            </a>
          </Button>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <p className="text-lg leading-relaxed">{formatFullAddress(business)}</p>
          {business.landmark && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
              <span className="text-sm">Landmark: {business.landmark}</span>
            </div>
          )}
        </div>

        {/* Map */}
        <BusinessMap
          latitude={business.latitude}
          longitude={business.longitude}
          businessName={business.name}
          address={formatFullAddress(business)}
          serviceRadius={business.serviceRadiusKm}
        />
      </Card>

      {/* Business Hours Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Business Hours
          </h2>

          {/* Status Badge */}
          {business.isTemporarilyClosed ? (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Temporarily Closed
            </Badge>
          ) : business.is24x7 ? (
            <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400">
              <Clock className="h-3 w-3" />
              Open 24/7
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1",
                isOpen
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {isOpen ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Open Now
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Closed
                </>
              )}
            </Badge>
          )}
        </div>

        {business.isTemporarilyClosed && business.temporaryClosureReason && (
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-1">Temporary Closure</p>
            <p className="text-sm text-muted-foreground">{business.temporaryClosureReason}</p>
            {business.temporaryClosureEnd && (
              <p className="text-sm text-muted-foreground mt-2">
                Expected to reopen: {new Date(business.temporaryClosureEnd).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
        )}

        {business.is24x7 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-primary mx-auto mb-3" />
            <p className="text-lg font-semibold mb-1">Open 24 Hours</p>
            <p className="text-sm text-muted-foreground">Available all day, every day</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedHours.map((hour) => (
              <div
                key={hour.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  hour.isClosed
                    ? "bg-muted/50"
                    : "bg-accent/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium min-w-[100px]">
                    {hour.dayOfWeek.charAt(0) + hour.dayOfWeek.slice(1).toLowerCase()}
                  </span>
                </div>

                {hour.isClosed ? (
                  <Badge variant="outline" className="text-muted-foreground">
                    Closed
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {hour.openTime} - {hour.closeTime}
                    </span>
                    {hour.hasSplitShift && hour.splitCloseTime && hour.splitReopenTime && (
                      <Badge variant="secondary" className="text-xs">
                        Split: {hour.splitCloseTime} - {hour.splitReopenTime}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}

            {!isOpen && nextOpen && (
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm">
                  <span className="font-medium">Next Opening:</span> {nextOpen}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Emergency Service */}
      {business.hasEmergencyService && (
        <Card className="p-6 bg-destructive/5 border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Emergency Service Available</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This business offers emergency services outside regular hours.
              </p>
              {business.emergencyContactNumber && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Emergency Contact:</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${business.emergencyContactNumber}`}
                      className="text-lg font-semibold text-destructive hover:underline"
                    >
                      {formatPhoneNumber(business.emergencyContactNumber)}
                    </a>
                    <Button asChild size="sm" variant="destructive" className="gap-2">
                      <a href={`tel:${business.emergencyContactNumber}`}>
                        <Phone className="h-4 w-4" />
                        Call Emergency
                      </a>
                    </Button>
                  </div>
                  {business.emergencyExtraCharge && (
                    <p className="text-xs text-muted-foreground">
                      Additional charge: ₹{business.emergencyExtraCharge}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
