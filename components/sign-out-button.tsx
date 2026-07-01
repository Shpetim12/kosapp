"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await createBrowserSupabase().auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <button className="button-secondary px-3" type="button" onClick={signOut} title="Dil">
      <LogOut size={16} />
      <span className="hidden sm:inline">Dil</span>
    </button>
  );
}
