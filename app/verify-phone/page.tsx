import { redirect } from "next/navigation";

export default async function VerifyPhonePage({ searchParams }: { searchParams: { next?: string } }) {
  redirect(searchParams.next ?? "/profile");
}
