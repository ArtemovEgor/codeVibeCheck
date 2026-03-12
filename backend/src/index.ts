import express from "express";
import cors from "cors";
import "./database";
import { registerUser } from "./auth.service";
import { IRegisterCredentials } from "./types.js";

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

    console.log("Получены данные:", JSON.stringify(credentials, null, 2));
    console.log(
      "Кодировка имени:",
      Buffer.from(credentials.name).toString("hex"),
    );

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
      error: error instanceof Error ? error.message : "Ошибка регистрации",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listens to: http://localhost:${PORT}`);
  console.log(`Check health: http://localhost:${PORT}/api/health`);
  console.log(`Registration: POST http://localhost:${PORT}/api/auth/register`);
});
