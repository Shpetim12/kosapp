import { listingStatuses } from "@/lib/constants";

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-brand-50 text-brand-700",
    pending_review: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700",
    rented: "bg-slate-100 text-slate-700",
    expired: "bg-slate-100 text-slate-700"
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status] ?? styles.expired}`}>
      {listingStatuses[status] ?? status}
    </span>
  );
}
