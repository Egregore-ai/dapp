# Egregore: Comprehensive Project Documentation

## Executive Summary

Egregore is a sophisticated decentralized AI application (dapp) that provides a unified interface for interacting with multiple Large Language Model (LLM) providers. Built with Next.js, Electron, and React, it features a modular architecture that supports various AI services through a standardized AIX (AI eXecution) system. The application offers chat functionality, image generation, voice interactions, and advanced features like multi-model conversations and beam search.

## Project Overview

### Core Technologies
- **Frontend**: Next.js 15.1.8 with React 18.3.1
- **Desktop**: Electron 37.4.0 for cross-platform desktop applications
- **UI Framework**: Material-UI Joy (MUI Joy) 5.0.0-beta.52
- **State Management**: Zustand 5.0.7
- **API Communication**: tRPC 11.4.4 with React Query 5.85.5
- **Database**: Prisma 5.22.0 with Dexie 4.0.11 (IndexedDB)
- **Build System**: Turbopack for development, Webpack for production

### Key Dependencies
- **AI/ML**: Tiktoken 1.0.21, Sharp 0.32.6 for image processing
- **Web3**: Wagmi 2.16.8, Viem 2.36.0, RainbowKit 2.2.8 for blockchain integration
- **File Processing**: Mammoth 1.10.0 (DOCX), PDF.js 5.4.54, Tesseract.js 6.0.1
- **UI Components**: @dnd-kit for drag-and-drop, React Resizable Panels 3.0.4
- **Utilities**: Nanoid 5.1.5, SuperJSON 2.2.2, EventEmitter3 5.0.1

## Architecture Overview

### Application Structure

```
src/
├── apps/                 # Application modules
│   ├── chat/            # Main chat interface
│   ├── draw/            # Image generation interface
│   ├── link-chat/       # Shared conversation links
│   ├── call/            # Voice call functionality
│   ├── beam/            # Multi-model beam search
│   └── personas/        # AI persona management
├── common/              # Shared utilities and components
│   ├── stores/          # State management (Zustand)
│   ├── layout/          # UI layout components
│   ├── providers/       # React context providers
│   ├── events/          # Event system
│   └── logic/           # Business logic
├── modules/             # Feature modules
│   ├── aix/            # AI eXecution system
│   ├── llms/           # LLM provider integrations
│   ├── t2i/            # Text-to-image generation
│   ├── elevenlabs/     # Voice synthesis
│   └── beam/           # Beam search functionality
└── server/             # Server-side code
```

### Core Systems

#### 1. AIX (AI eXecution) System
The AIX system provides a unified interface for all AI operations:

- **Client Layer** (`src/modules/aix/client/`): Handles API communication, streaming, and content reassembly
- **Server Layer** (`src/modules/aix/server/`): Manages vendor-specific API integrations and response parsing
- **Wire Types** (`src/modules/aix/server/api/aix.wiretypes.ts`): Type-safe API contracts

**Key Features:**
- Unified streaming API across all LLM providers
- Content reassembly from streaming particles
- Vendor-agnostic model configuration
- Performance profiling and debugging
- Rate limiting and throttling

#### 2. LLM Integration System
Supports multiple AI providers through a modular vendor system:

**Supported Vendors:**
- OpenAI (GPT models, DALL-E)
- Anthropic (Claude models)
- Google (Gemini models)
- Ollama (Local models)
- Egregore (Custom models)
- DeepSeek, LM Studio, LocalAI, OpenRouter

**Architecture:**
- **Vendor Registry**: Central registration system for all providers
- **Model Discovery**: Dynamic model listing and configuration
- **Access Management**: Secure API key and endpoint management
- **Rate Limiting**: Vendor-specific rate limit handling

#### 3. State Management
Uses Zustand for efficient state management:

- **Chat Store**: Conversation management and message handling
- **LLM Store**: Model configuration and vendor management
- **UI Store**: User interface preferences and settings
- **Workspace Store**: File and folder management
- **Beam Store**: Multi-model conversation state

## Application Features

### 1. Chat Interface (`src/apps/chat/`)
The main chat application with advanced features:

**Core Functionality:**
- Multi-conversation support with split panes
- Real-time streaming responses
- Message branching and editing
- Conversation import/export
- Folder organization

**Advanced Features:**
- **Beam Search**: Multi-model comparison and fusion
- **Voice Integration**: ElevenLabs TTS/STT
- **Image Generation**: DALL-E and other T2I models
- **File Attachments**: Support for documents, images, and PDFs
- **Persona System**: Custom AI personalities

**UI Components:**
- **Composer**: Rich text input with attachments
- **Message List**: Streaming message display
- **Drawer**: Conversation sidebar
- **Panels**: Resizable conversation panes

### 2. Image Generation (`src/apps/draw/`)
Text-to-image generation interface:

**Supported Providers:**
- OpenAI DALL-E
- LocalAI
- Custom T2I services

**Features:**
- Prompt engineering tools
- Gallery management
- Batch generation
- Image editing and refinement

### 3. Voice Calls (`src/apps/call/`)
Voice-based AI interactions:

**Features:**
- Real-time voice conversations
- Persona-based voice responses
- Call recording and transcription
- Multi-participant support

