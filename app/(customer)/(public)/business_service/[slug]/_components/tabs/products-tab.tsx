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
}

export function ProductsTab({ business }: ProductsTabProps) {
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
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
function ProductCard({ product }: { product: MenuItem }) {
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const finalPrice = product.discountedPrice || product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100)
    : 0;

  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-lg transition-all duration-300 group",
        !product.isAvailable && "opacity-60"
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image || product.images?.[0] ? (
          <Image
            src={product.image || product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.isFeatured && (
            <Badge className="gap-1 bg-primary">
              <Star className="h-3 w-3 fill-white" />
              Featured
            </Badge>
          )}
          {product.isBestseller && (
            <Badge className="gap-1 bg-orange-500">
              <TrendingUp className="h-3 w-3" />
              Bestseller
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="gap-1 bg-green-600">
              <Tag className="h-3 w-3" />
              {discountPercent}% OFF
            </Badge>
          )}
        </div>

        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-base px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Name & Category */}
        <div>
          <h4 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h4>
          {product.subcategory && (
            <p className="text-xs text-muted-foreground">{product.subcategory}</p>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Dietary Badges */}
        {(product.isVegetarian || product.isVegan || product.isGlutenFree || product.isJain) && (
          <div className="flex flex-wrap gap-1.5">
            {product.isVegetarian && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-300">
                Veg
              </Badge>
            )}
            {product.isVegan && (
              <Badge variant="outline" className="text-xs bg-green-600/10 text-green-800 border-green-400">
                Vegan
              </Badge>
            )}
            {product.isGlutenFree && (
              <Badge variant="outline" className="text-xs">
                Gluten-Free
              </Badge>
            )}
            {product.isJain && (
              <Badge variant="outline" className="text-xs">
                Jain
              </Badge>
            )}
          </div>
        )}

        {/* Price & Rating */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground flex items-center">
              <IndianRupee className="h-4 w-4" />
              {finalPrice}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          {product.averageRating && product.averageRating > 0 && (
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="text-sm font-semibold">{product.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {(product.servingSize || product.calories) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2">
            {product.servingSize && <span>Serving: {product.servingSize}</span>}
            {product.calories && <span>Calories: {product.calories}</span>}
          </div>
        )}

        {/* Stock Indicator */}
        {product.hasLimitedStock && product.stockQuantity !== null && product.isAvailable && (
          <Badge variant="outline" className="w-full justify-center text-xs border-orange-300 text-orange-700">
            Only {product.stockQuantity} left in stock
          </Badge>
        )}

        {/* Order Count */}
        {product.totalOrders > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {product.totalOrders} orders placed
          </p>
        )}
      </div>
    </Card>
  );
}
