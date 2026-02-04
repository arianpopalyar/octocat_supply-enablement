import { vi } from "vitest";

/**
 * Test setup file for Vitest
 * Mocks external dependencies that are not yet installed or needed for tests
 */

// Mock @tao/core package until it's implemented
vi.mock("@tao/core", () => ({
  MetricRegistry: {
    counter: vi.fn(),
    gauge: vi.fn(),
    histogram: vi.fn(),
  },
  Trace: vi.fn(() => () => {}), // Decorator mock
  Log: vi.fn(() => () => {}), // Decorator mock
  Measure: vi.fn(() => () => {}), // Decorator mock
  getTraceContext: vi.fn(() => ({
    traceId: "test-trace-id",
    spanId: "test-span-id",
  })),
  initTAO: vi.fn(),
  observe: vi.fn(() => (req: any, res: any, next: any) => next()),
}));
