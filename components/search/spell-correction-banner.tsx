"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpellCorrectionBannerProps {
  originalQuery: string;
  suggestedQuery: string;
}

export function SpellCorrectionBanner({
  originalQuery,
  suggestedQuery,
}: SpellCorrectionBannerProps) {
  const router = useRouter();

  const handleSearchSuggestion = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("q", suggestedQuery);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-gray-700">
            No results found for{" "}
            <span className="font-semibold">"{originalQuery}"</span>
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Did you mean:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearchSuggestion}
              className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 border-orange-300"
            >
              <Search className="h-3 w-3 mr-1" />
              {suggestedQuery}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
