from sqlalchemy import create_engine
from langchain_postgres.vectorstores import PGVector
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

connection_string = os.getenv('TEST_CONNECTION_STRING', os.getenv('CONNECTION_STRING'))
collection_name = os.getenv('TEST_COLLECTION_NAME', os.getenv('COLLECTION_NAME'))

engine = create_engine(connection_string)

db = PGVector(
    connection=engine.connect(),
    embedding_function=OpenAIEmbeddings(),
    collection_name=collection_name,
)
