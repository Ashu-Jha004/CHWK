// app/business/dashboard/_components/sidebar-footer.tsx
"use client";

import { LogOut, HelpCircle } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/business-dashboard";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/business-onboarding/toast";

export function SidebarFooter() {
  const { sidebarOpen } = useDashboardStore();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast.success("Signed out successfully");
    } catch (error) {
      console.error("[SIDEBAR] Sign out error:", error);
      showToast.error("Failed to sign out", "Please try again");
    }
  };

  return (
    <div className="border-t border-border p-4">
      <div className="space-y-2">
        {/* Help Button */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
            !sidebarOpen && "justify-center"
          )}
          onClick={() => window.open("/help", "_blank")}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Help & Support</span>}
        </Button>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive",
            !sidebarOpen && "justify-center"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
