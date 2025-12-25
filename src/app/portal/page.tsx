import Link from "next/link";
import {
  Package,
  FileText,
  Plus,
  TrendingUp,
  DollarSign,
  Clock,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmissionsList } from "@/components/portal/submissions-list";

// Mock data - replace with actual data fetching
const stats = {
  activeSubmissions: 3,
  itemsSold: 12,
  totalEarnings: 4250.0,
  pendingPayout: 850.0,
};

const recentSubmissions = [
  {
    id: "1",
    title: "1921 Morgan Silver Dollar",
    status: "LISTED",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    images: [{ url: "/api/placeholder/100/100" }],
    suggestedPrice: 285,
  },
  {
    id: "2",
    title: "1909-S VDB Lincoln Cent",
    status: "UNDER_REVIEW",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    images: [{ url: "/api/placeholder/100/100" }],
    estimatedValue: 1500,
  },
  {
    id: "3",
    title: "Mixed Silver Coins Lot",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    images: [{ url: "/api/placeholder/100/100" }],
  },
];

export default function PortalPage() {
  // In production, get user from session
  const user = {
    name: "John Collector",
    email: "john@example.com",
    image: null,
    role: "CLIENT",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name?.split(" ")[0]}!
            </h1>
            <p className="text-gray-500">
              Manage your submissions and track your sales
            </p>
          </div>
          <Button variant="gold" asChild>
            <Link href="/portal/submit">
              <Plus className="mr-2 h-4 w-4" />
              Submit New Item
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Submissions"
            value={stats.activeSubmissions.toString()}
            icon={<Package className="h-5 w-5" />}
            trend="+2 this month"
          />
          <StatCard
            title="Items Sold"
            value={stats.itemsSold.toString()}
            icon={<TrendingUp className="h-5 w-5" />}
            trend="+5 this month"
          />
          <StatCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend="+$1,250 this month"
          />
          <StatCard
            title="Pending Payout"
            value={`$${stats.pendingPayout.toLocaleString()}`}
            icon={<Clock className="h-5 w-5" />}
            description="Processing..."
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <QuickAction
            href="/portal/submit"
            icon={<Plus className="h-6 w-6" />}
            title="Submit Items"
            description="Upload photos for consignment"
          />
          <QuickAction
            href="/portal/submissions"
            icon={<Package className="h-6 w-6" />}
            title="My Submissions"
            description="Track your items"
          />
          <QuickAction
            href="/portal/invoices"
            icon={<FileText className="h-6 w-6" />}
            title="Invoices"
            description="View payments & fees"
          />
        </div>

        {/* Recent Submissions */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Submissions
            </h2>
            <Link
              href="/portal/submissions"
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              View all
            </Link>
          </div>
          <div className="mt-4">
            <SubmissionsList submissions={recentSubmissions} />
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
  trend,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{title}</span>
          <div className="rounded-full bg-amber-100 p-2 text-amber-600">
            {icon}
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        {trend && (
          <p className="mt-1 text-xs text-green-600">{trend}</p>
        )}
        {description && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickAction({
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
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full bg-amber-100 p-3 text-amber-600">
            {icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
