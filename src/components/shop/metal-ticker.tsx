"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface MetalPrice {
  metal: string;
  spotPrice: number;
  change?: number;
  changePct?: number;
}

interface MetalTickerProps {
  initialPrices?: MetalPrice[];
  refreshInterval?: number; // in milliseconds
}

const metalIcons: Record<string, string> = {
  GOLD: "Au",
  SILVER: "Ag",
  PLATINUM: "Pt",
  PALLADIUM: "Pd",
};

const metalColors: Record<string, string> = {
  GOLD: "from-amber-400 to-yellow-500",
  SILVER: "from-gray-300 to-gray-400",
  PLATINUM: "from-gray-200 to-gray-300",
  PALLADIUM: "from-gray-400 to-gray-500",
};

export function MetalTicker({
  initialPrices = [],
  refreshInterval = 60000,
}: MetalTickerProps) {
  const [prices, setPrices] = useState<MetalPrice[]>(initialPrices);
  const [loading, setLoading] = useState(initialPrices.length === 0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/prices/metals");
        if (response.ok) {
          const data = await response.json();
          setPrices(data.prices);
        }
      } catch (error) {
        console.error("Failed to fetch metal prices:", error);
      } finally {
        setLoading(false);
      }
    };

    if (initialPrices.length === 0) {
      fetchPrices();
    }

    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [initialPrices.length, refreshInterval]);

  if (loading) {
    return (
      <div className="flex h-12 items-center justify-center bg-gray-900">
        <div className="h-4 w-48 animate-pulse rounded bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      <div className="animate-ticker flex whitespace-nowrap py-3">
        {/* Duplicate the content for seamless loop */}
        {[...prices, ...prices].map((price, index) => (
          <MetalPriceItem key={`${price.metal}-${index}`} price={price} />
        ))}
      </div>

      {/* Gradient overlays for fade effect */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-900 to-transparent" />
    </div>
  );
}

function MetalPriceItem({ price }: { price: MetalPrice }) {
  const isPositive = (price.change || 0) > 0;
  const isNegative = (price.change || 0) < 0;

  return (
    <div className="mx-8 flex items-center gap-3">
      {/* Metal Symbol */}
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-gray-900",
          metalColors[price.metal] || "from-gray-400 to-gray-500"
        )}
      >
        {metalIcons[price.metal] || price.metal.slice(0, 2)}
      </div>

      {/* Metal Name & Price */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-400">
          {price.metal.charAt(0) + price.metal.slice(1).toLowerCase()}
        </span>
        <span className="font-semibold text-white">
          {formatCurrency(price.spotPrice)}/oz
        </span>
      </div>

      {/* Change */}
      {price.change !== undefined && (
        <div
          className={cn(
            "flex items-center gap-1 text-sm",
            isPositive && "text-green-400",
            isNegative && "text-red-400",
            !isPositive && !isNegative && "text-gray-400"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : isNegative ? (
            <TrendingDown className="h-4 w-4" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {formatCurrency(Math.abs(price.change))}
          </span>
          {price.changePct !== undefined && (
            <span className="text-xs">
              ({isPositive ? "+" : ""}
              {price.changePct.toFixed(2)}%)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Static ticker for server-side rendering
export function MetalTickerStatic({
  prices,
}: {
  prices: MetalPrice[];
}) {
  return (
    <div className="flex items-center justify-center gap-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-3">
      {prices.slice(0, 4).map((price) => (
        <MetalPriceItem key={price.metal} price={price} />
      ))}
    </div>
  );
}
