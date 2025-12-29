/* eslint-disable @typescript-eslint/no-explicit-any */
// app/business/dashboard/_components/service-settings/service-settings-form.tsx
"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useServiceSettingsStore } from "@/store/business-dashboard/service-settings-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Settings, MapPin, CreditCard, Package } from "lucide-react";
import { ServiceTypesSection } from "./service-types-section";
import { ServiceAreasSection } from "./service-areas-section";
import { PaymentMethodsSection } from "./payment-methods-section";
import { CatalogSection } from "./catalog-section";

// ==================== TYPES ====================

interface ServiceSettingsFormProps {
  businessId: string;
}

// ==================== MAIN COMPONENT ====================

export function ServiceSettingsForm({ businessId }: ServiceSettingsFormProps) {
  const { activeSection, setActiveSection, resetStore } =
    useServiceSettingsStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [resetStore]);

  // Memoized tab change handler
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveSection(value as any);
    },
    [setActiveSection]
  );

  // Tab configuration
  const tabs = useMemo(
    () => [
      {
        id: "service-types",
        label: "Service Types",
        icon: Settings,
        description: "What you offer",
      },
      {
        id: "service-areas",
        label: "Service Areas",
        icon: MapPin,
        description: "Where you serve",
      },
      {
        id: "payment-methods",
        label: "Payment Methods",
        icon: CreditCard,
        description: "How customers pay",
      },
      {
        id: "catalog",
        label: "Services & Products",
        icon: Package,
        description: "Your offerings",
      },
    ],
    []
  );

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Service Settings
        </h2>
        <p className="text-muted-foreground">
          Configure your services, products, and business settings
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeSection}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{tab.label}</span>
                  <span className="text-xs opacity-70 hidden sm:block">
                    {tab.description}
                  </span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6">
          <TabsContent value="service-types" className="space-y-6">
            <Card className="glass p-6">
              <ServiceTypesSection businessId={businessId} />
            </Card>
          </TabsContent>

          <TabsContent value="service-areas" className="space-y-6">
            <Card className="glass p-6">
              <ServiceAreasSection businessId={businessId} />
            </Card>
          </TabsContent>

          <TabsContent value="payment-methods" className="space-y-6">
            <Card className="glass p-6">
              <PaymentMethodsSection businessId={businessId} />
            </Card>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <CatalogSection businessId={businessId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
