import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  mockSupabase,
  push,
  resetSupabase,
} from "../src/test/mocks";
import { LoginForm } from "./login-form";


vi.mock("next/link", () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    resetSupabase();
    push.mockClear();
  });

  it("muestra los campos de correo y contraseña", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("inicia sesión y redirige al dashboard", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "demo@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Clave123!" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    await waitFor(() => {
      expect(
        mockSupabase.auth.signInWithPassword
      ).toHaveBeenCalledWith({
        email: "demo@test.com",
        password: "Clave123!",
      });
    });

    expect(push).toHaveBeenCalledWith("/protected");
  });

  it("muestra un mensaje cuando Supabase rechaza las credenciales", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      error: new Error("Credenciales inválidas"),
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "mal@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "incorrecta" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(
      await screen.findByText("Credenciales inválidas")
    ).toBeInTheDocument();
  });
});
