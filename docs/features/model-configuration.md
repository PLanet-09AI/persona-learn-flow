# Ndu AI Learning System - Model Configuration

This document explains the model configuration for the Ndu AI Learning System.

## OpenRouter API Configuration

The application uses two different AI models from OpenRouter for different purposes:

### 1. Content Generation Model
- **Model**: `cognitivecomputations/dolphin-mistral-24b-venice-edition:free`
- **Environment Variable**: `VITE_OPENROUTER_API_KEY` (in `.env`)
- **Used For**: Generating educational content based on learning style and topic

### 2. Chat Feature Model
- **Model**: `qwen/qwen3-14b:free`
- **Environment Variable**: `VITE_OPENROUTER_QWEN_API_KEY` (in `.env.local`)
- **Used For**: Interactive Q&A about learning content

## Why Two Different Models?

We use two different models to optimize performance for different use cases:

1. The Dolphin Mistral model excels at structured content generation with markdown formatting, which makes it ideal for creating learning materials with proper structure.

2. The Qwen3 model is better suited for conversation and answering specific questions about content, making it perfect for the interactive chat feature.

## Setup Instructions

1. Create an account at [OpenRouter.ai](https://openrouter.ai/)
2. Generate two API keys
3. Add them to your environment configuration:
   ```
   # In .env (for content generation)
   VITE_OPENROUTER_API_KEY="your-first-key"
   
   # In .env.local (for chat feature)
   VITE_OPENROUTER_QWEN_API_KEY="your-second-key"
   ```

## API Usage Considerations

- Both models are accessed through the OpenRouter API
- Each model has separate billing and usage quotas
- Monitor your usage at the OpenRouter dashboard
- Free tier limits apply separately to each model
