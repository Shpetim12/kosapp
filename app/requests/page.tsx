import { redirect } from "next/navigation";
import { Check, X } from "lucide-react";
import { decideContactRequest } from "@/lib/actions";
import { createServerSupabase } from "@/lib/supabase-server";

const requestStatusLabels: Record<string, string> = {
  pending: "Në pritje të përgjigjes",
  approved: "Aprovuar",
  declined: "Kërkesa u refuzua"
};

export default async function RequestsPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/requests");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role === "landlord") {
    const { data: requests } = await supabase
      .from("contact_requests")
      .select("*, listings(title, price, city, neighborhood), profiles(full_name)")
      .order("created_at", { ascending: false });

    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-950">Kërkesat e kontaktit</h1>
          <p className="text-sm text-slate-600">Aprovo ose refuzo kërkesat për shpalljet e tua.</p>
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {requests?.length ? (
            <div className="divide-y divide-slate-100">
              {requests.map((request: any) => (
                <div key={request.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-950">{request.profiles?.full_name ?? "Qiramarrës"}</h2>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {requestStatusLabels[request.status] ?? request.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {request.listings?.title} · {request.listings?.neighborhood}, {request.listings?.city}
                    </p>
                    <p className="text-xs text-slate-500">
                      Dërguar më {new Date(request.created_at).toLocaleDateString("sq-AL")}
                    </p>
                  </div>
                  {request.status === "pending" ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <form action={async () => {
                        "use server";
                        await decideContactRequest(request.id, "approved");
                      }}>
                        <button className="button-primary w-full"><Check size={16} /> Aprovo</button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await decideContactRequest(request.id, "declined");
                      }}>
                        <button className="button-secondary w-full"><X size={16} /> Refuzo</button>
                      </form>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-600">Ende nuk ka kërkesa për kontakt.</div>
          )}
        </section>
      </main>
    );
  }

  const { data: requests } = await supabase
    .from("contact_requests")
    .select("*, listings(title, city, neighborhood, landlord_id)")
    .eq("renter_id", user.id)
    .order("created_at", { ascending: false });
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Kërkesat e mia</h1>
        <p className="text-sm text-slate-600">Shiko statusin e kërkesave për kontakt.</p>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {requests?.length ? (
          <div className="divide-y divide-slate-100">
            {requests.map((request: any) => {
              return (
                <div key={request.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold text-slate-950">{request.listings?.title ?? "Shpallje"}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {requestStatusLabels[request.status] ?? request.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {request.listings?.neighborhood}, {request.listings?.city}
                  </p>
                  {request.status === "approved" ? (
                    <p className="mt-3 rounded-md bg-brand-50 p-3 text-sm font-semibold text-brand-800">
                      Kërkesa u aprovua.
                    </p>
                  ) : request.status === "pending" ? (
                    <p className="mt-3 text-sm text-amber-700">Në pritje të përgjigjes</p>
                  ) : (
                    <p className="mt-3 text-sm text-red-700">Kërkesa u refuzua</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-600">Ende nuk ke dërguar kërkesa për kontakt.</div>
        )}
      </section>
    </main>
  );
}
