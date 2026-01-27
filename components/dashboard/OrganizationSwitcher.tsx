'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, ChevronsUpDown, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useOrganizationContext } from '@/components/providers/organization-provider'
import { FeatureBadge } from '@/components/features/FeatureBadge'

export function OrganizationSwitcher() {
  const { organization, organizations, setCurrentOrganization } = useOrganizationContext()
  const [open, setOpen] = useState(false)
  const t = useTranslations('dashboard.organizationSwitcher')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={t('selectOrganization')}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{organization.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder={t('searchPlaceholder')} />
          <CommandEmpty>{t('noOrganizationFound')}</CommandEmpty>
          <CommandGroup>
            {organizations.map((org) => (
              <CommandItem
                key={org.id}
                value={org.name}
                onSelect={() => {
                  setCurrentOrganization(org.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    organization.id === org.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex items-center justify-between flex-1">
                  <span className="truncate">{org.name}</span>
                  <FeatureBadge tier={org.planTier} showIcon={false} />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
