import { queryRag } from './ragService';

async function testLanguage(lang: string, question: string) {
    console.log(`\n--- Testing ${lang} ---`);
    console.log(`Question: ${question}`);
    try {
        const answer = await queryRag(question);
        console.log(`Answer:\n${answer}\n`);
    } catch (e) {
        console.error(`Error in ${lang}:`, e);
    }
}

async function main() {
    console.log("Starting multilingual RAG tests...\n");

    // Testing Arabic (expecting an Arabic response)
    await testLanguage("Arabic", "ما هو الحد الأدنى لرأس مال شركة SARL في المغرب؟");

    // Testing English (expecting an English response)
    await testLanguage("English", "What are the advantages of the auto-entrepreneur status in Morocco?");

    // Testing French (expecting a French response)
    await testLanguage("French", "Quelles sont les obligations fiscales d'une SARL ?");

    console.log("Tests completed.");
}

main();
