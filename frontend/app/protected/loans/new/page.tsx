"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Item {
  id: string;
  name: string;
  category: string | null;
}

export default function NewLoanPage() {
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    itemId: "",
    borrowerName: "",
    borrowerContact: "",
    dueDate: "",
    notes: "",
  });

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
          throw new Error("No se pudieron cargar los objetos");
        }

        const data = await response.json();

        setItems(
          data.items.filter(
            (item: { status: string }) => item.status === "AVAILABLE",
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar objetos",
        );
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.itemId) {
      setError("Selecciona un objeto disponible");
      return;
    }

    setSaving(true);

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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message || "No se pudo registrar el préstamo",
        );
      }

      router.push("/protected/loans");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/protected/loans"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-700"
        >
          <ArrowLeft size={17} />
          Volver a préstamos
        </Link>

        <p className="mt-6 text-sm font-semibold text-[#16834B]">
          NUEVO PRÉSTAMO
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Registrar préstamo
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Registra quién recibe el objeto y cuándo debe devolverlo.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Objeto que se prestará
          </label>

          {loading ? (
            <p className="text-sm text-gray-500">Cargando objetos...</p>
          ) : (
            <select
              required
              value={form.itemId}
              onChange={(e) =>
                setForm({ ...form, itemId: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
            >
              <option value="">Selecciona un objeto</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.category ? ` - ${item.category}` : ""}
                </option>
              ))}
            </select>
          )}

          {!loading && items.length === 0 && (
            <p className="mt-2 text-sm text-orange-600">
              No tienes objetos disponibles para prestar.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Nombre de quien recibe el objeto
          </label>

          <input
            required
            maxLength={120}
            value={form.borrowerName}
            onChange={(e) =>
              setForm({ ...form, borrowerName: e.target.value })
            }
            placeholder="Nombre completo"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Contacto
          </label>

          <input
            maxLength={100}
            value={form.borrowerContact}
            onChange={(e) =>
              setForm({ ...form, borrowerContact: e.target.value })
            }
            placeholder="Teléfono o correo electrónico"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Fecha de devolución
          </label>

          <input
            required
            type="date"
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 10)}
            value={form.dueDate}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value })
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Observaciones
          </label>

          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
            placeholder="Información adicional del préstamo..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <button
          type="submit"
          disabled={saving || loading || items.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#146B43] px-5 py-3 font-semibold text-white transition hover:bg-[#105735] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Registrando..." : "Registrar préstamo"}
        </button>
      </form>
    </div>
  );
}
