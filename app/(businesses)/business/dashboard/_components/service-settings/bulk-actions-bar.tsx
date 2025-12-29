// app/business/dashboard/_components/service-settings/bulk-actions-bar.tsx
"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Trash2, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useBulkItemOperation } from "@/hooks/business-dashboard/use-menu-items";

// ==================== TYPES ====================

interface BulkActionsBarProps {
  businessId: string;
}

type BulkAction = "enable" | "disable" | "delete" | "change-category";

// ==================== COMPONENT ====================

export function BulkActionsBar({ businessId }: BulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { selectedItems, clearSelectedItems } = useServiceSettingsStore();
  const { mutate: bulkOperation, isPending } = useBulkItemOperation(businessId);

  const selectedCount = selectedItems.itemIds.length;

  // Handle bulk action
  const handleBulkAction = (action: BulkAction) => {
    if (action === "delete") {
      setShowDeleteDialog(true);
      return;
    }

    if (action === "change-category") {
      if (!selectedCategory) {
        return; // Category must be selected
      }
      bulkOperation(
        {
          itemIds: selectedItems.itemIds,
          action: "change-category",
          targetCategoryId: selectedCategory,
        },
        {
          onSuccess: () => {
            clearSelectedItems();
            setSelectedCategory("");
          },
        }
      );
      return;
    }

    bulkOperation(
      {
        itemIds: selectedItems.itemIds,
        action,
      },
      {
        onSuccess: () => {
          clearSelectedItems();
        },
      }
    );
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    bulkOperation(
      {
        itemIds: selectedItems.itemIds,
        action: "delete",
      },
      {
        onSuccess: () => {
          clearSelectedItems();
          setShowDeleteDialog(false);
        },
      }
    );
  };

  return (
    <>
      <div className="sticky top-0 z-20 bg-primary text-primary-foreground rounded-lg p-4 shadow-lg border border-primary">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelectedItems}
              className="h-8 w-8 p-0 hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Enable */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkAction("enable")}
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Enable
            </Button>

            {/* Disable */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkAction("disable")}
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              Disable
            </Button>

            {/* Change Category - Commented out for now since we need category data */}
            {/*
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue placeholder="Move to..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cat1">Category 1</SelectItem>
                  <SelectItem value="cat2">Category 2</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkAction("change-category")}
                disabled={isPending || !selectedCategory}
                className="gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FolderOpen className="h-4 w-4" />
                )}
                Move
              </Button>
            </div>
            */}

            {/* Delete */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCount} item
              {selectedCount !== 1 ? "s" : ""} from your catalog. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete {selectedCount} Item{selectedCount !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
