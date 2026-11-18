import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  push,
  replace,
  resetSupabase,
} from "../../../../src/test/mocks";

import NewLoanPage from "./page";

describe("NewLoanPage", () => {
  beforeEach(() => {
    resetSupabase();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "item-1",
              name: "Portátil",
              category: "Tecnología",
              status: "AVAILABLE",
            },
            {
              id: "item-2",
              name: "Taladro",
              category: "Herramientas",
              status: "LOANED",
            },
          ],
        }),
      } as Response)
    );

    push.mockClear();
    replace.mockClear();
  });

  it("lista solo los objetos disponibles", async () => {
    render(<NewLoanPage />);

    expect(
      await screen.findByRole("option", { name: /portátil/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("option", { name: /taladro/i })
    ).not.toBeInTheDocument();
  });

  it("redirige al login si no hay sesión", async () => {
    resetSupabase(false);

    render(<NewLoanPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("envía un préstamo y redirige", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "item-1",
              name: "Portátil",
              category: "Tecnología",
              status: "AVAILABLE",
            },
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "loan-1" }),
      } as Response);

    render(<NewLoanPage />);

    fireEvent.change(
      await screen.findByRole("combobox"),
      { target: { value: "item-1" } }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/nombre completo/i),
      { target: { value: "María Pérez" } }
    );

    const dateInput = document.querySelector(
      'input[type="date"]'
    );

    expect(dateInput).not.toBeNull();

    fireEvent.change(dateInput!, {
      target: { value: "2099-12-31" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /registrar préstamo|guardar/i,
      })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/loans",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    expect(push).toHaveBeenCalledWith("/protected/loans");
  });
});
