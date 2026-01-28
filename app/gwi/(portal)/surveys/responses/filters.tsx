"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useCallback, useTransition } from "react"

interface ResponseFiltersProps {
  surveys?: Array<{ id: string; name: string }>
}

export function ResponseFilters({ surveys = [] }: ResponseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('gwi.surveys.responses')
  const [isPending, startTransition] = useTransition()

  const handleSurveyChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("surveyId")
    } else {
      params.set("surveyId", value)
    }
    startTransition(() => {
      router.push(`/gwi/surveys/responses?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleStatusChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    startTransition(() => {
      router.push(`/gwi/surveys/responses?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    const value = e.target.value
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    startTransition(() => {
      router.push(`/gwi/surveys/responses?${params.toString()}`)
    })
  }, [router, searchParams])

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          className="pl-9"
          defaultValue={searchParams.get("search") || ""}
          onChange={handleSearchChange}
          disabled={isPending}
        />
      </div>
      <Select 
        defaultValue={searchParams.get("surveyId") || "all"}
        onValueChange={handleSurveyChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder={t('filterBySurvey')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allSurveys')}</SelectItem>
          {surveys.map((survey) => (
            <SelectItem key={survey.id} value={survey.id}>
              {survey.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select 
        defaultValue={searchParams.get("status") || "all"}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('filterByStatus')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allStatuses')}</SelectItem>
          <SelectItem value="completed">{t('completed')}</SelectItem>
          <SelectItem value="incomplete">{t('incomplete')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
