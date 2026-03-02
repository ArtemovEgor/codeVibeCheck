export const INPUT_VALIDATION = {
  NAME: String.raw`^[\p{L}\s'-]+$`,
  EMAIL: String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
  PASSWORD: "^.{6,50}$",
} as const;
