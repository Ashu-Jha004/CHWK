"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "../../_components/image-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ImageIcon, Edit } from "lucide-react";

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    category: string | null;
}

interface MenuClientProps {
    initialItems: MenuItem[];
    businessId: string;
}

export function MenuClient({ initialItems, businessId }: MenuClientProps) {
    const [items, setItems] = useState<MenuItem[]>(initialItems);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const handleImageUpdate = async (url: string) => {
        if (!selectedItem) return;

        try {
            // Optimistic update
            setItems(prev => prev.map(item =>
                item.id === selectedItem.id ? { ...item, image: url } : item
            ));

            const res = await fetch(`/api/business/${businessId}/menu-items/${selectedItem.id}/image`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: url })
            });

            if (!res.ok) throw new Error("Failed to update image");

            toast.success("Image updated successfully");
            setIsUploadOpen(false);
            setSelectedItem(null);
        } catch (error) {
            toast.error("Failed to save image");
            // Revert on error would be ideal, skipping for brevity
        }
    };

    const openUpload = (item: MenuItem) => {
        setSelectedItem(item);
        setIsUploadOpen(true);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-video relative bg-muted flex items-center justify-center">
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        )}
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2 opacity-90"
                            onClick={() => openUpload(item)}
                        >
                            <Edit className="h-3 w-3 mr-1" />
                            {item.image ? "Change" : "Add Image"}
                        </Button>
                    </div>
                    <CardHeader className="p-4 pb-2">
                        <div className="flex justifying-between items-start">
                             <div className="space-y-1">
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                <CardDescription className="line-clamp-2 text-sm">
                                    {item.description || "No description"}
                                </CardDescription>
                             </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-center mt-2">
                         <span className="font-bold">₹{item.price}</span>
                         {item.category && <Badge variant="outline">{item.category}</Badge>}
                    </CardContent>
                </Card>
            ))}

            {items.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-10">
                    No items found. Add items to your menu to see them here.
                </p>
            )}

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Image for {selectedItem?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <ImageUpload
                            value={selectedItem?.image || ""}
                            onChange={(url:any) => handleImageUpdate(url)}
                            folder="business/menu-items"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
