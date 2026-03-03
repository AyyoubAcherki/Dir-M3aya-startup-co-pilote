import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { indexPdfs, queryRag, queryRagStream, getRagStatus } from "./ragService";
import { analyzeInvoice, generateDocument, chat, chatStream } from "./llamaService";

const db = new Database("database.sqlite");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    amount REAL,
    client TEXT,
    category TEXT,
    description TEXT,
    file_path TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('limit_service', '200000');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('limit_commercial', '500000');
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/invoices", (req, res) => {
    const invoices = db.prepare("SELECT * FROM invoices ORDER BY date DESC").all();
    res.json(invoices);
  });

  app.post("/api/invoices", (req, res) => {
    const { date, amount, client, category, description, file_path } = req.body;
    const info = db.prepare(
      "INSERT INTO invoices (date, amount, client, category, description, file_path) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(date, amount, client, category, description, file_path);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/invoices/:id", (req, res) => {
    db.prepare("DELETE FROM invoices WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    const total = db.prepare("SELECT SUM(amount) as total FROM invoices").get() as { total: number };
    const services = db.prepare("SELECT SUM(amount) as total FROM invoices WHERE category = 'Services'").get() as { total: number };
    const commercial = db.prepare("SELECT SUM(amount) as total FROM invoices WHERE category = 'Commercial'").get() as { total: number };

    const settings = db.prepare("SELECT * FROM settings").all() as { key: string, value: string }[];
    const limits = Object.fromEntries(settings.map(s => [s.key, parseFloat(s.value)]));
    res.json({
      total: total.total || 0,
      total_services: services.total || 0,
      total_commercial: commercial.total || 0,
      limits
    });
  });

  // RAG API - Llama 3.1 sur les PDFs du dossier data
  app.post("/api/rag/index", async (req, res) => {
    try {
      const result = await indexPdfs();
      res.json({ success: true, ...result });
    } catch (err) {
      console.error("RAG index error:", err);
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  app.post("/api/rag/query", async (req, res) => {
    const { question } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "question requise" });
    }
    try {
      const answer = await queryRag(question);
      res.json({ answer });
    } catch (err) {
      console.error("RAG query error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/rag/query/stream", async (req, res) => {
    const { question } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "question requise" });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
      const stream = await queryRagStream(question);
      for await (const chunk of stream) {
        if (chunk.message?.content) {
          res.write(chunk.message.content);
        }
      }
      res.end();
    } catch (err) {
      console.error("RAG stream error:", err);
      res.write("\n[Erreur de connexion détaillée]");
      res.end();
    }
  });

  app.get("/api/rag/status", (req, res) => {
    res.json(getRagStatus());
  });

  // Llama 3.1 - Analyse factures, génération docs, assistant
  app.post("/api/ai/analyze-invoice", async (req, res) => {
    const { base64, mimeType } = req.body;
    if (!base64 || !mimeType) {
      return res.status(400).json({ error: "base64 et mimeType requis" });
    }
    try {
      const analysis = await analyzeInvoice(base64, mimeType);
      res.json(analysis);
    } catch (err) {
      console.error("Analyze invoice error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/ai/generate-document", async (req, res) => {
    const { type, data } = req.body;
    if (!type) {
      return res.status(400).json({ error: "type requis" });
    }
    try {
      const doc = await generateDocument(type, data || {});
      res.json({ document: doc });
    } catch (err) {
      console.error("Generate document error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message requis" });
    }
    try {
      const timeout = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Délai dépassé (5 min). Llama peut être lent au premier lancement.")), 300000)
      );
      const response = await Promise.race([chat(message, history || []), timeout]);
      res.json({ text: response });
    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/ai/chat/stream", async (req, res) => {
    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message requis" });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
      const stream = await chatStream(message, history || []);
      for await (const chunk of stream) {
        if (chunk.message?.content) {
          res.write(chunk.message.content);
        }
      }
      res.end();
    } catch (err) {
      console.error("Chat stream error:", err);
      res.write("\n[Erreur de génération détaillée]");
      res.end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
