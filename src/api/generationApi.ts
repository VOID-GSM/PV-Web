import { apiRequest } from "./client";

export interface Generation {
  id: number;
  number: number;
}

export function getGenerations() {
  return apiRequest<Generation[]>("/generations");
}