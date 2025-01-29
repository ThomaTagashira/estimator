import os
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from dotenv import load_dotenv
from langchain_postgres.vectorstores import PGVector
from sqlalchemy import create_engine


load_dotenv()

loader = TextLoader('costs.txt', encoding='utf-8')
documents = loader.load()

text_splitter = CharacterTextSplitter(
    separator="\n\n",
    chunk_size=100,
    chunk_overlap=20,
    length_function=len,
    is_separator_regex=False,
)
costs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()


CONNECTION_STRING = os.getenv("CONNECTION_STRING")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

engine = create_engine(CONNECTION_STRING)

db = PGVector.from_documents(
    connection=engine,
    embedding=embeddings,
    collection_name=COLLECTION_NAME,
    documents=costs,
)

print("Embeddings successfully stored in the database")
