import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/auth/signup',
        destination: '/auth/register',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? '___ORG_SLUG___',
  project: process.env.SENTRY_PROJECT ?? '___PROJECT_SLUG___',

  authToken: process.env.SENTRY_AUTH_TOKEN,
  //Sem true: alguns erros aparecem como código minificado, arquivos genéricos ou linhas estranhas
  widenClientFileUpload: true,
  // Proxy route to bypass ad-blockers
  tunnelRoute: '/monitoring',

  silent: !process.env.CI,
});
