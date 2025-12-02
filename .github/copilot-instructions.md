<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Home Styler Project Instructions

This is a TypeScript monorepo with React frontend and Node.js backend for AI-powered home styling.

## Project Structure
- Frontend: React + Vite + Tailwind + shadcn/ui + Zustand
- Backend: Node.js + Express + TypeScript
- AI Integration: OpenAI Images Edit API with gpt-image-1 model

## Key Guidelines
- Use TypeScript strictly throughout the project
- Follow security best practices (API keys only in backend, CORS, rate limiting)
- Keep components modular and reusable
- Use Zustand for state management
- Implement proper error handling and loading states
- Use shadcn/ui components for consistent UI
- Follow the prompt preset system for style variations

## Security Requirements
- Never expose OpenAI API key in frontend
- Implement file size and MIME type validation
- Use rate limiting and CORS protection
- Validate all user inputs on backend