/**
 * Service RAG (Retrieval Augmented Generation) pour interroger les PDFs
 * avec Llama 3.1 via Ollama - VectorDB persistant (SQLite)
 */

import ollama from "ollama";
import { PDFParse } from "pdf-parse";
import fs from "fs";
import path from "path";
import {
  clearVectorStore,
  insertChunks,
  getAllChunks,
  getChunkCount,
  getLastIndexTime,
  isFileIndexed,
  type RAGChunk,
} from "./vectorStore";

const DATA_DIR = path.join(process.cwd(), "data");
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;
const TOP_K = 5;

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  console.log(`[RAG] Extracting text from: ${path.basename(filePath)}`);
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  try {
    const textResult = await parser.getText();
    console.log(`[RAG] Extracted ${textResult.text?.length || 0} characters from ${path.basename(filePath)}`);
    return textResult.text || "";
  } finally {
    await parser.destroy();
  }
}

function splitIntoChunks(text: string, source: string): { text: string; source: string }[] {
  const result: { text: string; source: string }[] = [];
  // Clean text a bit (remove multiple spaces/newlines)
  const cleanText = text.replace(/\s+/g, " ").trim();

  const sentences = cleanText.split(/(?<=[.!?])\s+/).filter(Boolean);
  let current = "";

  for (const sent of sentences) {
    // If a single segment is already too big, we need to force split it
    if (sent.length > CHUNK_SIZE) {
      // First, push what we have in current
      if (current.trim()) {
        result.push({ text: current.trim(), source });
        current = "";
      }

      // Force split the long sentence
      let str = sent;
      while (str.length > CHUNK_SIZE) {
        let chunk = str.substring(0, CHUNK_SIZE);
        result.push({ text: chunk.trim(), source });
        str = str.substring(CHUNK_SIZE - CHUNK_OVERLAP);
      }
      current = str;
    } else if (current.length + sent.length > CHUNK_SIZE && current.length > 0) {
      result.push({ text: current.trim(), source });
      current = current.slice(-CHUNK_OVERLAP) + " " + sent;
    } else {
      current += (current ? " " : "") + sent;
    }
  }
  if (current.trim()) result.push({ text: current.trim(), source });
  console.log(`[RAG] Split ${source} into ${result.length} chunks`);
  return result;
}

async function getEmbedding(text: string): Promise<number[]> {
  try {
    // console.log(`[RAG] Getting embedding for chunk...`);
    const res = await ollama.embed({
      model: "nomic-embed-text",
      input: text,
    });
    return res.embeddings[0] || [];
  } catch (e) {
    console.warn("[RAG] Embedding failed, falling back to empty:", e);
    return [];
  }
}

export async function indexPdfs(): Promise<{ files: number; chunks: number }> {
  console.log(`[RAG] Starting indexing process...`);
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.toLowerCase().endsWith(".pdf"));
  console.log(`[RAG] Found ${files.length} PDFs to index`);

  // clearVectorStore(); // Removed to allow incremental indexing
  let totalChunks = 0;

  for (const file of files) {
    if (isFileIndexed(file)) {
      console.log(`[RAG] Skipping ${file} (already indexed)`);
      totalChunks += 0; // We don't know the exact count easily here without querying, but we'll return the total at the end
      continue;
    }

    const filePath = path.join(DATA_DIR, file);
    const fileChunks: RAGChunk[] = [];
    try {
      const text = await extractTextFromPdf(filePath);
      const textChunks = splitIntoChunks(text, file);

      let count = 0;
      for (const { text: chunkText, source } of textChunks) {
        if (chunkText.length < 50) continue;
        const embedding = await getEmbedding(chunkText);
        fileChunks.push({ text: chunkText, source, embedding });
        count++;
        if (count % 20 === 0) {
          console.log(`[RAG] Progressing ${file}: ${count}/${textChunks.length} chunks embedded`);
        }
      }

      if (fileChunks.length > 0) {
        insertChunks(fileChunks);
        totalChunks += fileChunks.length;
        console.log(`[RAG] Saved ${fileChunks.length} chunks for ${file}. Total chunks indexed: ${totalChunks}`);
      }

    } catch (err) {
      console.error(`[RAG] Erreur indexation ${file}:`, err);
    }
  }

  console.log(`[RAG] Indexing complete! Total files: ${files.length}, Total chunks: ${totalChunks}`);
  return { files: files.length, chunks: totalChunks };
}

