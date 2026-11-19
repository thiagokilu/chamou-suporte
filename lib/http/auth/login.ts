import axios from "axios";
import { apiUrl } from "../api-url";

const TICKETS_URL = apiUrl("/auth/login");

export async function login<T>(
  email: string,
  password: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await axios.post<T>(
    TICKETS_URL,
    { email, password },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal,
      validateStatus: () => true,
    },
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Não foi possível fazer login (${response.status}).`);
  }

  return response.data;
}
