/** Configuración de producción servida por Nginx dentro del contenedor. */
export const environment = {
  production: true,
  kongUrl: 'https://konge-dev.interrapidisimo.co',
  apiBaseUrl: '/api',
} as const;
