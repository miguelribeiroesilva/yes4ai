import OpenAI from 'openai';
import type { ChatRequest, ChatResponse } from '~/types/api';

export default defineEventHandler(async (event) => {
  console.log('Chat endpoint hit');
  
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

    console.log('Initializing OpenAI client with:', {
      hasApiKey: !!config.openaiApiKey,
      orgId: config.openaiOrgId,
      projectId: config.openaiProjectId
    });

    const openai = new OpenAI({
      apiKey: config.openaiApiKey,
      organization: config.openaiOrgId,
      defaultQuery: { 'project': config.openaiProjectId }
    });

    console.log('Sending request to OpenAI');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: body.message }]
    });

    console.log('Received OpenAI response');
    
    const response: ChatResponse = {
      success: true,
      result: completion.choices[0].message.content || 'No response from OpenAI'
    };
    
    console.log('Sending response:', response);
    return response;

  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
});
