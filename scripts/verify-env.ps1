# Script to verify OpenRouter environment variables
$requiredVars = @(
    "OPENROUTER_API_KEY",
    "OPENROUTER_MOONSHOT_API_KEY",
    "OPENROUTER_QWEN_API_KEY"
)

Write-Host "`n🔍 Checking environment variables..."

# Check local .env file
if (Test-Path .env) {
    Write-Host "✓ Found .env file"
    Get-Content .env | ForEach-Object {
        if ($_ -match '^OPENROUTER_.*=.+') {
            Write-Host "  Found variable: $($_.Split('=')[0])"
        }
    }
} else {
    Write-Host "⚠️ No .env file found in current directory"
}

# Check Netlify environment
Write-Host "`n📡 Checking Netlify environment..."
Write-Host "To verify Netlify environment variables:"
Write-Host "1. Go to https://app.netlify.com/sites/ndusai/settings/deploys#environment"
Write-Host "2. Check that these variables are set:"
foreach ($var in $requiredVars) {
    Write-Host "   - $var"
}

# Validate API key format
Write-Host "`n🔑 Validating API key format..."
foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        if ($value.StartsWith("sk-")) {
            Write-Host "✅ $var: Valid format"
        } else {
            Write-Host "❌ $var: Invalid format (should start with sk-)"
        }
    } else {
        Write-Host "⚠️ $var: Not set"
    }
}

Write-Host "`n📋 Instructions:"
Write-Host "1. Ensure all API keys start with 'sk-'"
Write-Host "2. Verify keys are set in Netlify environment"
Write-Host "3. Run test-openrouter-models.js to verify connectivity"
Write-Host "4. Check Netlify function logs for detailed request/response info"
