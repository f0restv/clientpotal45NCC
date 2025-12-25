"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Gavel, Clock, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, getTimeRemaining } from "@/lib/utils";

interface AuctionItem {
  id: string;
  title: string;
  currentBid: number | null;
  startPrice: number;
  reservePrice?: number | null;
  buyNowPrice?: number | null;
  bidCount: number;
  endTime: string;
  images: { url: string }[];
  isReserveMet?: boolean;
}

interface AuctionCardProps {
  auction: AuctionItem;
  onBid?: (amount: number) => void;
  className?: string;
}

export function AuctionCard({ auction, onBid, className }: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(auction.endTime));
  const currentAmount = auction.currentBid || auction.startPrice;
  const minBid = currentAmount + 1; // Simplified increment

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(auction.endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.endTime]);

  const isEndingSoon = timeLeft.total > 0 && timeLeft.total < 1000 * 60 * 60; // Less than 1 hour
  const isEnded = timeLeft.expired;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Link href={`/shop/${auction.id}`} className="block">
        <div className="relative aspect-square">
          {auction.images[0] ? (
            <Image
              src={auction.images[0].url}
              alt={auction.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <Gavel className="h-12 w-12 text-gray-300" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute left-2 top-2">
            {isEnded ? (
              <Badge variant="secondary">Ended</Badge>
            ) : isEndingSoon ? (
              <Badge variant="destructive" className="animate-pulse">
                Ending Soon!
              </Badge>
            ) : (
              <Badge variant="auction">Live Auction</Badge>
            )}
          </div>

          {/* Time Remaining */}
          {!isEnded && (
            <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1">
              <div className="flex items-center gap-1 text-sm text-white">
                <Clock className="h-3 w-3" />
                <TimeDisplay time={timeLeft} />
              </div>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <h3 className="line-clamp-2 font-medium">{auction.title}</h3>

        <div className="mt-3 space-y-2">
          {/* Current Bid */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {auction.currentBid ? "Current Bid" : "Starting Bid"}
            </span>
            <span className="text-lg font-bold text-amber-600">
              {formatCurrency(currentAmount)}
            </span>
          </div>

          {/* Bid Count */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"}
            </div>
            {auction.reservePrice && !auction.isReserveMet && (
              <span className="text-amber-600">Reserve not met</span>
            )}
          </div>

          {/* Buy Now Price */}
          {auction.buyNowPrice && !isEnded && (
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm text-gray-500">Buy Now</span>
              <span className="font-semibold">
                {formatCurrency(auction.buyNowPrice)}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {!isEnded && onBid && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="gold"
                className="flex-1"
                onClick={() => onBid(minBid)}
              >
                <Gavel className="mr-2 h-4 w-4" />
                Bid {formatCurrency(minBid)}
              </Button>
              {auction.buyNowPrice && (
                <Button variant="outline" className="shrink-0">
                  Buy Now
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TimeDisplay({
  time,
}: {
  time: ReturnType<typeof getTimeRemaining>;
}) {
  if (time.expired) return <span>Ended</span>;

  if (time.days > 0) {
    return (
      <span>
        {time.days}d {time.hours}h
      </span>
    );
  }

  if (time.hours > 0) {
    return (
      <span>
        {time.hours}h {time.minutes}m
      </span>
    );
  }

  return (
    <span className={cn(time.minutes < 5 && "text-red-400")}>
      {time.minutes}m {time.seconds}s
    </span>
  );
}

// Featured auction carousel item
export function FeaturedAuctionCard({
  auction,
}: {
  auction: AuctionItem;
}) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(auction.endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(auction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  return (
    <Link
      href={`/shop/${auction.id}`}
      className="group relative flex h-64 overflow-hidden rounded-xl"
    >
      {auction.images[0] && (
        <Image
          src={auction.images[0].url}
          alt={auction.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <Badge variant="auction" className="mb-2">
          <TrendingUp className="mr-1 h-3 w-3" />
          Hot Auction
        </Badge>
        <h3 className="text-xl font-bold text-white">{auction.title}</h3>
        <div className="mt-2 flex items-center gap-4 text-white">
          <span className="text-2xl font-bold">
            {formatCurrency(auction.currentBid || auction.startPrice)}
          </span>
          <span className="text-sm text-gray-300">
            {auction.bidCount} bids
          </span>
          <span className="ml-auto flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <TimeDisplay time={timeLeft} />
          </span>
        </div>
      </div>
    </Link>
  );
}
