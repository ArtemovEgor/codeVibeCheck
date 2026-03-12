import express from "express";
import cors from "cors";
import "./database";

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

app.listen(PORT, () => {
  console.log(`Server listens to: http://localhost:${PORT}`);
  console.log(`Check health: http://localhost:${PORT}/api/health`);
});
