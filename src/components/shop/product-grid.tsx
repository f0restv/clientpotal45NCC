"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Gavel, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, getTimeRemaining } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  price: number | null;
  images: { url: string; alt?: string }[];
  listingType: "BUY_NOW" | "AUCTION" | "BOTH";
  metalType?: string | null;
  grade?: string | null;
  certification?: string | null;
  auction?: {
    currentBid: number | null;
    endTime: string;
    bidCount?: number;
  } | null;
  status: string;
}

interface ProductGridProps {
  products: Product[];
  columns?: 3 | 4 | 5;
}

export function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  const gridCols = {
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  };

  return (
    <div className={cn("grid gap-1", gridCols[columns])}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);

  const primaryImage = product.images[0];
  const isAuction = product.listingType === "AUCTION" || product.listingType === "BOTH";
  const timeRemaining = product.auction?.endTime
    ? getTimeRemaining(product.auction.endTime)
    : null;

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group relative aspect-square overflow-hidden bg-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      {primaryImage ? (
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt || product.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gray-200">
          <span className="text-gray-400">No image</span>
        </div>
      )}

      {/* Badges */}
      <div className="absolute left-2 top-2 flex flex-col gap-1">
        {isAuction && (
          <Badge variant="auction" className="gap-1">
            <Gavel className="h-3 w-3" />
            Auction
          </Badge>
        )}
        {product.metalType === "GOLD" && (
          <Badge variant="gold">Gold</Badge>
        )}
        {product.metalType === "SILVER" && (
          <Badge variant="silver">Silver</Badge>
        )}
        {product.grade && (
          <Badge variant="outline" className="bg-white/90">
            {product.grade}
          </Badge>
        )}
      </div>

      {/* Like Button */}
      <button
        className={cn(
          "absolute right-2 top-2 rounded-full bg-white/90 p-2 opacity-0 transition-all hover:bg-white group-hover:opacity-100",
          isLiked && "opacity-100"
        )}
        onClick={(e) => {
          e.preventDefault();
          setIsLiked(!isLiked);
        }}
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-colors",
            isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
          )}
        />
      </button>

      {/* Hover Overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 transition-opacity",
          isHovered && "opacity-100"
        )}
      >
        {product.listingType !== "AUCTION" && (
          <button
            className="rounded-full bg-white p-3 hover:bg-gray-100"
            onClick={(e) => {
              e.preventDefault();
              // Add to cart logic
            }}
          >
            <ShoppingCart className="h-5 w-5 text-gray-800" />
          </button>
        )}
      </div>

      {/* Price/Bid Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
        <h3 className="line-clamp-1 text-sm font-medium text-white">
          {product.title}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          {isAuction && product.auction ? (
            <div className="flex flex-col">
              <span className="text-xs text-gray-300">Current Bid</span>
              <span className="font-bold text-white">
                {product.auction.currentBid
                  ? formatCurrency(product.auction.currentBid)
                  : "No bids"}
              </span>
            </div>
          ) : (
            <span className="font-bold text-white">
              {product.price ? formatCurrency(product.price) : "Contact"}
            </span>
          )}

          {timeRemaining && !timeRemaining.expired && (
            <div className="flex items-center gap-1 text-xs text-gray-300">
              <Clock className="h-3 w-3" />
              {timeRemaining.days > 0
                ? `${timeRemaining.days}d`
                : timeRemaining.hours > 0
                ? `${timeRemaining.hours}h`
                : `${timeRemaining.minutes}m`}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse bg-gray-200"
        />
      ))}
    </div>
  );
}
