import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { ListingForm } from "./listing-form";
import type { Profile } from "@/lib/types";

export default async function NewListingPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/new");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const landlord = profile as Profile;

  if (landlord.role !== "landlord") {
    redirect("/listings");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Shpallje e re</h1>
        <p className="text-sm text-slate-600">Çdo shpallje kalon në verifikim para publikimit.</p>
      </div>
      <ListingForm />
    </main>
  );
}
