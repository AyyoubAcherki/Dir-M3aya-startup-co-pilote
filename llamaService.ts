/**
 * Service Llama 3.1 - Moteur IA principal de Dir-M3aya
 * Remplace Gemini pour analyse, génération et assistant
 */

import ollama from "ollama";
import { PDFParse } from "pdf-parse";

const MODEL = "llama3.1";
const VISION_MODEL = "llama3.2-vision"; // Pour les images (fallback: llava)

export interface InvoiceAnalysis {
  amount: number;
  date: string;
  client: string;
  category: string;
  description: string;
}

async function callLlama(prompt: string, systemPrompt?: string): Promise<string> {
  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const response = await ollama.chat({
    model: MODEL,
    messages,
  });
  return response.message?.content || "";
}

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const textResult = await parser.getText();
    return textResult.text || "";
  } finally {
    await parser.destroy();
  }
}

function parseJsonFromResponse(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    } catch {
      // ignore
    }
  }
  return {};
}

function parseAmount(amount: any): number {
  if (typeof amount === "number") return amount;
  if (!amount) return 0;
  // Nettoyer la chaîne: enlever les espaces insécables, les symboles de monnaie, etc.
  const cleaned = String(amount)
    .replace(/[^\d.,]/g, "") // Garde seulement chiffres, points et virgules
    .replace(",", "."); // Change virgule en point

  // Gérer les cas où il y a plusieurs points (séparateurs de milliers)
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    // Probablement 1.000.000 style
    return parseFloat(parts.join("")) || 0;
  }

  return parseFloat(cleaned) || 0;
}

