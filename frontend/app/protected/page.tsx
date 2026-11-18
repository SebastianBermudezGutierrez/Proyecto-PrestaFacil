import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package,
  PackageCheck,
  Handshake,
  ClockAlert,
  Plus,
  ArrowUpRight,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

// Evita la navegación instantánea con datos no almacenados en caché.
export const instant = false;

interface DashboardData {
  totalItems: number;
  availableItems: number;
  activeLoans: number;
  overdueLoans: number;
  recentLoans: {
    id: string;
    borrowerName: string;
    loanDate: string;
    dueDate: string;
    status: string;
    item: {
      name: string;
    };
  }[];
}

export default async function ProtectedPage() {
  // AUTENTICACIÓN
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // CONSULTAR DASHBOARD
  const response = await fetch(
    `${process.env.BACKEND_URL ?? "http://localhost:3000"}/dashboard`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "No se pudieron cargar las estadísticas de PrestaFácil",
    );
  }

  const dashboard: DashboardData = await response.json();

  const statistics = [
    {
      title: "Objetos registrados",
      value: dashboard.totalItems,
      description: "Total de objetos en tu inventario",
      icon: Package,
      color: "text-[#16834B]",
      background: "bg-green-50",
    },
    {
      title: "Disponibles",
      value: dashboard.availableItems,
      description: "Listos para prestar",
      icon: PackageCheck,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "Préstamos activos",
      value: dashboard.activeLoans,
      description: "Objetos actualmente prestados",
      icon: Handshake,
      color: "text-orange-600",
      background: "bg-orange-50",
    },
    {
      title: "Préstamos vencidos",
      value: dashboard.overdueLoans,
      description: "Requieren seguimiento",
      icon: ClockAlert,
      color: "text-red-600",
      background: "bg-red-50",
    },
  ];

  const statusLabels: Record<string, string> = {
    ACTIVE: "Activo",
    RETURNED: "Devuelto",
    CANCELLED: "Cancelado",
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700",
    RETURNED: "bg-blue-50 text-blue-700",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-8">
      {/* BIENVENIDA */}
      <section className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#146B43] to-[#16834B] p-7 text-white shadow-sm sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-green-100">
            PANEL PRINCIPAL
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            ¡Bienvenido a PrestaFácil!
          </h1>

          <p className="mt-2 max-w-xl text-sm text-green-50">
            Administra tus objetos, controla tus préstamos y
            mantén todo organizado desde un solo lugar.
          </p>
        </div>

        <Link
          href="/protected/loans/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#146B43] shadow-sm transition hover:bg-green-50"
        >
          <Plus size={19} />
          Registrar préstamo
        </Link>
      </section>

      {/* ESTADÍSTICAS */}
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Resumen general
          </h2>

          <p className="text-sm text-gray-500">
            Estado actual de tu gestión de préstamos.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.title}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.background} ${stat.color}`}
                  >
                    <Icon size={24} />
                  </div>

                  <ArrowUpRight
                    size={19}
                    className="text-gray-300"
                  />
                </div>

                <p className="mt-5 text-sm font-medium text-gray-500">
                  {stat.title}
                </p>

                <h3 className="mt-1 text-3xl font-bold text-gray-900">
                  {stat.value}
                </h3>

                <p className="mt-2 text-xs text-gray-400">
                  {stat.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ALERTA DE VENCIMIENTOS */}
      {dashboard.overdueLoans > 0 && (
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-1 shrink-0 text-red-600"
              size={23}
            />

            <div>
              <h3 className="font-bold text-red-800">
                Tienes préstamos vencidos
              </h3>

              <p className="mt-1 text-sm text-red-700">
                Hay {dashboard.overdueLoans} préstamo(s) que requieren
                seguimiento.
              </p>
            </div>
          </div>

          <Link
            href="/protected/loans"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Revisar préstamos
            <ArrowUpRight size={16} />
          </Link>
        </section>
      )}

      {/* ACTIVIDAD Y ACCESOS */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* ACTIVIDAD RECIENTE */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Actividad reciente
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Tus últimos movimientos de préstamos.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#16834B]">
              <ClipboardList size={23} />
            </div>
          </div>

          {dashboard.recentLoans.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-5 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[#16834B]">
                <Package size={27} />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                Aún no hay movimientos
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Cuando registres tus primeros préstamos,
                aparecerán aquí.
              </p>

              <Link
                href="/protected/loans/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#146B43] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#105735]"
              >
                <Plus size={17} />
                Crear préstamo
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {dashboard.recentLoans.map((loan) => {
                const overdue =
                  loan.status === "ACTIVE" &&
                  new Date(loan.dueDate) < new Date();

                const label = overdue
                  ? "Vencido"
                  : statusLabels[loan.status] ?? loan.status;

                const color = overdue
                  ? "bg-red-50 text-red-700"
                  : statusColors[loan.status] ??
                    "bg-gray-100 text-gray-600";

                return (
                  <article
                    key={loan.id}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-green-200 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#16834B]">
                        <Package size={22} />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {loan.item.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Prestado a: {loan.borrowerName}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={13} />
                            {formatDate(loan.loanDate)}
                          </span>

                          <span>
                            Devolución: {formatDate(loan.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${color}`}
                    >
                      {label}
                    </span>
                  </article>
                );
              })}
            </div>
          )}

          <Link
            href="/protected/loans"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#16834B] hover:text-[#105735]"
          >
            Ver todos los préstamos
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Accesos rápidos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Gestiona PrestaFácil fácilmente.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/protected/objects"
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-green-200 hover:bg-green-50"
            >
              <Package
                size={22}
                className="text-[#16834B]"
              />

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Mis objetos
                </p>

                <p className="text-xs text-gray-500">
                  Consultar inventario
                </p>
              </div>

              <ArrowUpRight size={17} className="text-gray-400" />
            </Link>

            <Link
              href="/protected/loans/new"
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-green-200 hover:bg-green-50"
            >
              <Plus size={22} className="text-[#16834B]" />

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Nuevo préstamo
                </p>

                <p className="text-xs text-gray-500">
                  Registrar un objeto prestado
                </p>
              </div>

              <ArrowUpRight size={17} className="text-gray-400" />
            </Link>

            <Link
              href="/protected/loans"
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-green-200 hover:bg-green-50"
            >
              <ClockAlert
                size={22}
                className="text-[#16834B]"
              />

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Préstamos y pendientes
                </p>

                <p className="text-xs text-gray-500">
                  Revisar estados y devoluciones
                </p>
              </div>

              <ArrowUpRight size={17} className="text-gray-400" />
            </Link>

            <Link
              href="/protected/loans"
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-green-200 hover:bg-green-50"
            >
              <ClipboardList
                size={22}
                className="text-[#16834B]"
              />

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Historial
                </p>

                <p className="text-xs text-gray-500">
                  Consultar préstamos anteriores
                </p>
              </div>

              <ArrowUpRight size={17} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* MENSAJE FINAL */}
      <section className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-5">
        <CheckCircle
          size={22}
          className="mt-0.5 shrink-0 text-[#16834B]"
        />

        <div>
          <h3 className="font-semibold text-green-900">
            Tu inventario bajo control
          </h3>

          <p className="mt-1 text-sm text-green-800">
            PrestaFácil te permite conocer quién tiene tus objetos,
            controlar las fechas de devolución y mantener actualizado
            tu inventario.
          </p>
        </div>
      </section>
    </div>
  );
}
