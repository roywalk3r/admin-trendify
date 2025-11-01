import { redirect } from "next/navigation"

export default function AccessoriesRedirect({ params }: { params: { locale: string } }) {
  // Redirect to the canonical, locale-aware category route
  redirect(`/${params.locale}/categories/accessories`)
}
