/* eslint-disable @typescript-eslint/no-explicit-any */
// app/business/dashboard/_components/service-settings/service-areas-section.tsx
"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  useServiceAreas,
  useDeleteServiceArea,
} from "@/hooks/business-dashboard/use-service-areas";
import { ServiceAreaDialog } from "./service-area-dialog";

// ==================== TYPES ====================

interface ServiceAreasSectionProps {
  businessId: string;
}

// ==================== COMPONENT ====================

export function ServiceAreasSection({ businessId }: ServiceAreasSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [deletingAreaId, setDeletingAreaId] = useState<string | null>(null);

  // Fetch service areas
  const { data: areas, isLoading } = useServiceAreas(businessId);
  const { mutate: deleteArea, isPending: isDeleting } = useDeleteServiceArea();

  // Handle delete
  const handleDelete = () => {
    if (deletingAreaId) {
      deleteArea(deletingAreaId, {
        onSuccess: () => {
          setDeletingAreaId(null);
        },
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (!areas || areas.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Service Areas</h3>
            <p className="text-sm text-muted-foreground">
              Define where you provide services or deliver
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Service Areas Yet</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            Add service areas by pincode or radius to let customers know where
            you operate
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Area
          </Button>
        </div>

        {/* Add Dialog */}
        <ServiceAreaDialog
          businessId={businessId}
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Service Areas</h3>
          <p className="text-sm text-muted-foreground">
            Manage your service coverage areas
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Area
        </Button>
      </div>

      {/* Areas Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Area / Pincode</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Delivery Fee</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Est. Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map((area: any) => (
              <TableRow key={area.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    {area.areaName && <span>{area.areaName}</span>}
                    {area.pincode && (
                      <span className="text-sm text-muted-foreground">
                        PIN: {area.pincode}
                      </span>
                    )}
                    {!area.areaName && !area.pincode && (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {area.city || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {area.deliveryFee !== null &&
                  area.deliveryFee !== undefined ? (
                    `₹${area.deliveryFee}`
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {area.minimumOrder !== null &&
                  area.minimumOrder !== undefined ? (
                    `₹${area.minimumOrder}`
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {area.estimatedTime || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={area.isActive ? "default" : "secondary"}>
                    {area.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingAreaId(area.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingAreaId(area.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Service Areas Tips
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Add specific pincodes where you deliver or provide services</li>
          <li>• Set custom delivery fees and minimum orders per area</li>
          <li>
            • You can also set a service radius in the Service Types section
          </li>
        </ul>
      </div>

      {/* Add/Edit Dialog */}
      <ServiceAreaDialog
        businessId={businessId}
        areaId={editingAreaId}
        open={isAddDialogOpen || !!editingAreaId}
        onOpenChange={(open: any) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingAreaId(null);
          } else {
            setIsAddDialogOpen(true);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAreaId}
        onOpenChange={(open) => !open && setDeletingAreaId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Area?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this service area. Customers in this area
              won&apos;t see your business as available. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
