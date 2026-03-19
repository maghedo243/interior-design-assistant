import pandas as pd
import re
import os
import nltk
from nltk.corpus import stopwords

# 1. Setup NLTK (Downloads the dictionary if you don't have it)
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

# 2. File Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# INPUT: The file you already made
INPUT_FILE = os.path.join(SCRIPT_DIR, 'clean_product_catalog.json')
# OUTPUT: The new, super-processed file
OUTPUT_FILE = os.path.join(SCRIPT_DIR, 'clean_product_catalog_parsed.json')

# 3. Load the Existing Clean Data
print(f"Loading {INPUT_FILE}...")
df = pd.read_json(INPUT_FILE)

# -----------------------------
# PARSING LOGIC
# -----------------------------

def optimize_text(text):
    """
    Takes the existing tf_idf_text and strips noise (stopwords, punctuation).
    """
    if not isinstance(text, str): return ""

    # A. Remove Punctuation & Numbers (Keep only a-z)
    # The previous script lowercased it, but didn't remove punctuation
    text = re.sub(r'[^a-z\s]', '', text)

    # B. Remove Stop Words (the, and, is, with...)
    words = text.split()
    meaningful_words = [w for w in words if w not in stop_words and len(w) > 2]

    return " ".join(meaningful_words)

# 4. Apply the Optimization
print("Optimizing keywords and removing stop words...")
df['parsed_text'] = df['tf_idf_text'].apply(optimize_text)

# 5. Apply "Title Boost"
# Since 'tf_idf_text' was (Title + Desc), adding 'name' (Title) again
# creates the ratio: (Title + Title + Desc)
df['final_search_text'] = df['name'].str.lower() + " " + df['parsed_text']

# 6. Swap the columns
# We replace the old messy text with our new super-clean text
df['tf_idf_text'] = df['final_search_text']

# Drop the temporary columns we made
df = df.drop(columns=['parsed_text', 'final_search_text'])

# 7. Save to NEW file
print(f"Saving to {OUTPUT_FILE}...")
df.to_json(OUTPUT_FILE, orient='records', indent=2, force_ascii=False)

print("✅ Parsing complete! Your text is now AI-ready.")
print(df[['name', 'tf_idf_text']].head())