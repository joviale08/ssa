function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full min-h-11 px-3 rounded-lg border bg-white
          text-slate-800 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-400" : "border-slate-300"}`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default Input;