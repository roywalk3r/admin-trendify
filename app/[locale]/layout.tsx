import { locales, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { I18nProvider } from "@/lib/i18n/I18nProvider"
import AppShell from "@/components/app-shell"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout(
  props: {
    children: React.ReactNode
    params: Promise<{ locale: Locale }>
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const dict = await getDictionary(params.locale)
  return (
    <I18nProvider dict={dict}>
      <AppShell>{children}</AppShell>
    </I18nProvider>
  )
}
