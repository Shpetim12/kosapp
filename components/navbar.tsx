"use client";

import Link from "next/link";
import { Home, LayoutDashboard, Menu, Search, ShieldCheck, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/user-menu";
import type { UserRole } from "@/lib/types";

type NavbarProps = {
  user: { email: string; name: string } | null;
  role?: UserRole;
  isAdmin: boolean;
};

export function Navbar({ user, role, isAdmin }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = (
    <>
      <Link href="/listings" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
        Kërko
      </Link>
      <Link href="/#si-funksionon" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
        Si funksionon
      </Link>
      {role === "landlord" ? (
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          <LayoutDashboard size={16} />
          Paneli
        </Link>
      ) : null}
      {isAdmin ? (
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          <ShieldCheck size={16} />
          Admin
        </Link>
      ) : null}
    </>
  );

  return (
    <header className={`sticky top-0 z-40 bg-[#0f0f1a]/80 backdrop-blur-md transition-all ${scrolled ? "border-b border-white/6 shadow-sm" : "border-b border-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-white">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8b04b] text-[#0f0f1a] shadow-lg shadow-[#e8b04b]/20">
            <Home size={19} />
          </span>
          Strehë
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">{links}</nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <UserMenu fullName={user.name} role={role} />
          ) : (
            <>
              <Link href="/login" className="button-secondary px-4 py-2">Hyr</Link>
              <Link href="/signup" className="button-primary px-4 py-2">Regjistrohu</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-[#1a1a2e] text-white shadow-sm lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Hap menunë"
        >
          <Menu size={22} />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside
            className="absolute right-0 top-0 flex h-dvh w-[86vw] max-w-sm flex-col bg-[#0f0f1a] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-lg font-black text-white" onClick={() => setOpen(false)}>
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8b04b] text-[#0f0f1a]">
                  <Home size={19} />
                </span>
                Strehë
              </Link>
              <button className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15" onClick={() => setOpen(false)} aria-label="Mbyll menunë">
                <X size={20} />
              </button>
            </div>

            <nav className="grid gap-2">
              <Link href="/listings" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-2xl px-4 font-semibold text-white hover:bg-white/5">
                <Search size={18} /> Kërko
              </Link>
              <Link href="/#si-funksionon" onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-2xl px-4 font-semibold text-white hover:bg-white/5">
                Si funksionon
              </Link>
              {role === "landlord" ? (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-2xl px-4 font-semibold text-white hover:bg-white/5">
                  <LayoutDashboard size={18} /> Paneli im
                </Link>
              ) : null}
              {isAdmin ? (
                <Link href="/admin" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-2xl px-4 font-semibold text-white hover:bg-white/5">
                  <ShieldCheck size={18} /> Admin
                </Link>
              ) : null}
            </nav>

            <div className="mt-auto border-t border-white/6 pt-5">
              {user ? (
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[#e8b04b] font-bold text-[#0f0f1a]">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{user.name}</p>
                    <p className="truncate text-xs text-[#a0a0b0]">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link href="/login" className="button-secondary w-full" onClick={() => setOpen(false)}>Hyr</Link>
                  <Link href="/signup" className="button-primary w-full" onClick={() => setOpen(false)}>Regjistrohu</Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
