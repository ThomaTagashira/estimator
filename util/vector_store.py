from sqlalchemy import create_engine
from langchain_postgres.vectorstores import PGVector
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

# Load connection string and collection name
connection_string = os.getenv('TEST_CONNECTION_STRING', os.getenv('CONNECTION_STRING'))
collection_name = os.getenv('TEST_COLLECTION_NAME', os.getenv('COLLECTION_NAME'))

# Update the connection string to use psycopg (psycopg3)
connection_string = connection_string.replace("postgresql://", "postgresql+psycopg://")

# Create a database engine using psycopg3
engine = create_engine(connection_string)

# Initialize PGVector
db = PGVector(
    connection=engine.connect(),
    embedding_function=OpenAIEmbeddings(),
    collection_name=collection_name,
)
