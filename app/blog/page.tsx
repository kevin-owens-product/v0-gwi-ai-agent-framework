import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"></div>
      </main>

      <Footer />
    </div>
  )
}
