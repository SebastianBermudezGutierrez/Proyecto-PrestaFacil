import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return NextResponse.json(
      { message: "No hay una sesión activa" },
      { status: 401 },
    );
  }

  const response = await fetch(
    "http://localhost:3000/dashboard",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
      cache: "no-store",
    },
  );

  const result = await response.json();

  return NextResponse.json(result, {
    status: response.status,
  });
}
