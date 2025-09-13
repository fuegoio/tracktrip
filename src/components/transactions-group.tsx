import { Transaction } from "./transaction";

export const TransactionsGroup = () => {
  return (
    <div className="mt-4">
      <div className="px-2 text-slate-500 text-xs mb-2">
        13th September 2025
      </div>

      <div className="space-y-1">
        <Transaction />
        <Transaction />
        <Transaction />
        <Transaction />
      </div>
    </div>
  );
};
