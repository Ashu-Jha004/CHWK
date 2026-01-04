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
  onBookClick?: () => void;
}

export function ServicesTab({ business, onBookClick }: ServicesTabProps) {
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

              {/* Services List/Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBookClick={onBookClick}
                  />
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
function ServiceCard({ service, onBookClick }: { service: MenuItem; onBookClick?: () => void }) {
  const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;

  // Pricing display based on pricing type
  const getPriceDisplay = () => {
    const price = service.discountedPrice || service.price;

    switch (service.pricingType) {
      case "HOURLY":
        return (
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-primary">{formatPrice(service.hourlyRate || price)}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Per Hour</span>
          </div>
        );
      case "DAILY":
        return (
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-primary">{formatPrice(service.dailyRate || price)}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Per Day</span>
          </div>
        );
      case "FIXED":
      default:
        return (
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-primary">{formatPrice(price)}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fixed Price</span>
          </div>
        );
    }
  };

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/40 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative bg-card",
        !service.isAvailable && "opacity-75 grayscale-[0.3]"
      )}
    >
      <div className="flex flex-col sm:flex-row h-full">
        {/* Service Image Section */}
        <div className="relative w-full sm:w-[200px] aspect-video sm:aspect-square overflow-hidden bg-muted/30 shrink-0">
          {service.image || service.images?.[0] ? (
            <Image
              src={service.image || service.images[0]}
              alt={service.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
              <Wrench className="h-10 w-10 text-muted-foreground/40 stroke-[1.5]" />
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {service.isFeatured && (
              <Badge className="bg-primary/90 text-[10px] py-0 px-2 shadow-lg backdrop-blur-sm">
                <Star className="h-3 w-3 fill-white mr-1" />
                Featured
              </Badge>
            )}
            {service.isBestseller && (
              <Badge className="bg-orange-500/90 text-[10px] py-0 px-2 shadow-lg backdrop-blur-sm">
                <TrendingUp className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>

          {!service.isAvailable && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-20">
              <Badge variant="destructive" className="text-[10px] font-bold uppercase py-0 px-2">
                Sold Out
              </Badge>
            </div>
          )}
        </div>

        {/* Service Details Section */}
        <div className="flex flex-col flex-1 p-5 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{service.name}</h3>
              {service.subcategory && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{service.subcategory}</p>
              )}
            </div>
            {getPriceDisplay()}
          </div>

          {service.description && (
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed h-[2.5rem]">
              {service.description}
            </p>
          )}

          {/* Detail Tags */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
            {service.serviceDuration && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <div className="p-1 rounded bg-muted/50"><Clock className="h-3 w-3" /></div>
                <span>{service.serviceDuration} mins</span>
              </div>
            )}
            {service.availableOnline && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <div className="p-1 rounded bg-blue-50 text-blue-600"><MapPin className="h-3 w-3" /></div>
                <span>Remote/Online</span>
              </div>
            )}
            {service.requiresBooking && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <div className="p-1 rounded bg-primary/10 text-primary"><Calendar className="h-3 w-3" /></div>
                <span>Appointment Req.</span>
              </div>
            )}
            {service.skillLevel && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <div className="p-1 rounded bg-orange-50 text-orange-600"><Award className="h-3 w-3" /></div>
                <span>{service.skillLevel}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 mt-auto border-t border-border/40 flex items-center justify-between gap-4">
             <div className="flex items-center gap-3">
              {service.averageRating && service.averageRating > 0 && (
                <div className="flex items-center gap-1 font-bold text-xs">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span>{service.averageRating.toFixed(1)}</span>
                </div>
              )}
              {service.totalOrders > 0 && (
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                  {service.totalOrders} Booked
                </span>
              )}
             </div>

             <Button
                size="sm"
                className={cn(
                  "rounded-lg font-bold h-9 px-5 shadow-lg transition-all active:scale-95 group/btn overflow-hidden relative",
                  service.isAvailable
                    ? "bg-primary text-white hover:bg-primary/95"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
                disabled={!service.isAvailable}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookClick?.();
                }}
             >
                <div className="flex items-center gap-2 relative z-10">
                  <Calendar className="h-3.5 w-3.5 transition-transform group-hover/btn:scale-110" />
                  <span>Book Now</span>
                </div>
                <div className="absolute inset-0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
             </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
