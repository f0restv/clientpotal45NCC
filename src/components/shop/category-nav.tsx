"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Coins,
  CircleDollarSign,
  Globe,
  Award,
  Gem,
  Package,
  Flame,
  Clock,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: React.ReactNode;
  count?: number;
}

const defaultCategories: Category[] = [
  { id: "all", name: "All Items", slug: "", icon: <Package className="h-4 w-4" /> },
  { id: "us-coins", name: "US Coins", slug: "us-coins", icon: <CircleDollarSign className="h-4 w-4" /> },
  { id: "world-coins", name: "World Coins", slug: "world-coins", icon: <Globe className="h-4 w-4" /> },
  { id: "bullion", name: "Gold & Silver", slug: "bullion", icon: <Coins className="h-4 w-4" /> },
  { id: "graded", name: "Certified", slug: "graded", icon: <Award className="h-4 w-4" /> },
  { id: "collectibles", name: "Collectibles", slug: "collectibles", icon: <Gem className="h-4 w-4" /> },
  { id: "auctions", name: "Auctions", slug: "auctions", icon: <Flame className="h-4 w-4" /> },
  { id: "ending-soon", name: "Ending Soon", slug: "ending-soon", icon: <Clock className="h-4 w-4" /> },
];

interface CategoryNavProps {
  categories?: Category[];
  className?: string;
}

export function CategoryNav({
  categories = defaultCategories,
  className,
}: CategoryNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "scrollbar-hide flex gap-2 overflow-x-auto border-b bg-white px-4 py-3",
        className
      )}
    >
      {categories.map((category) => {
        const href = category.slug ? `/shop/category/${category.slug}` : "/shop";
        const isActive =
          category.slug === ""
            ? pathname === "/shop"
            : pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={category.id}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            {category.icon}
            <span>{category.name}</span>
            {category.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  isActive ? "bg-amber-200 text-amber-800" : "bg-gray-100 text-gray-500"
                )}
              >
                {category.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// Vertical category sidebar for larger screens
export function CategorySidebar({
  categories = defaultCategories,
  className,
}: CategoryNavProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("hidden w-64 shrink-0 lg:block", className)}>
      <div className="sticky top-20 rounded-lg border bg-white p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Categories</h3>
        <nav className="flex flex-col gap-1">
          {categories.map((category) => {
            const href = category.slug
              ? `/shop/category/${category.slug}`
              : "/shop";
            const isActive =
              category.slug === ""
                ? pathname === "/shop"
                : pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={category.id}
                href={href}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-amber-50 font-medium text-amber-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  {category.icon}
                  <span>{category.name}</span>
                </div>
                {category.count !== undefined && (
                  <span className="text-xs text-gray-400">{category.count}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
