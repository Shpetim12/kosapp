"use client";

import Link from "next/link";
import { Bell, Home, Plus, Search, UserRound } from "lucide-react";
import type { UserRole } from "@/lib/types";

export function MobileBottomNav({ role }: { role?: UserRole }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 shadow-[0_-12px_35px_-25px_rgba(15,23,42,0.6)] backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        <Link href="/" className="grid min-h-12 place-items-center rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-brand-700">
          <Home size={20} />
        </Link>
        <Link href="/listings" className="grid min-h-12 place-items-center rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-brand-700">
          <Search size={20} />
        </Link>
        {role === "landlord" ? (
          <Link href="/dashboard/new" className="grid min-h-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-green-600/20">
            <Plus size={22} />
          </Link>
        ) : (
          <span />
        )}
        <Link href="/requests" className="grid min-h-12 place-items-center rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-brand-700">
          <Bell size={20} />
        </Link>
        <Link href="/profile" className="grid min-h-12 place-items-center rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-brand-700">
          <UserRound size={20} />
        </Link>
      </div>
    </nav>
  );
}
