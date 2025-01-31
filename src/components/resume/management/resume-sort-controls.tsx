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

export type SortOption = 'name' | 'jobTitle' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

const sortOptions = [
  { value: 'name', label: 'Name', icon: ArrowDownAZ },
  { value: 'jobTitle', label: 'Job Title', icon: ArrowDownAZ },
  { value: 'createdAt', label: 'Creation Date', icon: Calendar },
]

interface ResumeSortControlsProps {
  sortParam?: string;
  directionParam?: string;
  currentSort?: SortOption;
  currentDirection?: SortDirection;
}

export function ResumeSortControls({ 
  sortParam = 'sort',
  directionParam = 'direction',
  currentSort: propCurrentSort,
  currentDirection: propCurrentDirection
}: ResumeSortControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentSort = propCurrentSort || (searchParams.get(sortParam) as SortOption) || 'createdAt'
  const direction = propCurrentDirection || (searchParams.get(directionParam) as SortDirection) || 'desc'

  function handleSortChange(sort: SortOption) {
    const params = new URLSearchParams(searchParams)
    params.set(sortParam, sort)
    if (sort !== currentSort) {
      params.set(directionParam, 'asc')
    }
    router.push(`?${params.toString()}`)
  }

  function toggleDirection() {
    const params = new URLSearchParams(searchParams)
    params.set(directionParam, direction === 'asc' ? 'desc' : 'asc')
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