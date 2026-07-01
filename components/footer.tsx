import Link from "next/link";
import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-2 text-lg font-black text-slate-950">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white">
              <Home size={19} />
            </span>
            KosBanesa
          </Link>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Shpallje të verifikuara, çmime transparente dhe kontakt i kontrolluar për qira më të sigurta në Kosovë.
          </p>
        </div>
        <nav className="grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-3 md:items-start">
          <Link href="/#si-funksionon" className="hover:text-brand-700">Si funksionon</Link>
          <Link href="/dashboard/new" className="hover:text-brand-700">Publiko</Link>
          <Link href="/profile" className="hover:text-brand-700">Kontakt</Link>
        </nav>
      </div>
      <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-500">
        © 2026 KosBanesa
      </div>
    </footer>
  );
}
