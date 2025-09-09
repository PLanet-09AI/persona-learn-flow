// CORS headers for Netlify Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Error response helper
export const createErrorResponse = (statusCode: number, message: string, details?: any) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify({
    error: message,
    details: details || undefined
  })
});

// Success response helper
export const createSuccessResponse = (data: any) => ({
  statusCode: 200,
  headers: corsHeaders,
  body: JSON.stringify(data)
});

// Validate environment variables
export const validateEnv = () => {
  const required = [
    'OPENROUTER_API_KEY',
    'YOCO_SECRET_KEY',
    'SITE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
