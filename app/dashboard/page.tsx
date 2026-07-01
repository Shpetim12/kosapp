import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock3, Home, Plus, ReceiptText } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";
import { StatusPill } from "@/components/status-pill";
import type { Listing, Profile } from "@/lib/types";

export default async function DashboardPage({ searchParams }: { searchParams: { created?: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if ((profile as Profile | null)?.role !== "landlord") {
    redirect("/listings");
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("landlord_id", user.id)
    .order("created_at", { ascending: false });

  const items = (listings ?? []) as Listing[];
  const stats = [
    { label: "Gjithsej", value: items.length, icon: ReceiptText },
    { label: "Aktive", value: items.filter((item) => item.status === "active").length, icon: CheckCircle2 },
    { label: "Në pritje", value: items.filter((item) => item.status === "pending_review").length, icon: Clock3 },
    { label: "E dhënë", value: items.filter((item) => item.status === "rented").length, icon: Home }
  ];

  return (
    <main className="page-shell">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-brand-700">Paneli im</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 sm:text-4xl">Menaxho shpalljet</h1>
          <p className="mt-2 text-sm text-slate-600">Shiko statusin, kërkesat dhe publikimet e tua.</p>
        </div>
        <Link href="/dashboard/new" className="button-primary">
          <Plus size={18} /> Shto shpallje
        </Link>
      </div>

      {searchParams.created === "1" ? (
        <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm font-bold text-brand-800">
          Shpallja juaj është dërguar për shqyrtim. Do njoftoheni kur të aprovohet.
        </div>
      ) : null}

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              <stat.icon size={20} className="text-brand-600" />
            </div>
            <p className="mt-4 text-3xl font-black text-slate-950">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="surface-card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-black text-slate-950">Shpalljet e tua</h2>
        </div>
        {items.length ? (
          <div className="divide-y divide-slate-100">
            {items.map((listing) => (
              <div key={listing.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-950">{listing.title}</h3>
                    <StatusPill status={listing.status} />
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {listing.city}, {listing.neighborhood} · {listing.price} €/muaj · {listing.bedrooms} dhoma
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(listing.created_at).toLocaleDateString("sq-AL")}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/listings/${listing.id}`} className="button-secondary px-4 py-2">Shiko</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Home className="mx-auto text-brand-600" size={36} />
            <h3 className="mt-4 text-xl font-black text-slate-950">Nuk ke ende shpallje</h3>
            <p className="mt-2 text-sm text-slate-600">Krijo shpalljen e parë kur të jesh gati.</p>
          </div>
        )}
      </section>
    </main>
  );
}
