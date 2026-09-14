/** Configuración de producción servida por Nginx dentro del contenedor. */
export const environment = {
  production: true,
  kongUrl: 'https://konge-dev.interrapidisimo.co',
  // Nginx reenvía /api al backend; evita localhost e IPs fijas en el bundle.
  apiBaseUrl: '/api',
} as const;
