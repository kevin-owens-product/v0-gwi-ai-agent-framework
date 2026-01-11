"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">G</span>
              </div>
              <span className="text-lg font-semibold text-foreground">GWI Insights</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Solutions
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/solutions/sales" className="w-full">
                      Sales Teams
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/solutions/insights" className="w-full">
                      Insights Teams
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/solutions/ad-sales" className="w-full">
                      Ad Sales
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/solutions/marketing" className="w-full">
                      Marketing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/solutions/product" className="w-full">
                      Product Development
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/solutions/market-research" className="w-full">
                      Market Research
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/solutions/innovation" className="w-full">
                      Innovation
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/#agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Agents
              </Link>
              <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Solutions</span>
              <Link href="/solutions/sales" className="pl-4 text-sm text-muted-foreground hover:text-foreground">
                Sales Teams
              </Link>
              <Link href="/solutions/insights" className="pl-4 text-sm text-muted-foreground hover:text-foreground">
                Insights Teams
              </Link>
              <Link href="/solutions/ad-sales" className="pl-4 text-sm text-muted-foreground hover:text-foreground">
                Ad Sales
              </Link>
              <Link href="/solutions/marketing" className="pl-4 text-sm text-muted-foreground hover:text-foreground">
                Marketing
              </Link>
              <Link href="/solutions/product" className="pl-4 text-sm text-muted-foreground hover:text-foreground">
                Product Development
              </Link>
              <Link
                href="/solutions/market-research"
                className="pl-4 text-sm text-muted-foreground hover:text-foreground"
              >
                Market Research
              </Link>
              <Link href="/solutions/innovation" className="pl-4 text-sm text-muted-foreground hover:text-foreground">
                Innovation
              </Link>
            </div>
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="/#agents" className="text-sm text-muted-foreground hover:text-foreground">
              Agents
            </Link>
            <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">
              Docs
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export { LandingHeader as Header }
