// Test OpenRouter with Moonshot key
async function testOpenRouterMoonshot() {
  const apiKey = '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';
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
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
    console.log('\n=== OpenRouter Moonshot Key Test ===');
    console.log('\nEndpoint:', endpoint);
    console.log('\nAPI Key (first 10 chars):', apiKey.substring(0, 10) + '...');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ndusai.netlify.app',
        'X-Title': 'Ndu AI Learning System',
        'User-Agent': 'Ndu AI Learning System/1.0.0'
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

testOpenRouterMoonshot();
