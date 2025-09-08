# Complete Guide: Adding a Custom Model Vendor to big-AGI

## Executive Summary

This comprehensive guide details the step-by-step process of integrating a custom Large Language Model (LLM) vendor into big-AGI, following the Ollama implementation pattern. big-AGI is a sophisticated AI suite that supports multiple model vendors through a modular architecture, enabling seamless integration of various AI services. This document provides detailed instructions for developers to add their own custom model provider while maintaining compatibility with the existing framework.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Implementation Steps](#implementation-steps)
4. [Code Structure](#code-structure)
5. [Testing & Deployment](#testing--deployment)
6. [Troubleshooting](#troubleshooting)

## Architecture Overview

### big-AGI Vendor System

big-AGI implements a **vendor abstraction layer** that allows multiple AI model providers to be integrated through a unified interface. The system follows these key principles:

- **Modular Design**: Each vendor is implemented as a separate module
- **Consistent API**: All vendors implement the same interface contracts
- **Dynamic Configuration**: Models can be discovered and configured at runtime
- **Type Safety**: Full TypeScript support for type checking and IntelliSense

### Core Components

1. **Vendor Registry**: Central registration system for all model vendors
2. **Model Source**: Configuration and connection management for each vendor
3. **API Transport**: Handles communication with the vendor's API endpoints
4. **Model Definitions**: Specifications for available models and their capabilities
5. **UI Components**: Settings panels and configuration interfaces

## Prerequisites

Before starting the implementation:

1. **Development Environment**
   - Node.js 18+ and npm/yarn installed
   - Git for version control
   - TypeScript knowledge
   - Familiarity with React and Next.js

2. **Custom Model API**
   - Your custom model should expose an API similar to Ollama's
   - Endpoints required:
     - `/api/tags` or equivalent for model listing
     - `/api/generate` for text generation
     - `/api/chat` for chat completions (optional)

3. **big-AGI Source Code**
   ```bash
   git clone https://github.com/enricoros/big-AGI.git
   cd big-AGI
   npm install
   ```

## Implementation Steps

### Step 1: Create Vendor Directory Structure

Create a new directory for your vendor under `src/common/llms-server/vendors/`:

```bash
src/common/llms-server/vendors/
└── custommodel/
    ├── custommodel.vendor.ts     # Main vendor implementation
    ├── custommodel.router.ts      # API routing logic
    ├── custommodel.models.ts      # Model definitions
    └── CustomModelSourceSetup.tsx # UI configuration component
```

### Step 2: Implement the Vendor Class

Create `custommodel.vendor.ts`:

```typescript
// src/common/llms-server/vendors/custommodel/custommodel.vendor.ts

import { IModelVendor } from '../IModelVendor';
import { VendorOptions } from '../vendor.types';
import { CustomModelSourceSetup } from './CustomModelSourceSetup';
import { registerCustomModelModels } from './custommodel.models';

export interface CustomModelAccessSchema {
  customModelHost: string;
  customModelKey?: string;  // Optional API key
}

export const ModelVendorCustomModel: IModelVendor<CustomModelAccessSchema> = {
  id: 'custommodel',
  name: 'Custom Model',
  rank: 15,  // Display order in vendor list
  location: 'local',  // or 'cloud'
  
  // Instance configuration
  instanceLimit: 5,  // Max number of instances
  hasServerKey: false,  // Whether server-side API key is supported
  
  // UI Component
  component: CustomModelSourceSetup,
  
  // Initialization
  async initializeSetup(options: VendorOptions<CustomModelAccessSchema>) {
    const { customModelHost } = options.access;
    
    // Validate connection
    try {
      const response = await fetch(`${customModelHost}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to connect to Custom Model server');
      }
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: `Connection failed: ${error.message}`,
      };
    }
  },
  
  // Model registration
  async getModels(options: VendorOptions<CustomModelAccessSchema>) {
    return await registerCustomModelModels(options);
  },
};
```

### Step 3: Create Model Registration Logic

Create `custommodel.models.ts`:

```typescript
// src/common/llms-server/vendors/custommodel/custommodel.models.ts

import { DLLMId, DLLMModel } from '../../store/llms-types';
import { VendorOptions } from '../vendor.types';
import { CustomModelAccessSchema } from './custommodel.vendor';

// Interface for model information from API
interface CustomModelInfo {
  name: string;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: {
    parameter_size?: string;
    quantization_level?: string;
    families?: string[];
    family?: string;
    parent_model?: string;
    format?: string;
  };
}

// Default model configurations
const DEFAULT_CONTEXT_WINDOW = 4096;
const DEFAULT_MAX_OUTPUT = 4096;

