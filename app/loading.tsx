import { Loader2 } from 'lucide-react'

export default function GlobalLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-primary)] sm:bg-transparent">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500" />
    </div>
  )
}
