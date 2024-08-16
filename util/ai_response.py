from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langsmith import traceable

@traceable
def get_response(retriever, query):

    # RAG Template:
    reply_template = """Use the following pieces of context to answer the query at the end.

    Make sure to pay close attention to the cost of the context when returning a cost in your reply.

    If you don't know the answer, just say that you don't know, don't try to make up an answer.

    {context}

    question: {question}

    Retrieve:
    Given a query for construction job pricing, the model should learn to recognize the verbiage used
    in the job descriptions to determine the appropriate pricing structure based on job size.

    The dataset contains pricing information categorized by different verbiage patterns, including:

    1. For jobs described as "for jobs up to [size]":
    - Use this data to calculate jobs that are up to the specified area.

    2. For jobs described as "for jobs [size] to [size]":
    - Use this data to calculate jobs within the specified area range.

    3. For jobs described as "per SF/LF/etc. for jobs over [size]":
    - Use this data to calculate the job cost per square foot or linear foot for jobs over the specified
      size.

    In the context provided if there are multiple similar contexts, the model shall only use the context
    and its costs that matches the area of work declared in the query, do not take an average of all the
    costs provided in the context or use multiple contexts to calculate the construction job pricing.

    Generate:
    Given a query for construction job pricing and the verbiage used in the job description, the model
    should provide an accurate cost estimate based on the learned patterns from the dataset.

    Ensure the response generated begins with "Context used:"

    Important:
    1. Do not include individual material and labor cost per unit from the context used (e.g., "Material Cost: $1.43 per sqft and Labor Cost: $1.52 per sqft", "Labor Cost: $158.66 per ea.", or "Labor Cost: $317.31") in the final response.
    2. Do not return Total costs (e.g., "Total Costs: - Labor Cost: $740.39", or "Total Costs: - Material Cost: $321.22 - Labor Cost: $740.39") in the final response.
    3. If a material cost or labor cost is not included in the context, do not include them (e.g., "Material Cost: Not provided". or "Labor Cost: Not provided") in the final response.
    4. When returning labor cost or material cost, do not include unneccessary verbiage (e.g., "per ea.") in the final response.
    5. Always make sure to return the single most related context for each search query, never return multiple context for each search query.


    Examples:
    Correct Example 1:
    Context: Install 3/4" tongue & groove plywood subfloor Material Cost: $1.43 per sqft Labor Cost: $1.52 per sqft
    Query: What is the total cost for installing a 3/4" tongue & groove plywood subfloor for an area of 42.66 sqft?
    Response: Context used: Install 3/4" tongue & groove plywood subfloor
    Material Cost: $61.00 (42.66 sqft * $1.43)
    Labor Cost: $64.80 (42.66 sqft * $1.52)

    Correct Example 2:
    Context: Demolish subfloor, 3/4" plywood sheathing, nailed & glued Labor Cost: $0.92 per sqft
    Query: What is the total cost for demolishing 42.66 sqft of 3/4" plywood sheathing?
    Response: Context used: Demolish subfloor, 3/4" plywood sheathing, nailed & glued
    Labor Cost: $39.22 (42.66sqft * $0.92)

    Correct Example 3:
    Context: Labor to install vanity with single sink, install sink & faucets only in prepared location. No fixture, fixture removal or rough-in included. Labor Cost: $158.66 per ea.
    Query: Install 1 vanity w/ 1 sink, install sink & faucets, only in prepared location
    Response: Context used: Labor to install vanity with single sink, install sink & faucets only in prepared location. No fixture, fixture removal or rough-in included.
    Labor Cost: $158.66

    Correct Example 4:
    Query: - Install 1 tub, diverter, faucet, head, fiberglass or acrylic surround in prepared location
    response:  Context used: Labor to install tub, faucet, diverter, head, fiberglass or acrylic with surround in prepared location. No fixture, fixture removal or rough-in included.
    Labor Cost: $740.39

    Incorrect Example 1:
    Context: Labor to install vanity with single sink, install sink & faucets only in prepared location. No fixture, fixture removal or rough-in included. Labor Cost: $158.66 per ea.
    Query: Install 1 vanity w/ 1 sink, install sink & faucets, only in prepared location
    Response: Context used: Labor to install vanity with single sink, install sink & faucets only in prepared location. No fixture, fixture removal or rough-in included. Labor Cost: $158.66 per ea.
    Total Costs:
    - Labor Cost: $158.66

    Incorrect Example 2:
    Query: - Install 1 vanity & top w/1 sink, install sink & faucets only in prepped location
    response:  Context used: Labor to install vanity with single sink, install sink & faucets only in prepared location. No fixture, fixture removal or rough-in included. Labor Cost: $158.66 per ea.
    Labor Cost: $158.66
    """

    reply_prompt = PromptTemplate.from_template(reply_template)

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    llm = ChatOpenAI(temperature=0)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | reply_prompt
        | llm
        | StrOutputParser()
    )

    response = rag_chain.invoke(query)
    if not isinstance(response, dict):
        dict_response = {'response': str(response)}

    print("response: ", response)
    return dict_response