import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, MapPin, Ruler, ShieldCheck } from "lucide-react";
import { getPublicPhotoUrl } from "@/lib/storage";
import type { ListingWithPhotos } from "@/lib/types";

export function ListingCard({ listing }: { listing: ListingWithPhotos }) {
  const photo = listing.listing_photos?.[0]?.storage_path;

  return (
    <Link href={`/listings/${listing.id}`} className="group block h-full overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a2e] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#e8b04b]/40 hover:shadow-[0_8px_32px_rgba(232,176,75,0.1)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1a2e]">
        {photo ? (
          <Image
            src={getPublicPhotoUrl(photo)}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-[#a0a0b0]">Pa foto</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0f0f1a]/80 to-transparent" />
        <span className="absolute right-3 top-3 rounded-full bg-[#e8b04b] px-3 py-1.5 text-sm font-black text-[#0f0f1a] shadow-lg">
          {listing.price} €/muaj
        </span>
        {listing.profiles?.is_verified_landlord ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#0f0f1a]/80 border border-[#e8b04b] px-2.5 py-1.5 text-xs font-black text-[#e8b04b]">
            <ShieldCheck size={14} />
            Verifikuar
          </span>
        ) : null}
      </div>
      <div className="space-y-4 p-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-[#a0a0b0]">
            <MapPin size={15} className="text-[#e8b04b]" />
            {listing.neighborhood}, {listing.city}
          </p>
          <h2 className="mt-2 line-clamp-2 text-base font-black leading-6 text-white">{listing.title}</h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-[#a0a0b0]">
          <span className="inline-flex items-center gap-1.5">
            <BedDouble size={16} /> {listing.bedrooms} dhoma
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Ruler size={16} /> {listing.size_m2} m²
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-white/6 pt-3 text-sm font-black text-[#e8b04b]">
          Shiko më shumë
          <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
