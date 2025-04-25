
# Ethical Web Watchdog

A browser extension that analyzes AI interactions for ethical concerns in real-time.

![image](https://github.com/user-attachments/assets/50c2a193-e13d-4593-adaf-e3ba0542417d)


## Features

- **AI Detection**: Automatically identifies AI systems on webpages
- **Real-time Analysis**: Monitors and analyzes interactions with AI services
- **Ethical Assessment**: Provides scores across multiple ethical dimensions:
  - Bias Detection
  - Privacy Analysis
  - Output Safety
  - Transparency
- **Adversarial Testing**: Option to test AI systems with challenging prompts
- **Visual Dashboard**: Clean, intuitive interface for understanding AI ethics

## Technical Overview

### Core Components

1. **Background Service** (`background.ts`)
   - Monitors network requests to detect AI service usage
   - Processes and analyzes AI interactions
   - Maintains a database of active analyses

2. **Content Script** (`content.ts`)
   - Runs on web pages to detect AI elements
   - Displays UI indicators for detected AI
   - Shows analysis results directly on the page

3. **Extension UI** (`Index.tsx` and components)
   - Dashboard for detailed analysis results
   - Settings for customizing detection parameters
   - Information about the analysis methodology

### How It Works

1. The extension detects when a user is interacting with an AI system through:
   - HTML/JavaScript signatures specific to AI services
   - Network requests to known AI API endpoints
   - Text patterns characteristic of AI interfaces

2. When an interaction is detected, the extension:
   - Captures the input being sent to the AI
   - Analyzes the response from the AI service
   - Evaluates various ethical dimensions
   - Displays real-time analysis results

## Building and Testing

### Prerequisites

- Node.js and npm

### Installation

1. Clone this repository
2. Install dependencies:
```
npm install --legacy-peer-deps
```

3. Build the extension:
```
npm run build
```

4. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory from this project

## Development

```
npm run dev
```

This will start a development server and rebuild the extension on file changes.

## Credits

Developed as an open-source tool for promoting ethical AI usage and transparency.
