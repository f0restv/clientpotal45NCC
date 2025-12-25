import Link from "next/link";
import {
  Coins,
  Shield,
  Truck,
  Award,
  TrendingUp,
  Users,
  ArrowRight,
  Gavel,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MetalTickerStatic } from "@/components/shop/metal-ticker";
import { ProductGrid } from "@/components/shop/product-grid";
import { Button } from "@/components/ui/button";

// Mock data - replace with actual data fetching
const featuredProducts = [
  {
    id: "1",
    title: "1921 Morgan Silver Dollar MS65",
    price: 285,
    images: [{ url: "/api/placeholder/400/400", alt: "Morgan Dollar" }],
    listingType: "BUY_NOW" as const,
    metalType: "SILVER",
    grade: "MS65",
    certification: "PCGS",
    status: "ACTIVE",
  },
  {
    id: "2",
    title: "1 oz American Gold Eagle 2024",
    price: 2450,
    images: [{ url: "/api/placeholder/400/400", alt: "Gold Eagle" }],
    listingType: "BUY_NOW" as const,
    metalType: "GOLD",
    status: "ACTIVE",
  },
  {
    id: "3",
    title: "1909-S VDB Lincoln Cent VF30",
    price: null,
    images: [{ url: "/api/placeholder/400/400", alt: "Lincoln Cent" }],
    listingType: "AUCTION" as const,
    grade: "VF30",
    certification: "NGC",
    auction: {
      currentBid: 1250,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 12,
    },
    status: "ACTIVE",
  },
  {
    id: "4",
    title: "10 oz Silver Bar - PAMP Suisse",
    price: 299,
    images: [{ url: "/api/placeholder/400/400", alt: "Silver Bar" }],
    listingType: "BUY_NOW" as const,
    metalType: "SILVER",
    status: "ACTIVE",
  },
  {
    id: "5",
    title: "1916-D Mercury Dime AG3",
    price: 895,
    images: [{ url: "/api/placeholder/400/400", alt: "Mercury Dime" }],
    listingType: "BUY_NOW" as const,
    grade: "AG3",
    status: "ACTIVE",
  },
  {
    id: "6",
    title: "2024 1 oz Platinum American Eagle",
    price: 1099,
    images: [{ url: "/api/placeholder/400/400", alt: "Platinum Eagle" }],
    listingType: "BUY_NOW" as const,
    metalType: "PLATINUM",
    status: "ACTIVE",
  },
];

const metalPrices = [
  { metal: "GOLD", spotPrice: 2350.50, change: 12.30, changePct: 0.53 },
  { metal: "SILVER", spotPrice: 28.45, change: -0.15, changePct: -0.52 },
  { metal: "PLATINUM", spotPrice: 985.00, change: 5.20, changePct: 0.53 },
  { metal: "PALLADIUM", spotPrice: 1045.00, change: -8.50, changePct: -0.81 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Metal Price Ticker */}
      <MetalTickerStatic prices={metalPrices} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your Trusted Source for{" "}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  Rare Coins & Bullion
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-300">
                Shop our curated collection of certified coins, precious metals,
                and collectibles. Sell with us through our easy consignment
                program with AI-powered valuations.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button variant="gold" size="lg" asChild>
                  <Link href="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/portal">Sell Your Coins</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 blur-3xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 p-8">
                      <Coins className="h-full w-full text-white/80" />
                    </div>
                    <div className="aspect-[4/3] rounded-2xl bg-gray-800 p-6">
                      <Award className="h-12 w-12 text-amber-400" />
                      <p className="mt-2 font-semibold text-white">
                        Certified Coins
                      </p>
                      <p className="text-sm text-gray-400">
                        PCGS & NGC Graded
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    <div className="aspect-[4/3] rounded-2xl bg-gray-800 p-6">
                      <Gavel className="h-12 w-12 text-purple-400" />
                      <p className="mt-2 font-semibold text-white">
                        Live Auctions
                      </p>
                      <p className="text-sm text-gray-400">Bid on rare items</p>
                    </div>
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 p-8">
                      <TrendingUp className="h-full w-full text-white/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <TrustBadge
              icon={<Shield className="h-6 w-6" />}
              title="100% Authentic"
              description="Guaranteed genuine"
            />
            <TrustBadge
              icon={<Truck className="h-6 w-6" />}
              title="Insured Shipping"
              description="Free over $500"
            />
            <TrustBadge
              icon={<Award className="h-6 w-6" />}
              title="Expert Grading"
              description="Professional evaluation"
            />
            <TrustBadge
              icon={<Users className="h-6 w-6" />}
              title="5000+ Collectors"
              description="Trusted community"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Items
              </h2>
              <p className="mt-1 text-gray-500">
                Hand-picked coins and collectibles
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/shop">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8">
            <ProductGrid products={featuredProducts} columns={3} />
          </div>
        </div>
      </section>

      {/* Sell With Us CTA */}
      <section className="bg-gradient-to-r from-amber-500 to-yellow-500 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Have Coins to Sell?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Our AI-powered valuation system gives you instant market estimates.
            Submit your items online and get paid fast with our streamlined
            consignment process.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-amber-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/portal/submit">
                Submit Items
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/consignment">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            How Consignment Works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <Step
              number={1}
              title="Submit Photos"
              description="Upload photos of your items through our easy portal"
            />
            <Step
              number={2}
              title="AI Valuation"
              description="Get instant market analysis and pricing estimates"
            />
            <Step
              number={3}
              title="Ship to Us"
              description="We provide insured shipping labels for your items"
            />
            <Step
              number={4}
              title="Get Paid"
              description="Receive payment within days of your item selling"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TrustBadge({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-600">
        {number}
      </div>
      <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}
