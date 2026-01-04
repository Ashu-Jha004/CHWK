"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ServiceSelectorProps {
  services: any[]; // In real usage, type strict this with MenuItem
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function ServiceSelector({ services, selectedIds, onToggle }: ServiceSelectorProps) {
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-4">
          {services.map((service) => {
            const isSelected = selectedIds.includes(service.id);
            return (
              <div
                key={service.id}
                className={cn(
                  "flex items-start space-x-3 p-4 rounded-lg border transition-colors cursor-pointer",
                  isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                )}
                onClick={() => onToggle(service.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggle(service.id)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">{service.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    ₹{service.discountedPrice || service.price}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      • {service.duration || 30} mins
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
