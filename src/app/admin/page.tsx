import Link from "next/link";
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Gavel,
  FileText,
  Settings,
  Upload,
  Globe,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

// Mock data
const stats = {
  totalProducts: 1250,
  activeListings: 890,
  totalSales: 125430,
  pendingSubmissions: 12,
  activeAuctions: 8,
  totalClients: 342,
};

const recentSubmissions = [
  { id: "1", title: "1921 Morgan Dollar", client: "John D.", status: "PENDING", createdAt: new Date() },
  { id: "2", title: "Gold Eagle Collection", client: "Sarah M.", status: "UNDER_REVIEW", createdAt: new Date() },
  { id: "3", title: "Silver Bar Lot", client: "Mike R.", status: "PENDING", createdAt: new Date() },
];

const recentSales = [
  { id: "1", title: "1909-S VDB Lincoln Cent", amount: 1250, platform: "Website", date: new Date() },
  { id: "2", title: "10 oz Silver Bar", amount: 299, platform: "eBay", date: new Date() },
  { id: "3", title: "1921 Morgan MS65", amount: 285, platform: "Website", date: new Date() },
];

export default function AdminDashboard() {
  const user = {
    name: "Admin User",
    email: "admin@coinvault.com",
    role: "ADMIN",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              Coin<span className="text-amber-600">Vault</span>
            </Link>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/admin" className="text-sm font-medium text-amber-600">
              Dashboard
            </Link>
            <Link href="/admin/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Products
            </Link>
            <Link href="/admin/submissions" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Submissions
            </Link>
            <Link href="/admin/auctions" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Auctions
            </Link>
            <Link href="/admin/integrations" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Integrations
            </Link>
          </nav>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/products/new">
                <Upload className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
            <Button variant="gold" asChild>
              <Link href="/admin/sync">
                <Globe className="mr-2 h-4 w-4" />
                Sync Platforms
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Total Products"
            value={stats.totalProducts.toLocaleString()}
            icon={<Package className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Active Listings"
            value={stats.activeListings.toLocaleString()}
            icon={<TrendingUp className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Total Sales"
            value={formatCurrency(stats.totalSales)}
            icon={<DollarSign className="h-5 w-5" />}
            color="amber"
          />
          <StatCard
            title="Pending Reviews"
            value={stats.pendingSubmissions.toString()}
            icon={<FileText className="h-5 w-5" />}
            color="purple"
            alert
          />
          <StatCard
            title="Active Auctions"
            value={stats.activeAuctions.toString()}
            icon={<Gavel className="h-5 w-5" />}
            color="pink"
          />
          <StatCard
            title="Total Clients"
            value={stats.totalClients.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
            color="cyan"
          />
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Pending Submissions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pending Submissions</CardTitle>
              <Link href="/admin/submissions" className="text-sm text-amber-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{sub.title}</p>
                      <p className="text-sm text-gray-500">by {sub.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={sub.status === "PENDING" ? "secondary" : "default"}
                      >
                        {sub.status}
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/submissions/${sub.id}`}>Review</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Sales</CardTitle>
              <Link href="/admin/sales" className="text-sm text-amber-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{sale.title}</p>
                      <p className="text-sm text-gray-500">{sale.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(sale.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(sale.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              href="/admin/products"
              icon={<Package className="h-6 w-6" />}
              title="Manage Products"
              description="Edit listings, prices, and inventory"
            />
            <QuickActionCard
              href="/admin/crosslist"
              icon={<Globe className="h-6 w-6" />}
              title="Cross-List Items"
              description="Post to eBay, Etsy, and more"
            />
            <QuickActionCard
              href="/admin/auctions/new"
              icon={<Gavel className="h-6 w-6" />}
              title="Create Auction"
              description="Set up a new auction event"
            />
            <QuickActionCard
              href="/admin/reports"
              icon={<BarChart3 className="h-6 w-6" />}
              title="View Reports"
              description="Sales analytics and insights"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  alert,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  alert?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
    cyan: "bg-cyan-100 text-cyan-600",
  };

  return (
    <Card className={alert ? "border-amber-300 bg-amber-50" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{title}</span>
          <div className={`rounded-full p-2 ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        <p className="mt-2 text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex items-start gap-4 p-4">
          <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
            {icon}
          </div>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
