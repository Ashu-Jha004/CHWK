// components/business-dashboard/response-form.tsx

"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Sparkles, AlertCircle } from "lucide-react";
import { useResponseForm } from "@/hooks/reviews/use-response-form";
import { CharacterCounter } from "@/components/reviews/character-counter";
import { getTemplatesForRating } from "@/lib/constants/response-templates";
import { cn } from "@/lib/utils";

// ============================================
// FORM SCHEMA
// ============================================
const responseSchema = z.object({
  content: z
    .string()
    .min(10, "Response must be at least 10 characters")
    .max(2000, "Response must be less than 2000 characters"),
});

type ResponseFormValues = z.infer<typeof responseSchema>;

// ============================================
// COMPONENT PROPS
// ============================================
interface ResponseFormProps {
  reviewId: string;
  reviewRating: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================
export function ResponseForm({
  reviewId,
  reviewRating,
  onSuccess,
  onCancel,
  className,
}: ResponseFormProps) {
  const [showTemplates, setShowTemplates] = useState(true);

  const { createResponse, isSubmitting } = useResponseForm({
    onSuccess,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      content: "",
    },
  });

  const content = watch("content") || "";
  const templates = getTemplatesForRating(reviewRating);

  // ============================================
  // HANDLERS
  // ============================================
  const handleTemplateSelect = useCallback(
    (template: string) => {
      setValue("content", template);
      setShowTemplates(false);
    },
    [setValue]
  );

  const onSubmit = async (data: ResponseFormValues) => {
    try {
      await createResponse(reviewId, data.content);
    } catch (error) {
      console.error("Response submission failed:", error);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <Card className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Post Response</h3>
          <p className="text-sm text-muted-foreground">
            Respond to this review as the business owner
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Business Owner
        </Badge>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Templates */}
        {showTemplates && templates.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Response Templates
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateSelect(template.content)}
                  className="h-auto py-3 px-4 text-left justify-start whitespace-normal"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{template.label}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {template.content}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(false)}
              className="w-full"
            >
              Write Custom Response
            </Button>
          </div>
        )}

        {/* Response Textarea */}
        {(!showTemplates || content.length > 0) && (
          <div className="space-y-2">
            <Label htmlFor="response-content">
              Your Response <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="response-content"
              placeholder="Thank you for your review..."
              rows={6}
              {...register("content")}
              maxLength={2000}
              className="resize-none"
            />
            <CharacterCounter current={content.length} min={10} max={2000} />
          </div>
        )}

        {errors.content && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.content.message}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {showTemplates && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(false)}
            >
              Skip Templates
            </Button>
          )}
          {!showTemplates && templates.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(true)}
            >
              Show Templates
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || content.length < 10}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Posting..." : "Post Response"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
