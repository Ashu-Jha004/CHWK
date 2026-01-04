// app/business_service/[slug]/_components/tabs/products-tab.tsx

"use client";

import { useMemo, useState } from "react";
import { BusinessDetail, MenuItemFilter, MenuItemSort } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Search,
  Filter,
  SortAsc,
  Star,
  TrendingUp,
  Tag,
  Package,
  IndianRupee,
} from "lucide-react";
import Image from "next/image";
import {
  filterMenuItems,
  sortMenuItems,
  groupMenuItemsByCategory,
  formatPrice,
} from "@/lib/utils/business-detail-utils";
import { useMenuFilters, useMenuActions } from "@/store/customer/business_service/business-detail-store";
import { cn } from "@/lib/utils";
import { MenuItem } from "@prisma/client";

interface ProductsTabProps {
  business: BusinessDetail;
  onOrderClick?: () => void;
}

export function ProductsTab({ business, onOrderClick }: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { filter, sort } = useMenuFilters();
  const { setMenuFilter, setMenuSort, resetMenuFilters } = useMenuActions();

  // Filter products only
  const products = useMemo(
    () => business.menuItems.filter((item) => item.itemType === "PRODUCT"),
    [business.menuItems]
  );

  // Apply search filter
  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  // Apply filters and sorting
  const processedProducts = useMemo(() => {
    const filtered = filterMenuItems(searchFiltered, filter);
    return sortMenuItems(filtered, sort);
  }, [searchFiltered, filter, sort]);

  // Group by category
  const groupedProducts = useMemo(
    () => groupMenuItemsByCategory(processedProducts),
    [processedProducts]
  );

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Final filtered products by category
  const displayProducts = useMemo(() => {
    if (selectedCategory === "all") return groupedProducts;
    return {
      [selectedCategory]: groupedProducts[selectedCategory] || [],
    };
  }, [groupedProducts, selectedCategory]);

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
        <p className="text-muted-foreground">
          This business doesn&apos;t have any products listed yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Products
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {processedProducts.length} {processedProducts.length === 1 ? "product" : "products"} available
            </p>
          </div>

          {(filter !== "all" || sort !== "default" || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetMenuFilters();
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat!}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select value={filter} onValueChange={(v) => setMenuFilter(v as MenuItemFilter)}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="available">Available Only</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="bestseller">Bestsellers</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setMenuSort(v as MenuItemSort)}>
            <SelectTrigger>
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Order</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Products Display */}
      {Object.entries(displayProducts).length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(displayProducts).map(([category, items]) => (
            <div key={category} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">{category}</h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOrderClick={onOrderClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ product, onOrderClick }: { product: MenuItem; onOrderClick?: () => void }) {
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const finalPrice = product.discountedPrice || product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100)
    : 0;

  return (
    <Card
      className={cn(
        "flex flex-col h-full overflow-hidden border-border/50 bg-card hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative",
        !product.isAvailable && "opacity-75 grayscale-[0.5]"
      )}
    >
      {/* Product Image Section */}
      <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-muted/30">
        {product.image || product.images?.[0] ? (
          <Image
            src={product.image || product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
            <Package className="h-16 w-16 text-muted-foreground/40 stroke-[1.5]" />
          </div>
        )}

        {/* Premium Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isFeatured && (
            <Badge className="bg-primary hover:bg-primary text-white border-none shadow-lg shadow-primary/20 backdrop-blur-md px-2.5 py-1">
              <Star className="h-3.5 w-3.5 fill-white mr-1.5" />
              Featured
            </Badge>
          )}
          {product.isBestseller && (
            <Badge className="bg-orange-500 hover:bg-orange-500 text-white border-none shadow-lg shadow-orange-500/20 px-2.5 py-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Bestseller
            </Badge>
          )}
        </div>

        {/* Discount Tag */}
        {hasDiscount && (
          <div className="absolute top-3 right-0 bg-secondary text-secondary-foreground font-bold px-3 py-1.5 rounded-l-full shadow-lg transform translate-x-1 group-hover:translate-x-0 transition-transform duration-300 z-10 text-sm">
            {discountPercent}% OFF
          </div>
        )}

        {/* Availability Overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center z-20">
            <Badge variant="destructive" className="text-sm font-bold px-6 py-2 border-none shadow-2xl">
              Currently Unavailable
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className="flex flex-col flex-1 p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-3">
            <h4 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h4>
            {product.averageRating && product.averageRating > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded-lg self-start shrink-0">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-bold">{product.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {product.category && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold py-0.5 px-2 border-primary/20 bg-primary/5 text-primary">
              {product.category}
            </Badge>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed h-[2.8rem]">
            {product.description}
          </p>
        )}

        {/* Dietary & Highlights */}
        <div className="flex flex-wrap gap-2">
          {product.isVegetarian && (
            <Badge variant="outline" className="h-6 w-6 p-0 border-green-500 flex items-center justify-center rounded-sm bg-green-50/50" title="Vegetarian">
              <div className="h-2 w-2 rounded-full bg-green-600" />
            </Badge>
          )}
          {product.isVegan && (
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Vegan</Badge>
          )}
          {product.isGlutenFree && (
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">GF</Badge>
          )}
        </div>

        {/* Price & Action Section - Pushed to bottom */}
        <div className="mt-auto pt-4 border-t border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground tracking-tight">
                  <IndianRupee className="h-4 w-4 inline mr-0.5" />
                  {finalPrice}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                    ₹{product.price}
                  </span>
                )}
              </div>
              {product.servingSize && (
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                  Per {product.servingSize}
                </span>
              )}
            </div>

            {product.totalOrders > 0 && (
              <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted/50 px-2 py-1 rounded">
                {product.totalOrders}+ Ordered
              </span>
            )}
          </div>

          <Button
            className={cn(
               "w-full h-12 rounded-xl font-bold text-base shadow-xl transition-all duration-300 active:scale-95 group/btn overflow-hidden relative",
               product.isAvailable
                 ? "bg-primary text-white hover:bg-primary/95 hover:shadow-primary/25"
                 : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            disabled={!product.isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              onOrderClick?.();
            }}
          >
            <div className="flex items-center justify-center gap-2">
               <ShoppingBag className="w-5 h-5 transition-transform duration-300 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" />
               <span>{product.isAvailable ? "Order Now" : "Out of Stock"}</span>
            </div>

            {/* Glossy shine effect on hover */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
