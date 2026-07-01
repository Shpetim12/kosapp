import { ShieldCheck } from "lucide-react";

export function VerifiedBadge({ verified }: { verified?: boolean }) {
  if (!verified) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
      <ShieldCheck size={14} />
      I verifikuar
    </span>
  );
}
