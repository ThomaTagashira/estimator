import os
from langchain_community.vectorstores import PGVector
from langchain_openai import OpenAIEmbeddings

db = PGVector(
    connection_string=os.environ['CONNECTION_STRING'],
    embedding_function=OpenAIEmbeddings(),
    collection_name=os.environ['COLLECTION_NAME'],
)