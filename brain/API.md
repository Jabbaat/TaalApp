# Language Learning Companion - API Documentation

## Authentication (`/api/auth`)
### POST `/register`
Register a new user.
- **Body**: `{ email, password, nativeLanguage, targetLanguage, skillLevel }`
- **Response**: `{ token, user }`

### POST `/login`
Authenticate a user.
- **Body**: `{ email, password }`
- **Response**: `{ token, user }`

### GET `/me`
Get current user profile (requires `Authorization: Bearer <token>`).
- **Response**: `{ user }`

## Lessons (`/api/lessons`)
### POST `/generate`
Generate a new AI-driven lesson.
- **Header**: `Authorization: Bearer <token>`
- **Response**: `{ id, title, content, difficultyLevel }`

### GET `/`
Get list of user's generated lessons.
- **Header**: `Authorization: Bearer <token>`
- **Response**: `[ { id, title, ... }, ... ]`

## Vocabulary (`/api/vocabulary`)
### POST `/add`
Add a new word to vocabulary.
- **Header**: `Authorization: Bearer <token>`
- **Body**: `{ word, translation }`
- **Response**: `{ id, word, translation, ... }`

### GET `/review`
Get words due for review (Spaced Repetition).
- **Header**: `Authorization: Bearer <token>`
- **Response**: `[ { id, word, translation, nextReviewDate }, ... ]`

### POST `/review/:id`
Submit a review rating for a word.
- **Header**: `Authorization: Bearer <token>`
- **Body**: `{ quality }` (0-5, where 5 is easiest)
- **Response**: `{ id, nextReviewDate, interval, easeFactor }`

## Chat (`/api/chat`)
### POST `/`
Send a message to the AI tutor.
- **Header**: `Authorization: Bearer <token>`
- **Body**: `{ message }`
- **Response**: `{ reply }`
