import json
import time
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
import random

# --- CONFIGURATION ---
INPUT_FILE = 'ikea_sample_file.json'
OUTPUT_FILE = 'ikea_products_with_images.json'
MAX_WORKERS = 3
LIMIT = 1000      # Set to 1000 if you just want a quick test batch, else None for all

# Robust setup for file paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_PATH = os.path.join(SCRIPT_DIR, INPUT_FILE)
OUTPUT_PATH = os.path.join(SCRIPT_DIR, OUTPUT_FILE)

def get_ikea_image(product):
    # Skip if no URL
    if 'product_url' not in product:
        return product

    url = product['product_url']
    headers = {
        # Rotate agents or just use a standard one
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        # Tiny random delay to look less bot-like across threads
        time.sleep(random.uniform(1.0, 2.0))

        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            meta_tag = soup.find('meta', property='og:image')
            if meta_tag:
                product['image_url'] = meta_tag['content']
                return product
    except Exception:
        pass

    product['image_url'] = None # Mark as missing
    return product

def run():
    # 1. Load Data
    with open(INPUT_PATH, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Optional: Slice the list if you defined a LIMIT
    if LIMIT:
        products = products[:LIMIT]

    print(f"🚀 Starting parallel scrape for {len(products)} products with {MAX_WORKERS} threads...")

    results = []

    # 2. Parallel Execution
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks
        future_to_product = {executor.submit(get_ikea_image, p): p for p in products}

        # Process as they finish (with progress bar)
        for future in tqdm(as_completed(future_to_product), total=len(products)):
            updated_product = future.result()
            results.append(updated_product)

            # Auto-save every 500 items (safety net)
            if len(results) % 500 == 0:
                with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
                    json.dump(results, f, indent=2)

    # 3. Final Save
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    print("✅ Done! Saved to", OUTPUT_PATH)

if __name__ == '__main__':
    run()