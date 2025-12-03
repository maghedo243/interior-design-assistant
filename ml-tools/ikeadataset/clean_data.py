import pandas as pd
import re
import json

# 1. Load the Scraped Data
df = pd.read_json('ikea_products_with_images.json')

# -----------------------------
# CLEANING LOGIC
# -----------------------------

# A. Fix Prices
# Converts "$24.99" or "24.99" (string) into 24.99 (float)
# 'coerce' turns bad data into NaN so we can drop it
df['price'] = pd.to_numeric(df['product_price'].astype(str).str.replace(r'[^\d.]', '', regex=True), errors='coerce')

# B. Clean Categories (Breadcrumbs)
# "Products/Furniture/Chairs" -> "Furniture"
def extract_category(breadcrumb_str):
    if not isinstance(breadcrumb_str, str): return "General"
    parts = breadcrumb_str.split('/')
    # Try to take the 2nd item (Index 1), otherwise take the first
    return parts[1] if len(parts) > 1 else parts[0]

df['category'] = df['breadcrumbs'].apply(extract_category)

# C. Create TF-IDF Search Text
# Strip HTML from description using Regex
def clean_html(raw_html):
    if not isinstance(raw_html, str): return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext

# Combine Title + Description -> Lowercase
df['description_clean'] = df['raw_product_details'].apply(clean_html)
df['tf_idf_text'] = (df['product_title'] + " " + df['description_clean']).str.lower()

# D. Rename / Select Final Columns
# We map the messy IKEA names to your clean API names
final_df = df.rename(columns={
    'sku': 'id',
    'product_title': 'name',
    'product_url': 'url'
})

# Only keep rows that have a valid price and image
final_df = final_df.dropna(subset=['price', 'image_url'])

# Select only the columns we need for the app/db
final_columns = ['id', 'name', 'price', 'category', 'tf_idf_text', 'image_url', 'url']
final_df = final_df[final_columns]

# -----------------------------
# SAVE
# -----------------------------
output_path = 'clean_product_catalog.json'
final_df.to_json(output_path, orient='records', indent=2, force_ascii=False)

print(f"✅ Transformation complete! Saved {len(final_df)} clean products to {output_path}")
print(final_df.head())