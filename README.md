# BlogSphere – Full Stack Blogging Application

BlogSphere is a full-stack blogging application where users can register, log in, create and publish blogs, save drafts, edit or delete their posts, and manage their profiles.

## Live Demo

- **Frontend:** https://blogsphere-frontend-mu.vercel.app
- **Backend:** https://blogsphere-mongo-db.vercel.app
- **GitHub Repository:** https://github.com/veerendrams14-sys/Blogsphere-MongoDB

## Features

- User registration and login
- Authentication using JWT
- Create, view, edit, and delete blog posts
- Save blogs as drafts and publish them later
- Dashboard to manage blog posts
- User profile viewing and name updates
- MongoDB database integration
- Responsive web interface
- Cloud deployment using Vercel

## Technology Stack

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js
- REST APIs

**Database**
- MongoDB Atlas
- Mongoose

**Deployment and Tools**
- Vercel
- Git and GitHub
- Postman

## Project Structure

```text
Blogsphere/
├── frontend HTML pages
├── CSS stylesheets
├── JavaScript files
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── package.json
└── README.md
```

*Note: Adjust the structure above to match the actual folders in your repository.*

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/veerendrams14-sys/Blogsphere-MongoDB.git
cd Blogsphere-MongoDB
```

### 2. Install backend dependencies

Open the backend directory:

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend directory using the variable names required by your backend:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_private_jwt_secret
```

Never commit your `.env` file or expose database credentials or authentication secrets.

### 4. Start the backend

Use the development command defined in the backend `package.json`, for example:

```bash
npm run dev
```

### 5. Run the frontend

Open the frontend using your configured local development server. Ensure its API URL points to the local backend when testing locally.

## Deployment

The frontend and backend are deployed separately on Vercel. The backend connects to MongoDB Atlas using environment variables configured in the deployment settings.

## Security

- Keep secrets in environment variables.
- Never publish database credentials or JWT secrets.
- Validate incoming API requests.
- Enforce authentication and ownership checks on protected operations.
- Restrict cross-origin access to trusted origins where appropriate.

## Project Objective

The objective of BlogSphere is to demonstrate full-stack web development, REST API integration, database operations, authentication, and application deployment.

## Author

Developed as part of a virtual internship project.
