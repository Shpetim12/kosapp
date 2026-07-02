import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BedDouble, Calendar, CheckCircle2, MapPin, Ruler, ShieldCheck } from "lucide-react";
import { amenities, furnishedOptions, propertyTypes } from "@/lib/constants";
import { reportListing, requestContact } from "@/lib/actions";
import { createServerSupabase } from "@/lib/supabase-server";
import { getPublicPhotoUrl } from "@/lib/storage";
import { VerifiedBadge } from "@/components/verified-badge";
import type { ListingPhoto, ListingWithPhotos } from "@/lib/types";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: listing } = await supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("id", params.id)
    .eq("status", "active")
    .maybeSingle();

  if (!listing) {
    notFound();
  }

  const typedListing = listing as ListingWithPhotos;
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  const { data: publicLandlord } = await supabase
    .from("landlord_public_profiles")
    .select("is_verified_landlord")
    .eq("id", typedListing.landlord_id)
    .maybeSingle();

  const { data: request } = user
    ? await supabase
        .from("contact_requests")
        .select("*")
        .eq("listing_id", params.id)
        .eq("renter_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: landlordProfile } = request?.status === "approved"
    ? await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", typedListing.landlord_id)
        .maybeSingle()
    : { data: null };

  const photos = [...(typedListing.listing_photos ?? [])].sort((a: ListingPhoto, b: ListingPhoto) => a.order_index - b.order_index);
  const furnished = furnishedOptions.find((item) => item.value === typedListing.furnished)?.label ?? typedListing.furnished;
  const propertyType = propertyTypes.find((item) => item.value === typedListing.property_type)?.label ?? typedListing.property_type;
  const activeAmenities = amenities.filter((item) => typedListing.amenities?.[item.key]);
  const isListingOwner = user?.id === typedListing.landlord_id;
  const canRequestContact = Boolean(user && profile?.role === "renter" && !isListingOwner);
  const approvedLandlordName = landlordProfile?.full_name && !landlordProfile.full_name.includes("@")
    ? landlordProfile.full_name
    : "Qiradhënës";

  async function requestAction() {
    "use server";
    await requestContact(params.id);
    redirect(`/listings/${params.id}`);
  }

  async function reportAction(formData: FormData) {
    "use server";
    await reportListing(params.id, formData);
    redirect(`/listings/${params.id}`);
  }

  return (
    <main className="page-shell">
      <section className="mb-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#e8b04b]/10 px-3 py-1 text-xs font-black text-[#e8b04b]">Aktive</span>
          <VerifiedBadge verified={publicLandlord?.is_verified_landlord} />
          <span className="text-sm font-medium text-[#a0a0b0]">Vendndodhje e përafërt, jo adresë e saktë</span>
        </div>

        <div className="overflow-hidden rounded-3xl bg-[#1a1a2e]">
          <div className="flex snap-x gap-2 overflow-x-auto md:grid md:grid-cols-[1.45fr_0.9fr] md:overflow-visible">
            <div className="relative aspect-[4/3] w-full min-w-full snap-start md:min-w-0">
              {photos[0] ? (
                <Image src={getPublicPhotoUrl(photos[0].storage_path)} alt={typedListing.title} fill priority className="object-cover" sizes="(min-width: 1024px) 60vw, 100vw" />
              ) : (
                <div className="grid h-full place-items-center text-[#a0a0b0]">Pa foto</div>
              )}
            </div>
            <div className="hidden grid-cols-2 gap-2 md:grid">
              {photos.slice(1, 5).map((photo) => (
                <div key={photo.id} className="relative min-h-0 overflow-hidden bg-[#1a1a2e]">
                  <Image src={getPublicPhotoUrl(photo.storage_path)} alt={typedListing.title} fill className="object-cover" sizes="20vw" />
                </div>
              ))}
            </div>
            {photos.slice(1).map((photo) => (
              <div key={photo.id} className="relative aspect-[4/3] w-full min-w-full snap-start md:hidden">
                <Image src={getPublicPhotoUrl(photo.storage_path)} alt={typedListing.title} fill className="object-cover" sizes="100vw" />
              </div>
            ))}
          </div>
        </div>
        {photos.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5 md:hidden">
            {photos.map((photo) => (
              <span key={photo.id} className="h-1.5 w-1.5 rounded-full bg-white/20" />
            ))}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <section className="space-y-5">
          <div className="surface-card p-5 sm:p-7">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{typedListing.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-base font-bold text-[#a0a0b0]">
              <MapPin size={18} className="text-[#e8b04b]" />
              {typedListing.neighborhood}, {typedListing.city}
            </p>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#a0a0b0]">{typedListing.description}</p>
          </div>

          <div className="surface-card p-5 sm:p-7">
            <h2 className="text-xl font-black text-white">Detajet</h2>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Tipi", propertyType],
                ["Lagjja", typedListing.neighborhood],
                ["Qyteti", typedListing.city],
                ["E mobiluar", furnished],
                ["Dhoma", `${typedListing.bedrooms}`],
                ["Sipërfaqja", `${typedListing.size_m2} m²`],
                ["Në dispozicion nga", typedListing.available_from]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/5 p-4">
                  <dt className="text-xs font-black uppercase tracking-wide text-[#a0a0b0]">{label}</dt>
                  <dd className="mt-1 font-black text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {activeAmenities.length ? (
            <div className="surface-card p-5 sm:p-7">
              <h2 className="text-xl font-black text-white">Komoditetet</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {activeAmenities.map((item) => (
                  <span key={item.key} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#e8b04b]/10 px-4 text-sm font-bold text-[#e8b04b]">
                    <CheckCircle2 size={16} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a2e] shadow-sm">
            <div className="p-5">
              <h2 className="text-xl font-black text-white">Harta e përafërt</h2>
              <p className="mt-1 text-sm text-[#a0a0b0]">{typedListing.neighborhood}, {typedListing.city}</p>
            </div>
            {typedListing.lat && typedListing.lng ? (
              <iframe
                className="h-[300px] w-full border-0 lg:h-[400px]"
                title="Harta e lagjes"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${typedListing.lng - 0.012},${typedListing.lat - 0.009},${typedListing.lng + 0.012},${typedListing.lat + 0.009}&layer=mapnik&marker=${typedListing.lat},${typedListing.lng}`}
              />
            ) : null}
          </section>

          <details className="surface-card p-5">
            <summary className="cursor-pointer list-none text-sm font-black text-[#a0a0b0]">Raporto shpalljen</summary>
            <form action={reportAction} className="mt-4 space-y-3">
              <textarea name="reason" className="field min-h-24" placeholder="P.sh. foto të pasakta, çmim mashtrues, kontakt i dyshimtë" required />
              <button className="button-secondary w-full">Dërgo raportimin</button>
            </form>
          </details>
        </section>

        <aside className="lg:sticky lg:top-24">
          <section className="focus-card p-5">
            <p className="text-3xl font-black text-[#e8b04b]">{typedListing.price} €/muaj</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-bold text-[#a0a0b0]">
              <span className="rounded-2xl bg-white/5 p-3"><BedDouble className="mx-auto mb-1" size={18} />{typedListing.bedrooms}</span>
              <span className="rounded-2xl bg-white/5 p-3"><Ruler className="mx-auto mb-1" size={18} />{typedListing.size_m2} m²</span>
              <span className="rounded-2xl bg-white/5 p-3"><Calendar className="mx-auto mb-1" size={18} />Gati</span>
            </div>
            {isListingOwner ? (
              <p className="mt-4 rounded-2xl bg-white/5 p-4 text-sm font-semibold text-[#a0a0b0]">
                Kjo është shpallja jote.
              </p>
            ) : !user ? (
              <Link href={`/login?next=/listings/${params.id}`} className="button-primary mt-4 w-full">
                Hyr për të kontaktuar
              </Link>
            ) : !canRequestContact ? (
              <p className="mt-4 rounded-2xl bg-white/5 p-4 text-sm font-semibold text-[#a0a0b0]">
                Vetëm qiramarrësit mund të kërkojnë kontakt.
              </p>
            ) : request?.status === "approved" ? (
              <div className="mt-4 rounded-2xl bg-[#e8b04b]/10 p-4 text-[#e8b04b]">
                <p className="font-black">Kërkesa u aprovua</p>
                <p className="mt-2 font-black">{approvedLandlordName}</p>
                <p className="mt-1 text-sm font-semibold">{landlordProfile?.phone}</p>
              </div>
            ) : request ? (
              <button className="button-secondary mt-4 w-full" disabled>
                {request.status === "pending" ? "Kërkesa në pritje..." : "Kërkesa u refuzua"}
              </button>
            ) : (
              <form action={requestAction} className="mt-4">
                <button className="button-primary w-full">Kërko kontakt</button>
              </form>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
