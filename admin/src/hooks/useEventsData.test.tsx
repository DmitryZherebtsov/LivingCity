import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEventsData } from "./useEventsData";

// Regression test for a broken import: this hook used to import a type named
// `EventItem` that was never exported by `eventsService` (only `Event` is),
// which meant the hook could never type-check if it were ever wired up.
vi.mock("@/services/eventsService", () => ({
  fetchEvents: vi.fn().mockResolvedValue([
    { id: 1, lon: "21.0", lat: "52.2", visitor_count: 10, capacity: 100 },
    { id: 2, lon: "19.9", lat: "50.0", visitor_count: 5, capacity: null },
  ]),
}));

describe("useEventsData", () => {
  it("loads events and computes stats using the corrected Event type", async () => {
    const { result } = renderHook(() => useEventsData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.events).toHaveLength(2);
    expect(result.current.stats.totalEvents).toBe(2);
    expect(result.current.stats.activeLocations).toBe(2);
    expect(result.current.stats.totalAttendees).toBe(15);
  });
});
