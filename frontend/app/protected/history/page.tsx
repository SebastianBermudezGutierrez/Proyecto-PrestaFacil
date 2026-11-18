"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  History,
  Package,
  CheckCircle,
  Loader2,
  Search,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

interface Loan {
  id: string;
  borrowerName: string;
  borrowerContact: string | null;
  loanDate: string;
  dueDate: string;
  returnedAt: string | null;
  status: string;
  item: {
    name: string;
  };
}

export default function HistoryPage() {
  const router = useRouter();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch("http://localhost:3000/loans", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el historial");
      }

      const data: Loan[] = await response.json();

      setLoans(
        data.filter(
          (loan) =>
            loan.status === "RETURNED" ||
            loan.status === "CANCELLED",
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar historial",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredLoans = loans.filter((loan) => {
    const term = search.toLowerCase().trim();

    return (
      loan.item.name.toLowerCase().includes(term) ||
      loan.borrowerName.toLowerCase().includes(term) ||
      (loan.borrowerContact ?? "").toLowerCase().includes(term)
    );
  });

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold text-[#16834B]">
          REGISTROS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Historial de préstamos
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Consulta los préstamos que ya finalizaron.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-2">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <History className="text-[#16834B]" size={25} />
          <p className="mt-4 text-sm text-gray-500">
            Total de registros finalizados
          </p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            {loading ? "..." : loans.length}
          </h2>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <CheckCircle className="text-green-600" size={25} />
          <p className="mt-4 text-sm text-gray-500">
            Préstamos devueltos
          </p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            {loading
              ? "..."
              : loans.filter((loan) => loan.status === "RETURNED").length}
          </h2>
        </article>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Movimientos anteriores
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Registro de objetos prestados y devueltos.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5">
            <Search size={18} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en historial..."
              className="w-full text-sm outline-none sm:w-48"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#16834B]" size={32} />
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="py-14 text-center">
            <History className="mx-auto text-gray-300" size={40} />
            <h3 className="mt-4 font-semibold text-gray-800">
              No hay registros en el historial
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Los préstamos finalizados aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredLoans.map((loan) => (
              <article
                key={loan.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 p-5 sm:flex-row sm:items-center"
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#16834B]">
                    <Package size={24} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {loan.item.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Prestado a: {loan.borrowerName}
                    </p>

                    {loan.borrowerContact && (
                      <p className="mt-1 text-xs text-gray-400">
                        Contacto: {loan.borrowerContact}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-gray-500">
                      Préstamo: {formatDate(loan.loanDate)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Devolución prevista: {formatDate(loan.dueDate)}
                    </p>

                    {loan.returnedAt && (
                      <p className="mt-1 text-xs text-green-700">
                        Devuelto el: {formatDate(loan.returnedAt)}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                    loan.status === "RETURNED"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {loan.status === "RETURNED" ? "Devuelto" : "Cancelado"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      <Link
        href="/protected"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#16834B]"
      >
        <ArrowLeft size={17} />
        Volver al dashboard
      </Link>
    </div>
  );
}
