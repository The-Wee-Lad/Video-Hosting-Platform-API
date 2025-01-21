# Video Hosting Platform Backend
I have made a generic VideoHosting backend for "Youtube" like System.

This repository contains the backend code for a video hosting platform. It provides RESTful APIs for managing users, videos, and related operations. The backend is built with scalability, security, and performance in mind.

---

## Features

- **User Management**
  - User registration and authentication (email/password, OAuth).
  - User profiles with roles (e.g., admin, viewer, uploader).

- **Video Management**
  - Upload, update, and delete videos.
  - Stream videos to clients using adaptive bitrate streaming.
  - Support for video metadata (e.g., title, description, tags).

- **Search and Recommendations**
  - Search videos by title, tags, or description.
  - Personalized video recommendations based on user activity.

- **Analytics and Insights**
  - Track views, likes, and other interactions.
  - Generate usage reports for users and admins.

- **Content Moderation**
  - Admin tools for flagging and reviewing inappropriate content.

---

## Tech Stack

- **Language**: [Node.js](https://nodejs.org/)
- **Frameworks**: [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) for metadata storage.
- **Storage**: [Cloudinary](https://cloudinary.com/) for video files.
- **Authentication**: [JWT](https://jwt.io/) for token-based authentication.

---

## Installation

### Prerequisites

1. **Node.js** (v16.x or higher).
2. **PostgreSQL** (v13 or higher).
3. **MongoDB** (optional for metadata).
4. **FFmpeg** installed on the server.
5. **AWS CLI** or **Google Cloud CLI** for storage integration.

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/video-hosting-backend.git
   cd video-hosting-backend
2. Installing Dependencies
    ```
    npm install
3. Environment Setup
```bash
    PORT=8000
    MONGODB_URI=Your Mongo url
    CORS_ORIGIN=*
    ACCESS_TOKEN_SECRET= use rendom string generators
    ACCESS_TOKEN_EXPIRY="1h"
    REFRESH_TOKEN_SECRET=a refresh Token secret
    REFRESH_TOKEN_EXPIRY="1d"

    #I used cloudinary for hosting user profile   pics, coverImage, and videos themselves.

    CLOUDINARY_CLOUD_NAME=clodinary cloud name
    CLOUDINARY_API_KEY=its api key
    CLOUDINARY_API_SECRET=its secret
    CLOUDINARY_URL=not really needed
```

4. Run Node Development
    ```bash
    npm run dev
5. Access Api At
    ```bash
    http://localhost:<port>


## API Endpoints

## Development
    
### Folder Structure

<pre>
Video-Hosting-Platform
├── SRC
│   ├── controllers
│   │   ├── comment.controller.js
│   │   ├── healthcheck.controller.js
│   │   ├── like.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   ├── user.controller.js
│   │   └── video.controller.js
│   ├── db
│   │   └── index.js
│   ├── middlewares
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── models
│   │   ├── comments.model.js
│   │   ├── likes.model.js
│   │   ├── playlists.model.js
│   │   ├── subscriptions.model.js
│   │   ├── users.model.js
│   │   └── videos.models.js
│   ├── public
│   │   └── temp
│   ├── routes
│   │   ├── comment.routes.js
│   │   ├── healthcheck.routes.js
│   │   ├── like.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscription.routes.js
│   │   ├── user.routes.js
│   │   └── video.routes.js
│   └── utilities
│       ├── ApiError.js
│       ├── ApiResponse.js
│       ├── asyncHandler.js
│       └── cloudinary.js
├── app.js
├── constants.js
├── index.js
├── .env
└── readme.md
</pre>



