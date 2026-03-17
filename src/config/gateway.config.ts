/**
 * Gateway configuration for external services.
 * Configure via USERS_SERVICE_URL and USERS_SERVICE_TIMEOUT env vars.
 */
export const serviceConfig = {
  users: {
    url: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
    timeout: parseInt(process.env.USERS_SERVICE_TIMEOUT || '5000', 10),
  },
};
