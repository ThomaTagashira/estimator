from openai import OpenAI
from django.conf import settings
from .vector_store import db

client = OpenAI()
OpenAI.api_key = settings.OPENAI_API_KEY

EMBEDDING_MODEL = 'text-embedding-3-small'

def get_embedding(text: str):
    text = text.replace("\n", " ")
    similar = db.similarity_search_with_score(text, k=1)

    for doc in similar:
        print(doc, end="\n\n")