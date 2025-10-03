# Authentication Setup

## Appwrite Configuration

The project is configured to use Appwrite for authentication. The configuration is already set in `.env`:

```
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68de6ea10017532e1685
VITE_APPWRITE_PROJECT_NAME=VirtuLab
```

## Features Implemented

- **Login/Signup Forms**: Clean UI for user authentication
- **Protected Routes**: Users must authenticate to access the lab
- **Session Management**: Automatic session checking and persistence
- **Logout Functionality**: Users can securely logout

## Usage

1. Users will see the login/signup form when accessing the app
2. After successful authentication, they can access the full VirtuLab
3. User info and logout button appear in the top-right corner
4. Sessions persist across browser refreshes

## Authentication Flow

1. App checks for existing session on load
2. If no session, shows Auth component
3. User can toggle between login/signup
4. Successful auth redirects to MainLab
5. ProtectedRoute guards all lab content
