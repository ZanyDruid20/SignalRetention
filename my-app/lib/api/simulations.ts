import type { SimulationRead, SimulationRequest } from "@/types/api";
import { apiGet, apiPost } from "@/lib/api/client";

export async function listSimulations(token: string): Promise<SimulationRead[]> {
  return apiGet<SimulationRead[]>("/simulations", token);
}

export async function createSimulation(
  token: string,
  simulationRequest: SimulationRequest
): Promise<SimulationRead> {
  return apiPost<SimulationRead, SimulationRequest>(
    "/simulations",
    token,
    simulationRequest
  );
}

export async function getSimulation(
  token: string,
  simulationId: string,
): Promise<SimulationRead> {
  return apiGet<SimulationRead>(
    `/simulations/${encodeURIComponent(simulationId)}`,
    token
  );
}