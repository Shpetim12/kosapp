import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const typedProfile = profile as Profile;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Profili</h1>
        <p className="text-sm text-slate-600">Të dhënat bazë të llogarisë dhe statusi i verifikimit.</p>
      </div>

      <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Emri</p>
            <p className="font-semibold text-slate-950">{typedProfile.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-semibold text-slate-950">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Roli</p>
            <p className="font-semibold text-slate-950">{typedProfile.role === "landlord" ? "Qiradhënës" : "Qiramarrës"}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {typedProfile.role === "landlord" ? (
            <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
              <ShieldCheck size={18} className={typedProfile.is_verified_landlord ? "text-brand-600" : "text-slate-500"} />
              <span className="text-sm font-medium text-slate-800">
                Badge {typedProfile.is_verified_landlord ? "aktiv" : "joaktiv"}
              </span>
            </div>
          ) : null}
        </div>

        {typedProfile.role === "landlord" ? (
          <Link href="/dashboard" className="button-primary">
            Shpalljet e mia
          </Link>
        ) : (
          <Link href="/listings" className="button-primary">
            Shiko banesat
          </Link>
        )}
      </section>
    </main>
  );
}
