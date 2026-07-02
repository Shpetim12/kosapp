import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createServerSupabase } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/storage";
import type { UserRole } from "@/lib/types";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Strehë",
  description: "Strehë - Platformë e verifikuar për qira në Kosovë."
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <html lang="sq">
      <body className={inter.className}>
        <Navbar
          user={user ? { email: user.email ?? "", name: profile?.full_name ?? user.email ?? "Përdorues" } : null}
          role={profile?.role as UserRole | undefined}
          isAdmin={isAdminEmail(user?.email)}
        />
        {children}
        <Footer />
        {user ? <MobileBottomNav role={profile?.role as UserRole | undefined} /> : null}
      </body>
    </html>
  );
}
