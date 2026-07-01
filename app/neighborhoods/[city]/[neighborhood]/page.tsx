import Link from "next/link";
import { notFound } from "next/navigation";
import { cities, neighborhoodsByCity } from "@/lib/constants";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function NeighborhoodPage({ params }: { params: { city: string; neighborhood: string } }) {
  const city = decodeURIComponent(params.city);
  const neighborhood = decodeURIComponent(params.neighborhood);

  if (!cities.includes(city as any) || !neighborhoodsByCity[city as keyof typeof neighborhoodsByCity]?.includes(neighborhood)) {
    notFound();
  }

  const supabase = createServerSupabase();
  const { data: listings } = await supabase
    .from("listings")
    .select("price, bedrooms")
    .eq("status", "active")
    .eq("city", city)
    .eq("neighborhood", neighborhood)
    .in("bedrooms", [1, 2, 3]);

  const averages = [1, 2, 3].map((bedrooms) => {
    const matching = (listings ?? []).filter((listing: any) => listing.bedrooms === bedrooms);
    const average = matching.length
      ? Math.round(matching.reduce((sum: number, listing: any) => sum + listing.price, 0) / matching.length)
      : null;
    return { bedrooms, average, count: matching.length };
  });
  const maxAverage = Math.max(...averages.map((item) => item.average ?? 0), 1);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">{neighborhood}, {city}</h1>
        <p className="text-sm text-slate-600">Mesatarja e çmimeve llogaritet nga shpalljet aktive në këtë lagje.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {averages.map((item) => (
          <div key={item.bedrooms} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">{item.bedrooms} dhomë{item.bedrooms > 1 ? "a" : ""} gjumi</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{item.average ? `${item.average} EUR` : "Pa të dhëna"}</p>
            <p className="mt-1 text-xs text-slate-500">{item.count} shpallje aktive</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-brand-600"
                style={{ width: `${item.average ? Math.max(12, (item.average / maxAverage) * 100) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </section>

      <div className="mt-6">
        <Link
          className="button-primary"
          href={`/listings?city=${encodeURIComponent(city)}&neighborhood=${encodeURIComponent(neighborhood)}`}
        >
          Shiko shpalljet në këtë lagje
        </Link>
      </div>
    </main>
  );
}
