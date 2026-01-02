// components/business-dashboard/edit-response-dialog.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save, Trash2, Clock } from "lucide-react";
import { useResponseForm } from "@/hooks/reviews/use-response-form";
import { CharacterCounter } from "@/components/reviews/character-counter";
import { formatEditTimeRemaining, canEditReview } from "@/lib/utils/review-utils";

// ============================================
// FORM SCHEMA
// ============================================
const editResponseSchema = z.object({
  content: z
    .string()
    .min(10, "Response must be at least 10 characters")
    .max(2000, "Response must be less than 2000 characters"),
});

type EditResponseFormValues = z.infer<typeof editResponseSchema>;

// ============================================
// COMPONENT PROPS
// ============================================
interface EditResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responseId: string;
  currentContent: string;
  editableUntil: Date | null;
}

// ============================================
// MAIN COMPONENT
// ============================================
export function EditResponseDialog({
  open,
  onOpenChange,
  responseId,
  currentContent,
  editableUntil,
}: EditResponseDialogProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { updateResponse, deleteResponse, isSubmitting } = useResponseForm({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EditResponseFormValues>({
    resolver: zodResolver(editResponseSchema),
    defaultValues: {
      content: currentContent,
    },
  });

  const content = watch("content") || "";

  // ============================================
  // CHECK EDIT PERMISSION
  // ============================================
  const editPermission = canEditReview(editableUntil);

  // ============================================
  // HANDLERS
  // ============================================
  const onSubmit = async (data: EditResponseFormValues) => {
    try {
      await updateResponse(responseId, data.content);
    } catch (error) {
      console.error("Response update failed:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResponse(responseId);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Response deletion failed:", error);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Your Response</DialogTitle>
            <DialogDescription>
              Make changes to your response.{" "}
              {editPermission.editTimeRemaining && (
                <span className="text-primary font-medium">
                  {formatEditTimeRemaining(editPermission.editTimeRemaining)} remaining
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Response Textarea */}
            <div className="space-y-2">
              <Label htmlFor="edit-content">
                Response Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-content"
                placeholder="Thank you for your review..."
                rows={6}
                {...register("content")}
                maxLength={2000}
                className="resize-none"
              />
              <CharacterCounter current={content.length} min={10} max={2000} />
            </div>

            {errors.content && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.content.message}</AlertDescription>
              </Alert>
            )}

            {/* Edit Time Warning */}
            {editPermission.editTimeRemaining && editPermission.editTimeRemaining < 86400000 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  You have{" "}
                  <strong>{formatEditTimeRemaining(editPermission.editTimeRemaining)}</strong>{" "}
                  left to edit or delete this response.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || content.length < 10}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Response?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this response? This action cannot be undone.
              The review will be marked as "no response" again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete Response"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
