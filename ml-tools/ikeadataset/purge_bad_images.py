import pandas as pd
import os

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, 'clean_product_catalog_parsed.json') # Your current file
OUTPUT_FILE = os.path.join(SCRIPT_DIR, 'clean_product_catalog_final.json')

print("Loading catalog...")
df = pd.read_json(INPUT_FILE)
print(f"Original count: {len(df)}")

# Logic: Drop if not a string OR doesn't contain '.jpg'/.jpeg/.png
# This handles "None", empty strings "", and weird text.
def has_image_extension(url):
    if not isinstance(url, str): return False
    url = url.lower()
    return '.jpg' in url or '.jpeg' in url or '.png' in url or '.webp' in url

# Apply Filter
df = df[df['image_url'].apply(has_image_extension)]

print(f"Final count: {len(df)}")
print("Saving...")

df.to_json(OUTPUT_FILE, orient='records', indent=2, force_ascii=False)
print("✅ Purge complete.")