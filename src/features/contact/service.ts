import { create as repoCreateContactMessage } from "./repository";
import type { ContactInput } from "./types";

export async function submitContactMessage(input: ContactInput) {
  return await repoCreateContactMessage(input);
}
