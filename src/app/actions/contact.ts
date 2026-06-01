"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  message: z.string().trim().min(1, "Message is required").max(4000),
});

const notifySchema = z.object({
  service: z.string().trim().min(1).max(60),
  email: z.string().trim().email("Enter a valid email").max(200),
});

// Contact Us form submission — stored for the admin inbox.
export async function submitContact(input: {
  name: string;
  email: string;
  message: string;
}) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await getSessionUser();
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    type: "contact",
    ...parsed.data,
    user_id: user?.id ?? null,
  });

  if (error) return { error: error.message };
  return { ok: true as const };
}

// "Notify me" capture on a coming-soon service page.
export async function submitNotify(service: string, email: string) {
  const parsed = notifySchema.safeParse({ service, email });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  const user = await getSessionUser();
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    type: "notify",
    email: parsed.data.email,
    service: parsed.data.service,
    user_id: user?.id ?? null,
  });

  if (error) return { error: error.message };
  return { ok: true as const };
}
