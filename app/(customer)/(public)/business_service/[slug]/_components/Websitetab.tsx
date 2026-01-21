import { BusinessDetail } from "@/types/customer/business/business-detail";
import { Globe, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WebsitetabProps {
  business: BusinessDetail;
}

export default function Websitetab({ business }: WebsitetabProps) {
  // If no website URL
  if (!business?.website) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
          <div className="rounded-full bg-muted p-6">
            <Globe className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">No Website Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              This business hasn't configured a website yet.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span className="font-medium">{business.name} Website</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => window.open(business.website||"undefined", '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Open in New Tab
        </Button>
      </div>
      <div className="relative w-full" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
        <iframe
          src={business.website}
          title={`${business.name} Website`}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </Card>
  );
}
