import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { ProtectedNav } from "./protected-nav";

function LoadingDashboard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F8F6]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-[#146B43]" />
        <p className="text-sm text-gray-500">
          Cargando PrestaFácil...
        </p>
      </div>
    </div>
  );
}

async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/auth/login");
  }

  const email =
    typeof data.claims.email === "string"
      ? data.claims.email
      : "Usuario";

  return (
    <div className="min-h-screen bg-[#F5F8F6] text-[#1F3027]">
      <ProtectedNav />

      <div className="min-h-screen pb-20 md:ml-64 md:pb-0">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4 md:px-8">
          <div>
            <p className="text-sm text-gray-500">
              Plataforma de gestión
            </p>
            <h2 className="text-lg font-bold">
              PrestaFácil
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-gray-500">
                Sesión iniciada
              </p>
              <p className="max-w-52 truncate text-sm font-semibold">
                {email}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-bold text-[#146B43]">
              {email.charAt(0).toUpperCase()}
            </div>

            <AuthButton />
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingDashboard />}>
      <AuthenticatedLayout>
        {children}
      </AuthenticatedLayout>
    </Suspense>
  );
}
