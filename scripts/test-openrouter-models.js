// Test script for OpenRouter models
require('dotenv').config();
const fetch = require('node-fetch');

const models = [
  'qwen/qwen3-14b:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free'
];

const testMessage = {
  role: 'user',
  content: 'Say hello!'
};

async function testModel(model, apiKey) {
  console.log(`\n🔍 Testing model: ${model}`);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ndusai.netlify.app',
        'X-Title': 'Ndu AI Learning System Test'
      },
      body: JSON.stringify({
        model,
        messages: [testMessage],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error:', data);
      return false;
    }

    console.log('✅ Success!');
    console.log('Response:', data.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  // Test with different API keys
  const keys = {
    'Default': process.env.OPENROUTER_API_KEY,
    'Moonshot': process.env.OPENROUTER_MOONSHOT_API_KEY,
    'Qwen': process.env.OPENROUTER_QWEN_API_KEY
  };

  console.log('🔑 Available API Keys:', Object.entries(keys)
    .map(([name, key]) => `${name}: ${key ? '✓' : '✗'}`)
    .join(', '));

  // Test each model with each available key
  for (const model of models) {
    let success = false;
    
    for (const [keyName, key] of Object.entries(keys)) {
      if (!key) continue;
      
      console.log(`\n🔄 Trying ${model} with ${keyName} key...`);
      success = await testModel(model, key);
      
      if (success) {
        console.log(`✨ ${model} works with ${keyName} key!`);
        break;
      }
    }

    if (!success) {
      console.error(`❌ Failed to use ${model} with any key`);
    }
  }
}

main().catch(console.error);
