import pandas as pd
import os
import re

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# 1. Source of Truth (Has the raw descriptions)
SOURCE_FILE = os.path.join(SCRIPT_DIR, 'ikea_products_with_images.json')
# 2. Your Current Final File (Has the valid 497 items)
TARGET_FILE = os.path.join(SCRIPT_DIR, 'clean_product_catalog_final.json')
# 3. New Output
OUTPUT_FILE = os.path.join(SCRIPT_DIR, 'clean_product_catalog_complete.json')

print("Loading datasets...")
source_df = pd.read_json(SOURCE_FILE) # The big one with 1000 items
target_df = pd.read_json(TARGET_FILE) # The clean one with 497 items

# -----------------------------
# CLEANING FUNCTION (Readable)
# -----------------------------
def make_readable(html_text):
    """
    Removes HTML tags but KEEPS punctuation and casing
    so it looks good in the App UI.
    """
    if not isinstance(html_text, str): return ""

    # Replace <br> or </span> with spaces to prevent words mashing together
    html_text = html_text.replace('</span>', '. ').replace('<br>', '. ')

    # Remove all HTML tags
    cleanr = re.compile('<.*?>')
    text = re.sub(cleanr, '', html_text)

    # Fix double spaces or weird dot sequences from the replace above
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.replace('..', '.')

    return text

# -----------------------------
# MERGE LOGIC
# -----------------------------
print("Restoring and cleaning descriptions...")

# Create a lookup dictionary: { SKU : Raw_HTML_Description }
# We use 'sku' because that was the ID in the original file
desc_lookup = dict(zip(source_df['sku'], source_df['raw_product_details']))

def get_desc(product_id):
    raw_html = desc_lookup.get(product_id)
    return make_readable(raw_html)

# Apply to the Target DataFrame
target_df['description'] = target_df['id'].apply(get_desc)

# -----------------------------
# CONSOLIDATE KEYWORDS
# -----------------------------
def consolidate_keywords(text):
    if not isinstance(text, str): return ""
    # Split string into words
    words = text.split()
    # dict.fromkeys() removes duplicates while preserving original order
    unique_words = list(dict.fromkeys(words))
    return " ".join(unique_words)

print("Consolidating TF-IDF keywords (Unique only)...")
# Note: We apply this to the 'tf_idf_text' column, not 'id'
target_df['tf_idf_text'] = target_df['tf_idf_text'].apply(consolidate_keywords)

# Re-order columns nicely
cols = ['id', 'name', 'price', 'category', 'description', 'image_url', 'tf_idf_text']
target_df = target_df[cols]

# Save
print(f"Saving {len(target_df)} items to {OUTPUT_FILE}...")
target_df.to_json(OUTPUT_FILE, orient='records', indent=2, force_ascii=False)

print("✅ Done! Descriptions restored.")