"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createActionSupabase } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/storage";

export async function requestContact(listingId: string) {
  const supabase = createActionSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listings/${listingId}`);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, landlord_id, status")
    .eq("id", listingId)
    .eq("status", "active")
    .maybeSingle();

  if (profile?.role !== "renter" || !listing || listing.landlord_id === user.id) {
    throw new Error("Vetëm qiramarrësit mund të kërkojnë kontakt për shpallje aktive.");
  }

  const { error } = await supabase.from("contact_requests").insert({
    listing_id: listingId,
    renter_id: user.id
  });

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }

  revalidatePath(`/listings/${listingId}`);
}

export async function decideContactRequest(requestId: string, status: "approved" | "declined") {
  const supabase = createActionSupabase();
  const { error } = await supabase.from("contact_requests").update({ status }).eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/requests");
}

export async function updateListingStatus(listingId: string, status: "active" | "rejected" | "expired" | "rented") {
  const supabase = createActionSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    throw new Error("Vetëm administratori mund ta ndryshojë këtë status.");
  }

  const { error } = await supabase.from("listings").update({ status }).eq("id", listingId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/listings");
}

export async function setLandlordVerification(profileId: string, isVerified: boolean) {
  const supabase = createActionSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    throw new Error("Vetëm administratori mund ta verifikojë qiradhënësin.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_verified_landlord: isVerified })
    .eq("id", profileId)
    .eq("role", "landlord");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

export async function reportListing(listingId: string, formData: FormData) {
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 5) {
    throw new Error("Shkruaj arsyen e raportimit.");
  }

  const supabase = createActionSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listings/${listingId}`);
  }

  const { error } = await supabase.from("reports").insert({
    listing_id: listingId,
    reporter_id: user.id,
    reason
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/listings/${listingId}`);
}
