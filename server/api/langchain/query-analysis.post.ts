import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

let vectorStore: MemoryVectorStore | null = null;

async function initVectorStore(openAIApiKey: string) {
  if (vectorStore) return vectorStore;

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey
  });

  // Sample documents about a fictional company
  const docs = [
    new Document({
      pageContent: "Acme Corporation was founded in 2010 by John Smith. The company specializes in AI-powered software solutions.",
    }),
    new Document({
      pageContent: "RoboAssist, Acme's flagship product, is an AI customer service platform that handles support tickets automatically. It uses natural language processing to understand customer queries and machine learning to provide accurate responses.",
    }),
    new Document({
      pageContent: "In 2022, Acme Corporation had 500 employees and $50M in revenue. By 2023, they reached 1000 employees, opened new offices in London and Tokyo, and achieved $100M in revenue.",
    }),
    new Document({
      pageContent: "Key features of RoboAssist include: multilingual support, 24/7 availability, sentiment analysis, automated ticket routing, and integration with popular CRM systems.",
    }),
    new Document({
      pageContent: "Acme's mission is to make AI technology accessible to businesses of all sizes. They offer flexible pricing plans starting from $99/month for small businesses to enterprise plans for large corporations.",
    }),
  ];

  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  return vectorStore;
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    if (!config.openaiApiKey) {
      throw createError({
        statusCode: 500,
        message: "OpenAI API key is not configured"
      });
    }

    const body = await readBody(event);
    const { question } = body;

    if (!question) {
      throw createError({
        statusCode: 400,
        message: "Question is required"
      });
    }

    // Initialize model
    const model = new ChatOpenAI({ 
      modelName: "gpt-3.5-turbo",
      openAIApiKey: config.openaiApiKey,
      temperature: 0
    }).bind({
      functions: [{
        name: "analyze_query",
        description: "Analyze a search query",
        parameters: {
          type: "object",
          properties: {
            queryType: {
              type: "string",
              description: "The type of query (e.g., factual, comparative, exploratory)"
            },
            keywords: {
              type: "array",
              items: { type: "string" },
              description: "Important keywords for searching"
            },
            reasoning: {
              type: "string",
              description: "Reasoning for the analysis"
            }
          },
          required: ["queryType", "keywords", "reasoning"]
        }
      }],
      function_call: { name: "analyze_query" }
    });

    // First, analyze the query
    const queryAnalysisPrompt = ChatPromptTemplate.fromTemplate(`Analyze the following query and determine:
1. The type of query (e.g., factual, comparative, exploratory)
2. Important keywords for searching
3. Reasoning for the analysis

Query: {query}`);

    const queryAnalysisChain = queryAnalysisPrompt
      .pipe(model)
      .pipe(new JsonOutputFunctionsParser());

    const analysis = await queryAnalysisChain.invoke({
      query: question
    });

    // Initialize vector store
    const store = await initVectorStore(config.openaiApiKey);

    // Use the analysis to perform a targeted search
    const k = analysis.queryType === "comparative" ? 4 : 2;
    const relevantDocs = await store.similaritySearch(question, k);

    // Create response prompt based on query type
    let responsePrompt;
    if (analysis.queryType === "comparative") {
      responsePrompt = ChatPromptTemplate.fromTemplate(`You are analyzing documents to answer a comparative query.
Based on the following context, provide a detailed comparison addressing the user's question.
If you can't make a comparison from the available information, say so.

Context:
{context}

Question: {question}`);
    } else {
      responsePrompt = ChatPromptTemplate.fromTemplate(`You are a helpful AI assistant.
Based on the following context, answer the user's question.
If the answer cannot be found in the context, politely say that you don't have that information.

Context:
{context}

Question: {question}`);
    }

    // Generate the response
    const responseModel = new ChatOpenAI({ 
      modelName: "gpt-3.5-turbo",
      openAIApiKey: config.openaiApiKey,
      temperature: 0.7
    });

    const responseChain = responsePrompt
      .pipe(responseModel)
      .pipe(new StringOutputParser());

    const response = await responseChain.invoke({
      context: relevantDocs.map(doc => doc.pageContent).join('\n\n'),
      question
    });

    return {
      analysis,
      response
    };

  } catch (error: any) {
    console.error('Error:', error);
    throw createError({
      statusCode: 500,
      message: `Error processing query: ${error.message}`
    });
  }
});
