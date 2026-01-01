// app/business_service/[slug]/_components/tabs/about-tab.tsx

"use client";

import { useMemo } from "react";
import { BusinessDetail, BusinessStats } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  MapPin,
  Package,
  CreditCard,
  Clock,
  Shield,
  Award,
  CheckCircle2,
  Info,
  Building2,
  Tags,
  Sparkles,
} from "lucide-react";
import { formatFullAddress, getPriceRangeLabel } from "@/lib/utils/business-detail-utils";
import { cn } from "@/lib/utils";

interface AboutTabProps {
  business: BusinessDetail;
  stats: BusinessStats;
}

export function AboutTab({ business, stats }: AboutTabProps) {
  // Group amenities by category
  const amenitiesByCategory = useMemo(() => {
    const grouped: Record<string, typeof business.amenities> = {};

    (business.amenities || []).forEach((amenity) => {
      const category = amenity.amenity.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(amenity);
    });

    return grouped;
  }, [business.amenities]);

  // Payment methods list
  const paymentMethods = useMemo(() => {
    const methods: string[] = [];
    if (business.acceptsCash) methods.push("Cash");
    if (business.acceptsUPI) methods.push("UPI");
    if (business.acceptsCards) methods.push("Credit/Debit Cards");
    if (business.acceptsNetBanking) methods.push("Net Banking");
    if (business.acceptsWallets) methods.push("Digital Wallets");
    return methods;
  }, [business]);

  return (
    <div className="space-y-6">
      {/* Full Description */}
      {(business.description || business.shortDescription) && (
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            About {business.name}
          </h2>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {business.description || business.shortDescription}
            </p>
          </div>

          {/* Business Type Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {business.offersProducts && (
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3 w-3" />
                Offers Products
              </Badge>
            )}
            {business.offersServices && (
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3 w-3" />
                Offers Services
              </Badge>
            )}
            {business.offersDineIn && (
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3 w-3" />
                Dine-In
              </Badge>
            )}
            {business.offersDelivery && (
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3 w-3" />
                Delivery
              </Badge>
            )}
            {business.offersPickup && (
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3 w-3" />
                Pickup
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Categories */}
      {business.categories && business.categories.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" />
            Categories
          </h3>

          <div className="flex flex-wrap gap-2">
            {business.categories.map((cat) => (
              <Badge
                key={cat.categoryId}
                variant="outline"
                className={cn(
                  "text-sm py-1.5 px-3",
                  cat.isPrimary && "bg-primary/10 border-primary text-primary font-semibold"
                )}
              >
                {cat.category.name}
                {cat.isPrimary && (
                  <CheckCircle2 className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Amenities */}
      {business.amenities && business.amenities.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Amenities & Features
          </h3>

          {Object.entries(amenitiesByCategory).map(([category, amenities], index) => (
            <div key={category}>
              {index > 0 && <Separator className="my-4" />}

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {category}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenities.map((amenity) => (
                    <div
                      key={amenity.amenityId}
                      className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 border border-border"
                    >
                      {amenity.amenity.icon && (
                        <div className="text-2xl flex-shrink-0">
                          {amenity.amenity.icon}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {amenity.amenity.name}
                        </p>
                        {amenity.amenity.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {amenity.amenity.description}
                          </p>
                        )}
                        {amenity.note && (
                          <p className="text-xs text-primary mt-1">
                            {amenity.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Service Areas */}
      {((business.serviceAreas && business.serviceAreas.length > 0) || (business.serviceArea && business.serviceArea.length > 0)) && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Service Areas
          </h3>

          <p className="text-sm text-muted-foreground">
            We provide our services in the following areas:
          </p>

          {/* ServiceArea Model */}
          {business.serviceAreas && business.serviceAreas.length > 0 && (
            <div className="space-y-2">
              {business.serviceAreas.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">
                          {area.areaName || area.city}
                          {area.pincode && (
                            <span className="text-muted-foreground ml-2">
                              ({area.pincode})
                            </span>
                          )}
                        </p>
                        {area.estimatedTime && (
                          <p className="text-xs text-muted-foreground">
                            Estimated time: {area.estimatedTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {area.deliveryFee !== null && area.deliveryFee > 0 && (
                    <Badge variant="outline" className="ml-2">
                      ₹{area.deliveryFee} delivery
                    </Badge>
                  )}
                  {area.minimumOrder && (
                    <Badge variant="secondary" className="ml-2">
                      Min: ₹{area.minimumOrder}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* BusinessServiceArea Model */}
          {business.serviceArea && business.serviceArea.length > 0 && (
            <div className="space-y-2">
              {business.serviceArea.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">
                          {area.areaName || area.city || area.pincode}
                          {area.state && (
                            <span className="text-muted-foreground ml-2">
                              {area.state}
                            </span>
                          )}
                        </p>
                        {area.radiusKm && (
                          <p className="text-xs text-muted-foreground">
                            Within {area.radiusKm}km radius
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {area.extraCharge !== null && area.extraCharge > 0 && (
                    <Badge variant="outline" className="ml-2">
                      +₹{area.extraCharge} extra
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {business.serviceRadiusKm && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm">
                <span className="font-medium">Service Radius:</span>{" "}
                Within {business.serviceRadiusKm}km from business location
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Business Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Methods */}
        {paymentMethods.length > 0 && (
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Methods
            </h3>

            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div
                  key={method}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{method}</span>
                </div>
              ))}
            </div>

            {business.requiresAdvancePayment && (
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Advance Payment:</span>{" "}
                  {business.advancePaymentPercent}% required for bookings
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Business Policies */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Policies
          </h3>

          <div className="space-y-3">
            {business.cancellationPolicy && (
              <div>
                <p className="text-sm font-medium mb-1">Cancellation Policy</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {business.cancellationPolicy}
                </p>
                {business.cancellationDeadlineHours && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Cancel at least {business.cancellationDeadlineHours} hours before
                  </p>
                )}
              </div>
            )}

            {business.refundPolicy && (
              <div>
                <p className="text-sm font-medium mb-1">Refund Policy</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {business.refundPolicy}
                </p>
              </div>
            )}

            {business.minOrderAmount && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm">
                  <span className="font-medium">Minimum Order:</span>{" "}
                  ₹{business.minOrderAmount}
                </p>
              </div>
            )}

            {business.deliveryFee !== null && business.deliveryFee !== undefined && (
              <div>
                <p className="text-sm">
                  <span className="font-medium">Delivery Fee:</span>{" "}
                  {business.deliveryFee === 0 ? "Free" : `₹${business.deliveryFee}`}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Price Range */}
      {stats.priceRange && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Price Range
          </h3>

          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">
              {"₹".repeat(
                ["BUDGET", "MODERATE", "EXPENSIVE", "LUXURY"].indexOf(
                  stats.priceRange
                ) + 1
              )}
            </div>
            <div>
              <p className="font-medium">{getPriceRangeLabel(stats.priceRange)}</p>
              <p className="text-sm text-muted-foreground">
                {stats.priceRange === "BUDGET" && "Affordable pricing for everyone"}
                {stats.priceRange === "MODERATE" && "Good value for money"}
                {stats.priceRange === "EXPENSIVE" && "Premium quality and service"}
                {stats.priceRange === "LUXURY" && "Exclusive luxury experience"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Verified Documents */}
      {business.documents && business.documents.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verified Documents
          </h3>

          <p className="text-sm text-muted-foreground">
            This business has submitted the following verified documents:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {business.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-accent/30"
              >
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <p className="text-xs font-medium">
                    {doc.customName || formatDocumentType(doc.type)}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-1 text-xs bg-green-500/10 text-green-700 dark:text-green-400"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {business.gstNumber && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm">
                <span className="font-medium">GST Number:</span>{" "}
                <span className="font-mono">{business.gstNumber}</span>
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Business Address */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Location
        </h3>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{formatFullAddress(business)}</p>

          {business.landmark && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Landmark: {business.landmark}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline">
              Lat: {business.latitude.toFixed(6)}
            </Badge>
            <Badge variant="outline">
              Lng: {business.longitude.toFixed(6)}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper function to format document types
function formatDocumentType(type: string): string {
  const typeMap: Record<string, string> = {
    PAN_CARD: "PAN Card",
    GST_CERTIFICATE: "GST Certificate",
    AADHAAR_CARD: "Aadhaar Card",
    FSSAI_LICENSE: "FSSAI License",
    TRADE_LICENSE: "Trade License",
    HEALTH_PERMIT: "Health Permit",
    COLLAGE_DEGREE: "Degree Certificate",
    BAR_CERTIFICATE: "Bar Certificate",
    COOK_LICENSE: "Cook License",
    OTHER: "Other Document",
  };

  return typeMap[type] || type.replace(/_/g, " ");
}
