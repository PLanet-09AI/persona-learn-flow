// Test script for OpenRouter models
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

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
    // Required OpenRouter headers
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ndusai.netlify.app',
      'X-Title': 'Ndu AI Learning System',
      'Content-Type': 'application/json',
      'OpenAI-Organization': 'org-THJ4kRE6LUjwkOGZ6JiA9ETM', // Add your OpenRouter org ID
      'User-Agent': 'Ndu AI Learning System/1.0.0',
      'X-Device-Info': JSON.stringify({
        type: 'desktop',
        os: 'windows',
        browser: 'chrome'
      })
    };

    console.log('Request details:', {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model,
      keyPrefix: apiKey ? `sk-...${apiKey.slice(-4)}` : 'not set',
      headers: {
        ...headers,
        'Authorization': `Bearer sk-...${apiKey.slice(-4)}`
      }
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [testMessage],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    console.log('Response headers:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers)
    });
    
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
  // Check both sets of environment variables
  const keys = {
    'Default': process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY,
    'Moonshot': process.env.OPENROUTER_MOONSHOT_API_KEY || process.env.VITE_OPENROUTER_MOONSHOT_API_KEY,
    'Qwen': process.env.OPENROUTER_QWEN_API_KEY || process.env.VITE_OPENROUTER_QWEN_API_KEY
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
