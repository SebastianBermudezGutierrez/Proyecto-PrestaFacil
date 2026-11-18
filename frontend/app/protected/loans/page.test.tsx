import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { resetSupabase } from "../../../src/test/mocks";
import LoansPage from "./page";

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

const activeLoan = {
  id: "loan-1",
  borrowerName: "María Pérez",
  borrowerContact: "maria@test.com",
  loanDate: "2026-11-10T10:00:00.000Z",
  dueDate: "2099-12-31T10:00:00.000Z",
  returnedAt: null,
  status: "ACTIVE",
  notes: "Cuidar el equipo",
  item: {
    id: "item-1",
    name: "Portátil",
    category: "Tecnología",
  },
};

const returnedLoan = {
  id: "loan-2",
  borrowerName: "Carlos Gómez",
  borrowerContact: null,
  loanDate: "2026-10-10T10:00:00.000Z",
  dueDate: "2026-10-15T10:00:00.000Z",
  returnedAt: "2026-10-14T10:00:00.000Z",
  status: "RETURNED",
  notes: null,
  item: {
    id: "item-2",
    name: "Taladro",
    category: "Herramientas",
  },
};

describe("LoansPage", () => {
  beforeEach(() => {
    resetSupabase();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [activeLoan, returnedLoan],
      } as Response)
    );
  });

  it("muestra los préstamos y permite filtrarlos por estado", async () => {
    render(<LoansPage />);

    expect(
      await screen.findByText(/María Pérez/)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Carlos Gómez/)
    ).toBeInTheDocument();

    expect(screen.getByText("Portátil")).toBeInTheDocument();
    expect(screen.getByText("Taladro")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "RETURNED" },
    });

    expect(
      screen.getByText(/Carlos Gómez/)
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/María Pérez/)
    ).not.toBeInTheDocument();
  });

  it("registra la devolución de un préstamo activo", async () => {
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [activeLoan],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: "Devolución registrada",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            ...activeLoan,
            status: "RETURNED",
            returnedAt: "2026-11-18T10:00:00.000Z",
          },
        ],
      } as Response);

    render(<LoansPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: /registrar devolución/i,
      })
    );

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/loans/loan-1/return",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    expect(
      await screen.findByText(
        'La devolución de "Portátil" fue registrada.'
      )
    ).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});
