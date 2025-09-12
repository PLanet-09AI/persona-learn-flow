// Test script for OpenRouter service with detailed logging
async function testOpenRouterService() {
  const endpoint = 'https://ndusai.netlify.app/.netlify/functions/openrouter-service';
  const payload = {
    model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    messages: [
      {
        role: 'user',
        content: 'Hello, how are you?'
      }
    ]
  };

  try {
    console.log('\n=== OpenRouter Service Test ===');
    console.log('\nEndpoint:', endpoint);
    console.log('\nPayload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('\nResponse Headers:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers])
    });

    const data = await response.json();
    console.log('\nResponse Data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log('\nError Details:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        details: data.details
      });
    }
  } catch (error) {
    console.error('\nTest Error:', error);
  }
}

testOpenRouterService();
