import { redirect } from 'next/navigation'
import { BRAND } from '@/lib/brand'

export default function BookPage() {
  redirect(BRAND.filloutUrl)
}
