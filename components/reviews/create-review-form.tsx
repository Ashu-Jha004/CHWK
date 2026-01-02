// components/reviews/create-review-form.tsx

"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Star,
  Camera,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { RatingSelector } from "./rating-selector";
import { CharacterCounter } from "./character-counter";
import { CameraCapture } from "./camera-capture";
import { TurnstileCaptcha } from "./turnstile-captcha";
import { useReviewForm } from "@/hooks/reviews/use-review-form";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ============================================
// FORM SCHEMA
// ============================================
const reviewFormSchema = z.object({
  rating: z.number().min(1, "Overall rating is required").max(5),
  title: z.string().max(255, "Title must be less than 255 characters").optional(),
  content: z
    .string()
    .min(20, "Review must be at least 20 characters")
    .max(2000, "Review must be less than 2000 characters"),
  foodRating: z.number().min(1).max(5).optional(),
  serviceRating: z.number().min(1).max(5).optional(),
  ambienceRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
  visitDate: z.date().optional(),
}).refine(
  (data) => {
    // At least one dimensional rating required
    return (
      data.foodRating !== undefined ||
      data.serviceRating !== undefined ||
      data.ambienceRating !== undefined ||
      data.valueRating !== undefined
    );
  },
  {
    message: "Please rate at least one aspect (Food, Service, Ambience, or Value)",
    path: ["foodRating"],
  }
);

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

// ============================================
// COMPONENT PROPS
// ============================================
interface CreateReviewFormProps {
  businessId: string;
  businessName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ============================================
// MAIN COMPONENT
// ============================================
export function CreateReviewForm({
  businessId,
  businessName,
  onSuccess,
  onCancel,
}: CreateReviewFormProps) {
  // ============================================
  // STATE
  // ============================================
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ============================================
  // HOOKS
  // ============================================
  const { submitReview, uploadPhoto, isSubmitting } = useReviewForm({
    businessId,
    onSuccess: async (reviewId) => {
      // Upload photo if captured
      if (capturedPhoto) {
        setIsUploading(true);
        try {
          await uploadPhoto(reviewId, capturedPhoto);
        } catch (error) {
          console.error("Photo upload failed:", error);
        } finally {
          setIsUploading(false);
        }
      }
      onSuccess?.();
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      title: "",
      content: "",
      foodRating: undefined,
      serviceRating: undefined,
      ambienceRating: undefined,
      valueRating: undefined,
    },
  });

  // ============================================
  // WATCH FORM VALUES
  // ============================================
  const rating = watch("rating");
  const content = watch("content") || "";
  const foodRating = watch("foodRating");
  const serviceRating = watch("serviceRating");
  const ambienceRating = watch("ambienceRating");
  const valueRating = watch("valueRating");

  // ============================================
  // VALIDATION CHECKS
  // ============================================
  const canProceedStep1 = useMemo(() => {
    return rating > 0;
  }, [rating]);

  const canProceedStep2 = useMemo(() => {
    const hasAtLeastOneRating =
      foodRating !== undefined ||
      serviceRating !== undefined ||
      ambienceRating !== undefined ||
      valueRating !== undefined;
    return hasAtLeastOneRating;
  }, [foodRating, serviceRating, ambienceRating, valueRating]);

  const canProceedStep3 = useMemo(() => {
    return content.length >= 20 && content.length <= 2000;
  }, [content]);

  const canSubmit = useMemo(() => {
    return captchaToken !== null && capturedPhoto !== null;
  }, [captchaToken, capturedPhoto]);

  // ============================================
  // CAMERA HANDLERS
  // ============================================
  const handleCameraCapture = useCallback((file: File) => {
    setCapturedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setShowCamera(false);
  }, []);

  const handleRemovePhoto = useCallback(() => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setCapturedPhoto(null);
    setPhotoPreview(null);
  }, [photoPreview]);

  // ============================================
  // FORM SUBMISSION
  // ============================================
  const onSubmit = async (data: ReviewFormValues) => {
    if (!captchaToken) {
      return;
    }

    try {
      await submitReview({
        ...data,
        captchaToken,
      });
    } catch (error) {
      console.error("Review submission failed:", error);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Form Steps Progress UI (moved up for better layout) */}

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                step >= s
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground text-muted-foreground"
              )}
            >
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  step > s ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: Overall Rating */}
        {step === 1 && (
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Overall Rating</h3>
              <p className="text-sm text-muted-foreground">
                How would you rate your overall experience?
              </p>
            </div>

            <RatingSelector
              value={rating}
              onChange={(value) => setValue("rating", value)}
              label="Overall Rating"
              required
              size="lg"
            />

            {errors.rating && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.rating.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
              >
                Next: Detailed Ratings
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: Dimensional Ratings */}
        {step === 2 && (
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Rate Specific Aspects</h3>
              <p className="text-sm text-muted-foreground">
                Rate at least one aspect of your experience
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <RatingSelector
                value={foodRating || 0}
                onChange={(value) => setValue("foodRating", value)}
                label="Food Quality"
              />
              <RatingSelector
                value={serviceRating || 0}
                onChange={(value) => setValue("serviceRating", value)}
                label="Service"
              />
              <RatingSelector
                value={ambienceRating || 0}
                onChange={(value) => setValue("ambienceRating", value)}
                label="Ambience"
              />
              <RatingSelector
                value={valueRating || 0}
                onChange={(value) => setValue("valueRating", value)}
                label="Value for Money"
              />
            </div>

            {errors.foodRating && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.foodRating.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
              >
                Next: Write Review
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: Written Review */}
        {step === 3 && (
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Write Your Review</h3>
              <p className="text-sm text-muted-foreground">
                Share details about your experience (20-2000 characters)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Review Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Summarize your experience..."
                {...register("title")}
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                Your Review <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Tell us about your experience. What did you like? What could be improved?"
                rows={6}
                {...register("content")}
                maxLength={2000}
                className="resize-none"
              />
              <CharacterCounter current={content.length} min={20} max={2000} />
            </div>

            {errors.content && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.content.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
              >
                Next: Verification
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: Photo Verification & CAPTCHA */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Photo Verification */}
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Photo Verification
                  <Badge variant="secondary">Required</Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Take a photo to verify your review and prevent spam
                </p>
              </div>

              {!showCamera && !capturedPhoto && (
                <Button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full gap-2"
                  variant="outline"
                  size="lg"
                >
                  <Camera className="h-5 w-5" />
                  Open Camera
                </Button>
              )}

              {showCamera && (
                <CameraCapture
                  onCapture={handleCameraCapture}
                  onCancel={() => setShowCamera(false)}
                />
              )}

              {capturedPhoto && photoPreview && (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src={photoPreview}
                      alt="Review verification photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      Photo captured successfully
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                    >
                      Retake
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* CAPTCHA Verification */}
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Security Check</h3>
                <p className="text-sm text-muted-foreground">
                  Complete the verification below
                </p>
              </div>

              <TurnstileCaptcha
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
              />
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(3)}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || isUploading}
                className="gap-2"
                size="lg"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Clock className="h-5 w-5 animate-spin" />
                    {isUploading ? "Uploading..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Cancel Button */}
      {onCancel && (
        <>
          <Separator />
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="w-full"
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}
