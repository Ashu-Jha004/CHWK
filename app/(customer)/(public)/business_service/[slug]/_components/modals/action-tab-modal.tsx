"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ActionTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: string | null;
  businessName: string;
}

export function ActionTabModal({ isOpen, onClose, form, businessName }: ActionTabModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-full h-screen p-0 gap-0">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Action Tab - {businessName}</DialogTitle>
            <DialogDescription>Complete the form for {businessName}</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        {/* Iframe Container */}
        <div className="w-full h-full">
          {form ? (
            <iframe
              src={form}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Google Form"
              className="w-full h-full"
            >
              Loading form...
            </iframe>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/20">
              <div className="text-center text-muted-foreground p-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Form Configured</p>
                <p className="text-sm">The business owner hasn't set up a form yet.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
