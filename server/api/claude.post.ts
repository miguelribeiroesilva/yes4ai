import Anthropic from '@anthropic-ai/sdk';
import type { ChatRequest, ChatResponse } from '~/types/api';

export default defineEventHandler(async (event) => {
  console.log('Claude endpoint hit');
  
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

    if (!config.anthropicApiKey) {
      console.error('Anthropic API key missing');
      throw createError({
        statusCode: 500,
        message: 'Anthropic API key is not configured'
      });
    }

    console.log('Initializing Anthropic client');
    const anthropic = new Anthropic({
      apiKey: config.anthropicApiKey
    });

    console.log('Sending request to Claude');
    const completion = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{ 
        role: 'user', 
        content: body.message 
      }]
    });

    console.log('Received Claude response');
    
    const response: ChatResponse = {
      success: true,
      result: completion.content[0].text
    };
    
    console.log('Sending response:', response);
    return response;

  } catch (error: any) {
    console.error('Error in Claude endpoint:', error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
});
