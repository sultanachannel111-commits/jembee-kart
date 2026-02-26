export const getCustomerStatus = (status: string) => {
  switch (status) {
    case "INITIATED":
    case "UNDER_REVIEW":
      return { label: "Pending ⏳", color: "text-yellow-600" };

    case "APPROVED":
      return { label: "Confirmed ✅", color: "text-green-600" };

    case "PROCESSING":
      return { label: "Processing 🚚", color: "text-blue-600" };

    case "SHIPPED":
      return { label: "Shipped 📦", color: "text-purple-600" };

    case "REJECTED":
      return { label: "Cancelled ❌", color: "text-red-600" };

    case "EXPIRED":
      return { label: "Expired ❌", color: "text-red-600" };

    default:
      return { label: "Pending ⏳", color: "text-yellow-600" };
  }
};
