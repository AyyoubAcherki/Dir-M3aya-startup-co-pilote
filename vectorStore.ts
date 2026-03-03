/**
 * Vector Store - Persistance des embeddings pour le RAG
 * Stocke les chunks et embeddings dans SQLite
 */

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "rag_vectors.sqlite");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS rag_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        source TEXT NOT NULL,
        embedding TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
      CREATE INDEX IF NOT EXISTS idx_rag_source ON rag_chunks(source);
    `);
  }
  return db;
}

export interface RAGChunk {
  text: string;
  source: string;
  embedding: number[];
}

export function clearVectorStore(): void {
  getDb().exec("DELETE FROM rag_chunks");
}

export function insertChunks(chunks: RAGChunk[]): void {
  console.log(`[VectorStore] Inserting ${chunks.length} chunks into SQLite...`);
  const stmt = getDb().prepare(
    "INSERT INTO rag_chunks (text, source, embedding) VALUES (?, ?, ?)"
  );
  const insert = getDb().transaction((items: RAGChunk[]) => {
    for (const c of items) {
      stmt.run(c.text, c.source, JSON.stringify(c.embedding));
    }
  });
  insert(chunks);
  console.log(`[VectorStore] Insertion complete.`);
}

export function getAllChunks(): RAGChunk[] {
  const rows = getDb().prepare("SELECT text, source, embedding FROM rag_chunks").all() as {
    text: string;
    source: string;
    embedding: string;
  }[];
  return rows.map((r) => ({
    text: r.text,
    source: r.source,
    embedding: JSON.parse(r.embedding) as number[],
  }));
}

export function getChunkCount(): number {
  const row = getDb().prepare("SELECT COUNT(*) as count FROM rag_chunks").get() as { count: number };
  return row.count;
}

export function getLastIndexTime(): number {
  const row = getDb().prepare("SELECT MAX(created_at) as ts FROM rag_chunks").get() as { ts: number | null };
  return row.ts ? row.ts * 1000 : 0;
}
export function isFileIndexed(source: string): boolean {
  const row = getDb()
    .prepare("SELECT COUNT(*) as count FROM rag_chunks WHERE source = ?")
    .get(source) as { count: number };
  return row.count > 0;
}
