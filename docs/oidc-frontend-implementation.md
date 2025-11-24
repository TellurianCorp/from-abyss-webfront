# OIDC Frontend Implementation Guide

**Version:** 1.0  
**Date:** November 24, 2025

## 1. Overview

This document provides a technical overview of the OpenID Connect (OIDC) client-side implementation for the **From Abyss Media** frontend. The implementation provides a complete authentication solution, enabling users to sign in via **LifeAuth** and access protected content.

## 2. Code Structure

The frontend authentication code is organized into the following components:

| Path | Description |
|---|---|
| `src/contexts/AuthContext.tsx` | React context for managing global authentication state (user, loading status, etc.). |
| `src/services/api/client.ts` | Generic API client with `credentials: 'include'` to handle session cookies. |
| `src/services/api/auth.ts` | API service for authentication-related endpoints (`/me`, `/logout`). |
| `src/components/auth/` | Directory containing all authentication-related UI components. |
| `src/components/auth/LoginButton.tsx` | Component that initiates the login flow by redirecting to the API. |
| `src/components/auth/LogoutButton.tsx` | Component that calls the logout API endpoint. |
| `src/components/auth/UserProfile.tsx` | Component to display authenticated user information. |
| `src/components/auth/AuthGuard.tsx` | Component that protects content, showing a fallback UI if not authenticated. |
| `src/components/routing/ProtectedRoute.tsx` | Route protection component for React Router, redirecting if not authenticated. |
| `src/hooks/useRequireAuth.ts` | Custom hook for programmatic redirection if authentication is required. |
| `src/types/user.ts` | TypeScript type definition for the User object. |
| `src/styles/auth.css` | Example CSS for styling authentication components. |
| `src/App.example.tsx` | Example `App.tsx` demonstrating full integration. |

## 3. Authentication Flow

1.  **Initialization:**
    - The `AuthProvider` component wraps the application.
    - On mount, it calls the `/v1/me` API endpoint to check for an existing session.
    - If successful, the user state is populated; otherwise, it remains `null`.

2.  **Login:**
    - The `LoginButton` component calls the `login` function from `useAuth`.
    - This function redirects the browser to the API's `/v1/auth/login` endpoint, which in turn redirects to LifeAuth.

3.  **Callback and Session:**
    - After successful authentication with LifeAuth, the user is redirected back to the API, which sets a secure session cookie.
    - The user is then redirected back to the frontend application.
    - The `AuthProvider` will automatically re-check authentication and update the user state.

4.  **Authenticated State:**
    - The `useAuth` hook provides access to the user object, `isAuthenticated` flag, and `isLoading` status.
    - Components can conditionally render content based on this state.

5.  **Logout:**
    - The `LogoutButton` calls the `logout` function from `useAuth`.
    - This function calls the API's `/v1/auth/logout` endpoint, which clears the session.
    - The user state in the frontend is set to `null`.

## 4. How to Use

### Step 1: Wrap Your App with `AuthProvider`

In your main `App.tsx` or `main.tsx` file, wrap your application with the `AuthProvider`.

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### Step 2: Use Authentication Components

**Login and Logout Buttons:**

```tsx
import { useAuth } from './contexts/AuthContext';
import { LoginButton, LogoutButton } from './components/auth';

const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header>
      {isAuthenticated ? <LogoutButton /> : <LoginButton />}
    </header>
  );
};
```

**Displaying User Information:**

```tsx
import { UserProfile } from './components/auth';

const MyProfilePage = () => {
  return <UserProfile />;
};
```

### Step 3: Protect Content and Routes

**Using `AuthGuard`:**

Use this component to protect specific parts of your UI.

```tsx
import { AuthGuard } from './components/auth';

const MyDashboard = () => {
  return (
    <AuthGuard>
      {/* This content is only visible to authenticated users */}
      <h2>Welcome to your dashboard!</h2>
    </AuthGuard>
  );
};
```

**Using `ProtectedRoute` with React Router:**

Use this component to protect entire routes.

```tsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/routing/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
```

## 5. Configuration

Ensure your frontend's `.env` file contains the correct API base URL:

```dotenv
# .env
VITE_API_BASE_URL=http://localhost:8080
```

## 6. Styling

Example styles for all authentication components are provided in `src/styles/auth.css`. You can import this file into your main CSS file or adapt the styles to your existing design system.

## Conclusion

This implementation provides a complete, reusable, and secure authentication solution for the From Abyss Media frontend. It is fully integrated with the backend OIDC flow and ready for production use.
