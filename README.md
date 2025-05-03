# VChat - Real-time Chat Application

A sleek, real-time 1-on-1 chat web application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.io.

![VChat Banner](https://via.placeholder.com/800x200?text=VChat+-+Real-time+Chat+App)

## Live Demo

Check out the live application: [VChat](https://buzz-link-azure.vercel.app)

## Features

- 🔐 Secure user authentication
- 💬 Instant messaging in real-time
- 🎨 Modern, intuitive interface
- 📱 Fully responsive design for mobile and desktop

## About This Project

VChat is a personal project that demonstrates a full-stack application using modern web technologies. It allows users to register, login, and engage in private one-on-one conversations with other users in real-time.

## Screenshots

![Register Screen](https://res.cloudinary.com/dhyfp5re1/image/upload/v1746252301/VChat-Screenshots/x2bvxlaojuovrwuwsyka.png)
![Login Screen](https://res.cloudinary.com/dhyfp5re1/image/upload/v1746252301/VChat-Screenshots/x2bvxlaojuovrwuwsyka.png)
![Chat Interface](https://res.cloudinary.com/dhyfp5re1/image/upload/v1746252643/VChat-Screenshots/bantxfq95j2wg2zch9bq.png)

## Tech Stack

- **Frontend**: React, TailwindCSS, Socket.io Client, Framer Motion
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Authentication**: JWT, bcrypt

## Fork and Deploy Your Own Instance

This project is completely open for forking and deploying your own instance. Follow these steps to get started:

### Prerequisites
- Node.js (v14.0.0 or later)
- MongoDB (local or cloud instance)

### Installation

1. Fork and clone the repository
```bash
git clone https://github.com/Rakshit-Rawat/ChatApp.git
cd vchat
```

2. Set up environment variables
   - Create a `.env` file in the backend directory
   ```
   NODE_ENV=development
   PORT=5000
   DATABASE_URI=[your_mongodb_connection_string]
   JWT_SECRET=[your_secret_key]
   ```
   
   - Create a `.env` file in the frontend directory
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. Install and start the backend
```bash
cd backend
npm install
npm run dev
```

4. Install and start the frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

5. Open your browser and navigate to the URL shown in your frontend terminal (typically http://localhost:5173)

## Usage

1. Register a new account or login with existing credentials
2. Browse available users in the contacts section
3. Click on a user to start or continue a conversation
4. Type messages in the input field and press Enter or click the send button
5. Enjoy real-time messaging!

## Deployment

### Deploying Your Own Instance

You can deploy your fork of VChat using various hosting services:

- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Render, Railway, Heroku, or any VPS provider
- **Database**: MongoDB Atlas for cloud database hosting

Simply adjust the environment variables to match your production setup.

### Current Deployment

The official instance is deployed with:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Future Enhancements

- Group chat functionality
- File and image sharing
- Read receipts and typing indicators
- Push notifications
- Voice and video calls
- User Profiles & Contacts

## License

This project is licensed under the ISC License.

## Contact

Your Name - sayamr086@gmail.com

Project Link: [https://github.com/Rakshit-Rawat/ChatApp.git](https://github.com/Rakshit-Rawat/ChatApp.git)

Live Demo: [https://buzz-link-azure.vercel.app](https://buzz-link-azure.vercel.app)