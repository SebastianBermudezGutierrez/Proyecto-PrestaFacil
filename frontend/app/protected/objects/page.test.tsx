import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  resetSupabase,
} from "../../../src/test/mocks";

import ObjectsPage from "./page";

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

describe("ObjectsPage", () => {
  beforeEach(() => {
    resetSupabase();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          totalItems: 2,
          availableItems: 1,
          loanedItems: 1,
          items: [
            {
              id: "item-1",
              name: "Portátil",
              description: "Portátil personal",
              category: "Tecnología",
              status: "AVAILABLE",
              createdAt: "2026-01-15T10:00:00.000Z",
              _count: { loans: 0 },
            },
            {
              id: "item-2",
              name: "Taladro",
              description: "Taladro eléctrico",
              category: "Herramientas",
              status: "LOANED",
              createdAt: "2026-01-16T10:00:00.000Z",
              _count: { loans: 2 },
            },
          ],
        }),
      } as Response)
    );
  });

  it("muestra los objetos registrados y permite buscarlos", async () => {
    render(<ObjectsPage />);

    expect(
      await screen.findByText("Portátil")
    ).toBeInTheDocument();

    expect(screen.getByText("Taladro")).toBeInTheDocument();

    expect(screen.getByText("Disponible")).toBeInTheDocument();
    expect(screen.getByText("Prestado")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Buscar objeto...");

    fireEvent.change(searchInput, {
      target: { value: "Taladro" },
    });

    expect(screen.getByText("Taladro")).toBeInTheDocument();
    expect(screen.queryByText("Portátil")).not.toBeInTheDocument();
  });
});
