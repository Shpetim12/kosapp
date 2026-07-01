"use client";

import Link from "next/link";
import { Home, KeyRound, Loader2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-client";
import type { UserRole } from "@/lib/types";

export function SignupForm({ initialRole }: { initialRole: UserRole }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  function goNext() {
    setMessage("");
    if (!fullName || !email || password.length < 8 || password !== confirmPassword) {
      setMessage("Plotëso të dhënat dhe sigurohu që fjalëkalimet përputhen.");
      return;
    }
    setStep(2);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const redirectTo = `${window.location.origin}/auth/callback`;
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${redirectTo}?next=/profile`,
        data: {
          role,
          full_name: fullName,
          phone: "+38300000000"
        }
      }
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      router.push(role === "landlord" ? "/dashboard" : "/listings");
      router.refresh();
      return;
    }

    setMessage("Kontrollo emailin për linkun e konfirmimit. Pastaj mund të hysh në llogari.");
  }

  return (
    <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-gradient-to-b from-green-50 to-white px-4 py-10">
      <form onSubmit={onSubmit} className={`focus-card w-full max-w-lg space-y-6 p-6 sm:p-8 ${message ? "animate-shake" : ""}`}>
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-green-600/20">
            <Home size={24} />
          </div>
          <h1 className="mt-5 text-3xl font-black text-slate-950">Krijo llogari</h1>
          <p className="mt-2 text-sm text-slate-600">Dy hapa të thjeshtë për të filluar.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((item) => (
            <div key={item} className={`h-2 rounded-full ${step >= item ? "bg-brand-600" : "bg-slate-200"}`} />
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="label">Emri i plotë</span>
              <input className="field" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </label>
            <label className="block space-y-2">
              <span className="label">Email</span>
              <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block space-y-2">
              <span className="label">Fjalëkalimi</span>
              <input className="field" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((item) => (
                  <span key={item} className={`h-1.5 rounded-full ${passwordScore >= item ? "bg-brand-600" : "bg-slate-200"}`} />
                ))}
              </div>
            </label>
            <label className="block space-y-2">
              <span className="label">Konfirmo fjalëkalimin</span>
              <input className="field" type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </label>
            {message ? <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{message}</p> : null}
            <button type="button" className="button-primary w-full" onClick={goNext}>
              Tjetër
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: "renter", icon: Home, title: "Qiramarrës", text: "Po kërkoj banesë" },
                { value: "landlord", icon: KeyRound, title: "Qiradhënës", text: "Dua të jap banesë me qera" }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRole(item.value as UserRole)}
                  className={`min-h-36 rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] ${
                    role === item.value ? "border-brand-600 bg-brand-50 ring-4 ring-brand-100" : "border-slate-200 bg-white"
                  }`}
                >
                  <item.icon className={role === item.value ? "text-brand-700" : "text-slate-500"} size={26} />
                  <p className="mt-4 font-black text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.text}</p>
                </button>
              ))}
            </div>
            {message ? <p className="rounded-xl bg-brand-50 p-3 text-sm font-medium text-brand-700">{message}</p> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className="button-secondary w-full" onClick={() => setStep(1)}>
                Kthehu
              </button>
              <button className="button-primary w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <UserRound size={18} />}
                {loading ? "Duke krijuar..." : "Regjistrohu"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-slate-600">
          Ke llogari?{" "}
          <Link href="/login" className="font-black text-brand-700">
            Hyr
          </Link>
        </p>
      </form>
    </main>
  );
}
