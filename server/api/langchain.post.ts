import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { ChatRequest, ChatResponse } from '~/types/api';

export default defineEventHandler(async (event) => {
  console.log('LangChain OpenAI endpoint hit');

  try {
    const config = useRuntimeConfig();
    const body = await readBody<ChatRequest>(event);
    console.log('Received body:', body);

    if (!body?.message) {
      console.log('No message in request body');
      throw createError({
        statusCode: 400,
        message: 'Message is required'
      });
    }

    if (!config.openaiApiKey) {
      console.error('OpenAI API key missing');
      throw createError({
        statusCode: 500,
        message: 'OpenAI API key is not configured'
      });
    }

    // Initialize the model
    const model = new ChatOpenAI({
      openAIApiKey: config.openaiApiKey,
      modelName: 'gpt-3.5-turbo'
    });

    // Create messages using LangChain message classes
    const messages = [
      new SystemMessage('You are a helpful AI assistant.'),
      new HumanMessage(body.message)
    ];
    
    // Call the model
    console.log('Calling OpenAI through LangChain');
    const response = await model.invoke(messages);

    console.log('Received LangChain response:', response);
    return {
      success: true,
      result: response.content
    };

  } catch (error: any) {
    console.error('Error in LangChain endpoint:', error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
});
