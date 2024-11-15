from sqlalchemy import create_engine
from langchain_postgres.vectorstores import PGVector
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Retrieve connection string and collection name
connection_string = os.getenv("CONNECTION_STRING")
collection_name = os.getenv("COLLECTION_NAME")

# Ensure the connection string explicitly uses psycopg (psycopg3)
if connection_string.startswith("postgresql://"):
    connection_string = connection_string.replace("postgresql://", "postgresql+psycopg://")

# Create the SQLAlchemy engine
engine = create_engine(connection_string)

# Initialize PGVector
db = PGVector(
    connection=engine.connect(),
    embedding_function=OpenAIEmbeddings(),
    collection_name=collection_name,
)
