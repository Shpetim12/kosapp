import { listingStatuses } from "@/lib/constants";

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-[#e8b04b]/10 text-[#e8b04b]",
    pending_review: "bg-amber-500/10 text-amber-400",
    rejected: "bg-red-500/10 text-red-400",
    rented: "bg-white/5 text-[#a0a0b0]",
    expired: "bg-white/5 text-[#a0a0b0]"
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status] ?? styles.expired}`}>
      {listingStatuses[status] ?? status}
    </span>
  );
}
