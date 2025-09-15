# AI Home Style Generator

An AI-powered interior design inspiration tool that generates professionally styled room variations based on your uploaded photos. Using advanced vision AI and image generation, get instant design ideas that match your chosen aesthetic.

## Features

- **5 Interior Styles**: Modern, Scandinavian, Industrial, Minimal, and Boho
- **AI Vision Analysis**: GPT-4o analyzes your room's layout, furniture, and lighting
- **Style-Matched Generation**: DALL-E 3 creates professionally designed variations
- **Adjustable Intensity**: Control how strong the style transformation is (0.3-0.8)
- **Multiple Variations**: Generate 2-4 design inspirations per request
- **Smart Image Processing**: Automatic resizing and optimization
- **Secure File Handling**: MIME type validation, file size limits, and rate limiting
- **Modern UI**: Clean, responsive interface built with Tailwind CSS and shadcn/ui

## How It Works

1. **Upload**: Submit a photo of any interior room (living room, bedroom, kitchen, etc.)
2. **Analyze**: GPT-4o Vision AI analyzes your room's architecture, furniture placement, and lighting
3. **Generate**: DALL-E 3 creates professionally styled room designs inspired by your space
4. **Inspire**: Download high-quality design variations perfect for renovation planning

**Note**: This tool generates style-inspired design ideas based on your room photo rather than directly editing your specific image. Results are professionally designed rooms that match your selected aesthetic and room type.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Zustand** for state management
- **Axios** for API calls

### Backend
- **Node.js** with Express and TypeScript
- **OpenAI GPT-4o Vision** for room analysis
- **OpenAI DALL-E 3** for image generation
- **Sharp** for image processing
- **Multer** for file uploads
- **Security**: Helmet, CORS, rate limiting

## Prerequisites

- Node.js 18+ (for both frontend and backend)
- pnpm (preferred) or npm
- OpenAI API key with sufficient quota

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install workspace dependencies
pnpm install

# Install frontend and backend dependencies
pnpm run install:all
```

### 2. Environment Configuration

Copy the environment template and configure:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```bash
# Required: Your OpenAI API key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Server configuration
PORT=3001
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173
MAX_IMAGE_SIDE=2048
MAX_UPLOAD_MB=10
```

### 3. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Ensure your account has sufficient credits for image generation
4. Add the key to `backend/.env`

## Development

### Run Both Services

```bash
# Start both frontend and backend in development mode
pnpm dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Run Services Separately

```bash
# Frontend only
cd frontend && pnpm dev

# Backend only  
cd backend && pnpm dev
```

### Build for Production

```bash
# Build frontend
pnpm build

# Build backend
cd backend && pnpm build
```

## Usage

1. **Upload Image**: Drag and drop or click to select a JPEG/PNG interior photo
2. **Choose Style**: Select from Modern, Scandinavian, Industrial, Minimal, or Boho
3. **Adjust Settings**: 
   - Set style intensity (0.3 = subtle, 0.8 = strong)
   - Choose number of variations (2-4)
4. **Generate**: Click "Generate Styled Images" and wait 20-60 seconds
5. **Download**: Click on any generated image to download it

## API Reference

### POST /api/restyle

Transform an interior image with a selected style.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `image`: Image file (JPEG/PNG, max 10MB)
  - `styleKey`: Style identifier (`modern`, `scandi`, `industrial`, `minimal`, `boho`)
  - `intensity`: Style strength (0.3-0.8)
  - `numOutputs`: Number of variations (1-4)

**Response:**
```json
{
  "images": [
    {
      "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "seed": 123456
    }
  ]
}
```

**Rate Limits:**
- 10 requests per minute per IP
- 60-second timeout per request

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && pnpm build`
3. Set output directory: `frontend/dist`
4. Deploy

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set build command: `cd backend && pnpm build`
3. Set start command: `cd backend && pnpm start`
4. Configure environment variables:
   - `OPENAI_API_KEY`
   - `ALLOWED_ORIGIN` (your Vercel frontend URL)
   - `MAX_IMAGE_SIDE=2048`
   - `MAX_UPLOAD_MB=10`

### Environment Variables for Production

```bash
# Backend environment variables
OPENAI_API_KEY=sk-your-production-key
ALLOWED_ORIGIN=https://your-frontend-domain.vercel.app
NODE_ENV=production
PORT=3001
MAX_IMAGE_SIDE=2048
MAX_UPLOAD_MB=10
```

## Security Features

- **CORS Protection**: Only allows requests from configured origins
- **Rate Limiting**: 10 requests per minute per IP address
- **File Validation**: MIME type and size checking
- **Secure Headers**: Helmet.js security headers
- **Input Validation**: All parameters validated and sanitized
- **API Key Protection**: OpenAI key never exposed to frontend

## Troubleshooting

### Common Issues

**"API rate limit exceeded"**
- Wait a few minutes before trying again
- Check your OpenAI account usage limits

**"File too large"**
- Ensure image is under 10MB
- Use JPEG instead of PNG for smaller file sizes

**"Invalid file type"**
- Only JPEG and PNG files are supported
- Check the file extension matches the content

**CORS errors**
- Verify `ALLOWED_ORIGIN` in backend `.env` matches your frontend URL
- For local development, use `http://localhost:5173`

### Development Tips

1. **Image Quality**: Use high-quality interior photos for best results
2. **Style Intensity**: Start with 0.6 intensity for balanced results
3. **API Costs**: Each request costs OpenAI credits - monitor usage
4. **Error Handling**: Check browser console and backend logs for detailed errors

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and ESLint conventions
4. Add proper error handling and logging
5. Test both frontend and backend changes
6. Submit a pull request

## Architecture Notes

### Prompt Engineering
- Base guardrails preserve room geometry and lighting
- Style-specific prompts define aesthetic transformations
- Intensity parameter controls transformation strength

### Image Processing
- Sharp.js handles resizing and format conversion
- Images auto-resize to max 2048px on longest side
- JPEG format ensures OpenAI API compatibility

### Error Handling
- Comprehensive error classification and user-friendly messages
- Request logging with performance metrics
- Graceful degradation for API failures# AI-Home-Renovation-Project-Solo-
# AI-Home-Renovation-Project-Solo-
# AI-Home-Renovation-Project-Solo-
# AI-Home-Renovation-Project-Solo-
# AI-Home-Renovation-Project-Solo-
