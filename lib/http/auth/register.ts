import axios from "axios";
import { apiUrl } from "../api-url";

const TICKETS_URL = apiUrl("/auth/register");

export async function register<T>(username: string, email: string, password: string, signal?: AbortSignal): Promise<T> {
  const response = await axios.post<T>(TICKETS_URL, { username, email, password }, {
    headers: { 
      "Content-Type": "application/json",
      Accept: "application/json" 
    },
    signal,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Não foi possível fazer registro (${response.status}).`);
  }

  return response.data;
}
