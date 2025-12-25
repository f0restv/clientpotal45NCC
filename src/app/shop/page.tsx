import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MetalTicker } from "@/components/shop/metal-ticker";
import { CategoryNav, CategorySidebar } from "@/components/shop/category-nav";
import { ProfileHeader } from "@/components/shop/profile-header";
import { ProductGrid } from "@/components/shop/product-grid";

// Mock data - replace with actual data fetching
const shopProfile = {
  shopName: "CoinVault",
  shopHandle: "coinvault",
  bio: "Premium coins, bullion, and collectibles. Trusted by collectors since 2024. We specialize in certified US coins, world coins, and precious metals.",
  avatarUrl: "/api/placeholder/150/150",
  stats: {
    posts: 1250,
    followers: 5420,
    sales: 3200,
  },
  verified: true,
};

const products = [
  {
    id: "1",
    title: "1921 Morgan Silver Dollar MS65",
    price: 285,
    images: [{ url: "/api/placeholder/400/400" }],
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
    images: [{ url: "/api/placeholder/400/400" }],
    listingType: "BUY_NOW" as const,
    metalType: "GOLD",
    status: "ACTIVE",
  },
  {
    id: "3",
    title: "1909-S VDB Lincoln Cent VF30",
    price: null,
    images: [{ url: "/api/placeholder/400/400" }],
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
    images: [{ url: "/api/placeholder/400/400" }],
    listingType: "BUY_NOW" as const,
    metalType: "SILVER",
    status: "ACTIVE",
  },
  {
    id: "5",
    title: "1916-D Mercury Dime AG3",
    price: 895,
    images: [{ url: "/api/placeholder/400/400" }],
    listingType: "BUY_NOW" as const,
    grade: "AG3",
    status: "ACTIVE",
  },
  {
    id: "6",
    title: "2024 1 oz Platinum American Eagle",
    price: 1099,
    images: [{ url: "/api/placeholder/400/400" }],
    listingType: "BUY_NOW" as const,
    metalType: "PLATINUM",
    status: "ACTIVE",
  },
  {
    id: "7",
    title: "1881-S Morgan Dollar MS66",
    price: null,
    images: [{ url: "/api/placeholder/400/400" }],
    listingType: "AUCTION" as const,
    grade: "MS66",
    certification: "PCGS",
    auction: {
      currentBid: 425,
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      bidCount: 8,
    },
    status: "ACTIVE",
  },
  {
    id: "8",
    title: "5 oz Silver Round - Buffalo",
    price: 149,
    images: [{ url: "/api/placeholder/400/400" }],
    listingType: "BUY_NOW" as const,
    metalType: "SILVER",
    status: "ACTIVE",
  },
  {
    id: "9",
    title: "1893-S Morgan Dollar VG8",
    price: 4500,
    images: [{ url: "/api/placeholder/400/400" }],
    listingType: "BUY_NOW" as const,
    grade: "VG8",
    certification: "NGC",
    status: "ACTIVE",
  },
];

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MetalTicker />

      {/* Instagram-style Profile Header */}
      <ProfileHeader {...shopProfile} />

      {/* Category Navigation */}
      <CategoryNav />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-8">
          {/* Sidebar - Hidden on mobile */}
          <CategorySidebar />

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid products={products} columns={3} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
