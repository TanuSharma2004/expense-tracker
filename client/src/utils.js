// Change "INR"/"en-IN" here to switch currency everywhere
export const inr = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

// Today's date as YYYY-MM-DD in local time
export const today = () => new Date().toLocaleDateString("sv-SE");