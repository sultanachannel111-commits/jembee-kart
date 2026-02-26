"use client";

export default function OrderTimeline({ status }: { status: string }) {
  const steps = [
    "INITIATED",
    "UNDER_REVIEW",
    "APPROVED",
    "PROCESSING",
    "SHIPPED",
  ];

  const currentIndex = steps.indexOf(status);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex-1 text-center">
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white text-sm font-bold
              ${
                index <= currentIndex
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              {index + 1}
            </div>

            <p className="text-xs mt-2">{step}</p>

            {index !== steps.length - 1 && (
              <div
                className={`h-1 mt-2 ${
                  index < currentIndex
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
