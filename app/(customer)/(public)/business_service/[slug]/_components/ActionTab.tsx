import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BusinessDetail } from "@/types/customer/business/business-detail";
import { ExternalLink, FileText, Globe } from "lucide-react";

interface ActionTabProps {
  business: BusinessDetail;
}

export default function ActionTab({ business }: ActionTabProps) {
  // Do not render iframe if form URL is missing
  if (!business?.form) {
    console.log("Form not available",business?.form);
    return (
      <div className="flex min-h-screen w-full items-center justify-center text-gray-500">
        Form not available
      </div>
    );
  }

  return (
   <Card className="overflow-hidden">
      <div className="border-b bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span className="font-medium">{business.name} Form</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => window.open(business.form||"undefined", '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Open in New Tab
        </Button>
      </div>
      <div className="relative w-full" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
        <iframe
          src={business.form||"undefined"}
          title={`${business.name} Website`}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </Card>
  );
}
