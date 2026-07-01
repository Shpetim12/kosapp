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
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:border-brand-600">
        <UserRound size={16} />
        <span className="max-w-28 truncate sm:max-w-40">{fullName}</span>
        <ChevronDown size={15} className="transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
        <Link href="/profile" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Profili
        </Link>
        {role === "landlord" ? (
          <Link href="/dashboard" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Shpalljet e mia
          </Link>
        ) : (
          <Link href="/listings" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Shiko banesat
          </Link>
        )}
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          <LogOut size={15} />
          Dilni
        </button>
      </div>
    </details>
  );
}
