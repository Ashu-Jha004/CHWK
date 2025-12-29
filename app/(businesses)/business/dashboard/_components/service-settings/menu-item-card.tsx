/* eslint-disable @typescript-eslint/no-explicit-any */
// app/business/dashboard/_components/service-settings/menu-item-card.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, MoreVertical, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useServiceSettingsStore } from "@/store/business-dashboard/service-settings-store";
import {
  useDeleteMenuItem,
  useToggleItemAvailability,
} from "@/hooks/business-dashboard/use-menu-items";
import {
  SERVICE_TYPE_LABELS,
  PRICING_TYPE_LABELS,
} from "@/types/businessDashboard/service-settings";

// ==================== TYPES ====================

interface MenuItemCardProps {
  item: any;
  viewMode: "grid" | "list";
  businessId: string;
}

// ==================== COMPONENT ====================

export function MenuItemCard({
  item,
  viewMode,
  businessId,
}: MenuItemCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { selectedItems, toggleItemSelection, setEditingItemId } =
    useServiceSettingsStore();

  const { mutate: deleteItem, isPending: isDeleting } = useDeleteMenuItem();
  const { mutate: toggleAvailability, isPending: isToggling } =
    useToggleItemAvailability();

  const isSelected = selectedItems.itemIds.includes(item.id);

  // Handle delete
  const handleDelete = () => {
    deleteItem(item.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  // Handle toggle availability
  const handleToggleAvailability = () => {
    toggleAvailability(item.id);
  };

  // Format price
  const formatPrice = () => {
    if (item.pricingType === "NEGOTIABLE") {
      return "Negotiable";
    }
    if (item.pricingType === "FREE") {
      return "Free";
    }
    if (item.pricingType === "HOURLY" && item.hourlyRate) {
      return `₹${item.hourlyRate}/hr`;
    }
    if (item.pricingType === "DAILY" && item.dailyRate) {
      return `₹${item.dailyRate}/day`;
    }
    if (item.basePrice) {
      return `₹${item.basePrice}`;
    }
    return "Price not set";
  };

  // Grid View
  if (viewMode === "grid") {
    return (
      <>
        <div
          className={`group relative rounded-lg border bg-card overflow-hidden transition-all hover:shadow-lg ${
            isSelected ? "ring-2 ring-primary" : ""
          } ${!item.isAvailable ? "opacity-60" : ""}`}
        >
          {/* Selection Checkbox */}
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleItemSelection(item.id)}
              className="bg-white dark:bg-gray-800 shadow-md"
            />
          </div>

          {/* Availability Badge */}
          {!item.isAvailable && (
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="secondary">Unavailable</Badge>
            </div>
          )}

          {/* Image */}
          <div className="relative aspect-video w-full bg-muted">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Name and Price */}
            <div>
              <h4 className="font-semibold text-base line-clamp-1">
                {item.name}
              </h4>
              <p className="text-sm text-primary font-medium mt-1">
                {formatPrice()}
              </p>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {item.itemType && (
                <Badge variant="outline" className="text-xs">
                  {
                    SERVICE_TYPE_LABELS[
                      item.itemType as keyof typeof SERVICE_TYPE_LABELS
                    ]
                  }
                </Badge>
              )}
              {item.requiresBooking && (
                <Badge variant="secondary" className="text-xs">
                  Booking Required
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingItemId(item.id)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleToggleAvailability}
                    disabled={isToggling}
                  >
                    {item.isAvailable ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Mark Unavailable
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Mark Available
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this item from your catalog. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // List View
  return (
    <>
      <div
        className={`group relative rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md ${
          isSelected ? "ring-2 ring-primary" : ""
        } ${!item.isAvailable ? "opacity-60" : ""}`}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Selection Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleItemSelection(item.id)}
          />

          {/* Image */}
          <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base truncate">
                  {item.name}
                </h4>
                <p className="text-sm text-primary font-medium">
                  {formatPrice()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!item.isAvailable && (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
            </div>

            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {item.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {item.itemType && (
                <Badge variant="outline" className="text-xs">
                  {
                    SERVICE_TYPE_LABELS[
                      item.itemType as keyof typeof SERVICE_TYPE_LABELS
                    ]
                  }
                </Badge>
              )}
              {item.requiresBooking && (
                <Badge variant="secondary" className="text-xs">
                  Booking Required
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingItemId(item.id)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleToggleAvailability}
                  disabled={isToggling}
                >
                  {item.isAvailable ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Mark Unavailable
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Mark Available
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item from your catalog. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
