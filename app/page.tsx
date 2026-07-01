import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, LockKeyhole, Search, ShieldCheck, Sparkles } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";
import { ListingCard } from "@/components/listing-card";
import { cities } from "@/lib/constants";
import type { ListingWithPhotos } from "@/lib/types";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data: listings } = await supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);
  const landlordIds = Array.from(new Set((listings ?? []).map((listing: any) => listing.landlord_id)));
  const { data: landlords } = landlordIds.length
    ? await supabase.from("landlord_public_profiles").select("id, is_verified_landlord").in("id", landlordIds)
    : { data: [] };
  const landlordById = new Map((landlords ?? []).map((landlord: any) => [landlord.id, landlord]));
  const listingCards = (listings ?? []).map((listing: any) => ({
    ...listing,
    profiles: landlordById.get(listing.landlord_id) ?? null
  })) as ListingWithPhotos[];

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-white">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(22,163,74,0.18),transparent_34rem)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white/80 px-4 py-2 text-sm font-bold text-brand-700 shadow-sm">
              <Sparkles size={16} />
              Qira më të sigurta në Kosovë
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Gjej banesën tënde në Kosovë
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Shpallje të verifikuara. Çmime transparente. Pa mashtrime.
            </p>
          </div>

          <form action="/listings" className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-3xl border border-white bg-white/90 p-3 shadow-2xl shadow-green-900/10 backdrop-blur sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Qyteti</span>
              <select name="city" className="field h-14 rounded-2xl border-slate-100 pl-11">
                <option value="">Zgjidh qytetin</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </label>
            <button className="button-primary h-14 rounded-2xl px-7">
              Kërko banesa
              <ArrowRight size={18} />
            </button>
          </form>

          <div id="si-funksionon" className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Të verifikuara", text: "Qiradhënësit dhe shpalljet kontrollohen para publikimit." },
              { icon: ClipboardCheck, title: "Miratim manual", text: "Çdo shpallje fillon në shqyrtim para se të dalë live." },
              { icon: LockKeyhole, title: "Kontakt me kontroll", text: "Kërkesat për kontakt krijojnë më shumë përgjegjësi dhe më pak spam." }
            ].map((item) => (
              <div key={item.title} className="surface-card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <item.icon size={22} />
                </div>
                <h2 className="text-lg font-black text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Të fundit</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">Shpalljet e fundit</h2>
          </div>
          <Link href="/listings" className="button-secondary hidden sm:inline-flex">
            Të gjitha
          </Link>
        </div>
        {listingCards.length ? (
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {listingCards.map((listing) => (
              <div key={listing.id} className="w-[82vw] max-w-sm flex-none snap-start sm:w-auto sm:max-w-none">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        ) : (
          <div className="focus-card p-10 text-center">
            <CheckCircle2 className="mx-auto text-brand-600" size={34} />
            <h3 className="mt-4 text-xl font-black text-slate-950">Shpalljet aktive do të shfaqen këtu</h3>
            <p className="mt-2 text-sm text-slate-600">Pas miratimit nga admini, banesat e reja dalin live në këtë seksion.</p>
          </div>
        )}
      </section>
    </main>
  );
}
