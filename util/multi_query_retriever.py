from util.vector_store import db
from langchain.retrievers.multi_query import MultiQueryRetriever
from util.output_parsers import LineListOutputParser
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langsmith import traceable

@traceable
def generate_response(query):

    print('Query:', query)

    output_parser = LineListOutputParser()

    # MultiQueryRetriever
    QUERY_PROMPT = PromptTemplate(
        input_variables=["query"],
        template="""You are an AI language model assistant. Your task is
        to generate 5 different versions of the given user
        question to retrieve relevant documents from a vector database.
        By generating multiple perspectives on the user question,
        your goal is to help the user overcome some of the limitations
        of distance-based similarity search. Provide these alternative
        questions separated by newlines. Original question: {question}""",
    )

    llm = ChatOpenAI(temperature=.7)
    llm_chain = LLMChain(llm=llm, prompt=QUERY_PROMPT, output_parser=output_parser)

    retriever = MultiQueryRetriever(retriever=db.as_retriever(), llm_chain=llm_chain)

    return retriever