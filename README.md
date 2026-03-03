<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c07fa2ed-2cc5-4427-bd2f-e5b836d1e424

## Run Locally

**Prerequisites:**  Node.js, [Ollama](https://ollama.com)

1. Install dependencies: `npm install`
2. Installer Ollama et télécharger les modèles :
   ```bash
   ollama pull llama3.1
   ollama pull nomic-embed-text
   ```
3. Run the app: `npm run dev`

## Llama 3.1 - Moteur IA principal

Dir-M3aya utilise **Llama 3.1** via Ollama pour toutes les fonctionnalités IA :
- **Analyse des factures** (PDF et images)
- **Génération de documents** (contrats, business plans, rapports)
- **Assistant conversationnel** (arabe/français)
- **RAG sur les PDFs** du dossier `data/`

Pour l'analyse de factures scannées (images), installez un modèle vision :
```bash
ollama pull llama3.2-vision   # ou  ollama pull llava
```

## RAG PDF (Llama 3.1) + VectorDB

L'onglet **RAG PDFs (Llama)** permet d'interroger les PDFs du dossier `data/` avec Llama 3.1 via Ollama.

Les embeddings sont **persistés dans une base vectorielle SQLite** (`rag_vectors.sqlite`). Une fois indexés, les documents restent disponibles sans re-indexation à chaque démarrage.

**Prérequis :**
- [Ollama](https://ollama.com) installé et en cours d'exécution
- Modèles requis :
  ```bash
  ollama pull llama3.1
  ollama pull nomic-embed-text
  ```

**Utilisation :**
1. Cliquez sur "Indexer les PDFs" pour indexer les documents du dossier `data/`
2. Posez vos questions dans la barre de recherche
3. Llama 3.1 répondra en s'appuyant sur le contenu des PDFs
