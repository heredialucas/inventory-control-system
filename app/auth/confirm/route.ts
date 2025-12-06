// import { createClient } from "@/lib/supabase/server";
// import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  // const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash) {
    // TODO: Implement self-hosted email verification
    // 1. Find user with this token_hash (need to add verificationToken to User model)
    // 2. Mark user as active/verified
    // 3. Set session cookie

    // const supabase = await createClient();
    // const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    // Mock success for now
    const error = null;

    if (!error) {
      redirect(next);
    } else {
      redirect(`/auth/error?error=verification_failed`);
    }
  }

  redirect(`/auth/error?error=token_missing`);
}
