import Image from "next/image";
import { redirect } from "next/navigation";
import { Check, ShieldCheck, X } from "lucide-react";
import { setLandlordVerification, updateListingStatus } from "@/lib/actions";
import { createServerSupabase } from "@/lib/supabase-server";
import { getPublicPhotoUrl, isAdminEmail } from "@/lib/storage";
import { StatusPill } from "@/components/status-pill";

export default async function AdminPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/");
  }

  const [{ data: pendingListings }, { data: landlords }, { data: reports }] = await Promise.all([
    supabase
      .from("listings")
      .select("*, listing_photos(*), profiles(full_name, is_verified_landlord)")
      .eq("status", "pending_review")
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "landlord")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("reports")
      .select("*, listings(title, city, neighborhood)")
      .order("created_at", { ascending: false })
      .limit(25)
  ]);

  return (
    <main className="page-shell">
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-wide text-brand-700">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950 sm:text-4xl">
          {pendingListings?.length ?? 0} shpallje në pritje
        </h1>
        <p className="mt-2 text-sm text-slate-600">Mirato shpalljet, verifiko qiradhënësit dhe shqyrto raportimet.</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto">
        <span className="rounded-full bg-brand-600 px-4 py-2 text-sm font-black text-white">Në pritje ({pendingListings?.length ?? 0})</span>
        <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm">Aktive</span>
        <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm">Refuzuara</span>
      </div>

      <div className="grid gap-6">
        <section className="surface-card overflow-hidden">
          {pendingListings?.length ? (
            <div className="divide-y divide-slate-100">
              {pendingListings.map((listing: any) => (
                <details key={listing.id} className="group">
                  <summary className="grid cursor-pointer list-none gap-4 p-4 md:grid-cols-[88px_1fr_auto] md:items-center">
                    <div className="relative h-24 overflow-hidden rounded-2xl bg-slate-100 md:h-20">
                      {listing.listing_photos?.[0] ? (
                        <Image src={getPublicPhotoUrl(listing.listing_photos[0].storage_path)} alt={listing.title} fill className="object-cover" sizes="88px" />
                      ) : null}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-950">{listing.title}</h3>
                        <StatusPill status={listing.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {listing.city}, {listing.neighborhood} · {listing.price} €/muaj · Qiradhënës: {listing.profiles?.full_name ?? "Pa emër"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">Dërguar më {new Date(listing.created_at).toLocaleDateString("sq-AL")}</p>
                    </div>
                    <div className="flex gap-2">
                      <form action={async () => {
                        "use server";
                        await updateListingStatus(listing.id, "active");
                      }}>
                        <button className="button-primary px-4 py-2"><Check size={16} /> Aprovo</button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await updateListingStatus(listing.id, "rejected");
                      }}>
                        <button className="button-secondary border-red-200 px-4 py-2 text-red-700"><X size={16} /> Refuzo</button>
                      </form>
                    </div>
                  </summary>
                  <div className="border-t border-slate-100 bg-slate-50 p-4">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {listing.listing_photos?.map((photo: any) => (
                        <div key={photo.id} className="relative h-32 w-40 flex-none overflow-hidden rounded-2xl bg-slate-200">
                          <Image src={getPublicPhotoUrl(photo.storage_path)} alt={listing.title} fill className="object-cover" sizes="160px" />
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{listing.description}</p>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-slate-600">Nuk ka shpallje në pritje.</div>
          )}
        </section>

        <section className="surface-card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-black text-slate-950">Qiradhënësit</h2>
          </div>
          {landlords?.length ? (
            <div className="divide-y divide-slate-100">
              {landlords.map((landlord: any) => (
                <div key={landlord.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h3 className="font-black text-slate-950">{landlord.full_name}</h3>
                    <p className="text-sm text-slate-600">Badge {landlord.is_verified_landlord ? "aktiv" : "joaktiv"}</p>
                  </div>
                  <form action={async () => {
                    "use server";
                    await setLandlordVerification(landlord.id, !landlord.is_verified_landlord);
                  }}>
                    <button className={landlord.is_verified_landlord ? "button-secondary" : "button-primary"}>
                      <ShieldCheck size={16} />
                      {landlord.is_verified_landlord ? "Hiq badge" : "Verifiko"}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-600">Nuk ka qiradhënës ende.</div>
          )}
        </section>

        <section className="surface-card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-black text-slate-950">Raportimet</h2>
          </div>
          {reports?.length ? (
            <div className="divide-y divide-slate-100">
              {reports.map((report: any) => (
                <div key={report.id} className="p-4">
                  <h3 className="font-black text-slate-950">{report.listings?.title}</h3>
                  <p className="text-sm text-slate-600">{report.listings?.neighborhood}, {report.listings?.city}</p>
                  <p className="mt-2 text-sm text-slate-800">{report.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-600">Nuk ka raportime.</div>
          )}
        </section>
      </div>
    </main>
  );
}
