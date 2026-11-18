"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Search,
  ArrowLeft,
  PackageCheck,
  Handshake,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

interface Item {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: "AVAILABLE" | "LOANED" | "INACTIVE";
  createdAt: string;
  _count: {
    loans: number;
  };
}

interface ItemsResponse {
  totalItems: number;
  availableItems: number;
  loanedItems: number;
  items: Item[];
}

export default function ObjectsPage() {
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // CARGAR INVENTARIO
  useEffect(() => {
    async function loadItems() {
      try {
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/auth/login");
          return;
        }

        const response = await fetch("http://localhost:3000/items", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar el inventario");
        }

        const inventory: ItemsResponse = await response.json();

        setItems(inventory.items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar los objetos",
        );
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [router]);

  // ELIMINAR (DESACTIVAR) OBJETO
  async function handleDelete(item: Item) {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar "${item.name}" del inventario?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(item.id);

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
        `http://localhost:3000/items/${item.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "No se pudo eliminar el objeto",
        );
      }

      setItems((currentItems) =>
        currentItems.filter((current) => current.id !== item.id),
      );

      setSuccess(`"${item.name}" se eliminó del inventario correctamente.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al eliminar el objeto",
      );
    } finally {
      setDeletingId(null);
    }
  }

  // BUSCADOR
  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.category ?? "").toLowerCase().includes(term) ||
        (item.description ?? "").toLowerCase().includes(term),
    );
  }, [items, search]);

  // ESTADÍSTICAS
  const totalItems = items.length;

  const availableItems = items.filter(
    (item) => item.status === "AVAILABLE",
  ).length;

  const loanedItems = items.filter(
    (item) => item.status === "LOANED",
  ).length;

  const statusLabels: Record<string, string> = {
    AVAILABLE: "Disponible",
    LOANED: "Prestado",
    INACTIVE: "Inactivo",
  };

  const statusColors: Record<string, string> = {
    AVAILABLE: "bg-green-50 text-green-700",
    LOANED: "bg-orange-50 text-orange-700",
    INACTIVE: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-8">
      {/* ENCABEZADO */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-[#16834B]">
            INVENTARIO
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Mis objetos
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Administra y consulta todos los objetos que tienes registrados.
          </p>
        </div>

        <Link
          href="/protected/objects/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#146B43] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#105735]"
        >
          <Plus size={19} />
          Registrar objeto
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

      {/* RESUMEN */}
      <section className="grid gap-5 sm:grid-cols-3">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#16834B]">
            <Package size={22} />
          </div>

          <p className="mt-5 text-sm text-gray-500">Total de objetos</p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            {loading ? "..." : totalItems}
          </h2>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#16834B]">
            <PackageCheck size={22} />
          </div>

          <p className="mt-5 text-sm text-gray-500">Disponibles</p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            {loading ? "..." : availableItems}
          </h2>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Handshake size={22} />
          </div>

          <p className="mt-5 text-sm text-gray-500">Prestados</p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            {loading ? "..." : loanedItems}
          </h2>
        </article>
      </section>

      {/* INVENTARIO */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Inventario registrado
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Consulta y administra tus pertenencias.
            </p>
          </div>

          {/* BUSCADOR */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5">
            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar objeto..."
              className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400 sm:w-48"
            />
          </div>
        </div>

        {/* CARGANDO */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[#16834B]" />
            <p className="mt-3 text-sm text-gray-500">
              Cargando inventario...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-5 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#16834B]">
              <Package size={30} />
            </div>

            <h3 className="mt-4 font-semibold text-gray-800">
              Todavía no tienes objetos registrados
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Comienza agregando tus pertenencias para llevar un mejor
              control de tus préstamos.
            </p>

            <Link
              href="/protected/objects/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#146B43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#105735]"
            >
              <Plus size={18} />
              Registrar mi primer objeto
            </Link>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-14 text-center">
            <Search size={30} className="mx-auto text-gray-300" />
            <h3 className="mt-3 font-semibold text-gray-800">
              No encontramos resultados
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta buscar con otro nombre o categoría.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-gray-100 p-5 transition hover:border-green-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#16834B]">
                    <Package size={23} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[item.status]}`}
                  >
                    {statusLabels[item.status]}
                  </span>
                </div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  {item.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {item.category || "Sin categoría"}
                </p>

                {item.description && (
                  <p className="mt-3 text-sm text-gray-500">
                    {item.description}
                  </p>
                )}

                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400">
                    Registrado:{" "}
                    {new Date(item.createdAt).toLocaleDateString("es-CO")}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Historial de préstamos: {item._count.loans}
                  </p>
                </div>

                {/* BOTONES */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href={`/protected/objects/${item.id}/edit`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 px-3 py-2.5 text-sm font-semibold text-[#146B43] transition hover:bg-green-50"
                  >
                    <Pencil size={16} />
                    Editar
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === item.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}

                    {deletingId === item.id ? "Eliminando" : "Eliminar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* VOLVER */}
      <Link
        href="/protected"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#16834B]"
      >
        <ArrowLeft size={17} />
        Volver al dashboard
      </Link>
    </div>
  );
}
