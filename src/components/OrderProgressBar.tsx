"use client";

export default function OrderProgressBar({ status }: { status: string }) {
  const statusPercent: any = {
    INITIATED: 10,
    UNDER_REVIEW: 25,
    APPROVED: 40,
    PROCESSING: 70,
    SHIPPED: 100,
  };

  return (
    <div className="mt-4">
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 transition-all duration-700"
          style={{ width: `${statusPercent[status] || 0}%` }}
        />
      </div>
    </div>
  );
}
