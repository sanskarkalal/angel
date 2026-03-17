import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import readingRouter from "./routes/reading";
import onboardingRouter from "./routes/onboarding";
import profileRouter from "./routes/profile";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? "3000", 10);

// Middleware
app.use(cors({
  origin: "*", // In production, restrict to your app's domain
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "alive",
    message: "Angel is present.",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/reading", readingRouter);
app.use("/api/chat", (req, res, next) => {
  // Alias /api/chat to /api/reading/chat
  req.url = "/chat" + req.url;
  readingRouter(req, res, next);
});
app.use("/api/onboard", onboardingRouter);
app.use("/api/profile", profileRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "This path does not exist." });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something stirred in the connection." });
});

app.listen(PORT, () => {
  console.log(`✦ Angel server listening on port ${PORT}`);
});

export default app;
