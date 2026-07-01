import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, MapPin, Ruler, ShieldCheck } from "lucide-react";
import { getPublicPhotoUrl } from "@/lib/storage";
import type { ListingWithPhotos } from "@/lib/types";

export function ListingCard({ listing }: { listing: ListingWithPhotos }) {
  const photo = listing.listing_photos?.[0]?.storage_path;

  return (
    <Link href={`/listings/${listing.id}`} className="group block h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        {photo ? (
          <Image
            src={getPublicPhotoUrl(photo)}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-500">Pa foto</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/55 to-transparent" />
        <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-black text-white shadow-lg">
          {listing.price} €/muaj
        </span>
        {listing.profiles?.is_verified_landlord ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-black text-brand-700 shadow">
            <ShieldCheck size={14} />
            Verifikuar
          </span>
        ) : null}
      </div>
      <div className="space-y-4 p-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
            <MapPin size={15} className="text-brand-600" />
            {listing.neighborhood}, {listing.city}
          </p>
          <h2 className="mt-2 line-clamp-2 text-base font-black leading-6 text-slate-950">{listing.title}</h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <BedDouble size={16} /> {listing.bedrooms} dhoma
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Ruler size={16} /> {listing.size_m2} m²
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-black text-brand-700">
          Shiko më shumë
          <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
