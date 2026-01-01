// app/business_service/[slug]/_components/modals/share-modal.tsx

"use client";

import { useState } from "react";
import { BusinessDetail } from "@/types/customer/business/business-detail";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Share2,
  Copy,
  CheckCircle2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  QrCode,
} from "lucide-react";
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

interface ShareModalProps {
  business: BusinessDetail;
}

export function ShareModal({ business }: ShareModalProps) {
  const { shareModalOpen, setShareModalOpen } = useBusinessDetailStore();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Generate share URL (assuming Next.js app running on domain)
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/business_service/${business.slug}`
    : `https://yourdomain.com/business_service/${business.slug}`;

  const shareTitle = `${business.name} - ${business.shortDescription || business.categories[0]?.category.name || "Business"}`;
  const shareDescription = business.shortDescription || `Check out ${business.name} on our platform!`;

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Share via Web Share API (mobile)
  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Native share failed:", error);
      }
    }
  };

  // Social media share URLs
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\n${shareUrl}`)}`,
  };

  return (
    <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share {business.name}
          </DialogTitle>
          <DialogDescription>
            Share this business with your friends and family
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Copy Link Section */}
          <div className="space-y-3">
            <Label htmlFor="share-url">Copy Link</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                variant={copied ? "default" : "outline"}
                size="icon"
                onClick={handleCopy}
                className={cn(copied && "bg-green-600 hover:bg-green-700")}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Link copied to clipboard!
              </p>
            )}
          </div>

          <Separator />

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <Label>Share via Social Media</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Facebook */}
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => window.open(shareUrls.facebook, "_blank", "width=600,height=400")}
              >
                <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                  <Facebook className="h-4 w-4 text-white fill-white" />
                </div>
                <span>Facebook</span>
              </Button>

              {/* Twitter */}
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => window.open(shareUrls.twitter, "_blank", "width=600,height=400")}
              >
                <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center flex-shrink-0">
                  <Twitter className="h-4 w-4 text-white fill-white" />
                </div>
                <span>Twitter</span>
              </Button>

              {/* LinkedIn */}
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => window.open(shareUrls.linkedin, "_blank", "width=600,height=400")}
              >
                <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center flex-shrink-0">
                  <Linkedin className="h-4 w-4 text-white fill-white" />
                </div>
                <span>LinkedIn</span>
              </Button>

              {/* WhatsApp */}
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => window.open(shareUrls.whatsapp, "_blank")}
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-white fill-white" />
                </div>
                <span>WhatsApp</span>
              </Button>

              {/* Email */}
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => window.location.href = shareUrls.email}
              >
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span>Email</span>
              </Button>

              {/* Native Share (Mobile) */}
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <Button
                  variant="outline"
                  className="gap-2 justify-start"
                  onClick={handleNativeShare}
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Share2 className="h-4 w-4 text-white" />
                  </div>
                  <span>More</span>
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* QR Code Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>QR Code</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="gap-2"
              >
                <QrCode className="h-4 w-4" />
                {showQR ? "Hide" : "Show"} QR Code
              </Button>
            </div>

            {showQR && (
              <div className="flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-muted/30">
                <QRCodeSVG
                  value={shareUrl}
                  size={200}
                  level="M"
                  includeMargin
                  className="rounded-lg bg-white p-2"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Scan to visit this business page
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Download QR code
                    const svg = document.querySelector("#qr-code-svg") as SVGElement;
                    if (svg) {
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement("canvas");
                      const ctx = canvas.getContext("2d");
                      const img = new Image();
                      img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx?.drawImage(img, 0, 0);
                        const pngFile = canvas.toDataURL("image/png");
                        const downloadLink = document.createElement("a");
                        downloadLink.download = `${business.slug}-qr-code.png`;
                        downloadLink.href = pngFile;
                        downloadLink.click();
                      };
                      img.src = "data:image/svg+xml;base64," + btoa(svgData);
                    }
                  }}
                >
                  Download QR Code
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
