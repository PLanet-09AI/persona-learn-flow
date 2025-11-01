# Persona Learn Flow - Codebase Documentation

## Project Overview
Persona Learn Flow is a modern web application built with React, TypeScript, and Vite that provides a personalized learning experience. The application adapts its content presentation based on user learning styles and preferences.

## Tech Stack
- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: React Query
- **Routing**: React Router
- **Package Manager**: npm/bun

## Project Structure

```
src/
├── components/
│   ├── learning/         # Learning-specific components
│   └── ui/              # Reusable UI components (shadcn/ui)
├── hooks/               # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Route components
└── App.tsx             # Root component
```

## Key Components

### 1. Learning Components

#### ContentViewer (`src/components/learning/ContentViewer.tsx`)
- Displays learning content based on user's learning style
- Supports multiple content formats:
  - Visual (diagrams, mind maps)
  - Auditory (rhythm-based learning)
  - Reading (comprehensive text)
  - Kinesthetic (hands-on exercises)
- Generates dynamic content based on topics and fields

#### QuizComponent (`src/components/learning/QuizComponent.tsx`)
- Interactive quiz system
- Features:
  - Timer-based questions
  - Progress tracking
  - Adaptive questions based on learning style
  - Immediate feedback and explanations
  - Score tracking

#### LearningDashboard
- Main interface for learning experience
- Manages user profile and learning preferences
- Coordinates between content viewing and quiz taking

### 2. UI Components
The project uses shadcn/ui components for a consistent and modern UI:
- Buttons, Cards, Badges
- Progress indicators
- Dialogs and Alerts
- Forms and Inputs
- Navigation components
- Tooltips and Toasts

## Configuration Files

### TypeScript Configuration
- `tsconfig.json`: Base TypeScript configuration
- `tsconfig.app.json`: Application-specific TS config
- `tsconfig.node.json`: Node-specific TS config

### Vite Configuration (`vite.config.ts`)
- Development server setup
- Plugin configuration
- Path aliases
- Build optimization

### Tailwind Configuration (`tailwind.config.ts`)
- Custom theme settings
- Color palette
- Typography
- Component styling

## Routing
The application uses React Router for navigation:
- Root route (`/`): Main learning dashboard
- 404 route: Custom not found page
- Extensible routing system for future features

## State Management
- Uses React Query for data fetching and caching
- Local state managed through React hooks
- Context API used for theme and UI state

## Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access at `http://localhost:8080`

## Project Features

### Learning Style Adaptation
- Supports multiple learning styles:
  - Visual learners: Diagrams, charts, visual analogies
  - Auditory learners: Rhythm-based content, verbal cues
  - Reading/Writing learners: Comprehensive text content
  - Kinesthetic learners: Interactive exercises

### Content Generation
- Dynamic content generation based on:
  - User's field of study
  - Learning style preferences
  - Topic selection
  - Progress level

### Assessment System
- Timed quizzes
- Adaptive questioning
- Progress tracking
- Instant feedback
- Score management

## Best Practices
- Component-based architecture
- Type-safe development with TypeScript
- Modern React patterns and hooks
- Responsive design
- Accessibility considerations
- Performance optimization

## Future Enhancements
- User authentication system
- Progress persistence
- More learning style algorithms
- Enhanced content generation
- Social learning features
- Analytics dashboard

This documentation provides an overview of the codebase structure and functionality. For specific implementation details, refer to the individual component files and their corresponding comments.
