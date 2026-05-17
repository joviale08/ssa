function Badge({ children, variant = "neutral" }) {
  const variants = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded-md text-xs font-medium
        ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export default Badge;