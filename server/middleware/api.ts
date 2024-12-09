export default defineEventHandler((event) => {
  // Only apply to /api routes
  if (event.path.startsWith('/api')) {
    setResponseHeaders(event, {
      'Content-Type': 'application/json'
    });
  }
});
