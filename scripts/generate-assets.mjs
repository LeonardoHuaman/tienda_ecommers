import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const API_KEY = process.env.KIE_API_KEY;

if (!API_KEY) {
    console.error("❌ KIE_API_KEY no encontrada en .env");
    process.exit(1);
}

const API_URL = "https://api.kie.ai/api/v1/jobs/createTask";

async function downloadFile(url, outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function pollStatus(taskId) {
    console.log(`⏳ Polling task: ${taskId}...`);
    while (true) {
        const response = await axios.get(`https://api.kie.ai/api/v1/jobs/getTask/${taskId}`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        const status = response.data.data.status;
        console.log(`   Status: ${status}`);

        if (status === 'success') {
            return response.data.data.resultUrl;
        } else if (status === 'failed') {
            throw new Error("Task failed");
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

async function generateHeroVideo() {
    console.log("🎬 Generando Video Hero...");
    try {
        const response = await axios.post(API_URL, {
            model: "kling-2.6/image-to-video",
            input: {
                prompt: "Cinematic beauty product showcase timelapse, cosmetics products appearing with soft lighting, luxury commercial style, 4K, smooth camera, studio background"
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        console.log("   Full Video Response:", JSON.stringify(response.data, null, 2));

        if (!response.data || !response.data.data) {
            throw new Error(`Respuesta inválida de la API: ${JSON.stringify(response.data)}`);
        }

        const taskId = response.data.data.taskId;
        const resultUrl = await pollStatus(taskId);

        const outputPath = path.join(__dirname, '../public/videos/hero-bg.mp4');
        await downloadFile(resultUrl, outputPath);
        console.log("✅ Video Hero guardado en /public/videos/hero-bg.mp4");
    } catch (error) {
        console.error("❌ Error generando video:", error.message);
    }
}

async function generateProductImages() {
    console.log("📸 Generando Imágenes de Productos...");
    const products = [
        { name: "labial-mate", prompt: "Luxury matte lipstick, gold packaging, soft lighting, professional cosmetics photography" },
        { name: "perfume-elegance", prompt: "Premium perfume bottle, glass and gold, floral background, cinematic lighting" },
        { name: "base-perfeccion", prompt: "Liquid foundation bottle, makeup textures, creamy, soft shadows, studio shot" }
    ];

    for (const product of products) {
        try {
            console.log(`   Generando: ${product.name}...`);
            const response = await axios.post(API_URL, {
                model: "nano-banana-pro",
                input: {
                    prompt: product.prompt,
                    aspect_ratio: "16:9"
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                }
            });

            console.log(`   Full Response (${product.name}):`, JSON.stringify(response.data, null, 2));

            if (!response.data || !response.data.data) {
                throw new Error(`Respuesta inválida de la API: ${JSON.stringify(response.data)}`);
            }

            const taskId = response.data.data.taskId;
            const resultUrl = await pollStatus(taskId);

            const outputPath = path.join(__dirname, `../public/images/products/${product.name}.png`);
            await downloadFile(resultUrl, outputPath);
            console.log(`   ✅ Imagen ${product.name} guardada.`);
        } catch (error) {
            console.error(`   ❌ Error con ${product.name}:`, error.message);
        }
    }
}

// Ejecución
(async () => {
    await generateHeroVideo();
    await generateProductImages();
})();
