import { ShieldCheck } from "lucide-react";

export function VerifiedBadge({ verified }: { verified?: boolean }) {
  if (!verified) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#e8b04b]/10 border border-[#e8b04b] px-2 py-1 text-xs font-semibold text-[#e8b04b]">
      <ShieldCheck size={14} />
      I verifikuar
    </span>
  );
}
