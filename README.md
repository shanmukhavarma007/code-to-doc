# Code-to-Doc Generator

> Convert source code into structured, human-readable documentation using free AI models.

## Tech Stack

- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (httpOnly cookies) + bcrypt
- **LLM:** OpenRouter `openrouter/free`

## Project Structure

```
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   └── tailwind.config.js
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── utils/
│   └── .env.example
├── .gitignore
├── .env.example
└── README.md
```

## Setup

### Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account
- OpenRouter API key

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
npm install
npm start
```

## Security Features

- JWT in httpOnly SameSite=Strict cookies
- bcrypt password hashing (rounds: 12)
- DOMPurify XSS sanitization
- Rate limiting (10 req/min per IP)
- MongoDB injection prevention
- Prompt injection guard
- Helmet.js security headers

## License

MIT
