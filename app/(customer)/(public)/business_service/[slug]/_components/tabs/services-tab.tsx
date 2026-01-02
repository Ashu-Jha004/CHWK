// app/business_service/[slug]/_components/tabs/services-tab.tsx

"use client";

import { useMemo, useState } from "react";
import { BusinessDetail, MenuItemFilter, MenuItemSort } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Search,
  Filter,
  SortAsc,
  Star,
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  IndianRupee,
  Award,
} from "lucide-react";
import Image from "next/image";
import {
  filterMenuItems,
  sortMenuItems,
  groupMenuItemsByCategory,
  formatPrice,
} from "@/lib/utils/business-detail-utils";
import { useServiceFilters, useServiceActions } from "@/store/customer/business_service/business-detail-store";
import { cn } from "@/lib/utils";
import { MenuItem } from "@prisma/client";

interface ServicesTabProps {
  business: BusinessDetail;
}

export function ServicesTab({ business }: ServicesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { filter, sort } = useServiceFilters();
  const { setServiceFilter, setServiceSort, resetServiceFilters } = useServiceActions();

  // Filter services only
  const services = useMemo(
    () => business.menuItems.filter((item) => item.itemType === "SERVICE"),
    [business.menuItems]
  );

  // Apply search filter
  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return services;

    const query = searchQuery.toLowerCase();
    return services.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [services, searchQuery]);

  // Apply filters and sorting
  const processedServices = useMemo(() => {
    const filtered = filterMenuItems(searchFiltered, filter);
    return sortMenuItems(filtered, sort);
  }, [searchFiltered, filter, sort]);

  // Group by category
  const groupedServices = useMemo(
    () => groupMenuItemsByCategory(processedServices),
    [processedServices]
  );

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category).filter(Boolean));
    return Array.from(cats);
  }, [services]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Final filtered services by category
  const displayServices = useMemo(() => {
    if (selectedCategory === "all") return groupedServices;
    return {
      [selectedCategory]: groupedServices[selectedCategory] || [],
    };
  }, [groupedServices, selectedCategory]);

  if (services.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Services Available</h3>
        <p className="text-muted-foreground">
          This business doesn&apos;t have any services listed yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              Services
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {processedServices.length} {processedServices.length === 1 ? "service" : "services"} available
            </p>
          </div>

          {(filter !== "all" || sort !== "default" || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetServiceFilters();
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat!}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select value={filter} onValueChange={(v) => setServiceFilter(v as MenuItemFilter)}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="available">Available Only</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="bestseller">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setServiceSort(v as MenuItemSort)}>
            <SelectTrigger>
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Order</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Services Display */}
      {Object.entries(displayServices).length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(displayServices).map(([category, items]) => (
            <div key={category} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">{category}</h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>

              {/* Services List */}
              <div className="space-y-4">
                {items.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Service Card Component
function ServiceCard({ service }: { service: MenuItem }) {
  const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;

  // Pricing display based on pricing type
  const getPriceDisplay = () => {
    const price = service.discountedPrice || service.price;

    switch (service.pricingType) {
      case "HOURLY":
        return (
          <div>
            <span className="text-2xl font-bold">{formatPrice(service.hourlyRate || price)}</span>
            <span className="text-sm text-muted-foreground">/hour</span>
          </div>
        );
      case "DAILY":
        return (
          <div>
            <span className="text-2xl font-bold">{formatPrice(service.dailyRate || price)}</span>
            <span className="text-sm text-muted-foreground">/day</span>
          </div>
        );
      case "FIXED":
      default:
        return <span className="text-2xl font-bold">{formatPrice(price)}</span>;
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-lg transition-all duration-300",
        !service.isAvailable && "opacity-60"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 p-6">
        {/* Service Image */}
        <div className="relative aspect-square md:aspect-auto md:h-full rounded-lg overflow-hidden bg-muted">
          {service.image || service.images?.[0] ? (
            <Image
              src={service.image || service.images[0]}
              alt={service.name}
              fill
              className="object-cover"
              sizes="200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Wrench className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {service.isFeatured && (
              <Badge className="gap-1 bg-primary">
                <Star className="h-3 w-3 fill-white" />
                Featured
              </Badge>
            )}
            {service.isBestseller && (
              <Badge className="gap-1 bg-orange-500">
                <TrendingUp className="h-3 w-3" />
                Popular
              </Badge>
            )}
          </div>

          {!service.isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm px-3 py-1.5">
                Unavailable
              </Badge>
            </div>
          )}
        </div>

        {/* Service Details */}
        <div className="flex flex-col justify-between gap-4">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">{service.name}</h3>
                {service.subcategory && (
                  <p className="text-sm text-muted-foreground">{service.subcategory}</p>
                )}
              </div>

              {/* Price */}
              <div className="text-right">{getPriceDisplay()}</div>
            </div>

            {/* Description */}
            {service.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {service.description}
              </p>
            )}

            {/* Service Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Duration */}
              {service.serviceDuration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{service.serviceDuration} mins</span>
                </div>
              )}

              {/* Availability */}
              {service.availableOnline && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Online</span>
                </div>
              )}

              {service.availableOnSite && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>On-Site</span>
                </div>
              )}

              {/* Booking Required */}
              {service.requiresBooking && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Booking Required</span>
                </div>
              )}

              {/* Skill Level */}
              {service.skillLevel && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>{service.skillLevel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-4">
              {/* Rating */}
              {service.averageRating && service.averageRating > 0 && (
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-sm font-semibold">{service.averageRating.toFixed(1)}</span>
                </div>
              )}

              {/* Order Count */}
              {service.totalOrders > 0 && (
                <span className="text-sm text-muted-foreground">
                  {service.totalOrders} bookings
                </span>
              )}

              {/* Available Days */}
              {service.availableDays && service.availableDays.length > 0 && service.availableDays.length < 7 && (
                <span className="text-sm text-muted-foreground">
                  Available {service.availableDays.length} days/week
                </span>
              )}
            </div>

            {/* Discount Badge */}
            {hasDiscount && (
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                Save {formatPrice(service.price - service.discountedPrice!)}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
