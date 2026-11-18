"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Package,
  CheckCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

interface Loan {
  id: string;
  borrowerName: string;
  borrowerContact: string | null;
  loanDate: string;
  dueDate: string;
  status: string;
  item: {
    name: string;
  };
}

export default function PendingPage() {
  const router = useRouter();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadLoans = useCallback(async () => {
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
        throw new Error("No se pudieron cargar los préstamos");
      }

      const data: Loan[] = await response.json();

      setLoans(data.filter((loan) => loan.status === "ACTIVE"));
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

  async function handleReturn(loan: Loan) {
    if (
      !window.confirm(
        `¿Confirmas la devolución de "${loan.item.name}" por ${loan.borrowerName}?`,
      )
    ) {
      return;
    }

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

      setLoans((current) =>
        current.filter((item) => item.id !== loan.id),
      );

      setSuccess(`"${loan.item.name}" se registró como devuelto.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al registrar devolución",
      );
    } finally {
      setReturningId(null);
    }
  }

  const overdueLoans = loans.filter(
    (loan) => new Date(loan.dueDate) < new Date(),
  );

  const activeLoans = loans.filter(
    (loan) => new Date(loan.dueDate) >= new Date(),
  );

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
          CONTROL DE DEVOLUCIONES
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Préstamos pendientes
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Consulta los objetos que todavía no han sido devueltos.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
          <p className="mt-1">
            El objeto ya está disponible en tu inventario.
          </p>
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-3">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <Clock className="text-blue-600" size={25} />
          <p className="mt-4 text-sm text-gray-500">Pendientes</p>
          <h2 className="mt-1 text-3xl font-bold">{loans.length}</h2>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <CheckCircle className="text-green-600" size={25} />
          <p className="mt-4 text-sm text-gray-500">En plazo</p>
          <h2 className="mt-1 text-3xl font-bold">{activeLoans.length}</h2>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <AlertTriangle className="text-red-600" size={25} />
          <p className="mt-4 text-sm text-gray-500">Vencidos</p>
          <h2 className="mt-1 text-3xl font-bold">{overdueLoans.length}</h2>
        </article>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          Objetos pendientes de devolución
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#16834B]" size={32} />
          </div>
        ) : loans.length === 0 ? (
          <div className="py-14 text-center">
            <CheckCircle className="mx-auto text-green-500" size={40} />
            <h3 className="mt-4 font-semibold text-gray-800">
              ¡Todo está al día!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              No tienes préstamos pendientes de devolución.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {loans.map((loan) => {
              const overdue = new Date(loan.dueDate) < new Date();

              return (
                <article
                  key={loan.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 p-5 md:flex-row md:items-center"
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
                        Responsable: {loan.borrowerName}
                      </p>

                      {loan.borrowerContact && (
                        <p className="mt-1 text-xs text-gray-400">
                          Contacto: {loan.borrowerContact}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-gray-500">
                        Fecha del préstamo: {formatDate(loan.loanDate)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Fecha de devolución: {formatDate(loan.dueDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        overdue
                          ? "bg-red-50 text-red-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {overdue ? "Vencido" : "En plazo"}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleReturn(loan)}
                      disabled={returningId !== null}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#146B43] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#105735] disabled:opacity-50"
                    >
                      {returningId === loan.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <RotateCcw size={16} />
                      )}
                      Registrar devolución
                    </button>
                  </div>
                </article>
              );
            })}
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
