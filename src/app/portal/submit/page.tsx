"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SubmissionForm } from "@/components/portal/submission-form";

export default function SubmitPage() {
  const router = useRouter();

  // In production, get user from session
  const user = {
    name: "John Collector",
    email: "john@example.com",
    image: null,
    role: "CLIENT",
  };

  const handleSubmit = async (data: {
    title: string;
    description: string;
    category: string;
    estimatedValue?: number;
    images: string[];
  }) => {
    // In production, this would submit to the API
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push("/portal/submissions");
    } else {
      throw new Error("Submission failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Submit an Item</h1>
          <p className="mt-1 text-gray-500">
            Upload photos and details for consignment or sale
          </p>
        </div>

        <SubmissionForm onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
