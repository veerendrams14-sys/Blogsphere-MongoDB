# BlogSphere — MongoDB database integration

The frontend design is retained and the backend now stores users and blog posts in MongoDB instead of temporary in-memory arrays. Registration hashes passwords; login checks the hash. Blog list/detail endpoints read from MongoDB, and opening a blog detail increments its view count.

## 1. Create the MongoDB connection string
1. In MongoDB Atlas, open your project and cluster, then choose **Connect → Drivers**.
2. Copy the Node.js connection string. Make sure your Atlas database user exists and **Network Access** allows your current IP (or configure a suitable restricted IP entry).
3. Replace the username, password and cluster placeholders. If your password contains characters such as `@`, `#`, `/`, or `:`, URL-encode them.

## 2. Configure the backend
1. Open the `Blogsphere/backend` folder in VS Code.
2. Copy `.env.example` and rename the copy to `.env`.
3. In `.env`, replace the `MONGODB_URI` value with your real Atlas connection string. Keep `/blogsphere` as the database name (or choose another name).
4. Open a terminal in the `backend` folder and run:

   ```bash
   npm install
   npm start
   ```

5. Wait for `MongoDB connected successfully` and `BlogSphere Backend running on http://localhost:5000`.
6. Open `http://localhost:5000/api/health`; it should report `"database":"connected"`.

## 3. Run the frontend
Use VS Code Live Server to open `Blogsphere/index.html` (or open the HTML files through your usual local frontend server). Keep the backend terminal running. Register a new account, then log in. Create a blog and check the dashboard. Refreshing the page or restarting the backend should not delete saved users or blogs.

## API endpoints
- `POST /api/auth/register` — name, email, password
- `POST /api/auth/login` — email, password
- `POST /api/blogs` — title, category, content, optional tags/status
- `GET /api/blogs` — list blogs
- `GET /api/blogs/:id` — individual blog details and view count
- `GET /api/health` — backend/database status

## Important
- Never share or commit your real `.env` file or MongoDB password. `.env` is ignored by Git.
- This starter integration implements database persistence, password hashing and login verification. It does not yet implement session/JWT authentication or per-user blog authorization; add those before deploying publicly.
- Draft saving already present in the existing frontend uses browser localStorage. Published blog posts are stored in MongoDB.
