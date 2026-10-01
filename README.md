# VChat

VChat is a full-stack real-time chat application built with React, Express, MongoDB, and Socket.IO.

It currently supports private one-to-one conversations with persistent messages, realtime delivery, user search, presence tracking, and message management.

## Features

- User registration, login, and logout
- JWT-based authentication flow
- Search users by username
- Create and open private conversations
- Persistent conversation and message history
- Realtime messaging with Socket.IO
- Online/offline presence updates
- Conversation previews with latest messages
- Optimistic message sending
- Multi-message selection and deletion
- Optimistic deletion with rollback
- Responsive messenger interface

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router 8 |
| State Management | Zustand 5 |
| HTTP Client | Axios |
| Styling | Tailwind CSS 4 |
| UI | Radix UI / shadcn-style components |
| Animation | Motion |
| Icons | Lucide React |
| Realtime | Socket.IO 4 |
| Backend | Node.js + Express 5 |
| Database | MongoDB |
| ODM | Mongoose 9 |
| Authentication | JWT |

## Project Structure

```text
ChatApp/
├── Backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Routes/
│   ├── db.js
│   ├── server.js
│   └── socket.js
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── App.jsx
│   │   └── SocketManager.js
│   └── vite.config.js
│
└── README.md
```

## Local Development

### Backend

```bash
cd Backend
npm install
cp .env.example .env
npm run dev
```

`Backend/.env`:

```env
PORT=6000
MONGO_URI=mongodb://127.0.0.1:27017/vchat
JWT_SECRET=replace_with_a_secret
```

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

`Frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:6000
```

The frontend is served by Vite at:

```text
http://localhost:5173
```

## Routes

```text
/           Landing page
/register   Registration
/login      Login
/chat       Messenger
```

## API

### Authentication

```http
POST /auth/register
POST /auth/login
POST /auth/logout
```

### Users

```http
GET /api/user/search?q=<username>
```

### Conversations

```http
GET   /api/conversation/:username
POST  /api/conversation/create
PATCH /api/conversation/:id
```

### Messages

```http
GET    /api/messages/:conversationId
POST   /api/messages
DELETE /api/messages/bulk-delete
```

## Status

VChat is under active development and is not currently intended for production deployment.

## License

ISC
