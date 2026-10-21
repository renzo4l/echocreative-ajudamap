export const ADMIN_HOSTNAME =
  'echocreative-ajudamap-git-v0-admin-portal-echocreative.vercel.app';

export const PUBLIC_SITE_URL = 'https://echocreative-ajudamap.vercel.app';

export function isAdminHostname(hostname: string) {
  return hostname.toLowerCase() === ADMIN_HOSTNAME;
}
