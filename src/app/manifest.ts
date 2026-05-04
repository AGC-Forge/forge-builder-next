import type { MetadataRoute } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({
    locale: routing.defaultLocale,
    namespace: 'Manifest'
  });

  return {
    name: t('name'),
    start_url: '/',
    theme_color: '#101E33',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32 48x48 128x128',
        type: 'image/x-icon',
      }
    ]
  };
}