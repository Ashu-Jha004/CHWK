"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { getBusinessStatus } from "@/lib/actions/user";

interface BusinessInfo {
  id: string;
  name: string;
  slug: string;
}

interface BusinessContextType {
  isBusinessOwner: boolean;
  business: BusinessInfo | null;
  isLoading: boolean;
  refreshStatus: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    if (!isSignedIn) {
      setIsBusinessOwner(false);
      setBusiness(null);
      setIsLoading(false);
      return;
    }

    try {
      const status = await getBusinessStatus();
      setIsBusinessOwner(status.isBusinessOwner);
      setBusiness(status.business);
    } catch (error) {
      console.error("Error fetching business status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchStatus();
    }
  }, [isLoaded, isSignedIn]);

  return (
    <BusinessContext.Provider
      value={{
        isBusinessOwner,
        business,
        isLoading,
        refreshStatus: fetchStatus,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
