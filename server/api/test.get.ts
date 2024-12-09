export default defineEventHandler(async (event) => {
  console.log('Test endpoint hit');
  return {
    success: true,
    message: 'Test endpoint working'
  };
});
