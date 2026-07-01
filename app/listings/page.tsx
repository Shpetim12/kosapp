import Link from "next/link";
import { Building2 } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { ListingFilters } from "@/components/listing-filters";
import { createServerSupabase } from "@/lib/supabase-server";
import type { ListingWithPhotos } from "@/lib/types";

type Params = {
  city?: string;
  neighborhood?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  furnished?: string;
  propertyType?: string;
  sort?: string;
};

export default async function ListingsPage({ searchParams }: { searchParams: Params }) {
  const supabase = createServerSupabase();
  let query = supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("status", "active");

  if (searchParams.city) query = query.eq("city", searchParams.city);
  if (searchParams.neighborhood) query = query.eq("neighborhood", searchParams.neighborhood);
  if (searchParams.minPrice) query = query.gte("price", Number(searchParams.minPrice));
  if (searchParams.maxPrice) query = query.lte("price", Number(searchParams.maxPrice));
  if (searchParams.bedrooms) query = searchParams.bedrooms === "4" ? query.gte("bedrooms", 4) : query.eq("bedrooms", Number(searchParams.bedrooms));
  if (searchParams.furnished) query = query.eq("furnished", searchParams.furnished);
  if (searchParams.propertyType) query = query.eq("property_type", searchParams.propertyType);

  if (searchParams.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (searchParams.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: listings } = await query;
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
    <main className="page-shell">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-brand-700">Shpallje aktive</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 sm:text-4xl">Banesa me qira</h1>
          <p className="mt-2 text-sm text-slate-600">{listingCards.length} shpallje të gjetura</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <ListingFilters values={searchParams} />

        <div>
          {listingCards.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {listingCards.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="focus-card grid min-h-80 place-items-center p-8 text-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-brand-700">
                  <Building2 size={30} />
                </div>
                <h2 className="mt-5 text-2xl font-black text-slate-950">Nuk u gjetën shpallje për kriteret e zgjedhura.</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Provo të ndryshosh qytetin, çmimin ose filtrat e tjerë.</p>
                <Link href="/listings" className="button-primary mt-6">
                  Pastro filtrat
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
