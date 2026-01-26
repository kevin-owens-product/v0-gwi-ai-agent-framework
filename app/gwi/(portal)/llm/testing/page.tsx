"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Play, Loader2, Copy, RotateCcw, Sparkles } from "lucide-react"

export default function LLMTestingPage() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState("gpt-4")
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([1024])

  const handleTest = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/gwi/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          temperature: temperature[0],
          maxTokens: maxTokens[0],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResponse(data.response)
      } else {
        setResponse("Error: Failed to get response from LLM")
      }
    } catch (error) {
      setResponse("Error: Failed to connect to API")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(response)
  }

  const handleClear = () => {
    setPrompt("")
    setResponse("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gwi/llm">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompt Playground</h1>
          <p className="text-muted-foreground">
            Test and experiment with LLM prompts
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Adjust model parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Temperature</Label>
                <span className="text-sm text-muted-foreground">
                  {temperature[0]}
                </span>
              </div>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                min={0}
                max={2}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Higher values make output more random
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Max Tokens</Label>
                <span className="text-sm text-muted-foreground">
                  {maxTokens[0]}
                </span>
              </div>
              <Slider
                value={maxTokens}
                onValueChange={setMaxTokens}
                min={256}
                max={4096}
                step={256}
              />
              <p className="text-xs text-muted-foreground">
                Maximum length of the response
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Prompt and Response */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt Input */}
          <Card>
            <CardHeader>
              <CardTitle>Prompt</CardTitle>
              <CardDescription>Enter your prompt to test</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="min-h-[200px] font-mono"
              />
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={handleTest}
                  disabled={isLoading || !prompt.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Response Output */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Response</CardTitle>
                <CardDescription>LLM output will appear here</CardDescription>
              </div>
              {response && (
                <Button variant="outline" size="sm" onClick={handleCopyResponse}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {response ? (
                <div className="p-4 bg-slate-50 rounded-lg min-h-[200px] whitespace-pre-wrap font-mono text-sm">
                  {response}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                  <p>Run a test to see the response</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