### 4. Shared Conversations (`src/apps/link-chat/`)
Public conversation sharing system:

**Features:**
- Shareable conversation links
- Public conversation browser
- Conversation forking
- Access control and deletion

### 5. Persona Management (`src/apps/personas/`)
AI personality customization:

**Features:**
- Persona creation from text/YouTube
- Custom system prompts
- Persona marketplace
- Voice and appearance customization

## Technical Implementation

### AIX System Deep Dive

#### Client-Side Architecture
```typescript
// Core AIX client functions
aixChatGenerateContent_DMessage()     // Full DMessage generation
aixChatGenerateText_Simple()          // Simple text-only API
_aixChatGenerateContent_LL()          // Low-level implementation
```

**Streaming Pipeline:**
1. **Request Formation**: Convert internal format to vendor-specific API calls
2. **Particle Streaming**: Receive streaming data as particles
3. **Content Reassembly**: Reconstruct content from streaming chunks
4. **UI Updates**: Progressive UI updates during streaming

#### Server-Side Dispatch
The server layer handles vendor-specific implementations:

```typescript
createChatGenerateDispatch() // Routes to appropriate vendor handler
```

**Supported Protocols:**
- **OpenAI Chat Completions**: Standard chat API
- **OpenAI Responses**: Advanced reasoning API
- **Anthropic Messages**: Claude-specific API
- **Custom Protocols**: Vendor-specific implementations

### LLM Vendor System

#### Vendor Interface
Each vendor implements a standardized interface:

```typescript
interface IModelVendor<TAccessSchema> {
  id: string;
  name: string;
  rank: number;
  location: 'local' | 'cloud';
  instanceLimit: number;
  hasServerKey: boolean;
  component: React.ComponentType;
  initializeSetup(): Promise<InitResult>;
  getModels(): Promise<DLLMModel[]>;
}
```

#### Model Configuration
Models are dynamically discovered and configured:

```typescript
interface DLLMModel {
  id: DLLMId;
  label: string;
  contextWindow: number;
  maxOutputTokens: number;
  interfaces: string[];
  supportsFunctionCalls: boolean;
  description?: string;
  pricing?: { input: number; output: number };
}
```

### State Management Architecture

#### Store Organization
- **Per-Chat State**: Conversation-specific data
- **Global State**: Application-wide settings
- **UI State**: Interface preferences
- **Workspace State**: File and folder management

#### Key Stores
- `store-chats.ts`: Conversation management
- `store-llms.ts`: Model and vendor configuration
- `store-ui.ts`: User interface settings
- `store-beam.ts`: Multi-model beam operations

## Development and Deployment

### Build System
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "desktop:build": "npm run build && electron-builder -mwl"
  }
}
```

### Environment Configuration
- **Development**: Local development with hot reload
- **Production**: Optimized builds with source maps
- **Desktop**: Electron builds for Windows, macOS, Linux
- **Docker**: Containerized deployment

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Prisma**: Database management
- **PostHog**: Analytics and error tracking

## Security and Privacy

### Data Handling
- **Client-Side Storage**: IndexedDB for local data
- **API Key Management**: Secure key storage and rotation
- **Conversation Privacy**: Local encryption options
- **Network Security**: HTTPS enforcement

### Access Control
- **Vendor Authentication**: API key validation
- **Rate Limiting**: Request throttling
- **Content Moderation**: Harmful content detection
- **Audit Logging**: Request/response logging

## Performance Optimization

### Streaming and Caching
- **Response Streaming**: Progressive content delivery
- **Token Caching**: Anthropic prompt caching
- **Image Optimization**: Sharp-based image processing
- **Bundle Splitting**: Code splitting for performance

### Memory Management
- **Conversation GC**: Automatic cleanup of old conversations
- **Image Asset Management**: Automatic cleanup of generated images
- **State Optimization**: Efficient state updates and subscriptions

## Integration APIs

### tRPC Endpoints
- `aix.chatGenerateContent`: Main chat generation
- `llms.listModels`: Model discovery
- `trade.storageGet`: Shared conversation retrieval
- `elevenlabs.speakText`: Voice synthesis

### External APIs
- **OpenAI**: Chat completions, image generation
- **Anthropic**: Claude models
- **ElevenLabs**: Voice synthesis
- **PostHog**: Analytics
- **Vercel**: Deployment and analytics

## Future Roadmap

### Planned Features
- **Advanced Beam Operations**: Multi-model fusion algorithms
- **Plugin System**: Extensible functionality
- **Blockchain Integration**: Decentralized model access
- **Advanced Voice Features**: Real-time conversation
- **Collaborative Features**: Multi-user conversations

### Technical Improvements
- **Performance Optimization**: Further streaming improvements
- **Vendor Expansion**: Additional LLM provider support
- **Mobile Optimization**: Enhanced mobile experience
- **Offline Support**: Local model execution

## Conclusion

Egregore represents a sophisticated approach to AI application development, providing a unified interface across multiple LLM providers while maintaining high performance, security, and user experience. The modular AIX system enables seamless integration of new AI services, while the comprehensive state management and UI architecture support complex multi-modal interactions.

The application's architecture demonstrates best practices in modern web development, combining React's component model with efficient state management, streaming APIs, and cross-platform deployment capabilities.