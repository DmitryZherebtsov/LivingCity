import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AdminOrganizations from "./AdminOrganizations";

const mockUseAuth = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

describe("AdminOrganizations", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("keeps a stable hook order when auth resolves to a non-admin user", async () => {
    // Regression test for a Rules-of-Hooks violation: a `useEffect` used to be
    // declared *after* an early `return` guarding non-admin users, so this
    // exact isLoading(true) -> isLoading(false, non-admin) transition used to
    // throw "Rendered fewer hooks than expected on the second render."
    mockUseAuth.mockReturnValue({ user: null, isLoading: true });

    const { rerender } = render(<AdminOrganizations />);

    mockUseAuth.mockReturnValue({
      user: { role: "moderator" },
      isLoading: false,
    });

    expect(() => rerender(<AdminOrganizations />)).not.toThrow();

    await waitFor(() => {
      expect(screen.getByText("Brak dostępu")).toBeInTheDocument();
    });
  });

  it("fetches organizations once auth resolves to an admin user", async () => {
    const api = (await import("@/lib/api")).default;

    mockUseAuth.mockReturnValue({
      user: { role: "admin" },
      isLoading: false,
    });

    render(<AdminOrganizations />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/organizations?status=")
      );
    });
  });
});