async function retrieveRelevantChunks(query: string, k: number = TOP_K): Promise<RAGChunk[]> {
  let chunks = getAllChunks();
  if (chunks.length === 0) {
    await indexPdfs();
    chunks = getAllChunks();
  }

  const queryEmbedding = await getEmbedding(query);
  if (queryEmbedding.length === 0) {
    return chunks.slice(0, k);
  }

  const scored = chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(chunk.embedding, queryEmbedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.chunk);
}

export async function queryRag(question: string): Promise<string> {
  const relevantChunks = await retrieveRelevantChunks(question);
  const context = relevantChunks
    .map((c) => `[Source: ${c.source}]\n${c.text}`)
    .join("\n\n---\n\n");

  const systemPrompt = `Tu es un assistant expert. 
  RÈGLES ABSOLUES :
  1. Tu réponds UNIQUEMENT à partir du contexte fourni, extrait de documents PDF juridiques et professionnels.
  2. Tu dois impérativement identifier la langue de la question de l'utilisateur.
  3. Tu DOIS répondre ENTIÈREMENT et UNIQUEMENT dans la langue de la question (Arabe, Anglais, ou Français).
  4. INTERDICTION FORMELLE DE MÉLANGER LES LANGUES (ex: pas d'arabe si la question est en français, pas de français si la question est en arabe).
  5. Si la réponse n'est pas dans le contexte, dis-le clairement dans la langue de la question.`;

  const userPrompt = `Contexte des documents :
${context}

---
Question de l'utilisateur : ${question}

RAPPEL IMPORTANT : Réponds DANS LA MÊME LANGUE que la "Question de l'utilisateur" ci-dessus. 
Rédige ta réponse en te basant uniquement sur le contexte, sans inventer d'informations.`;

  try {
    const response = await ollama.chat({
      model: "llama3.1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return response.message?.content || "Désolé, je n'ai pas pu générer de réponse.";
  } catch (err) {
    console.error("Erreur Ollama:", err);
    throw new Error(
      "Ollama n'est pas accessible. Assurez-vous qu'Ollama est installé et que le modèle llama3.1 est disponible (ollama pull llama3.1)"
    );
  }
}

export async function queryRagStream(question: string) {
  const relevantChunks = await retrieveRelevantChunks(question);
  const context = relevantChunks
    .map((c) => `[Source: ${c.source}]\n${c.text}`)
    .join("\n\n---\n\n");

  const systemPrompt = `Tu es un assistant expert. 
  RÈGLES ABSOLUES :
  1. Tu réponds UNIQUEMENT à partir du contexte fourni, extrait de documents PDF juridiques et professionnels.
  2. Tu dois impérativement identifier la langue de la question de l'utilisateur.
  3. Tu DOIS répondre ENTIÈREMENT et UNIQUEMENT dans la langue de la question (Arabe, Anglais, ou Français).
  4. INTERDICTION FORMELLE DE MÉLANGER LES LANGUES (ex: pas d'arabe si la question est en français, pas de français si la question est en arabe).
  5. Si la réponse n'est pas dans le contexte, dis-le clairement dans la langue de la question.`;

  const userPrompt = `Contexte des documents :
${context}

---
Question de l'utilisateur : ${question}

RAPPEL IMPORTANT : Réponds DANS LA MÊME LANGUE que la "Question de l'utilisateur" ci-dessus. 
Rédige ta réponse en te basant uniquement sur le contexte, sans inventer d'informations.`;

  return await ollama.chat({
    model: "llama3.1",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: true,
  });
}

export function getRagStatus(): { indexed: number; lastIndex: number } {
  return {
    indexed: getChunkCount(),
    lastIndex: getLastIndexTime(),
  };
}
