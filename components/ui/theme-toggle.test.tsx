/**
 * Theme Toggle Component Tests
 *
 * @prompt-id forge-v4.1:feature:dark-mode:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ThemeToggle, ThemeToggleSimple, themeOptions } from "./theme-toggle"

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({
    theme: "system",
    setTheme: vi.fn(),
    resolvedTheme: "dark",
    systemTheme: "dark",
    themes: ["light", "dark", "system"],
  })),
}))

// Mock the theme provider
vi.mock("@/components/providers/theme-provider", () => ({
  useTheme: vi.fn(() => ({
    theme: "system",
    setTheme: vi.fn(),
    resolvedTheme: "dark",
    systemTheme: "dark",
    themes: ["light", "dark", "system"],
  })),
}))

import { useTheme } from "@/components/providers/theme-provider"

describe("ThemeToggle", () => {
  const mockSetTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "system",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
      systemTheme: "dark",
      themes: ["light", "dark", "system"],
    })
  })

  it("renders the toggle button", () => {
    render(<ThemeToggle />)

    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
  })

  it("renders screen reader text", () => {
    render(<ThemeToggle />)

    expect(screen.getByText("Toggle theme")).toBeInTheDocument()
  })

  it("shows label when showLabel is true", async () => {
    ;(useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
      systemTheme: "dark",
      themes: ["light", "dark", "system"],
    })

    render(<ThemeToggle showLabel />)

    // Wait for mounting
    await waitFor(() => {
      expect(screen.getByText("Dark")).toBeInTheDocument()
    })
  })

  it("opens dropdown menu on click", async () => {
    render(<ThemeToggle />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText("Light")).toBeInTheDocument()
      expect(screen.getByText("Dark")).toBeInTheDocument()
      expect(screen.getByText("System")).toBeInTheDocument()
    })
  })

  it("calls setTheme when selecting a theme", async () => {
    render(<ThemeToggle />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    await waitFor(() => {
      const lightOption = screen.getByText("Light")
      fireEvent.click(lightOption)
    })

    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })

  it("calls onThemeChange callback when provided", async () => {
    const onThemeChange = vi.fn()
    render(<ThemeToggle onThemeChange={onThemeChange} />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    await waitFor(() => {
      const darkOption = screen.getByText("Dark")
      fireEvent.click(darkOption)
    })

    expect(onThemeChange).toHaveBeenCalledWith("dark")
  })

  it("applies custom className", () => {
    render(<ThemeToggle className="custom-class" />)

    const button = screen.getByRole("button")
    expect(button).toHaveClass("custom-class")
  })

  it("applies size variant", () => {
    render(<ThemeToggle size="lg" />)

    const button = screen.getByRole("button")
    expect(button).toHaveClass("h-10")
  })

  it("applies variant styles", () => {
    render(<ThemeToggle variant="outline" />)

    const button = screen.getByRole("button")
    expect(button).toHaveClass("border")
  })
})

describe("ThemeToggleSimple", () => {
  const mockSetTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
      systemTheme: "light",
      themes: ["light", "dark", "system"],
    })
  })

  it("renders the toggle button", () => {
    render(<ThemeToggleSimple />)

    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
  })

  it("cycles through themes on click", async () => {
    render(<ThemeToggleSimple />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    // light -> dark
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })

  it("cycles from dark to system", async () => {
    ;(useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
      systemTheme: "dark",
      themes: ["light", "dark", "system"],
    })

    render(<ThemeToggleSimple />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    // dark -> system
    expect(mockSetTheme).toHaveBeenCalledWith("system")
  })

  it("cycles from system back to light", async () => {
    ;(useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "system",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
      systemTheme: "dark",
      themes: ["light", "dark", "system"],
    })

    render(<ThemeToggleSimple />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    // system -> light
    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })
})

describe("themeOptions", () => {
  it("contains all three theme options", () => {
    expect(themeOptions).toHaveLength(3)
    expect(themeOptions.map((o) => o.value)).toEqual(["light", "dark", "system"])
  })

  it("has labels for each option", () => {
    expect(themeOptions.map((o) => o.label)).toEqual(["Light", "Dark", "System"])
  })

  it("has descriptions for each option", () => {
    themeOptions.forEach((option) => {
      expect(option.description).toBeTruthy()
    })
  })

  it("has icons for each option", () => {
    themeOptions.forEach((option) => {
      expect(option.icon).toBeTruthy()
    })
  })
})
