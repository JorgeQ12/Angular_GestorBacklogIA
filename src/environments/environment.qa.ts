/** Conecta el desarrollo local con Kong y el backend ejecutado directamente. */
export const environment = {
  production: false,
  kongUrl: 'https://konge-dev.interrapidisimo.co',
  apiBaseUrl: 'https://localhost:44329/api',
} as const;
