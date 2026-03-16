import "dotenv/config";
import express from "express";
import cors from "cors";
import "./database";
import { registerUser, loginUser } from "./auth.service";
import { IRegisterCredentials, ILoginCredentials } from "./types";
import { EN } from "./locale/en";
import { getChatHistory, resetChat, sendChatMessage } from "./ai/ai.service";
import { ISendMessagePayload } from "./ai/ai.types";
import { verifyToken } from "./utils/verify-token";

const app = express();
const PORT = process.env.PORT || 5000;
const LANG = EN;

/** Simple auth helper to extract userId from request */
const getUserId = (request: express.Request): string => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized", { cause: "MISSING_TOKEN" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Unauthorized", { cause: "EMPTY_TOKEN" });
  }

  const decoded = verifyToken(token);
  return decoded.id;
};

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
    message: LANG.messages.server_status,
  });
});

/** POST /api/auth/register - Registers a new user */
app.post("/api/auth/register", (request, response) => {
  try {
    const credentials: IRegisterCredentials = request.body;

    if (!credentials.email || !credentials.password || !credentials.name) {
      throw new Error(LANG.errors.all_fields_required);
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

    response.status(201).json({
      data: registerResult,
      success: true,
    });
  } catch (error) {
    /* Only for dev */
    console.log(`${LANG.errors.registration_error}:`, error);

    response.status(400).json({
      success: false,
      status: 400,
      message:
        error instanceof Error ? error.message : LANG.errors.registration_error,
    });
  }
});

/** POST /api/auth/login - User Login */
app.post("/api/auth/login", (request, response) => {
  try {
    const credentials: ILoginCredentials = request.body;

    if (!credentials.email || !credentials.password) {
      throw new Error(EN.errors.email_password_required);
    }

    const loginResult = loginUser(credentials);

    response.status(200).json({
      data: loginResult,
      success: true,
    });
  } catch (error) {
    /* Only for dev */
    console.error(`${LANG.errors.login_error}:`, error);

    const statusCode =
      error instanceof Error &&
      error.message === LANG.errors.incorrect_mail_password
        ? 401
        : 400;

    response.status(statusCode).json({
      success: false,
      status: statusCode,
      message: error instanceof Error ? error.message : LANG.errors.login_error,
    });
  }
});

app.post("/api/ai/chat", async (request, response) => {
  const controller = new AbortController();

  response.on("close", () => {
    controller.abort();
  });

  try {
    const userId = getUserId(request);
    const message: ISendMessagePayload = request.body;

    const stream = sendChatMessage(userId, message, controller.signal);

    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("X-Accel-Buffering", "no");

    for await (const chunk of stream) {
      if (response.writableEnded) {
        controller.abort();
        break;
      }
      response.write(`data: ${JSON.stringify(chunk)}\n\n`, (error) => {
        if (error) {
          console.error("Write error during SSE streaming:", error);
          controller.abort();
        }
      });
    }

    response.end();
  } catch (error) {
    if (controller.signal?.aborted) return;

    const isAuthError =
      error instanceof Error &&
      (error.message === "Unauthorized" ||
        error.message === "Invalid or expired token");

    if (response.headersSent) {
      console.error("Stream failed", error);
      response.write(
        `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`,
      );
      response.end();
    } else {
      const status = isAuthError ? 401 : 500;
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      response.status(status).json({ success: false, message });
    }
  }
});

app.get("/api/ai/chat", (request, response) => {
  try {
    const userId = getUserId(request);
    const history = getChatHistory(userId);
    response.json({ success: true, data: history });
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message === "Unauthorized" ||
        error.message === "Invalid or expired token");

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    response.status(status).json({ success: false, message });
  }
});

app.delete("/api/ai/chat", (request, response) => {
  try {
    const userId = getUserId(request);
    resetChat(userId);
    response.json({ success: true });
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message === "Unauthorized" ||
        error.message === "Invalid or expired token");

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    response.status(status).json({ success: false, message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listens to: http://localhost:${PORT}`);
  console.log(`Check health: http://localhost:${PORT}/api/health`);
  console.log(`Registration: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`Login: POST http://localhost:${PORT}/api/auth/login`);
});
