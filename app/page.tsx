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
      <section className="relative overflow-hidden bg-[#0f0f1a]">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_center,rgba(232,176,75,0.08),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#e8b04b]/30 bg-[#1a1a2e] px-4 py-2 text-sm font-bold text-[#e8b04b] shadow-sm">
              <Sparkles size={16} />
              Platformë e verifikuar për Kosovë
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
              Gjej strehën tënde
              <br />
              <span className="text-[#e8b04b]">në Kosovë.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#a0a0b0]">
              Shpallje të verifikuara. Çmime transparente. Pa mashtrime.
            </p>
          </div>

          <form action="/listings" className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-3xl border border-white/10 bg-[#1a1a2e] p-2 shadow-2xl shadow-[#e8b04b]/5 backdrop-blur sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Qyteti</span>
              <select name="city" className="field h-14 rounded-2xl border-white/10 pl-11">
                <option value="">Zgjidh qytetin</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0b0]" size={18} />
            </label>
            <button className="button-primary h-14 rounded-2xl px-7">
              Kërko
              <ArrowRight size={18} />
            </button>
          </form>

          <div id="si-funksionon" className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Të verifikuara", text: "Qiradhënësit dhe shpalljet kontrollohen para publikimit." },
              { icon: ClipboardCheck, title: "Miratim manual", text: "Çdo shpallje fillon në shqyrtim para se të dalë live." },
              { icon: LockKeyhole, title: "Kontakt me kontroll", text: "Kërkesat për kontakt krijojnë më shumë përgjegjësi dhe më pak spam." }
            ].map((item) => (
              <div key={item.title} className="surface-card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#e8b04b]/40">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#e8b04b]/10 text-[#e8b04b]">
                  <item.icon size={22} />
                </div>
                <h2 className="text-lg font-black text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#a0a0b0]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 bg-[#0f0f1a]">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#e8b04b]">TË FUNDIT</p>
            <h2 className="mt-1 text-3xl font-black text-white">Shpalljet e fundit</h2>
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
            <CheckCircle2 className="mx-auto text-[#e8b04b]" size={34} />
            <h3 className="mt-4 text-xl font-black text-white">Shpalljet aktive do të shfaqen këtu</h3>
            <p className="mt-2 text-sm text-[#a0a0b0]">Pas miratimit nga admini, banesat e reja dalin live në këtë seksion.</p>
          </div>
        )}
      </section>
    </main>
  );
}
