export const formatCurrency = (
  price: number | string,
  currencyCode?: string,
  locale: string = "en-US",
) => {
  const code = (currencyCode || "GHS").toUpperCase()
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
  }).format(Number(price))
}
