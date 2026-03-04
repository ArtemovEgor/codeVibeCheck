export const delay = (ms = Number(import.meta.env.VITE_MOCK_DELAY)) =>
  new Promise((r) => setTimeout(r, ms));