// Model capabilities mapping
const MODEL_CAPABILITIES = {
  'llama': { contextWindow: 8192, maxOutput: 4096, supportsFunctions: false },
  'mistral': { contextWindow: 32768, maxOutput: 4096, supportsFunctions: false },
  'codellama': { contextWindow: 16384, maxOutput: 4096, supportsFunctions: false },
  'qwen': { contextWindow: 32768, maxOutput: 4096, supportsFunctions: true },
  // Add more model families as needed
};

export async function registerCustomModelModels(
  options: VendorOptions<CustomModelAccessSchema>
): Promise<DLLMModel[]> {
  const { customModelHost, customModelKey } = options.access;
  
  try {
    // Fetch available models from the Custom Model API
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (customModelKey) {
      headers['Authorization'] = `Bearer ${customModelKey}`;
    }
    
    const response = await fetch(`${customModelHost}/api/tags`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    const data = await response.json();
    const modelList: CustomModelInfo[] = data.models || [];
    
    // Transform API models to DLLMModel format
    return modelList.map((model) => {
      const modelId = model.name.toLowerCase();
      const family = detectModelFamily(modelId);
      const capabilities = MODEL_CAPABILITIES[family] || {
        contextWindow: DEFAULT_CONTEXT_WINDOW,
        maxOutput: DEFAULT_MAX_OUTPUT,
        supportsFunctions: false,
      };
      
      return {
        id: `custommodel:${modelId}` as DLLMId,
        label: formatModelLabel(model.name),
        created: model.modified_at ? new Date(model.modified_at).getTime() : Date.now(),
        updated: model.modified_at ? new Date(model.modified_at).getTime() : Date.now(),
        
        // Model capabilities
        contextWindow: capabilities.contextWindow,
        maxOutputTokens: capabilities.maxOutput,
        
        // Features
        interfaces: ['text-to-text', 'text-to-text-stream'],
        supportsFunctionCalls: capabilities.supportsFunctions,
        
        // Metadata
        description: generateModelDescription(model),
        
        // Pricing (optional - set to 0 for local models)
        pricing: {
          input: 0,
          output: 0,
        },
        
        // Additional metadata
        benchmark: generateBenchmarkInfo(model),
        parameters: extractParameterCount(model),
      };
    });
  } catch (error) {
    console.error('Failed to register Custom Model models:', error);
    return [];
  }
}

// Helper functions
function detectModelFamily(modelId: string): string {
  if (modelId.includes('llama')) return 'llama';
  if (modelId.includes('mistral')) return 'mistral';
  if (modelId.includes('codellama')) return 'codellama';
  if (modelId.includes('qwen')) return 'qwen';
  return 'default';
}

function formatModelLabel(modelName: string): string {
  // Convert model name to readable format
  // e.g., "llama2:7b-chat" -> "Llama 2 7B Chat"
  return modelName
    .replace(/:/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateModelDescription(model: CustomModelInfo): string {
  const size = model.details?.parameter_size || 'Unknown size';
  const quant = model.details?.quantization_level || '';
  const format = model.details?.format || '';
  
  return `${size} model${quant ? ` (${quant})` : ''}${format ? ` - ${format}` : ''}`;
}

function generateBenchmarkInfo(model: CustomModelInfo): string | undefined {
  // Add benchmark information if available
  if (model.details?.families?.includes('llama')) {
    return 'Optimized for general conversation and reasoning';
  }
  if (model.details?.families?.includes('code')) {
    return 'Specialized for code generation and analysis';
  }
  return undefined;
}

function extractParameterCount(model: CustomModelInfo): string | undefined {
  return model.details?.parameter_size;
}
```

### Step 4: Implement the API Router

Create `custommodel.router.ts`:

```typescript
// src/common/llms-server/vendors/custommodel/custommodel.router.ts

import { createTRPCRouter, publicProcedure } from '../../trpc/trpc';
import { z } from 'zod';
import { CustomModelAccessSchema } from './custommodel.vendor';

export const customModelRouter = createTRPCRouter({
  
  // Chat completion endpoint
  chatComplete: publicProcedure
    .input(z.object({
      access: z.object({
        customModelHost: z.string(),
        customModelKey: z.string().optional(),
      }),
      model: z.string(),
      messages: z.array(z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
      })),
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
      stream: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { access, model, messages, temperature, maxTokens, stream } = input;
      
      // Prepare request body
      const requestBody = {
        model: model.replace('custommodel:', ''),
        messages,
        options: {
          temperature: temperature ?? 0.7,
          num_predict: maxTokens ?? 4096,
        },
        stream: stream ?? false,
      };
      
      // Make API request
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (access.customModelKey) {
        headers['Authorization'] = `Bearer ${access.customModelKey}`;
      }
      
      const response = await fetch(`${access.customModelHost}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      // Handle streaming response
      if (stream && response.body) {
        return handleStreamingResponse(response.body);
      }
      
      // Handle non-streaming response
      const data = await response.json();
      return {
        content: data.message?.content || data.response,
        model: data.model,
        usage: {
          promptTokens: data.prompt_eval_count,
          completionTokens: data.eval_count,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    }),
  
  // Model pull endpoint (if your API supports downloading models)
  pullModel: publicProcedure
    .input(z.object({
      access: z.object({
        customModelHost: z.string(),
        customModelKey: z.string().optional(),
      }),
      modelName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { access, modelName } = input;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (access.customModelKey) {
        headers['Authorization'] = `Bearer ${access.customModelKey}`;
      }
      
      const response = await fetch(`${access.customModelHost}/api/pull`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: modelName }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }
      
      return { success: true };
    }),
});

// Helper function for handling streaming responses
async function handleStreamingResponse(stream: ReadableStream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            fullContent += json.message.content;
          } else if (json.response) {
            fullContent += json.response;
          }
        } catch (e) {
          // Skip non-JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  
  return { content: fullContent };
}
```

### Step 5: Create the UI Configuration Component

Create `CustomModelSourceSetup.tsx`:

```tsx
// src/common/llms-server/vendors/custommodel/CustomModelSourceSetup.tsx

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
} from '@mui/joy';
import { CustomModelAccessSchema } from './custommodel.vendor';

export interface DModelSourceSetupProps {
  source: {
    id: string;
    setup: CustomModelAccessSchema;
  };
  onChange: (setup: CustomModelAccessSchema) => void;
  onTest?: () => Promise<{ success: boolean; message?: string }>;
}

export function CustomModelSourceSetup({
  source,
  onChange,
  onTest,
}: DModelSourceSetupProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...source.setup,
      customModelHost: e.target.value.trim(),
    });
  };
  
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...source.setup,
      customModelKey: e.target.value.trim(),
    });
  };
  
  const handleTest = async () => {
    if (!onTest) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await onTest();
      setTestResult({
        success: result.success,
        message: result.message || (result.success ? 'Connection successful!' : 'Connection failed'),
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography level="title-lg">Custom Model Configuration</Typography>
      
      <Alert color="neutral">
        <Typography level="body-sm">
          Configure your Custom Model server connection. The server should be running
          and accessible from this application.
        </Typography>
      </Alert>
      
      <FormControl>
        <FormLabel>Server URL</FormLabel>
        <Input
          placeholder="http://localhost:11434"
          value={source.setup.customModelHost || ''}
          onChange={handleHostChange}
          sx={{ fontFamily: 'monospace' }}
        />
        <FormHelperText>
          Enter the URL where your Custom Model server is running
        </FormHelperText>
      </FormControl>
      
      <FormControl>
        <FormLabel>API Key (Optional)</FormLabel>
        <Input
          type="password"
          placeholder="Enter API key if required"
          value={source.setup.customModelKey || ''}
          onChange={handleKeyChange}
        />
        <FormHelperText>
          Only required if your server has authentication enabled
        </FormHelperText>
      </FormControl>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleTest}
          loading={testing}
          disabled={!source.setup.customModelHost}
        >
          Test Connection
        </Button>
        
        {testResult && (
          <Alert
            color={testResult.success ? 'success' : 'danger'}
            variant="soft"
            sx={{ flex: 1 }}
          >
            {testResult.message}
          </Alert>
        )}
      </Box>
      
      <Alert color="primary" variant="soft">
        <Typography level="body-sm">
          <strong>Tips:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Ensure your Custom Model server is running before connecting</li>
            <li>For remote servers, use the full URL including protocol (http/https)</li>
            <li>Check firewall settings if connection fails</li>
            <li>Use the Test Connection button to verify your configuration</li>
          </ul>
        </Typography>
      </Alert>
    </Box>
  );
}
```

### Step 6: Register the Vendor

Add your vendor to the main vendor registry:

```typescript
// src/common/llms-server/vendors/vendor.registry.ts

import { ModelVendorOllama } from './ollama/ollama.vendor';
import { ModelVendorOpenAI } from './openai/openai.vendor';
// ... other imports
import { ModelVendorCustomModel } from './custommodel/custommodel.vendor';  // Add this

export const MODEL_VENDORS = [
  ModelVendorOpenAI,
  ModelVendorAnthropic,
  ModelVendorOllama,
  // ... other vendors
  ModelVendorCustomModel,  // Add your vendor here
];

// Export the vendor for use in other parts of the application
export { ModelVendorCustomModel };
```

### Step 7: Update API Router Registry

Add your router to the main API router:

```typescript
// src/modules/backend/backend.router.ts (or similar location)

import { customModelRouter } from '../common/llms-server/vendors/custommodel/custommodel.router';

export const backendRouter = createTRPCRouter({
  // ... existing routers
  customModel: customModelRouter,  // Add your router
});
```

### Step 8: Add Environment Variables Support (Optional)

If you want to support server-side configuration via environment variables:

```typescript
// src/server/env.ts

export const env = {
  // ... existing env vars
  CUSTOMMODEL_API_HOST: process.env.CUSTOMMODEL_API_HOST || '',
  CUSTOMMODEL_API_KEY: process.env.CUSTOMMODEL_API_KEY || '',
};
```

Update your vendor to check for environment variables:

```typescript
// In custommodel.vendor.ts
export const ModelVendorCustomModel: IModelVendor<CustomModelAccessSchema> = {
  // ... other properties
  
  // Add environment variable support
  async getEnvironmentConfig() {
    const host = process.env.CUSTOMMODEL_API_HOST;
    const key = process.env.CUSTOMMODEL_API_KEY;
    
    if (host) {
      return {
        customModelHost: host,
        customModelKey: key,
      };
    }
    return null;
  },
};
```

## Code Structure

### Directory Layout

```
src/
├── common/
│   └── llms-server/
│       └── vendors/
│           └── custommodel/
│               ├── custommodel.vendor.ts      # Main vendor implementation
│               ├── custommodel.router.ts      # API routing
│               ├── custommodel.models.ts      # Model definitions
│               └── CustomModelSourceSetup.tsx # UI component
│
├── modules/
│   └── backend/
│       └── backend.router.ts                  # Register router here
│
└── server/
    └── env.ts                                  # Environment variables
```

### Key Interfaces

#### IModelVendor Interface

```typescript
interface IModelVendor<TSourceSetup> {
  id: string;                    // Unique vendor identifier
  name: string;                  // Display name
  rank: number;                  // Sort order
  location: 'local' | 'cloud';  // Deployment type
  instanceLimit: number;         // Max instances
  hasServerKey: boolean;         // Server-side API key support
  
  component: React.ComponentType<DModelSourceSetupProps>;  // UI component
  
  initializeSetup(options: VendorOptions<TSourceSetup>): Promise<InitResult>;
  getModels(options: VendorOptions<TSourceSetup>): Promise<DLLMModel[]>;
}
```

#### DLLMModel Interface

```typescript
interface DLLMModel {
  id: DLLMId;                    // Unique model ID
  label: string;                 // Display name
  created: number;               // Creation timestamp
  updated: number;               // Update timestamp
  
  contextWindow: number;         // Max context size
  maxOutputTokens: number;       // Max generation length
  
  interfaces: string[];          // Supported interfaces
  supportsFunctionCalls: boolean; // Function calling support
  
  description?: string;          // Model description
  pricing?: {                    // Cost information
    input: number;
    output: number;
  };
  
  benchmark?: string;            // Performance info
  parameters?: string;           // Model size
}
```

## Testing & Deployment

### Local Testing

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Start your Custom Model server:**
   ```bash
   # Example for Ollama-like server
   ./custommodel serve
   ```

3. **Test the integration:**
   - Navigate to `http://localhost:3000`
   - Go to Models settings
   - Click "Add Model Source"
   - Select "Custom Model"
   - Enter your server URL
   - Click "Test Connection"
   - Refresh models list

### Unit Testing

Create test files for your implementation:

```typescript
// src/common/llms-server/vendors/custommodel/__tests__/custommodel.test.ts

import { ModelVendorCustomModel } from '../custommodel.vendor';
import { registerCustomModelModels } from '../custommodel.models';

describe('CustomModel Vendor', () => {
  test('vendor configuration is valid', () => {
    expect(ModelVendorCustomModel.id).toBe('custommodel');
    expect(ModelVendorCustomModel.name).toBe('Custom Model');
  });
  
  test('model registration works', async () => {
    // Mock fetch response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [
          { name: 'test-model:latest', modified_at: '2024-01-01' },
        ],
      }),
    });
    
    const models = await registerCustomModelModels({
      access: { customModelHost: 'http://localhost:11434' },
    });
    
    expect(models).toHaveLength(1);
    expect(models[0].id).toBe('custommodel:test-model:latest');
  });
});
```

### Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set environment variables (optional):**
   ```bash
   export CUSTOMMODEL_API_HOST=https://your-model-server.com
   export CUSTOMMODEL_API_KEY=your-api-key
   ```

3. **Deploy using your preferred method:**
   - Vercel: `vercel deploy`
   - Docker: `docker build -t big-agi . && docker run -p 3000:3000 big-agi`
   - Direct: `npm start`

## Troubleshooting

### Common Issues and Solutions

#### 1. Connection Refused Error

**Problem:** Cannot connect to Custom Model server

**Solutions:**
- Ensure the server is running: `ps aux | grep custommodel`
- Check the URL is correct (including protocol and port)
- Verify firewall settings: `sudo ufw status`
- For Docker, ensure proper network configuration

#### 2. Models Not Appearing

**Problem:** Models list is empty after refresh

**Solutions:**
- Check API endpoint returns correct format
- Verify model parsing in `custommodel.models.ts`
- Check browser console for errors
- Ensure proper CORS headers on your server

#### 3. CORS Issues

**Problem:** Cross-Origin Request Blocked

**Solutions:**
Add CORS headers to your Custom Model server:
```javascript
// Example for Express.js server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});
```

#### 4. Authentication Failures

**Problem:** 401 Unauthorized errors

**Solutions:**
- Verify API key is correct
- Check authorization header format
- Ensure server accepts the authentication method
- Test with curl: `curl -H "Authorization: Bearer YOUR_KEY" http://localhost:11434/api/tags`

#### 5. Streaming Response Issues

**Problem:** Streaming responses not working

**Solutions:**
- Ensure server supports Server-Sent Events (SSE)
- Check response headers include `Content-Type: text/event-stream`
- Verify chunked transfer encoding is enabled
- Test streaming endpoint directly

### Debug Mode

Enable debug logging by adding to your vendor:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[CustomModel]', ...args);
  }
}

// Use in your code
debugLog('Fetching models from:', customModelHost);
debugLog('Models received:', modelList);
```

## Best Practices

### 1. Error Handling

Always implement comprehensive error handling:

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  // Process response
} catch (error) {
  console.error('API call failed:', error);
  // Provide user-friendly error message
  return {
    success: false,
    error: error.message || 'Unknown error occurred',
  };
}
```

### 2. Type Safety

Use TypeScript interfaces for all data structures:

```typescript
interface APIResponse {
  models: ModelInfo[];
  error?: string;
}

// Type guard
function isValidResponse(data: any): data is APIResponse {
  return data && Array.isArray(data.models);
}
```

### 3. Performance Optimization

- Cache model lists when appropriate
- Implement request debouncing for frequent API calls
- Use streaming for large responses
- Implement connection pooling if supported

### 4. Security Considerations

- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Implement rate limiting
- Validate all user inputs
- Use HTTPS for production deployments

### 5. User Experience

- Provide clear error messages
- Show loading states during operations
- Implement connection testing
- Provide helpful documentation
- Add tooltips for complex settings

## Conclusion

This comprehensive guide provides all the necessary steps to integrate a custom model vendor into big-AGI. The modular architecture makes it straightforward to add new providers while maintaining consistency with the existing system. By following the Ollama pattern and implementing the required interfaces, your custom model will integrate seamlessly with big-AGI's advanced features including chat, voice, personas, and multi-model capabilities.

Remember to:
- Test thoroughly in development before production deployment
- Document any custom API requirements
- Contribute improvements back to the community if possible
- Keep your implementation updated with big-AGI's evolving architecture

For additional support, consult the big-AGI GitHub repository, join the Discord community, or refer to the official documentation at https://big-agi.com/docs.

## Appendix: Quick Reference

### File Checklist
- [ ] `custommodel.vendor.ts` - Main vendor implementation
- [ ] `custommodel.router.ts` - API routing logic
- [ ] `custommodel.models.ts` - Model definitions
- [ ] `CustomModelSourceSetup.tsx` - UI component
- [ ] Update `vendor.registry.ts`
- [ ] Update `backend.router.ts`
- [ ] Add environment variables (optional)
- [ ] Write tests
- [ ] Update documentation

### API Endpoints Required
- `GET /api/tags` - List available models
- `POST /api/chat` - Chat completion
- `POST /api/generate` - Text generation (optional)
- `POST /api/pull` - Download models (optional)

### Testing Commands
```bash
# Development
npm run dev

# Build
npm run build

# Test
npm test

# Lint
npm run lint

# Type check
npm run type-check
```