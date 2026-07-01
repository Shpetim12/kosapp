import { SignupForm } from "./signup-form";

export default function SignupPage({ searchParams }: { searchParams: { role?: string } }) {
  return <SignupForm initialRole={searchParams.role === "landlord" ? "landlord" : "renter"} />;
}
