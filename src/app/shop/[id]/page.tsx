"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ShoppingCart,
  Gavel,
  Clock,
  Shield,
  Truck,
  Award,
  MessageCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency } from "@/lib/utils";

// Mock product data
const product = {
  id: "1",
  title: "1921 Morgan Silver Dollar MS65",
  description: `This stunning 1921 Morgan Silver Dollar has been professionally graded MS65 by PCGS. The coin exhibits exceptional luster with light contact marks consistent with the grade. The strike is sharp, and the surfaces display attractive cartwheel luster.

The Morgan Dollar series, designed by George T. Morgan, is one of the most popular series among collectors. The 1921 date marks the final year of regular Morgan Dollar production before the series was replaced by the Peace Dollar.

This coin comes in its original PCGS holder with certification number 12345678.`,
  price: 285,
  images: [
    { url: "/api/placeholder/600/600", alt: "Front" },
    { url: "/api/placeholder/600/600", alt: "Back" },
    { url: "/api/placeholder/600/600", alt: "Edge" },
    { url: "/api/placeholder/600/600", alt: "PCGS Holder" },
  ],
  listingType: "BUY_NOW",
  metalType: "SILVER",
  metalWeight: 0.7734,
  metalPurity: 0.9,
  year: 1921,
  mint: "Philadelphia",
  grade: "MS65",
  certification: "PCGS",
  certNumber: "12345678",
  population: 4521,
  category: "US Coins",
  status: "ACTIVE",
  quantity: 1,
  views: 245,
};

export default function ProductPage() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/shop" className="hover:text-amber-600">
            Shop
          </Link>
          <span>/</span>
          <Link href="/shop/category/us-coins" className="hover:text-amber-600">
            US Coins
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt}
                fill
                className="object-cover"
              />

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )
                    }
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )
                    }
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Like Button */}
              <button
                className={cn(
                  "absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-md hover:bg-white",
                  isLiked && "text-red-500"
                )}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart
                  className={cn("h-5 w-5", isLiked && "fill-current")}
                />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md bg-gray-100",
                    selectedImage === index && "ring-2 ring-amber-500"
                  )}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap gap-2">
                {product.metalType && (
                  <Badge variant={product.metalType === "GOLD" ? "gold" : "silver"}>
                    {product.metalType}
                  </Badge>
                )}
                {product.certification && (
                  <Badge variant="outline">{product.certification}</Badge>
                )}
                {product.grade && (
                  <Badge variant="outline">{product.grade}</Badge>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900 lg:text-3xl">
                {product.title}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-amber-600">
                {formatCurrency(product.price)}
              </span>
              {product.metalWeight && (
                <span className="text-sm text-gray-500">
                  ({product.metalWeight} oz {product.metalType?.toLowerCase()})
                </span>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              {product.year && (
                <div>
                  <span className="text-sm text-gray-500">Year</span>
                  <p className="font-medium">{product.year}</p>
                </div>
              )}
              {product.mint && (
                <div>
                  <span className="text-sm text-gray-500">Mint</span>
                  <p className="font-medium">{product.mint}</p>
                </div>
              )}
              {product.certification && product.certNumber && (
                <div>
                  <span className="text-sm text-gray-500">Cert #</span>
                  <p className="font-medium">{product.certNumber}</p>
                </div>
              )}
              {product.population && (
                <div>
                  <span className="text-sm text-gray-500">Population</span>
                  <p className="font-medium">{product.population.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <Card>
              <CardContent className="space-y-4 p-4">
                {product.quantity > 1 && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{quantity}</span>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
                        onClick={() =>
                          setQuantity((q) => Math.min(product.quantity, q + 1))
                        }
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {product.quantity} available
                    </span>
                  </div>
                )}

                <Button variant="gold" size="lg" className="w-full">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Ask Question
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Authenticity Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Insured Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="h-4 w-4 text-amber-600" />
                <span>Expert Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <div className="prose max-w-none">
                {product.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Category" value={product.category} />
                <DetailRow label="Year" value={product.year?.toString()} />
                <DetailRow label="Mint" value={product.mint} />
                <DetailRow label="Grade" value={product.grade} />
                <DetailRow label="Certification" value={product.certification} />
                <DetailRow label="Cert Number" value={product.certNumber} />
                <DetailRow label="Metal Type" value={product.metalType} />
                <DetailRow
                  label="Metal Weight"
                  value={product.metalWeight ? `${product.metalWeight} oz` : undefined}
                />
                <DetailRow
                  label="Purity"
                  value={product.metalPurity ? `${product.metalPurity * 100}%` : undefined}
                />
                <DetailRow
                  label="Population"
                  value={product.population?.toLocaleString()}
                />
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="mt-4">
              <div className="space-y-4">
                <p>
                  All orders are shipped via USPS Priority Mail with full
                  insurance. Orders over $500 ship free.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Processing time: 1-2 business days</li>
                  <li>Domestic shipping: 2-3 business days</li>
                  <li>International shipping: 7-14 business days</li>
                  <li>Signature required for orders over $250</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b py-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
