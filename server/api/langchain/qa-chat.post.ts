import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize vector store once
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
      pageContent: "Acme's flagship product is RoboAssist, an AI customer service platform that handles support tickets automatically.",
    }),
    new Document({
      pageContent: "In 2023, Acme Corporation reached 1000 employees and opened new offices in London and Tokyo.",
    }),
    new Document({
      pageContent: "RoboAssist uses advanced machine learning algorithms to understand customer queries and provide accurate responses.",
    }),
    new Document({
      pageContent: "Acme's mission is to make AI technology accessible to businesses of all sizes. They offer flexible pricing plans.",
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
    const { question, chatHistory = [] } = body;

    if (!question) {
      throw createError({
        statusCode: 400,
        message: "Question is required"
      });
    }

    // Initialize model and vector store
    const model = new ChatOpenAI({ 
      modelName: "gpt-3.5-turbo",
      openAIApiKey: config.openaiApiKey 
    });

    const store = await initVectorStore(config.openaiApiKey);
    
    // Search for relevant documents
    const relevantDocs = await store.similaritySearch(question, 2);

    // Convert chat history to the correct format
    const formattedHistory = chatHistory.map((msg: any) => 
      msg.type === "human" 
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );

    // Create the prompt template with chat history
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a helpful AI assistant for Acme Corporation. Answer questions based on the provided context. If the answer cannot be found in the context, politely say that you don't have that information.

Context:
{context}`],
      new MessagesPlaceholder("chat_history"),
      ["human", "{question}"],
    ]);

    // Format the context from relevant documents
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');

    // Create the document chain
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    // Get the response
    const response = await chain.invoke({
      question,
      chat_history: formattedHistory,
      context: context
    });

    return {
      response,
    };

  } catch (error: any) {
    console.error('Error:', error);
    throw createError({
      statusCode: 500,
      message: `Error processing query: ${error.message}`
    });
  }
});
