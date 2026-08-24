/** Conecta el desarrollo local con Kong y el backend ejecutado directamente. */
export const environment = {
  production: false,
  kongUrl: 'https://konge-dev.interrapidisimo.co',
  apiBaseUrl: 'http://172.21.232.114:8081/api',
} as const;
