# Chat Feature Documentation

## Overview

The Ndu AI Learning System now includes an interactive chat feature that allows students to ask questions about their learning content. This feature uses the Qwen3-14B language model through the OpenRouter API to provide intelligent, contextual responses based on the current learning material.

## Setup Instructions

1. **OpenRouter API Keys**:
   - The application uses two separate OpenRouter API keys:
     - Main API key (`VITE_OPENROUTER_API_KEY` in `.env`) for content generation using the Dolphin Mistral model
     - Secondary API key (`VITE_OPENROUTER_QWEN_API_KEY` in `.env.local`) for chat feature using the Qwen3 model

2. **Environment Variables**:
   - The application uses the following environment variables:
     - `VITE_OPENROUTER_API_KEY`: Your main OpenRouter API key (for content generation)
     - `VITE_OPENROUTER_QWEN_API_KEY`: Your secondary OpenRouter API key (for chat feature)
     - `VITE_SITE_URL`: Your application URL (for API attribution)
     - `VITE_SITE_NAME`: Your application name (for API attribution)

## How It Works

1. **User Experience**:
   - Students can switch to the "Ask Questions" tab in the ContentViewer component
   - They can type questions about the current learning material
   - The AI responds with relevant information from the content

2. **Technical Implementation**:
   - Questions are sent to the OpenRouter API with the current learning content as context
   - The Qwen3-14B model processes the question and content to generate a response
   - Responses are displayed in a chat-like interface within the ContentViewer

3. **Files**:
   - `src/services/openrouter.ts`: Service for communicating with OpenRouter API
   - `src/components/learning/ContentChat.tsx`: Chat UI component
   - `src/components/learning/ContentViewer.tsx`: Integration into the learning experience

## Usage Tips

- For best results, ask questions that are specifically about the learning content
- The model has access to the current content only, not previous materials
- Responses are based on the context provided by the current learning content
- If you don't have an OpenRouter API key, a fallback message will be displayed

## Extending the Feature

You can extend this feature by:
1. Adding conversation history persistence in Firestore
2. Implementing additional context from previous learning sessions
3. Creating a custom model fine-tuned on your educational content

## Troubleshooting

If you encounter any issues:
1. Check that your OpenRouter Qwen API key is correctly set in the `.env.local` file as `VITE_OPENROUTER_QWEN_API_KEY`
2. Ensure you have sufficient credits/quota on your OpenRouter account for both API keys
3. Verify that the content being sent as context isn't too large (API limits apply)
4. Check browser console for any error messages from the API
