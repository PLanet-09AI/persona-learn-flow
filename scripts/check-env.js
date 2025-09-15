// Environment variable checker for OpenRouter
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const requiredVars = [
  'OPENROUTER_API_KEY',
  'OPENROUTER_MOONSHOT_API_KEY',
  'OPENROUTER_QWEN_API_KEY'
];

const viteVars = [
  'VITE_OPENROUTER_API_KEY',
  'VITE_OPENROUTER_MOONSHOT_API_KEY',
  'VITE_OPENROUTER_QWEN_API_KEY'
];

console.log('\n🔍 Checking environment variables...');

// Check .env files
const envFiles = ['.env', '.env.development', '.env.local'];
let foundEnvFile = false;

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Found ${file} file`);
    foundEnvFile = true;
    const content = fs.readFileSync(file, 'utf8');
    content.split('\n').forEach(line => {
      if (line.match(/^(OPENROUTER|VITE_OPENROUTER).*=/)) {
        console.log(`  Found variable: ${line.split('=')[0]}`);
      }
    });
  }
});

if (!foundEnvFile) {
  console.log('⚠️ Warning: No .env files found in current directory');
}

// Check environment variables
console.log('\n📝 Environment Variables Status:');

const checkVar = (name) => {
  const value = process.env[name];
  if (value) {
    if (value.startsWith('sk-')) {
      console.log(`✅ ${name}: Valid format`);
    } else {
      console.log(`❌ ${name}: Invalid format (should start with sk-)`);
    }
  } else {
    console.log(`⚠️ ${name}: Not set`);
  }
};

console.log('\nChecking Netlify Function variables:');
requiredVars.forEach(checkVar);

console.log('\nChecking Vite frontend variables:');
viteVars.forEach(checkVar);

console.log('\n📋 Instructions:');
console.log('1. Ensure all API keys start with "sk-"');
console.log('2. Verify keys are set in Netlify environment');
console.log('3. Run test-models.js to verify connectivity');
console.log('4. Check Netlify function logs for detailed request/response info');
