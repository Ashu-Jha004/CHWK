"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { DocumentUpload } from "./(business-profile)/document-upload";

export const AddCustomDocument = ({ businessId }: { businessId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [showUploader, setShowUploader] = useState(false);

  return (
    <Dialog
      // CRITICAL: modal={false} allows interaction with external elements like Cloudinary
      modal={false}
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);
        if (!val) {
          setCustomName("");
          setShowUploader(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-dashed border-2 h-full min-h-[140px] flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
        >
          <PlusCircle className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">Add Degree or Certificate</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px] glass border-white/20 z-[9999]"
        // Prevent autofocus from locking the browser context inside the dialog
        onOpenAutoFocus={(e) => e.preventDefault()}
        // Prevent the dialog from closing when you click on the Cloudinary Widget
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add Custom Document</DialogTitle>
          <DialogDescription>
            Enter a name for your certificate before uploading.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!showUploader ? (
            <div className="grid gap-2">
              <Label htmlFor="docName">Document Name</Label>
              <Input
                id="docName"
                placeholder="e.g. Health Inspection Certificate"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <Button
                className="w-full mt-2"
                disabled={!customName.trim()}
                onClick={() => setShowUploader(true)}
              >
                Next: Select File
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center bg-primary/5 p-2 rounded-lg">
                <span className="text-xs font-bold text-primary truncate mr-2">
                  Target: {customName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => setShowUploader(false)}
                >
                  Edit Name
                </Button>
              </div>

              <DocumentUpload
                businessId={businessId}
                type="OTHER"
                label={customName}
                customName={customName}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
