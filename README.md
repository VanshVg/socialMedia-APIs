# socialMedia-APIs

This github repository contains APIs for different routes and functionalities for a Social Media application. 

## For Testing

To test the APIs run below command inside main folder

```bash
 npm run test
 ```

## API Endpoints

### User Authentication and Profile

- `POST /api/register`: User registration.
- `POST /api/authenticate`: User login.
- `GET /api/user`: Get user profile.
- `POST /api/logout`: User logout.

### User Interaction

- `POST /api/follow/:id`: Follow another user.
- `POST /api/unfollow/:id`: Unfollow a user.

### Posts

- `POST /api/posts/`: Create a post.
- `DELETE /api/posts/:id`: Delete a post.
- `POST /api/like/:id`: Like a post.
- `POST /api/unlike/:id`: Unlike a post.
- `POST /api/comment/:id`: Add a comment to a post.
- `GET /api/posts/:id`: Get details of a post.
- `GET /api/all_posts`: Get all posts.

