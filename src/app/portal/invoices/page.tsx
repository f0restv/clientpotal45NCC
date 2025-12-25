import { Header } from "@/components/layout/header";
import { InvoiceList } from "@/components/portal/invoice-list";

// Mock data
const invoices = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001234",
    type: "PAYOUT",
    status: "PAID",
    total: 1250.0,
    paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-001235",
    type: "CONSIGNMENT_SALE",
    status: "SENT",
    total: 45.0,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-001236",
    type: "PAYOUT",
    status: "PAID",
    total: 850.0,
    paidAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function InvoicesPage() {
  const user = {
    name: "John Collector",
    email: "john@example.com",
    image: null,
    role: "CLIENT",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-gray-500">
            View your payments, fees, and transaction history
          </p>
        </div>

        <InvoiceList invoices={invoices} />
      </main>
    </div>
  );
}
