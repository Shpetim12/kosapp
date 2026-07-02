"use client";

import Link from "next/link";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-client";
import type { UserRole } from "@/lib/types";

export function UserMenu({ fullName, role }: { fullName: string; role?: UserRole }) {
  const router = useRouter();

  async function signOut() {
    await createBrowserSupabase().auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-white/15 bg-[#1a1a2e] px-3 py-2 text-sm font-semibold text-white hover:border-[#e8b04b]">
        <UserRound size={16} />
        <span className="max-w-28 truncate sm:max-w-40">{fullName}</span>
        <ChevronDown size={15} className="transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-md border border-white/8 bg-[#0f0f1a] py-1 shadow-lg">
        <Link href="/profile" className="block px-3 py-2 text-sm text-[#a0a0b0] hover:bg-white/5 hover:text-white">
          Profili
        </Link>
        {role === "landlord" ? (
          <Link href="/dashboard" className="block px-3 py-2 text-sm text-[#a0a0b0] hover:bg-white/5 hover:text-white">
            Shpalljet e mia
          </Link>
        ) : (
          <Link href="/listings" className="block px-3 py-2 text-sm text-[#a0a0b0] hover:bg-white/5 hover:text-white">
            Shiko banesat
          </Link>
        )}
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#a0a0b0] hover:bg-white/5 hover:text-white"
        >
          <LogOut size={15} />
          Dilni
        </button>
      </div>
    </details>
  );
}
