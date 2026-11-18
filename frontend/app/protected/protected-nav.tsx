"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Handshake,
  Clock3,
  History,
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/protected",
    icon: LayoutDashboard,
  },
  {
    name: "Mis objetos",
    href: "/protected/objects",
    icon: Package,
  },
  {
    name: "Nuevo préstamo",
    href: "/protected/loans/new",
    icon: Handshake,
  },
  {
    name: "Pendientes",
    href: "/protected/loans/pending",
    icon: Clock3,
  },
  {
    name: "Historial",
    href: "/protected/history",
    icon: History,
  },
];

export function ProtectedNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/protected") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* MENÚ PARA COMPUTADOR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#146B43] text-white md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#146B43]">
            <Handshake size={26} />
          </div>

          <div>
            <h1 className="text-xl font-bold">PrestaFácil</h1>
            <p className="text-xs text-green-100">
              Gestión de préstamos
            </p>
          </div>
        </div>

        <div className="px-4 py-7">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-green-200">
            Menú principal
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-white text-[#146B43] shadow-sm"
                      : "text-green-50 hover:bg-white/10"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-5">
          <div className="rounded-xl border border-white/15 bg-white/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck size={19} />
              <span className="text-sm font-semibold">
                Acceso seguro
              </span>
            </div>

            <p className="text-xs leading-5 text-green-100">
              Tu información está protegida mediante autenticación.
            </p>
          </div>
        </div>
      </aside>

      {/* MENÚ PARA CELULARES */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white px-2 py-2 shadow-lg md:hidden">
        <div className="flex items-center justify-around gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-center text-[10px] font-medium ${
                  active
                    ? "bg-green-50 text-[#146B43]"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon size={19} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
