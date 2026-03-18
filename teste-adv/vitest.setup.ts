// Must run before any imports that use env (e.g. api-routes)
process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

import "@testing-library/jest-dom/vitest";
