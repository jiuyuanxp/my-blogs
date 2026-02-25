import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(({ locale }) => ({
  messages: (await import(`@/messages/${locale}.json`)).default,
}));
