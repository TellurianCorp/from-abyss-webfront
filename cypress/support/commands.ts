/// <reference types="cypress" />

// Custom command to login a user
Cypress.Commands.add('login', (user = {}) => {
  const defaultUser = {
    id: 1,
    lifeauth_sub: 'test-user-sub-123',
    name: 'Test User',
    email: 'test@fromabyss.media',
    email_verified: true,
    picture: 'https://example.com/avatar.jpg',
    created_at: '2025-11-24T00:00:00Z',
    updated_at: '2025-11-24T00:00:00Z',
    ...user,
  };

  const apiBaseUrl = Cypress.env('apiBaseUrl');

  // Set session cookie
  cy.setCookie('session_id', 'mock-session-id-12345', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  // Intercept /v1/me to return the user
  cy.intercept('GET', `${apiBaseUrl}/v1/me`, {
    statusCode: 200,
    body: defaultUser,
  }).as('getMe');
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  const apiBaseUrl = Cypress.env('apiBaseUrl');

  cy.intercept('POST', `${apiBaseUrl}/v1/auth/logout`, {
    statusCode: 200,
    body: { message: 'Logged out successfully' },
  }).as('logout');

  cy.clearCookies();
  cy.clearLocalStorage();
});

// Extend Cypress namespace for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login()
       * @example cy.login({ name: 'Custom User', email: 'custom@example.com' })
       */
      login(user?: Partial<{
        id: number;
        lifeauth_sub: string;
        name: string;
        email: string;
        email_verified: boolean;
        picture?: string;
        created_at: string;
        updated_at: string;
      }>): Chainable<void>;

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;
    }
  }
}

export {};
