import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

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

    // Initialize the model and embeddings
    const model = new ChatOpenAI({ 
      modelName: "gpt-3.5-turbo",
      openAIApiKey: config.openaiApiKey 
    });

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openaiApiKey
    });

    // Create a vector store with sample documents
    const docs = [
      new Document({
        pageContent: "LangChain is a framework for developing applications powered by language models. It enables applications that are context-aware and can reason about their environment.",
      }),
      new Document({
        pageContent: "LangChain provides modules for working with documents, chains, agents, memory, and more. It helps developers build complex applications using Large Language Models (LLMs).",
      }),
      new Document({
        pageContent: "RAG (Retrieval Augmented Generation) is a technique that combines retrieval of relevant documents with language model generation to produce more accurate and contextual responses.",
      }),
      new Document({
        pageContent: "LangChain's Expression Language is a declarative way to compose chains. It provides a more intuitive way to work with language models and other components.",
      }),
    ];

    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    // Search for relevant documents
    const relevantDocs = await vectorStore.similaritySearch(question, 2);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");

    // Create and use the prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`
Answer the question based only on the following context:

{context}

Question: {question}

Answer the question in a helpful and detailed way. If you don't know the answer based on the context, just say so.`);

    const formattedPrompt = await prompt.format({
      context,
      question,
    });

    const response = await model.invoke(formattedPrompt);

    return {
      response: response.content,
    };

  } catch (error: any) {
    console.error('Error:', error);
    throw createError({
      statusCode: 500,
      message: `Error processing query: ${error.message}`
    });
  }
});
