import { CategoryBadge } from "./category-badge";

export const Transaction = () => {
  return (
    <div className="flex items-center gap-4 h-10 rounded bg-gray-50 px-3">
      <CategoryBadge />
      <div className="text-xs font-medium text-slate-800">AirBnB</div>
      <div className="text-xs text-slate-400">New Castle</div>
      <div className="flex-1" />
      <div className="text-xs font-mono text-slate-800">120.00€</div>
    </div>
  );
};
