const DEFAULT_SITE_URL = "https://iglesiacjc.com";

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
}

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL
);
