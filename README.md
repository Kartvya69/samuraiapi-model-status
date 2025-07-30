# 🤖 SamuraiAPI Model Status Monitor

A beautiful, real-time monitoring dashboard for AI models from SamuraiAPI. Built with Next.js 15, TypeScript, and Tailwind CSS.

![Status Monitor](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Vercel](https://img.shields.io/badge/Vercel-Deployable-black)

## ✨ Features

### 🚀 **Real-time Monitoring**
- **Background Monitoring**: Checks all models every 2 minutes (starts with app)
- **Instant Status**: Users see current status immediately
- **Dynamic Discovery**: Automatically fetches all available models from API
- **Live Updates**: Real-time status updates without manual refresh

### 🎨 **Beautiful UI/UX**
- **Dark/Light Mode**: Smooth theme toggle with system preference detection
- **Modern Design**: Glassmorphism effects and gradient backgrounds
- **Responsive**: Perfect on all devices (mobile-first design)
- **Search & Filter**: Real-time search and status filtering
- **Animations**: Smooth transitions and hover effects

### 📊 **Professional Dashboard**
- **Status Cards**: Color-coded model status with gradient indicators
- **Statistics**: Total, Online, Offline counts with uptime percentage
- **Model Cards**: Detailed status with timestamps and error messages
- **Grid Layout**: Responsive 1-4 column grid system

### 🛠 **Technical Excellence**
- **Next.js 15**: Latest App Router with TypeScript
- **Background Services**: Server-side monitoring independent of user sessions
- **API Routes**: RESTful endpoints for model management
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized builds and efficient polling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- SamuraiAPI key

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Kartvya69/samuraiapi-model-status.git
cd samuraiapi-model-status
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```
Add your SamuraiAPI key:
```env
OPENAI_API_KEY=your_samurai_api_key_here
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect to Vercel:**
   - Import this repository to Vercel
   - Set environment variable: `OPENAI_API_KEY`
   - Deploy!

2. **Auto-deployment:**
   - Every push to `main` automatically deploys
   - Background monitoring starts immediately on deployment

### Other Platforms

The app works on any platform supporting Node.js:

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main dashboard |
| `/api/models` | GET | Get current model statuses |
| `/api/health` | GET | Health check |
| `/api/refresh-models` | POST | Manually refresh model list |

## 🎯 How It Works

1. **Application Starts** → Background monitoring initializes
2. **Model Discovery** → Fetches all available models from SamuraiAPI
3. **Status Testing** → Tests each model with: "Hello, are you working?"
4. **Background Loop** → Repeats every 2 minutes automatically
5. **User Access** → Sees current status instantly (no waiting)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your SamuraiAPI key | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |

### Monitoring Settings

- **Check Interval**: 2 minutes (120,000ms)
- **Request Timeout**: 30 seconds
- **Fallback Models**: 5 common models if API fails

## 🎨 UI Features

### Theme System
- **Auto-detection**: Respects system dark/light preference
- **Manual Toggle**: Beautiful sun/moon toggle button
- **Persistence**: Remembers user choice in localStorage

### Search & Filter
- **Real-time Search**: Instant filtering by model name
- **Status Filter**: Show All, Online Only, or Offline Only
- **Combined Filtering**: Search and status work together

### Responsive Design
- **Mobile**: Single column layout
- **Tablet**: 2-3 column grid
- **Desktop**: 4 column grid
- **Large Screen**: Optimized spacing

## 🛡️ Error Handling

- **API Failures**: Graceful fallback to common models
- **Network Issues**: Retry logic with exponential backoff
- **Invalid Responses**: Error logging and user feedback
- **Background Failures**: Continues monitoring other models

## 📊 Monitoring Details

### Model Testing
- **Test Message**: "Hello, are you working?"
- **Max Tokens**: 10 (minimal response)
- **Timeout**: 30 seconds per model
- **Parallel Testing**: All models tested simultaneously

### Status Determination
- **Online**: Successful response from model
- **Offline**: HTTP error or timeout
- **Error**: Unexpected failure during testing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SamuraiAPI**: For providing the AI model API
- **Next.js Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide**: For beautiful icons
- **Vercel**: For seamless deployment platform

---

**Built with ❤️ and Claude Code**

🚀 [Deploy to Vercel](https://vercel.com/import/project?template=https://github.com/Kartvya69/samuraiapi-model-status)