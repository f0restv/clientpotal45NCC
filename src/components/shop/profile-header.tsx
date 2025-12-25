"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, Grid3X3, Bookmark, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ShopStats {
  posts: number;
  followers: number;
  sales: number;
}

interface ProfileHeaderProps {
  shopName: string;
  shopHandle: string;
  bio: string;
  avatarUrl?: string;
  coverUrl?: string;
  stats: ShopStats;
  isOwner?: boolean;
  verified?: boolean;
}

export function ProfileHeader({
  shopName,
  shopHandle,
  bio,
  avatarUrl,
  coverUrl,
  stats,
  isOwner = false,
  verified = false,
}: ProfileHeaderProps) {
  return (
    <header className="border-b bg-white">
      {/* Cover Image */}
      {coverUrl && (
        <div className="relative h-32 sm:h-48">
          <Image
            src={coverUrl}
            alt="Shop cover"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <Avatar className={cn("h-24 w-24 ring-4 ring-white sm:h-32 sm:w-32", coverUrl && "-mt-12 sm:-mt-16")}>
            <AvatarImage src={avatarUrl} alt={shopName} />
            <AvatarFallback className="text-2xl font-bold">
              {shopName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <h1 className="flex items-center gap-2 text-xl font-semibold">
                {shopName}
                {verified && (
                  <svg
                    className="h-5 w-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </h1>
              {isOwner ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="gold" size="sm">
                  Follow
                </Button>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500">@{shopHandle}</p>
            <p className="mt-3 max-w-lg text-sm text-gray-700">{bio}</p>

            {/* Stats */}
            <div className="mt-4 flex justify-center gap-8 sm:justify-start">
              <StatItem value={stats.posts} label="Items" />
              <StatItem value={stats.followers} label="Followers" />
              <StatItem value={stats.sales} label="Sales" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <ProfileTabs isOwner={isOwner} />
      </div>
    </header>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  const formatted =
    value >= 1000000
      ? `${(value / 1000000).toFixed(1)}M`
      : value >= 1000
      ? `${(value / 1000).toFixed(1)}K`
      : value.toString();

  return (
    <div className="text-center">
      <span className="font-semibold">{formatted}</span>
      <span className="ml-1 text-gray-500">{label}</span>
    </div>
  );
}

function ProfileTabs({ isOwner }: { isOwner: boolean }) {
  const [activeTab, setActiveTab] = React.useState("posts");

  const tabs = [
    { id: "posts", label: "Items", icon: <Grid3X3 className="h-4 w-4" /> },
    { id: "saved", label: "Saved", icon: <Bookmark className="h-4 w-4" /> },
    ...(isOwner
      ? [{ id: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> }]
      : []),
  ];

  return (
    <div className="mt-6 flex justify-center border-t">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex items-center gap-2 border-t-2 px-6 py-4 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// Compact header for mobile
export function ProfileHeaderCompact({
  shopName,
  shopHandle,
  avatarUrl,
  stats,
}: Pick<ProfileHeaderProps, "shopName" | "shopHandle" | "avatarUrl" | "stats">) {
  return (
    <div className="flex items-center gap-4 border-b bg-white px-4 py-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatarUrl} alt={shopName} />
        <AvatarFallback>{shopName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h1 className="font-semibold">{shopName}</h1>
        <p className="text-xs text-gray-500">
          {stats.posts} items &middot; {stats.sales} sales
        </p>
      </div>
      <Link href="/shop" className="text-sm font-medium text-amber-600">
        View Shop
      </Link>
    </div>
  );
}
