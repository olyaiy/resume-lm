'use client'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowDownAZ, ArrowUpAZ, Calendar } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export type SortOption = 'name' | 'jobTitle' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'

const sortOptions = [
  { value: 'name', label: 'Name', icon: ArrowDownAZ },
  { value: 'jobTitle', label: 'Job Title', icon: ArrowDownAZ },
  { value: 'updatedAt', label: 'Last Updated', icon: Calendar },
]

export function ResumeSortControls() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentSort = searchParams.get('sort') as SortOption || 'updatedAt'
  const direction = searchParams.get('direction') as SortDirection || 'desc'

  function handleSortChange(sort: SortOption) {
    const params = new URLSearchParams(searchParams)
    params.set('sort', sort)
    if (sort !== currentSort) {
      params.set('direction', 'asc')
    }
    router.push(`?${params.toString()}`)
  }

  function toggleDirection() {
    const params = new URLSearchParams(searchParams)
    params.set('direction', direction === 'asc' ? 'desc' : 'asc')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <span>Sort by {sortOptions.find(opt => opt.value === currentSort)?.label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value as SortOption)}
            >
              <option.icon className="mr-2 h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        variant="outline"
        size="icon"
        onClick={toggleDirection}
      >
        {direction === 'asc' ? <ArrowUpAZ /> : <ArrowDownAZ />}
      </Button>
    </div>
  )
} 