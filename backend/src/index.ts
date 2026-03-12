import express from "express";
import cors from "cors";
import "./database";
import { registerUser, loginUser } from "./auth.service";
import { IRegisterCredentials, ILoginCredentials } from "./types.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());

/** GET /api/health - Check server state */
app.get("/api/health", (_request, response) => {
  response.json({
    status: "Ok",
    message: "Backend is work!",
    database: "Connected!",
  });
});

/** POST /api/auth/register - Registers a new user */
app.post("/api/auth/register", (request, response) => {
  try {
    const credentials: IRegisterCredentials = request.body;

    if (!credentials.email || !credentials.password || !credentials.name) {
      throw new Error("All fields are required");
    }

    const registerResult = registerUser(credentials);

    /**
     * response.status:
     * - 200 - OK
     * - 201 - Created
     * - 400 - Bad Request (client-side error)
     * - 401 - Unauthorized
     * - 404 - Not Found
     * - 500 - Internal Server Error
     */

    response.status(201).json(registerResult);
  } catch (error) {
    console.log("Registration error:", error);

    response.status(400).json({
      error: error instanceof Error ? error.message : "Registration error",
    });
  }
});

/** POST /api/auth/login - User Login */
app.post("/api/auth/login", (request, response) => {
  try {
    const credentials: ILoginCredentials = request.body;

    if (!credentials.email || !credentials.password) {
      throw new Error("Email and password are required");
    }

    const loginResult = loginUser(credentials);

    response.status(200).json(loginResult);
  } catch (error) {
    console.error("Login Error:", error);

    const statusCode =
      error instanceof Error && error.message === "Incorrect email or password"
        ? 401
        : 400;

    response.status(statusCode).json({
      error: error instanceof Error ? error.message : "Login error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listens to: http://localhost:${PORT}`);
  console.log(`Check health: http://localhost:${PORT}/api/health`);
  console.log(`Registration: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`Login: POST http://localhost:${PORT}/api/auth/login`);
});
