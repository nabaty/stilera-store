
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 10) {
    redirect("/admin/update-password?error=length");
  }

  if (password !== confirmation) {
    redirect("/admin/update-password?error=mismatch");
  }

  const supabase = await createClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    redirect("/admin/login?error=recovery");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/admin/update-password?error=failed");
  }

  redirect("/admin/login?success=password-updated");
}
