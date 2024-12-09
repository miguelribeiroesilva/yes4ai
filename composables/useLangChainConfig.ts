import { useRuntimeConfig } from '#imports';

export function useLangChainConfig() {
  const config = useRuntimeConfig();

  const processChain = async (template: string, variables: Record<string, any> = {}) => {
    try {
      const response = await $fetch('/api/langchain', {
        method: 'POST',
        body: {
          template,
          variables
        }
      });
      return response.result;
    } catch (error: any) {
      console.error('Error in chain processing:', error);
      throw new Error(error.data?.message || 'Error processing request');
    }
  };

  return {
    processChain
  };
}
