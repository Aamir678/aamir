import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize MongoDB connection if URI is provided
  const mongoUri = process.env.MONGODB_URI;
  let databaseConnection = null;
  
  if (mongoUri) {
    try {
      // Set a timeout for the entire database connection attempt
      const connectionPromise = connectToDatabase();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('MongoDB connection attempt timed out')), 6000);
      });
      
      databaseConnection = await Promise.race([connectionPromise, timeoutPromise]);
      
      if (databaseConnection) {
        log("MongoDB connection initialized successfully", "mongodb");
      } else {
        log("MongoDB connection failed, using in-memory storage", "mongodb");
      }
    } catch (error) {
      log(`Failed to initialize MongoDB: ${error instanceof Error ? error.message : String(error)}`, "mongodb");
      log("Using in-memory storage as fallback", "mongodb");
    }
  } else {
    log("No MongoDB URI provided, using in-memory storage", "mongodb");
  }
  
  // Continue with server setup even if MongoDB connection failed
  // The app will fall back to in-memory storage
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
