"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  total: number;
  dueDate?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: "Draft",
    color: "bg-gray-100 text-gray-800",
    icon: <FileText className="h-4 w-4" />,
  },
  SENT: {
    label: "Sent",
    color: "bg-blue-100 text-blue-800",
    icon: <FileText className="h-4 w-4" />,
  },
  VIEWED: {
    label: "Viewed",
    color: "bg-purple-100 text-purple-800",
    icon: <Eye className="h-4 w-4" />,
  },
  PAID: {
    label: "Paid",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  OVERDUE: {
    label: "Overdue",
    color: "bg-red-100 text-red-800",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-500",
    icon: <FileText className="h-4 w-4" />,
  },
};

const typeLabels: Record<string, string> = {
  CONSIGNMENT_SALE: "Consignment Sale",
  PURCHASE: "Purchase",
  LISTING_FEES: "Listing Fees",
  PAYOUT: "Payout",
};

export function InvoiceList({ invoices }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12">
          <FileText className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No invoices yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Invoices will appear here after sales or services
          </p>
        </CardContent>
      </Card>
    );
  }

  // Summary stats
  const pendingAmount = invoices
    .filter((inv) => ["SENT", "VIEWED", "OVERDUE"].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total, 0);

  const paidAmount = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Outstanding Balance</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(paidAmount)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {invoices.map((invoice) => {
              const status = statusConfig[invoice.status] || statusConfig.DRAFT;
              const isPending = ["SENT", "VIEWED", "OVERDUE"].includes(
                invoice.status
              );

              return (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        invoice.status === "PAID"
                          ? "bg-green-100"
                          : invoice.status === "OVERDUE"
                          ? "bg-red-100"
                          : "bg-gray-100"
                      )}
                    >
                      {status.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{invoice.invoiceNumber}</span>
                        <Badge className={cn("text-xs", status.color)}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {typeLabels[invoice.type] || invoice.type} &middot;{" "}
                        {formatDate(invoice.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-semibold",
                          invoice.type === "PAYOUT"
                            ? "text-green-600"
                            : "text-gray-900"
                        )}
                      >
                        {invoice.type === "PAYOUT" ? "+" : ""}
                        {formatCurrency(Math.abs(invoice.total))}
                      </p>
                      {invoice.dueDate && !invoice.paidAt && (
                        <p className="text-xs text-gray-500">
                          Due {formatDate(invoice.dueDate)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/portal/invoices/${invoice.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      {isPending && (
                        <Button variant="gold" size="sm" asChild>
                          <Link href={`/portal/invoices/${invoice.id}/pay`}>
                            <CreditCard className="mr-1 h-4 w-4" />
                            Pay
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Single invoice detail view
export function InvoiceDetail({
  invoice,
}: {
  invoice: Invoice & {
    lineItems: Array<{ description: string; amount: number; quantity?: number }>;
    subtotal: number;
    fees: number;
    credits: number;
    notes?: string;
  };
}) {
  const status = statusConfig[invoice.status] || statusConfig.DRAFT;
  const isPending = ["SENT", "VIEWED", "OVERDUE"].includes(invoice.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
          <Badge className={cn("mt-2", status.color)}>{status.label}</Badge>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{formatCurrency(invoice.total)}</p>
          {invoice.dueDate && !invoice.paidAt && (
            <p className="text-sm text-gray-500">
              Due {formatDate(invoice.dueDate)}
            </p>
          )}
        </div>
      </div>

      {/* Line Items */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">
                    {item.description}
                    {item.quantity && item.quantity > 1 && (
                      <span className="text-gray-500"> x{item.quantity}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-gray-50">
              <tr>
                <td className="px-4 py-2 text-sm text-gray-500">Subtotal</td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>
              {invoice.fees > 0 && (
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-500">Fees</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(invoice.fees)}
                  </td>
                </tr>
              )}
              {invoice.credits > 0 && (
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-500">Credits</td>
                  <td className="px-4 py-2 text-right text-green-600">
                    -{formatCurrency(invoice.credits)}
                  </td>
                </tr>
              )}
              <tr className="text-lg font-bold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(invoice.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium">Notes</h3>
            <p className="mt-2 text-sm text-gray-600">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isPending && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">Payment Required</h3>
              <p className="text-sm text-gray-600">
                Pay securely with credit card or bank transfer
              </p>
            </div>
            <Button variant="gold" size="lg">
              <CreditCard className="mr-2 h-5 w-5" />
              Pay {formatCurrency(invoice.total)}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
