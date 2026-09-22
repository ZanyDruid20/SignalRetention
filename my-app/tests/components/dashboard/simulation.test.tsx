import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ScenarioSimulator } from "@/components/dashboard/simulation";
import { makeDataset, makeSimulation } from "@/tests/fixtures/factories";

const mocks = vi.hoisted(() => ({ runSimulation: vi.fn(), useSimulations: vi.fn() }));
vi.mock("@/hooks/use-simulations", () => ({ useSimulations: mocks.useSimulations }));

describe("ScenarioSimulator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSimulations.mockReturnValue({ datasets: [makeDataset({ id: "dataset-1", name: "Demo dataset" })], simulations: [], result: null, isLoading: false, isRunning: false, error: null, refresh: vi.fn(), runSimulation: mocks.runSimulation });
  });

  it("submits defaults against the first completed dataset", async () => {
    mocks.runSimulation.mockResolvedValue(makeSimulation());
    render(<ScenarioSimulator />);
    await userEvent.click(screen.getByRole("button", { name: /Run Simulation/ }));
    expect(mocks.runSimulation).toHaveBeenCalledWith({ dataset_id: "dataset-1", intervention_type: "discount", target_segment: "high-risk", intensity_percentage: 50 });
  });

  it("disables execution when no dataset exists", () => {
    mocks.useSimulations.mockReturnValue({ datasets: [], simulations: [], result: null, isLoading: false, isRunning: false, error: null, refresh: vi.fn(), runSimulation: mocks.runSimulation });
    render(<ScenarioSimulator />);
    expect(screen.getByText("Upload and process a dataset before running a simulation.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Run Simulation/ })).toBeDisabled();
  });

  it("formats projected simulation results and hides backend details", () => {
    mocks.useSimulations.mockReturnValue({ datasets: [makeDataset()], simulations: [], result: makeSimulation({ estimated_revenue_saved: "1200", predicted_churn_reduction: "0.15", estimated_customers_retained: 3, roi: "3" }), isLoading: false, isRunning: false, error: "internal stack trace", refresh: vi.fn(), runSimulation: mocks.runSimulation });
    render(<ScenarioSimulator />);
    expect(screen.getByText("$1,200")).toBeInTheDocument();
    expect(screen.getByText("15.0%")).toBeInTheDocument();
    expect(screen.getByText("3.00x")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Unable to run the simulation. Please try again.");
    expect(screen.queryByText("internal stack trace")).not.toBeInTheDocument();
  });
});
