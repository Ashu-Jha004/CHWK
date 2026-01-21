"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface FormResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  formResponse: string | null;
}

export function FormResponseModal({ isOpen, onClose, formResponse }: FormResponseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-full h-screen p-0 gap-0">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Form Responses</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="rounded-full bg-background/95 backdrop-blur-sm shadow-lg hover:bg-background"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Iframe Container */}
        <div className="w-full h-full">
          {formResponse ? (
            <iframe
              src={formResponse}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Form Responses"
              className="w-full h-full"
            >
              Loading responses...
            </iframe>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/20">
              <div className="text-center text-muted-foreground p-8">
                <p className="text-lg font-medium mb-2">No Response URL Configured</p>
                <p className="text-sm">You haven't set up a response URL yet.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
