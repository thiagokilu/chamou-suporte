import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { login } from "./login";

vi.mock("axios");

const email = "user@example.com";
const password = "password123";

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the response data on success", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: { token: "mockToken" },
    });

    const result = await login(email, password);

    expect(result).toEqual({ token: "mockToken" });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      { email, password },
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
    );
  });

  it("should throw when the status is not successful (401)", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 401,
      data: { message: "Unauthorized" },
    });

    await expect(login(email, "wrong-password")).rejects.toThrow(
      "Não foi possível fazer login (401).",
    );
  });
});
