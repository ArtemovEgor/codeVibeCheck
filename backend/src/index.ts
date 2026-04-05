import "dotenv/config";
import express from "express";
import cors from "cors";
import "./database";
import { registerUser, loginUser, getUserById } from "./auth.service";
import { IRegisterCredentials, ILoginCredentials } from "./types";
import { EN } from "./locale/en";
import {
  getChatHistory,
  resetChat,
  sendChatMessage,
  getUserChatStats,
} from "./ai/ai.service";
import { ISendMessagePayload } from "./ai/ai.types";
import { verifyToken } from "./utils/verify-token";
import {
  getAllTopics,
  getTopicById,
  getWidgetsByTopicId,
  getWidgetById,
  submitWidgetAnswer,
  getUserProgress,
  getUserLearningStats,
  getUserProgressByTopicId,
  initUserTopicProgress,
  updateUserTopicProgress,
  resetUserTopicProgress,
} from "./widgets.service";

const app = express();
const PORT = process.env.PORT || 5000;
const LANG = EN;

/** Simple auth helper to extract userId from request */
const getUserId = (request: express.Request): string => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error(LANG.errors.unauthorized, { cause: "MISSING_TOKEN" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error(LANG.errors.unauthorized, { cause: "EMPTY_TOKEN" });
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

/** GET /api/auth/me - Get Current User Profile */
app.get("/api/auth/me", (request, response) => {
  try {
    const userId = getUserId(request);
    const user = getUserById(userId);

    if (!user) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.user_not_found,
      });
    }

    response.status(200).json({
      data: user,
      success: true,
    });
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;
    response.status(status).json({ success: false, status, message });
  }
});

// Widget EndPoints
/** GET /api/topics - Get all topics */
app.get("/api/topics", (_request, response) => {
  try {
    const topics = getAllTopics();

    if (topics.length === 0) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.topics_no_data,
      });
    }

    response.json({
      success: true,
      data: topics,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      status: 500,
      message:
        error instanceof Error ? error.message : LANG.errors.server_error,
    });
  }
});

/** GET /api/topics/:id - Get topic by id */
app.get("/api/topics/:id", (request, response) => {
  try {
    const { id } = request.params;
    const topic = getTopicById(id);

    if (!topic) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.topic_not_found,
      });
    }

    response.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      status: 500,
      message:
        error instanceof Error ? error.message : LANG.errors.server_error,
    });
  }
});

/** GET /api/topics/:id/widgets - Get all widgets for topick by id */
app.get("/api/topics/:id/widgets", (request, response) => {
  try {
    const { id } = request.params;
    const topic = getTopicById(id);

    if (!topic) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.topic_not_found,
      });
    }

    const widgets = getWidgetsByTopicId(id);
    response.json({
      success: true,
      data: widgets,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      status: 500,
      message:
        error instanceof Error ? error.message : LANG.errors.server_error,
    });
  }
});

/** GET /api/widgets/:id - Get widget by id */
app.get("/api/widgets/:id", (request, response) => {
  try {
    const { id } = request.params;
    const widget = getWidgetById(id);

    if (!widget) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.widget_not_found,
      });
    }

    response.json({
      success: true,
      data: widget,
    });
  } catch (error) {
    console.error("Ошибка при получении виджета по ID:", error);
    response.status(500).json({
      success: false,
      status: 500,
      message:
        error instanceof Error ? error.message : LANG.errors.server_error,
    });
  }
});

/** POST /api/widgets/:id/submit - Answer check */
app.post("/api/widgets/:id/submit", (request, response) => {
  try {
    const userId = getUserId(request);
    const { id: widgetId } = request.params;

    if (!widgetId) {
      return response.status(400).json({
        success: false,
        status: 400,
        message: LANG.errors.missing_widget_id,
      });
    }

    const { answer } = request.body;
    if (answer === undefined) {
      return response.status(400).json({
        success: false,
        status: 400,
        message: "Answer is required",
      });
    }

    const verdict = submitWidgetAnswer(widgetId, userId, answer);

    response.status(200).json({
      success: true,
      data: verdict,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "WIDGET_NOT_FOUND") {
        return response.status(404).json({
          success: false,
          status: 404,
          message: LANG.errors.widget_not_found,
        });
      }
      if (error.message === "UNKNOWN_WIDGET_TYPE") {
        return response.status(400).json({
          success: false,
          status: 400,
          message: "Unsupported widget type",
        });
      }
      if (error.message === "INVALID_ANSWER_DATA") {
        return response.status(500).json({
          success: false,
          status: 500,
          message: "Invalid answer data in database",
        });
      }
    }

    const isAuthError =
      error instanceof Error &&
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;

    response.status(status).json({ success: false, message });
  }
});