export async function analyzeInvoice(base64Data: string, mimeType: string): Promise<InvoiceAnalysis> {
  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType.startsWith("image/");

  if (isPdf) {
    const buffer = Buffer.from(base64Data, "base64");
    const text = await extractTextFromPdfBuffer(buffer);
    const prompt = `Extrait les informations de cette facture marocaine. Réponds UNIQUEMENT en JSON valide avec exactement ces clés:
{
  "amount": nombre (montant en MAD),
  "date": "YYYY-MM-DD",
  "client": "nom du client",
  "category": "Services" ou "Commercial",
  "description": "brève description"
}

Texte de la facture:
${text}`;

    const response = await callLlama(prompt);
    const parsed = parseJsonFromResponse(response) as Partial<InvoiceAnalysis>;
    return {
      amount: parseAmount(parsed.amount),
      date: String(parsed.date || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
      client: String(parsed.client || "Inconnu"),
      category: parsed.category === "Commercial" ? "Commercial" : "Services",
      description: String(parsed.description || ""),
    };
  }

  if (isImage) {
    try {
      const response = await ollama.chat({
        model: VISION_MODEL,
        messages: [
          {
            role: "user",
            content: "Extrait les informations de cette facture marocaine. Réponds UNIQUEMENT en JSON valide avec exactement ces clés: amount (nombre), date (YYYY-MM-DD), client (string), category (Services ou Commercial), description (string).",
            images: [base64Data],
          },
        ],
      });
      const parsed = parseJsonFromResponse(response.message?.content || "") as Partial<InvoiceAnalysis>;
      return {
        amount: parseAmount(parsed.amount),
        date: String(parsed.date || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
        client: String(parsed.client || "Inconnu"),
        category: parsed.category === "Commercial" ? "Commercial" : "Services",
        description: String(parsed.description || ""),
      };
    } catch (visionErr) {
      console.warn("Vision model failed, trying llava:", visionErr);
      try {
        const response = await ollama.chat({
          model: "llava",
          messages: [
            {
              role: "user",
              content: "Extrait les informations de cette facture marocaine. Réponds UNIQUEMENT en JSON: amount, date (YYYY-MM-DD), client, category (Services ou Commercial), description.",
              images: [base64Data],
            },
          ],
        });
        const parsed = parseJsonFromResponse(response.message?.content || "") as Partial<InvoiceAnalysis>;
        return {
          amount: Number(parsed.amount) || 0,
          date: String(parsed.date || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
          client: String(parsed.client || "Inconnu"),
          category: parsed.category === "Commercial" ? "Commercial" : "Services",
          description: String(parsed.description || ""),
        };
      } catch (visionErr) {
        console.error("Vision model error:", visionErr);
        throw new Error(
          "Outil Vision non trouvé. Pour analyser des images de factures, vous devez installer un modèle vision. Ouvrez un terminal et tapez: 'ollama pull llama3.2-vision'"
        );
      }
    }
  }

  throw new Error("Format non supporté. Utilisez PDF ou image (JPEG, PNG).");
}

export async function generateDocument(type: string, data: { language?: string; invoices?: unknown[] }): Promise<string> {
  const prompt = `Génère un document professionnel de type "${type}" basé sur les données suivantes: ${JSON.stringify(data)}.
Le document doit respecter les standards juridiques marocains et être rédigé en ${data.language || "français"}.
Inclure toutes les mentions légales nécessaires (ICE, RC, IF, CNSS si applicable).
Retourne le document en format Markdown.`;

  const systemPrompt =
    "Tu es un expert juridique et financier marocain. Tu rédiges des documents professionnels conformes au droit marocain.";

  return callLlama(prompt, systemPrompt);
}

export async function chat(message: string, history: { role: string; text: string }[]): Promise<string> {
  const systemPrompt = `Tu es Dir-M3aya, un assistant IA expert pour les entrepreneurs marocains. 
  Tu te spécialises dans le droit des affaires marocain, les taxes et les programmes d'aide gouvernementaux. 
  
  RÈGLE ABSOLUE ET STRICTE CONCERNANT LA LANGUE :
  1. Identifie la langue exacte du DERNIER message de l'utilisateur.
  2. Si le message est en ARABE (ex: "شحال خص..."), tu DOIS répondre ENTIÈREMENT et UNIQUEMENT en ARABE.
  3. Si le message est en FRANÇAIS, tu DOIS répondre ENTIÈREMENT et UNIQUEMENT en FRANÇAIS.
  4. Si le message est en ANGLAIS, tu DOIS répondre ENTIÈREMENT et UNIQUEMENT en ANGLAIS.
  
  Ne traduis pas la question. Ne mélange pas les langues. C'est une question de respect pour l'utilisateur.
  Sois précis, professionnel et utile.`;

  const messages: { role: string; content: string }[] = [{ role: "system", content: systemPrompt }];
  for (const h of history.slice(-10)) {
    messages.push({ role: h.role === "user" ? "user" : "assistant", content: h.text });
  }
  messages.push({ role: "user", content: message });

  const response = await ollama.chat({
    model: MODEL,
    messages,
  });
  return response.message?.content || "Désolé, je n'ai pas pu traiter votre demande.";
}

export async function chatStream(message: string, history: { role: string; text: string }[]) {
  const systemPrompt = `Tu es Dir-M3aya, un assistant IA expert pour les entrepreneurs marocains. 
  Tu te spécialises dans le droit des affaires marocain, les taxes et les programmes d'aide gouvernementaux. 
  
  RÈGLE ABSOLUE ET STRICTE CONCERNANT LA LANGUE :
  1. Identifie la langue exacte du DERNIER message de l'utilisateur.
  2. Si le message est en ARABE (ex: "شحال خص..."), tu DOIS répondre ENTIÈREMENT et UNIQUEMENT en ARABE.
  3. Si le message est en FRANÇAIS, tu DOIS répondre ENTIÈREMENT et UNIQUEMENT en FRANÇAIS.
  4. Si le message est en ANGLAIS, tu DOIS répondre ENTIÈREMENT et UNIQUEMENT en ANGLAIS.
  
  Ne traduis pas la question. Ne mélange pas les langues. C'est une question de respect pour l'utilisateur.
  Sois précis, professionnel et utile.`;

  const messages: { role: string; content: string }[] = [{ role: "system", content: systemPrompt }];
  for (const h of history.slice(-10)) {
    messages.push({ role: h.role === "user" ? "user" : "assistant", content: h.text });
  }
  messages.push({ role: "user", content: message });

  return await ollama.chat({
    model: MODEL,
    messages,
    stream: true,
  });
}
