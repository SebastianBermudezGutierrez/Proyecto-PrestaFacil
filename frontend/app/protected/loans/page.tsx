"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Handshake,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Package,
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
  status: "ACTIVE" | "RETURNED" | "CANCELLED";
  notes: string | null;
  item: {
    id: string;
    name: string;
    category: string | null;
  };
}

export default function LoansPage() {
  const router = useRouter();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const loadLoans = useCallback(async () => {
    try {
      setError("");

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
        throw new Error("No se pudieron cargar los préstamos");
      }

      const data: Loan[] = await response.json();
      setLoans(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar préstamos",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  // DEVOLVER OBJETO
  async function handleReturn(loan: Loan) {
    const confirmed = window.confirm(
      `¿Confirmas que "${loan.item.name}" fue devuelto por ${loan.borrowerName}?`,
    );

    if (!confirmed) return;

    setReturningId(loan.id);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/loans/${loan.id}/return`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "No se pudo registrar la devolución",
        );
      }

      await loadLoans();
      setSuccess(`La devolución de "${loan.item.name}" fue registrada.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al devolver el objeto",
      );
    } finally {
      setReturningId(null);
    }
  }

  const now = new Date();

  const isOverdue = (loan: Loan) =>
    loan.status === "ACTIVE" && new Date(loan.dueDate) < now;

  const activeLoans = loans.filter(
    (loan) => loan.status === "ACTIVE" && !isOverdue(loan),
  );

  const overdueLoans = loans.filter(isOverdue);

  const returnedLoans = loans.filter(
    (loan) => loan.status === "RETURNED",
  );

  const filteredLoans = loans.filter((loan) => {
    const term = search.toLowerCase().trim();

    const matchesSearch =
      loan.borrowerName.toLowerCase().includes(term) ||
      loan.item.name.toLowerCase().includes(term) ||
      (loan.borrowerContact ?? "").toLowerCase().includes(term);

    const matchesFilter =
      filter === "ALL" ||
      (filter === "ACTIVE" && loan.status === "ACTIVE" && !isOverdue(loan)) ||
      (filter === "OVERDUE" && isOverdue(loan)) ||
      (filter === "RETURNED" && loan.status === "RETURNED");

    return matchesSearch && matchesFilter;
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
      {/* ENCABEZADO */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#16834B]">
            ADMINISTRACIÓN
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Préstamos
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Controla los objetos prestados y sus fechas de devolución.
          </p>
        </div>

        <Link
          href="/protected/loans/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#146B43] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#105735]"
        >
          <Plus size={19} />
          Registrar préstamo
        </Link>
      </section>

      {/* MENSAJES */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ESTADÍSTICAS */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <Handshake className="text-[#16834B]" size={25} />
          <p className="mt-4 text-sm text-gray-500">Total de préstamos</p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            {loading ? "..." : loans.length}
          </h2>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <Clock className="text-blue-600" size={25} />
          <p className="mt-4 text-sm text-gray-500">Activos</p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            {loading ? "..." : activeLoans.length}
          </h2>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <AlertTriangle className="text-red-600" size={25} />
          <p className="mt-4 text-sm text-gray-500">Vencidos</p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            {loading ? "..." : overdueLoans.length}
          </h2>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <CheckCircle className="text-green-600" size={25} />
          <p className="mt-4 text-sm text-gray-500">Devueltos</p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            {loading ? "..." : returnedLoans.length}
          </h2>
        </article>
      </section>

      {/* LISTADO */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Historial de préstamos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Consulta el estado de cada préstamo.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5">
              <Search size={18} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar préstamo..."
                className="w-full text-sm outline-none sm:w-44"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none"
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="OVERDUE">Vencidos</option>
              <option value="RETURNED">Devueltos</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="animate-spin text-[#16834B]" size={32} />
            <p className="mt-3 text-sm text-gray-500">
              Cargando préstamos...
            </p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto text-gray-300" size={38} />
            <h3 className="mt-4 font-semibold text-gray-800">
              No hay préstamos para mostrar
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Registra un préstamo o cambia los filtros de búsqueda.
            </p>
            <Link
              href="/protected/loans/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#146B43] px-5 py-3 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              Nuevo préstamo
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredLoans.map((loan) => {
              const overdue = isOverdue(loan);

              return (
                <article
                  key={loan.id}
                  className="rounded-xl border border-gray-100 p-5 transition hover:border-green-200"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
                            Devuelto: {formatDate(loan.returnedAt)}
                          </p>
                        )}

                        {loan.notes && (
                          <p className="mt-2 text-xs text-gray-500">
                            Observaciones: {loan.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      {loan.status === "RETURNED" ? (
                        <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                          Devuelto
                        </span>
                      ) : overdue ? (
                        <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                          Vencido
                        </span>
                      ) : loan.status === "ACTIVE" ? (
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          Activo
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                          Cancelado
                        </span>
                      )}

                      {loan.status === "ACTIVE" && (
                        <button
                          type="button"
                          onClick={() => handleReturn(loan)}
                          disabled={returningId !== null}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#146B43] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#105735] disabled:opacity-50"
                        >
                          {returningId === loan.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <RotateCcw size={16} />
                          )}
                          Registrar devolución
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* VOLVER */}
      <Link
        href="/protected"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#16834B]"
      >
        <ArrowLeft size={17} />
        Volver al dashboard
      </Link>
    </div>
  );
}