/** GET /api/progress - Get user progress */
/* If the user has no progress, an empty array is returned. */
app.get("/api/progress", (request, response) => {
  try {
    const userId = getUserId(request);
    const progress = getUserProgress(userId);

    response.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;

    response.status(status).json({ success: false, message });
  }
});

/** GET /api/progress/stats - Get user stats */
app.get("/api/progress/stats", (request, response) => {
  try {
    const userId = getUserId(request);
    const stats = getUserLearningStats(userId);

    response.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;

    response.status(status).json({ success: false, message });
  }
});

/** GET /api/progress/:topicId - Get user progress by topic id */
app.get("/api/progress/:topicId", (request, response) => {
  try {
    const userId = getUserId(request);
    const { topicId } = request.params;

    if (!topicId) {
      return response.status(400).json({
        success: false,
        status: 400,
        message: LANG.errors.missing_topic_id,
      });
    }

    const topic = getTopicById(topicId);
    if (!topic) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.topic_not_found,
      });
    }

    const progress = getUserProgressByTopicId(userId, topicId);
    if (!progress) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.progress_not_found,
      });
    }

    response.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;

    response.status(status).json({ success: false, message });
  }
});

/** POST /api/progress/:topicId/init - Init progress by topic id */
app.post("/api/progress/:topicId/init", (request, response) => {
  try {
    const userId = getUserId(request);
    const { topicId } = request.params;

    if (!topicId) {
      return response.status(400).json({
        success: false,
        status: 400,
        message: LANG.errors.missing_topic_id,
      });
    }

    const topic = getTopicById(topicId);
    if (!topic) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.topic_not_found,
      });
    }

    const progress = initUserTopicProgress(userId, topicId);

    response.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;

    response.status(status).json({ success: false, message });
  }
});

/** POST /api/progress - Update progress after responding to widget */
app.post("/api/progress", (request, response) => {
  try {
    const userId = getUserId(request);
    const { topicId, widgetId, xpEarned, totalWidgets } = request.body;

    if (!topicId || !widgetId || totalWidgets === undefined) {
      return response.status(400).json({
        success: false,
        status: 400,
        message: "Missing required fields: topicId, widgetId, totalWidgets",
      });
    }

    if (typeof xpEarned !== "number" || xpEarned < 0) {
      return response.status(400).json({
        success: false,
        status: 400,
        message: "xpEarned must be a non-negative number",
      });
    }

    const widget = getWidgetById(widgetId);
    if (!widget) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.widget_not_found,
      });
    }

    const topic = getTopicById(topicId);
    if (!topic) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.topic_not_found,
      });
    }

    const updatedProgress = updateUserTopicProgress(userId, {
      topicId,
      widgetId,
      xpEarned,
      totalWidgets,
    });

    response.json({
      success: true,
      data: updatedProgress,
    });
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;

    response.status(status).json({ success: false, message });
  }
});

/** PATCH /api/progress/:topicId/reset - Resetting progress by theme (clearing widgets and XP) */
app.patch("/api/progress/:topicId/reset", (request, response) => {
  try {
    const userId = getUserId(request);
    const { topicId } = request.params;

    if (!topicId) {
      return response.status(400).json({
        success: false,
        status: 400,
        message: LANG.errors.missing_topic_id,
      });
    }

    const topic = getTopicById(topicId);
    if (!topic) {
      return response.status(404).json({
        success: false,
        status: 404,
        message: LANG.errors.topic_not_found,
      });
    }

    const updatedProgress = resetUserTopicProgress(userId, topicId);

    response.json({
      success: true,
      data: updatedProgress,
    });
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;

    response.status(status).json({ success: false, message });
  }
});

// AI EndPoints
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
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    if (response.headersSent) {
      console.error("Stream failed", error);
      const errorMessage =
        error instanceof Error ? error.message : LANG.errors.stream_interrupted;
      response.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      response.end();
    } else {
      const status = isAuthError ? 401 : 500;
      const message =
        error instanceof Error ? error.message : LANG.errors.internal_error;
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
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;
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
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;
    response.status(status).json({ success: false, message });
  }
});

app.get("/api/profile/chat-stats", (request, response) => {
  try {
    const userId = getUserId(request);
    const stats = getUserChatStats(userId);

    if (!stats) {
      return response.json({
        success: true,
        data: {
          userId,
          totalXp: 0,
          chatSessionsCompleted: 0,
          lastChatXpEarned: 0,
        },
      });
    }

    response.json({ success: true, data: stats });
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message === LANG.errors.unauthorized ||
        error.message === LANG.errors.invalid_token);

    const status = isAuthError ? 401 : 500;
    const message =
      error instanceof Error ? error.message : LANG.errors.internal_error;
    response.status(status).json({ success: false, message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listens to: http://localhost:${PORT}`);
  console.log(`Check health: http://localhost:${PORT}/api/health`);
  console.log(`Registration: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`Login: POST http://localhost:${PORT}/api/auth/login`);
});
