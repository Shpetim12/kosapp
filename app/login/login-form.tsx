"use client";

import Link from "next/link";
import { Eye, EyeOff, Home, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-client";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createBrowserSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const { data: profileResult } = data.user
      ? await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle()
      : { data: null };
    const rolePath = profileResult?.role === "landlord" ? "/dashboard" : "/listings";

    router.push(nextPath ?? rolePath);
    router.refresh();
  }

  return (
    <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-gradient-to-b from-green-50 to-white px-4 py-10">
      <form onSubmit={onSubmit} className={`focus-card w-full max-w-md space-y-6 p-6 sm:p-8 ${message ? "animate-shake" : ""}`}>
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-green-600/20">
            <Home size={24} />
          </div>
          <h1 className="mt-5 text-3xl font-black text-slate-950">Mirë se u kthyet</h1>
          <p className="mt-2 text-sm text-slate-600">Hyni për të vazhduar në KosBanesa.</p>
        </div>

        <label className="block space-y-2">
          <span className="label">Email</span>
          <input
            className={`field ${message ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="label">Fjalëkalimi</span>
          <div className="relative">
            <input
              className={`field pr-12 ${message ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}`}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Fshih fjalëkalimin" : "Shfaq fjalëkalimin"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {message ? <p className="text-sm font-medium text-red-600">{message}</p> : null}
        </label>

        <button className="button-primary w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : null}
          {loading ? "Duke hyrë..." : "Hyr"}
        </button>

        <div className="space-y-3 text-center text-sm">
          <p className="text-slate-600">
            Nuk ke llogari?{" "}
            <Link href="/signup" className="font-black text-brand-700">
              Regjistrohu
            </Link>
          </p>
          <Link href="/listings" className="inline-flex font-bold text-slate-500 hover:text-brand-700">
            Vazhdo si vizitor
          </Link>
        </div>
      </form>
    </main>
  );
}
