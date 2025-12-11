import { redirect } from "next/navigation"

export default async function AccessoriesRedirect(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  // Redirect to the canonical, locale-aware category route
  redirect(`/${params.locale}/categories/accessories`)
}
