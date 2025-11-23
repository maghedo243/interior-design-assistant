import fs from 'fs';
import path from 'path';
import {fileURLToPath} from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    image_url: string;
    keywords: string[];
}

class ProductCatalog {
    public products: Product[] = [];
    public idfScores: Record<string, number> = {};

    // Load data from disk into memory
    public loadData() {
        try {
            console.log("Loading static datasets...");

            const dataDir = path.join(__dirname, '../../data');

            const productsPath = path.join(dataDir, 'product_catalog.json');
            const idfPath = path.join(dataDir, 'idfScores.json');

            const productsRaw = fs.readFileSync(productsPath, 'utf-8');
            const idfRaw = fs.readFileSync(idfPath, 'utf-8');

            const rawList: any[] = JSON.parse(productsRaw);
            this.products = rawList.map(item => {
                return {
                    ...item,
                    keywords: item.tf_idf_text ? item.tf_idf_text.split(' ') : [] //to split words into list
                }
            });

            this.idfScores = JSON.parse(idfRaw);

            console.log(`Loaded ${this.products.length} products and IDF dictionary.`);
        } catch (error) {
            console.error("❌ Failed to load datasets:", error);
            process.exit(1);
        }
    }

    // Helper to find a product by ID
    public getProductById(id: string): Product | undefined {
        return this.products.find(p => p.id === id);
    }
}

export const productCatalog = new ProductCatalog();