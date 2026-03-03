import ollama from 'ollama';

async function testStream() {
    try {
        console.log("Starting Ollama stream test (ESM)...");
        const stream = await ollama.chat({
            model: 'llama3.1',
            messages: [{ role: 'user', content: 'Say hello in two words.' }],
            stream: true,
        });

        console.log("Stream received. Iterating...");
        for await (const chunk of stream) {
            if (chunk.message && chunk.message.content) {
                process.stdout.write(chunk.message.content);
            }
        }
        console.log("\nStream finished successfully.");
    } catch (err) {
        console.error("\nStream test failed:", err);
    }
}

testStream();
