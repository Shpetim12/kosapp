"use client";

import Link from "next/link";
import { Bell, Home, Plus, Search, UserRound } from "lucide-react";
import type { UserRole } from "@/lib/types";

export function MobileBottomNav({ role }: { role?: UserRole }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/6 bg-[#0f0f1a]/95 px-3 py-2 shadow-[0_-12px_35px_-25px_rgba(0,0,0,0.6)] backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        <Link href="/" className="grid min-h-12 place-items-center rounded-2xl text-[#a0a0b0] hover:bg-white/5 hover:text-[#e8b04b]">
          <Home size={20} />
        </Link>
        <Link href="/listings" className="grid min-h-12 place-items-center rounded-2xl text-[#a0a0b0] hover:bg-white/5 hover:text-[#e8b04b]">
          <Search size={20} />
        </Link>
        {role === "landlord" ? (
          <Link href="/dashboard/new" className="grid min-h-12 place-items-center rounded-2xl bg-[#e8b04b] text-[#0f0f1a] shadow-lg shadow-[#e8b04b]/20">
            <Plus size={22} />
          </Link>
        ) : (
          <span />
        )}
        <Link href="/requests" className="grid min-h-12 place-items-center rounded-2xl text-[#a0a0b0] hover:bg-white/5 hover:text-[#e8b04b]">
          <Bell size={20} />
        </Link>
        <Link href="/profile" className="grid min-h-12 place-items-center rounded-2xl text-[#a0a0b0] hover:bg-white/5 hover:text-[#e8b04b]">
          <UserRound size={20} />
        </Link>
      </div>
    </nav>
  );
}
