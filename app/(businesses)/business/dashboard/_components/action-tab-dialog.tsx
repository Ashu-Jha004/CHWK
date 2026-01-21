"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateBusinessForms } from "../../actions/settings-actions";
import { FileText, Loader2 } from "lucide-react";

interface ActionTabDialogProps {
  businessId: string;
  initialFormUrl?: string | null;
  initialFormResponseUrl?: string | null;
}

export function ActionTabDialog({
  businessId,
  initialFormUrl,
  initialFormResponseUrl,
}: ActionTabDialogProps) {
  const [open, setOpen] = useState(false);
  const [formUrl, setFormUrl] = useState(initialFormUrl || "");
  const [formResponseUrl, setFormResponseUrl] = useState(initialFormResponseUrl || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateBusinessForms(businessId, formUrl, formResponseUrl);

      if (result.success) {
        toast.success("Settings updated successfully");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Manage Forms
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[100vw] w-full h-screen p-6 gap-4">
        <DialogHeader>
          <DialogTitle>Action Tab Settings</DialogTitle>
          <DialogDescription>
            Configure the Google Form URLs for the Action Tab.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="formUrl">Google Form URL</Label>
            <Input
              id="formUrl"
              placeholder="https://docs.google.com/forms/d/e/..."
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="formResponseUrl">Form Response URL (Sheet)</Label>
            <Input
              id="formResponseUrl"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={formResponseUrl}
              onChange={(e) => setFormResponseUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
