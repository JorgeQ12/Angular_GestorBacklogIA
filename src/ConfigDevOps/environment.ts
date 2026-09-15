/** Conecta con Kong y el backend ejecutado directamente. */
export const environment = {
  production: false,
  kongUrl: '#{kongUrl}',
  apiBaseUrl: '#{apiBaseUrl}',
} as const;
