import os
from langchain_postgres.vectorstores import PGVector
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

load_dotenv()
connection_strings = os.getenv('TEST_CONNECTION_STRING', os.getenv('CONNECTION_STRING'))
collection_names = os.getenv('TEST_COLLECTION_NAME', os.getenv('COLLECTION_NAME'))

db = PGVector(
    connection_string=connection_strings,
    embedding_function=OpenAIEmbeddings(),
    collection_name=collection_names,
)