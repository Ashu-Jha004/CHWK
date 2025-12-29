/* eslint-disable @typescript-eslint/no-explicit-any */
// app/business/dashboard/_components/service-settings/catalog-section.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMenuItems } from "@/hooks/business-dashboard/use-menu-items";
import { useServiceSettingsStore } from "@/store/business-dashboard/service-settings-store";
import { MenuItemCard } from "./menu-item-card";
import { MenuItemDialog } from "./menu-item-dialog";
import { BulkActionsBar } from "./bulk-actions-bar";
import {
  SERVICE_TYPE_LABELS,
  PRICING_TYPE_LABELS,
} from "@/types/businessDashboard/service-settings";

// ==================== TYPES ====================

interface CatalogSectionProps {
  businessId: string;
}

type ViewMode = "grid" | "list";

// ==================== COMPONENT ====================

export function CatalogSection({ businessId }: CatalogSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("all");
  const [pricingTypeFilter, setPricingTypeFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

  const { selectedItems, setEditingItemId } = useServiceSettingsStore();

  // Fetch menu items
  const { data: items, isLoading } = useMenuItems(businessId);

  // Filter and search items
  const filteredItems = useMemo(() => {
    if (!items) return [];

    return items.filter((item: any) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType =
        itemTypeFilter === "all" || item.itemType === itemTypeFilter;

      // Pricing filter
      const matchesPricing =
        pricingTypeFilter === "all" || item.pricingType === pricingTypeFilter;

      // Availability filter
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && item.isAvailable) ||
        (availabilityFilter === "unavailable" && !item.isAvailable);

      return (
        matchesSearch && matchesType && matchesPricing && matchesAvailability
      );
    });
  }, [
    items,
    searchTerm,
    itemTypeFilter,
    pricingTypeFilter,
    availabilityFilter,
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Services & Products Catalog
            </h3>
            <p className="text-sm text-muted-foreground">
              List your services and products
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Items Yet</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            Start building your catalog by adding services, products, or menu
            items
          </p>
          <Button onClick={() => setEditingItemId("new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Item
          </Button>
        </div>

        {/* Add Dialog */}
        <MenuItemDialog businessId={businessId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Services & Products Catalog</h3>
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>
        <Button onClick={() => setEditingItemId("new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Item Type Filter */}
          <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Pricing Type Filter */}
          <Select
            value={pricingTypeFilter}
            onValueChange={setPricingTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              {Object.entries(PRICING_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select
            value={availabilityFilter}
            onValueChange={setAvailabilityFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.itemIds.length > 0 && (
        <BulkActionsBar businessId={businessId} />
      )}

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setItemTypeFilter("all");
              setPricingTypeFilter("all");
              setAvailabilityFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {filteredItems.map((item: any) => (
            <MenuItemCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              businessId={businessId}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <MenuItemDialog businessId={businessId} />
    </div>
  );
}
