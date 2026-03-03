import { indexPdfs } from './ragService';
async function main() {
    console.log("Starting manual index...");
    try {
        const result = await indexPdfs();
        console.log("Manual index result:", result);
    } catch (e) {
        console.error("Manual index failed:", e);
    }
}
main();
