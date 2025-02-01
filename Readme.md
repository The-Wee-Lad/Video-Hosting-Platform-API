# Video Hosting Platform Backend
I’ve developed a scalable and secure backend for a video hosting platform, similar to YouTube.

 This repository contains the core backend code that provides RESTful APIs for managing users, videos, comments, likes, and other essential operations. Designed with performance and scalability in mind, this system is built to handle growing traffic and user interaction while ensuring robust security measures.


---

## Features

- **User Management**
  - User registration and authentication (email/password)
  -login, logout, remove user,

- **Subscrition**
  -Users can subscribe other users

- **Video Management**
  - Upload, update, and delete videos.
  - Support for video metadata (e.g., title, description).

- **Comments and Likes**
  - user can comment and like a Video

- **Search**
  - Search videos by title or description
  - sort searches by duration, views, date

- **Playlist**
  - playlist of videos can be made

- **Privacy**
  - a video can have comments on off options
  - a video can be public, private
  - subscription list and can be made private


## Installation

### Prerequisites

1. **Node.js** (v16.x or higher).
2. **MongoDb** (v8.x or higher).
3. **Mongoose** (as ODM).
4. **Express** (4.x) installed on the server.
5. **Cloudinary** for cloud storage.

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/The-Wee-Lad/Video-Hosting-Platform
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
> **All routes are protected by JWT Authentication.**  
> The `verifyJWT` middleware ensures that only authenticated users can access these endpoints.
### User Endpoints

<details>
<summary>Authentication</summary>

- **Register User:**  
  ```
  POST /user/register
  ```
- **Login User:**  
  ```
  POST /user/login
  ```
- **Refresh Access Token:**  
  ```
  POST /user/refresh-accessToken
  ```
- **Logout:**  
  ```
  POST /user/logout
  ```
- **Change Password:**  
  ```
  POST /user/change-pass
  ```

</details>

<details>
<summary>User Profile</summary>

- **Get Current User:**  
  ```
  GET /user/getcurruser
  ```
- **Update Account Details:**  
  ```
  PUT /user/update-acc-details
  ```
- **Update Avatar:**  
  ```
  PUT /user/update-avatar
  ```
- **Update Cover:**  
  ```
  PUT /user/update-cover
  ```

</details>

<details>
<summary>Channel & Activity</summary>

- **Channel Info:**  
  ```
  GET /user/channel/:channelName
  ```
- **Watch History:**  
  ```
  GET /user/watch-history
  ```
- **Toggle Subscription Privacy Policy:**  
  ```
  PUT /user/toggleSubsPrivacy
  ```

</details>

<details>
<summary>Deletion & Removal</summary>

- **Remove User:**  
  ```
  DELETE /user/remove-user
  ```
- **Remove Cover Image:**  
  ```
  DELETE /user/remove-cover
  ```
- **Remove Avatar:**  
  ```
  DELETE /user/remove-avatar
  ```

</details>

### Video Endpoints

<details>
<summary>Video Upload & Retrieval</summary>

- **Publish Video:**  
  ```
  POST /videos
  ```
- **Get All Videos:**  
  ```
  GET /videos
  ```

</details>

<details>
<summary>Video Operations</summary>

- **Get Video by ID:**  
  ```
  GET /videos/:videoId
  ```
- **Update Video:**  
  ```
  PATCH /videos/:videoId
  ```
- **Delete Video:**  
  ```
  DELETE /videos/:videoId
  ```

</details>

<details>
<summary>Toggle Features</summary>

- **Toggle Video Publish Status:**  
  ```
  POST /videos/toggle-publish/:videoId
  ```
- **Toggle Comments on Video:**  
  ```
  POST /videos/toggle-comments/:videoId
  ```

</details>








### Subscription Endpoints

<details>
<summary>Manage Subscriptions</summary>

- **Toggle Subscription to a Channel:**  
  ```
  POST /subscriptions/c/:channel
  ```
- **Get Subscribed Channels:**  
  ```
  GET /subscriptions/c/:channel
  ```

</details>

<details>
<summary>Subscriber Information</summary>

- **Get My Subscribers:**  
  ```
  GET /subscriptions/my-subscribers
  ```

</details>


<br>



### Playlist Endpoints

<details>
<summary>Playlist Management</summary>

- **Create Playlist:**  
  `POST /playlists/`
  
- **Get Playlist By ID:**  
  `GET /playlists/:playlistId`
  
- **Update Playlist:**  
  `PATCH /playlists/:playlistId`
  
- **Delete Playlist:**  
  `DELETE /playlists/:playlistId`

</details>

<details>
<summary>Video in Playlist</summary>

- **Add Video to Playlist:**  
  `PATCH /playlists/add/:videoId/:playlistId`
  
- **Remove Video from Playlist:**  
  `PATCH /playlists/remove/:videoId/:playlistId`

</details>

<details>
<summary>User Playlists</summary>

- **Get User Playlists:**  
  `GET /playlists/user/:userId`

</details>

<br>

### Like/Dislike Endpoints

<details>
<summary>Toggle Like on Content</summary>

- **Toggle Like on Video:**  
  `POST /toggle/v/:videoId`
  
- **Toggle Like on Comment:**  
  `POST /toggle/c/:commentId`
  
<!-- Uncomment and modify the following if needed -->

<!-- - **Toggle Like on Tweet:**  
  `POST /toggle/t/:tweetId` -->

</details>

<details>
<summary>Liked Content</summary>

- **Get Liked Videos:**  
  `GET /videos`

</details>

<br>

### Comment Endpoints

<details>
<summary>Manage Comments</summary>

- **Get Comments for a Video:**  
  `GET /:videoId`
  
- **Add Comment to a Video:**  
  `POST /:videoId`
  
</details>

<details>
<summary>Update/Delete Comment</summary>

- **Delete Comment:**  
  `DELETE /c/:commentId`
  
- **Update Comment:**  
  `PATCH /c/:commentId`

</details>

<br>


> **ALL the API Endpoints** of **Videos**, **Subscriptions**, **Playlists**, **Likes**, and **Comments** are in the **Postman Collection**.
## Folder Structure

<details>
<summary> Click Here To expand </summary>
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
</details>

---

## Technologies Used

- **Language**: [Node.js](https://nodejs.org/)
- **Frameworks**: [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) for metadata storage.
- **Storage**: [Cloudinary](https://cloudinary.com/) for video files.
- **Authentication**: [JWT](https://jwt.io/) for token-based authentication.

---


