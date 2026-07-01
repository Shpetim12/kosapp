import {
  createRouteHandlerClient,
  createServerActionClient,
  createServerComponentClient
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export function createServerSupabase() {
  return createServerComponentClient({ cookies });
}

export function createActionSupabase() {
  return createServerActionClient({ cookies });
}

export function createRouteSupabase() {
  return createRouteHandlerClient({ cookies });
}
