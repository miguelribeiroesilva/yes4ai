import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

export default defineEventHandler(async (event) => {
  console.log('LLM Chain endpoint hit');

  try {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    console.log('Received body:', body);

    const { template, variables } = body;

    if (!template || !variables) {
      console.log('Missing template or variables');
      throw createError({
        statusCode: 400,
        message: 'Template and variables are required'
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
      modelName: 'gpt-3.5-turbo',
      temperature: 0.9
    });

    // Create the prompt template
    const prompt = PromptTemplate.fromTemplate(template);

    // Create the chain
    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser()
    ]);

    // Run the chain
    console.log('Running LLM Chain with variables:', variables);
    const result = await chain.invoke(variables);
    console.log('Chain result:', result);

    return {
      success: true,
      result: result
    };

  } catch (error: any) {
    console.error('Error in LLM Chain endpoint:', error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
});
