"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  DollarSign,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface Submission {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  images: { url: string }[];
  estimatedValue?: number | null;
  suggestedPrice?: number | null;
  reviewNotes?: string | null;
}

interface SubmissionsListProps {
  submissions: Submission[];
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending Review",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-4 w-4" />,
  },
  RECEIVED: {
    label: "Received",
    color: "bg-blue-100 text-blue-800",
    icon: <Package className="h-4 w-4" />,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "bg-purple-100 text-purple-800",
    icon: <Clock className="h-4 w-4" />,
  },
  APPROVED: {
    label: "Approved",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  LISTED: {
    label: "Listed for Sale",
    color: "bg-amber-100 text-amber-800",
    icon: <DollarSign className="h-4 w-4" />,
  },
  SOLD: {
    label: "Sold",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  RETURNED: {
    label: "Returned",
    color: "bg-gray-100 text-gray-800",
    icon: <Package className="h-4 w-4" />,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="h-4 w-4" />,
  },
};

export function SubmissionsList({ submissions }: SubmissionsListProps) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12">
          <Package className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No submissions yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Submit your first item to get started
          </p>
          <Link
            href="/portal/submit"
            className="mt-4 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            Submit an Item
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const status = statusConfig[submission.status] || statusConfig.PENDING;

        return (
          <Link key={submission.id} href={`/portal/submissions/${submission.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                {/* Image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {submission.images[0] ? (
                    <Image
                      src={submission.images[0].url}
                      alt={submission.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {submission.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Submitted {formatDate(submission.createdAt)}
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <Badge className={cn("gap-1", status.color)}>
                      {status.icon}
                      {status.label}
                    </Badge>

                    {submission.suggestedPrice && (
                      <span className="text-sm text-gray-600">
                        Est. {formatCurrency(submission.suggestedPrice)}
                      </span>
                    )}
                  </div>

                  {submission.reviewNotes && submission.status === "REJECTED" && (
                    <div className="mt-2 flex items-start gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{submission.reviewNotes}</span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

// Submission detail card for the detail page
export function SubmissionDetail({ submission }: { submission: Submission & {
  description?: string;
  category?: string;
  aiAnalysis?: Record<string, unknown>;
} }) {
  const status = statusConfig[submission.status] || statusConfig.PENDING;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={cn("rounded-lg p-4", status.color)}>
        <div className="flex items-center gap-2">
          {status.icon}
          <span className="font-medium">{status.label}</span>
        </div>
        {submission.reviewNotes && (
          <p className="mt-2 text-sm opacity-90">{submission.reviewNotes}</p>
        )}
      </div>

      {/* Images */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {submission.images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
          >
            <Image
              src={image.url}
              alt={`${submission.title} - Image ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Details */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <span className="text-sm text-gray-500">Title</span>
            <p className="font-medium">{submission.title}</p>
          </div>

          {submission.category && (
            <div>
              <span className="text-sm text-gray-500">Category</span>
              <p className="font-medium">{submission.category}</p>
            </div>
          )}

          {submission.description && (
            <div>
              <span className="text-sm text-gray-500">Description</span>
              <p className="text-gray-700">{submission.description}</p>
            </div>
          )}

          <div className="flex gap-8">
            {submission.estimatedValue && (
              <div>
                <span className="text-sm text-gray-500">Your Estimate</span>
                <p className="font-medium">
                  {formatCurrency(submission.estimatedValue)}
                </p>
              </div>
            )}

            {submission.suggestedPrice && (
              <div>
                <span className="text-sm text-gray-500">Our Suggested Price</span>
                <p className="text-lg font-bold text-amber-600">
                  {formatCurrency(submission.suggestedPrice)}
                </p>
              </div>
            )}
          </div>

          <div>
            <span className="text-sm text-gray-500">Submitted</span>
            <p className="font-medium">{formatDate(submission.createdAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
