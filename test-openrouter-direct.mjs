// Direct OpenRouter API test
async function testOpenRouterDirect() {
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
    console.log('\n=== Direct OpenRouter API Test ===');
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

testOpenRouterDirect();
