/// <reference types="cypress" />

describe('OIDC Authentication Flow', () => {
  const apiBaseUrl = Cypress.env('apiBaseUrl');

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('FE-001: Login with Success (Happy Path)', () => {
    it('should successfully log in a user', () => {
      // Visit the home page
      cy.visit('/');

      // Verify the login button is visible
      cy.contains('button', /login/i).should('be.visible');

      // Intercept the API call to /v1/me to mock the authenticated state
      cy.intercept('GET', `${apiBaseUrl}/v1/me`, {
        statusCode: 200,
        body: {
          id: 1,
          lifeauth_sub: 'test-user-sub-123',
          name: 'Test User',
          email: 'test@fromabyss.media',
          email_verified: true,
          picture: 'https://example.com/avatar.jpg',
          created_at: '2025-11-24T00:00:00Z',
          updated_at: '2025-11-24T00:00:00Z',
        },
      }).as('getMe');

      // Click the login button
      cy.contains('button', /login/i).click();

      // The app should redirect to the API login endpoint
      // In a real scenario, this would redirect to LifeAuth
      // For testing, we'll mock the callback
      cy.url().should('include', `${apiBaseUrl}/v1/auth/login`);

      // Simulate successful callback by setting a session cookie
      cy.setCookie('session_id', 'mock-session-id-12345', {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'lax',
      });

      // Navigate back to the app
      cy.visit('/');

      // Wait for the /v1/me call
      cy.wait('@getMe');

      // Verify user is logged in
      cy.contains('Test User').should('be.visible');
      cy.contains('test@fromabyss.media').should('be.visible');
    });
  });

  describe('FE-002: Logout with Success', () => {
    beforeEach(() => {
      // Set up authenticated state
      cy.setCookie('session_id', 'mock-session-id-12345');
      cy.intercept('GET', `${apiBaseUrl}/v1/me`, {
        statusCode: 200,
        body: {
          id: 1,
          lifeauth_sub: 'test-user-sub-123',
          name: 'Test User',
          email: 'test@fromabyss.media',
          email_verified: true,
        },
      });
    });

    it('should successfully log out a user', () => {
      // Intercept the logout API call
      cy.intercept('POST', `${apiBaseUrl}/v1/auth/logout`, {
        statusCode: 200,
        body: { message: 'Logged out successfully' },
      }).as('logout');

      cy.visit('/');

      // Click the logout button
      cy.contains('button', /logout/i).click();

      // Wait for the logout call
      cy.wait('@logout');

      // Verify the session cookie is removed
      cy.getCookie('session_id').should('be.null');

      // Verify the login button is visible again
      cy.contains('button', /login/i).should('be.visible');
    });
  });

  describe('FE-003: Access Protected Route (Authenticated)', () => {
    beforeEach(() => {
      // Set up authenticated state
      cy.setCookie('session_id', 'mock-session-id-12345');
      cy.intercept('GET', `${apiBaseUrl}/v1/me`, {
        statusCode: 200,
        body: {
          id: 1,
          lifeauth_sub: 'test-user-sub-123',
          name: 'Test User',
          email: 'test@fromabyss.media',
          email_verified: true,
        },
      });
    });

    it('should allow access to protected route', () => {
      // Visit a protected route (assuming /dashboard exists)
      cy.visit('/dashboard');

      // Verify the page loads without redirect
      cy.url().should('include', '/dashboard');

      // Verify protected content is visible
      cy.contains('Dashboard').should('be.visible');
    });
  });

  describe('FE-004: Access Protected Route (Not Authenticated)', () => {
    it('should redirect to login page', () => {
      // Intercept /v1/me to return 401
      cy.intercept('GET', `${apiBaseUrl}/v1/me`, {
        statusCode: 401,
        body: { error: 'Unauthorized' },
      });

      // Try to visit a protected route
      cy.visit('/dashboard');

      // Should be redirected to home or login
      cy.url().should('not.include', '/dashboard');
      cy.contains('button', /login/i).should('be.visible');
    });
  });

  describe('FE-005: Failure in Callback (Invalid Code)', () => {
    it('should display error message on authentication failure', () => {
      // Intercept the callback with an error
      cy.intercept('GET', `${apiBaseUrl}/v1/auth/callback*`, {
        statusCode: 400,
        body: { error: 'Invalid authorization code' },
      }).as('callbackError');

      // Simulate visiting the callback URL with invalid code
      cy.visit(`${apiBaseUrl}/v1/auth/callback?code=invalid&state=invalid`);

      // Verify error message is displayed
      cy.contains(/authentication failed/i).should('be.visible');
    });
  });

  describe('FE-006: Loading State', () => {
    it('should show loading state during login', () => {
      cy.visit('/');

      // Intercept and delay the login redirect
      cy.intercept('GET', `${apiBaseUrl}/v1/auth/login`, (req) => {
        req.reply((res) => {
          res.delay = 1000;
          res.send();
        });
      });

      cy.contains('button', /login/i).click();

      // Verify loading state (if implemented)
      // This depends on your UI implementation
      cy.contains('button', /login/i).should('be.disabled');
    });

    it('should show loading state during logout', () => {
      // Set up authenticated state
      cy.setCookie('session_id', 'mock-session-id-12345');
      cy.intercept('GET', `${apiBaseUrl}/v1/me`, {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Test User',
          email: 'test@fromabyss.media',
        },
      });

      cy.visit('/');

      // Intercept and delay the logout call
      cy.intercept('POST', `${apiBaseUrl}/v1/auth/logout`, (req) => {
        req.reply((res) => {
          res.delay = 1000;
          res.send({ statusCode: 200 });
        });
      });

      cy.contains('button', /logout/i).click();

      // Verify loading state
      cy.contains('button', /logout/i).should('be.disabled');
    });
  });

  describe('FE-007: Session Persistence', () => {
    it('should persist session after page reload', () => {
      // Set up authenticated state
      cy.setCookie('session_id', 'mock-session-id-12345');
      cy.intercept('GET', `${apiBaseUrl}/v1/me`, {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Test User',
          email: 'test@fromabyss.media',
          email_verified: true,
        },
      }).as('getMe');

      cy.visit('/');
      cy.wait('@getMe');

      // Verify user is logged in
      cy.contains('Test User').should('be.visible');

      // Reload the page
      cy.reload();

      // Wait for the /v1/me call again
      cy.wait('@getMe');

      // Verify user is still logged in
      cy.contains('Test User').should('be.visible');
    });
  });
});
