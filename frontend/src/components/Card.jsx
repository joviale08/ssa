function Card({ children, title }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      {title && (
        <h2 className="mb-3 text-base font-semibold text-slate-800">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export default Card;