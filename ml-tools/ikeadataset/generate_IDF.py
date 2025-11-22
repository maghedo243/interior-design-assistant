import pandas as pd
import os
import math
import json


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, 'clean_product_catalog_complete.json')
OUTPUT_FILE = os.path.join(SCRIPT_DIR, 'productsIDF.json')

df = pd.read_json(INPUT_FILE)
products = df.to_dict('records')

wordCounts = dict()
for product in products:
    for word in product['tf_idf_text'].split(" "):
        if len(word) > 1:
            if word in wordCounts: wordCounts[word] += 1
            else: wordCounts[word] = 1

idfScores = dict()

for word, count in wordCounts.items():
    idfScores[word] = math.log(len(products) / count)

idfScores = dict(sorted(idfScores.items(), key=lambda item: item[1], reverse=True))

with open("idfScores.json", "w", encoding="utf-8") as f:
    json.dump(idfScores,f,indent=4,ensure_ascii=False)