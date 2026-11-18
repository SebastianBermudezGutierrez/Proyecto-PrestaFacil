import { vi } from "vitest";

const {
  push,
  replace,
  refresh,
  back,
  router,
  mockSupabase,
  mockSession,
} = vi.hoisted(() => {
  const push = vi.fn();
  const replace = vi.fn();
  const refresh = vi.fn();
  const back = vi.fn();

  const router = {
    push,
    replace,
    refresh,
    back,
  };

  const mockSession = {
    access_token: "token-de-prueba",
    refresh_token: "refresh-token-de-prueba",
    user: {
      id: "user-test-1",
      email: "demo@test.com",
    },
  };

  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  };

  return {
    push,
    replace,
    refresh,
    back,
    router,
    mockSupabase,
    mockSession,
  };
});

export {
  push,
  replace,
  refresh,
  back,
  router,
  mockSupabase,
  mockSession,
};

export function resetSupabase(hasSession: boolean = true) {
  mockSupabase.auth.signInWithPassword.mockReset();
  mockSupabase.auth.signOut.mockReset();
  mockSupabase.auth.getSession.mockReset();
  mockSupabase.auth.getUser.mockReset();
  mockSupabase.auth.onAuthStateChange.mockReset();

  mockSupabase.auth.signInWithPassword.mockResolvedValue({
    data: {
      user: mockSession.user,
      session: mockSession,
    },
    error: null,
  });

  mockSupabase.auth.getSession.mockResolvedValue({
    data: {
      session: hasSession ? mockSession : null,
    },
    error: null,
  });

  mockSupabase.auth.getUser.mockResolvedValue({
    data: {
      user: hasSession ? mockSession.user : null,
    },
    error: null,
  });

  mockSupabase.auth.signOut.mockResolvedValue({
    error: null,
  });

  mockSupabase.auth.onAuthStateChange.mockReturnValue({
    data: {
      subscription: {
        unsubscribe: vi.fn(),
      },
    },
  });
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/protected",
  useSearchParams: () => new URLSearchParams(),
}));
