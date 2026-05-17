function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  fullWidth = false,
  onClick,
}) {
  const base =
    "min-h-[44px] px-4 rounded-lg font-medium transition-colors " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}

export default Button;