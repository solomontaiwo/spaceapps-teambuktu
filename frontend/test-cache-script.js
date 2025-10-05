// Test della cache per verificare che funzioni correttamente
import { getAllExoplanets } from './src/api/exoplanets.js';

console.log("🧪 Test Cache - Simulazione StrictMode");

async function testCache() {
    console.log("\n=== TEST 1: Prima chiamata ===");
    const promise1 = getAllExoplanets();
    
    console.log("=== TEST 2: Seconda chiamata immediata (StrictMode) ===");
    const promise2 = getAllExoplanets();
    
    try {
        const [result1, result2] = await Promise.all([promise1, promise2]);
        
        console.log("\n📊 RISULTATI:");
        console.log(`Prima chiamata: ${result1.length} pianeti`);
        console.log(`Seconda chiamata: ${result2.length} pianeti`);
        console.log(`Stesso oggetto? ${result1 === result2 ? 'Sì (cache)' : 'No (duplicazione)'}`);
        
        // Test cache dopo delay
        console.log("\n=== TEST 3: Chiamata dopo breve delay ===");
        setTimeout(async () => {
            const result3 = await getAllExoplanets();
            console.log(`Terza chiamata: ${result3.length} pianeti`);
            console.log(`Cache utilizzata? ${result3 === result1 ? 'Sì' : 'No'}`);
        }, 100);
        
    } catch (error) {
        console.error("❌ Errore nel test:", error);
    }
}

testCache();