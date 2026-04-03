export const formatDeliveryDate = (date) => {
  if (!date) return "";

  const d = date.toDate ? date.toDate() : new Date(date);

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
};
