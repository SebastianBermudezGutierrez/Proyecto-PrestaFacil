import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  push,
  refresh,
  resetSupabase,
} from "../../../../src/test/mocks";

import NewObjectPage from "./page";

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

describe("NewObjectPage", () => {
  beforeEach(() => {
    resetSupabase();
    vi.stubGlobal("fetch", vi.fn());
    push.mockClear();
    refresh.mockClear();
  });

  it("muestra el formulario de registro", () => {
    render(<NewObjectPage />);

    expect(
      screen.getByRole("heading", { name: "Registrar objeto" })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/nombre del objeto/i)
    ).toBeInTheDocument();
  });

  it("rechaza el registro cuando el nombre está vacío", async () => {
    render(<NewObjectPage />);

    fireEvent.change(
      screen.getByLabelText(/nombre del objeto/i),
      { target: { value: "   " } }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /registrar objeto|guardar/i,
      })
    );

    expect(
      await screen.findByText(
        "El nombre del objeto es obligatorio."
      )
    ).toBeInTheDocument();

    expect(fetch).not.toHaveBeenCalled();
  });

  it("envía los datos del objeto y navega al inventario", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "obj-1" }),
    } as Response);

    render(<NewObjectPage />);

    fireEvent.change(
      screen.getByLabelText(/nombre del objeto/i),
      { target: { value: " Portátil " } }
    );

    fireEvent.change(
      screen.getByLabelText(/categoría/i),
      { target: { value: "Tecnología" } }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /registrar objeto|guardar/i,
      })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/items",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Portátil",
            category: "Tecnología",
            description: undefined,
          }),
        })
      );
    });

    expect(refresh).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/protected/objects");
  });
});
