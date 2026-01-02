// hooks/business-dashboard/use-video-actions.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming sonner is used based on common Next.js 14+ stacks
import { updateBusinessVideo } from "@/app/(businesses)/business/actions/profile-actions"; // We will create this next

export function useVideoActions(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoUrl: string | null) => {
      // Debugging segment: Log the attempt
      console.log(`[VideoAction] Attempting to ${videoUrl ? 'update' : 'delete'} video for business: ${businessId}`);

      const result = await updateBusinessVideo(businessId, videoUrl);

      if (!result.success) {
        throw new Error(result.error || "Failed to process video request");
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate the business data to trigger a refresh across the UI
      queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      toast.success("Video gallery updated successfully");
    },
    onError: (error: Error) => {
      // Detailed error logging for debugging
      console.error(`[VideoAction Error] Source: useVideoActions. Reason: ${error.message}`);
      toast.error(error.message || "An unexpected error occurred");
    },
  });
}