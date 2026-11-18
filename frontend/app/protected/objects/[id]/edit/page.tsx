"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Save,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

interface Item {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
}

export default function EditObjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const itemId = params.id;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar los datos actuales del objeto
  useEffect(() => {
    async function loadItem() {
      try {
        const supabase = createClient();

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `http://localhost:3000/items/${itemId}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          },
        );

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.message || "No se pudo cargar el objeto.",
          );
        }

        const item: Item = result;

        setName(item.name);
        setCategory(item.category || "");
        setDescription(item.description || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar el objeto.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [itemId, router]);

  // Guardar los cambios
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("El nombre del objeto es obligatorio.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/items/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            category: category.trim(),
            description: description.trim(),
          }),
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(result?.message)
          ? result.message.join(", ")
          : result?.message;

        throw new Error(message || "No se pudo actualizar el objeto.");
      }

      setSuccess("¡Objeto actualizado correctamente!");

      router.refresh();
      router.push("/protected/objects");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al actualizar el objeto.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-gray-500">
        <LoaderCircle size={22} className="animate-spin" />
        Cargando información del objeto...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Encabezado */}
      <section>
        <Link
          href="/protected/objects"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#16834B]"
        >
          <ArrowLeft size={17} />
          Volver a mis objetos
        </Link>

        <p className="mb-2 text-sm font-medium text-[#16834B]">
          INVENTARIO
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Editar objeto
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Modifica la información de tu pertenencia.
        </p>
      </section>

      {/* Formulario */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#16834B]">
            <Package size={25} />
          </div>

          <div>
            <h2 className="font-bold text-gray-900">
              Información del objeto
            </h2>

            <p className="text-sm text-gray-500">
              Actualiza los campos que necesites.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Nombre del objeto *
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16834B] focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Categoría */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Categoría
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#16834B] focus:ring-2 focus:ring-green-100"
            >
              <option value="">Selecciona una categoría</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Herramientas">Herramientas</option>
              <option value="Hogar">Hogar</option>
              <option value="Deportes">Deportes</option>
              <option value="Libros y estudio">Libros y estudio</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Descripción
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16834B] focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Mensajes */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={19} className="shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle size={19} />
              {success}
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/protected/objects"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#146B43] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#105735] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
