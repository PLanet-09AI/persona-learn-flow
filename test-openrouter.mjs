// Test script for OpenRouter service
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
    console.log('Making test request to:', endpoint);
    console.log('With payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testOpenRouterService();
