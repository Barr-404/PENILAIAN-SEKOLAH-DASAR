'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter, X, ArrowUpDown, Search } from 'lucide-react'

export interface StudentData {
  id: string
  name: string
  nis?: string
  className?: string
  subjectId?: string
  subjectName?: string
  averageGrade?: number
  finalScore?: number
  ranking?: number
}

export interface FilterOptions {
  searchQuery: string
  selectedClass: string
  minGrade: string
  maxGrade: string
  sortBy: 'name-asc' | 'name-desc' | 'grade-desc' | 'grade-asc' | 'ranking-asc'
}

interface StudentFiltersProps {
  students: StudentData[]
  onFilterChange: (filtered: StudentData[]) => void
  availableClasses?: string[]
  availableSubjects?: Array<{ id: string; name: string }>
}

export default function StudentFilters({
  students,
  onFilterChange,
  availableClasses = [],
  availableSubjects = []
}: StudentFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    selectedClass: 'all',
    minGrade: '',
    maxGrade: '',
    sortBy: 'name-asc'
  })

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Apply filters and sorting
  const applyFilters = (newFilters: FilterOptions) => {
    let filtered = [...students]

    // Filter by search query (name or NIS)
    if (newFilters.searchQuery) {
      const query = newFilters.searchQuery.toLowerCase()
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(query) ||
        (student.nis && student.nis.includes(query))
      )
    }

    // Filter by class
    if (newFilters.selectedClass !== 'all') {
      filtered = filtered.filter(student => student.className === newFilters.selectedClass)
    }

    // Filter by grade range
    if (newFilters.minGrade) {
      const min = parseFloat(newFilters.minGrade)
      filtered = filtered.filter(student => (student.finalScore || student.averageGrade || 0) >= min)
    }
    if (newFilters.maxGrade) {
      const max = parseFloat(newFilters.maxGrade)
      filtered = filtered.filter(student => (student.finalScore || student.averageGrade || 0) <= max)
    }

    // Sorting
    switch (newFilters.sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'grade-desc':
        filtered.sort((a, b) => (b.finalScore || b.averageGrade || 0) - (a.finalScore || a.averageGrade || 0))
        break
      case 'grade-asc':
        filtered.sort((a, b) => (a.finalScore || a.averageGrade || 0) - (b.finalScore || b.averageGrade || 0))
        break
      case 'ranking-asc':
        filtered.sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
        break
    }

    onFilterChange(filtered)
  }

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      searchQuery: '',
      selectedClass: 'all',
      minGrade: '',
      maxGrade: '',
      sortBy: 'name-asc'
    }
    setFilters(defaultFilters)
    applyFilters(defaultFilters)
  }

  const hasActiveFilters = 
    filters.searchQuery || 
    filters.selectedClass !== 'all' || 
    filters.minGrade ||
    filters.maxGrade

  return (
    <div className="space-y-4">
      {/* Search Bar & Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nama siswa..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="w-full sm:w-[200px]">
          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value as any)}>
            <SelectTrigger>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nama A → Z</SelectItem>
              <SelectItem value="name-desc">Nama Z → A</SelectItem>
              <SelectItem value="grade-desc">Nilai Tertinggi</SelectItem>
              <SelectItem value="grade-asc">Nilai Terendah</SelectItem>
              <SelectItem value="ranking-asc">Ranking Terbaik</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant={isFilterOpen ? "default" : "outline"}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full sm:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter {hasActiveFilters && `(${[filters.selectedClass !== 'all', filters.minGrade, filters.maxGrade].filter(Boolean).length})`}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {isFilterOpen && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filter Lanjutan</CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Reset Filter
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Filter Rentang Nilai */}
              <div className="space-y-2">
                <Label>Nilai Minimum</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={filters.minGrade}
                  onChange={(e) => handleFilterChange('minGrade', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Nilai Maksimum</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={filters.maxGrade}
                  onChange={(e) => handleFilterChange('maxGrade', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
