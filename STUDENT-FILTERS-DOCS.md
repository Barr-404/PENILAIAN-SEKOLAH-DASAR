# Student Filters Component - Documentation

## 📦 Komponen yang Dibuat

### 1. `StudentFilters` - Main Filter Component
**File:** `src/components/students/student-filters.tsx`

Komponen filter & sorting yang reusable untuk data siswa.

### 2. `StudentsListExample` - Example Implementation
**File:** `src/components/students/students-list-example.tsx`

Contoh implementasi lengkap dengan UI cards.

---

## 🎯 Fitur Lengkap

### ✅ FILTERING
- **Search**: Cari berdasarkan nama atau NIS siswa
- **Filter Kelas**: Pilih kelas tertentu (4A, 4B, dll)
- **Filter Mata Pelajaran**: Pilih mapel spesifik
- **Filter Rentang Nilai**: Set nilai minimum dan maksimum (0-100)

### ✅ SORTING
- **Nama A → Z**: Urut nama ascending
- **Nama Z → A**: Urut nama descending
- **Nilai Tertinggi**: Urut dari nilai terbesar ke terkecil
- **Nilai Terendah**: Urut dari nilai terkecil ke terbesar
- **Ranking Terbaik**: Urut berdasarkan ranking (1, 2, 3, dst)

### ✅ UI Features
- Search bar dengan icon
- Dropdown sorting
- Collapsible advanced filters
- Active filter counter badge
- Reset filter button
- Responsive design (mobile & desktop)
- Modern styling dengan Tailwind CSS

---

## 🚀 Cara Install Dependencies

Pastikan Anda sudah install semua komponen shadcn/ui yang dibutuhkan:

```bash
# Install semua komponen yang diperlukan
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
```

---

## 💻 Cara Menggunakan

### Basic Usage

```tsx
import StudentFilters, { StudentData } from '@/components/students/student-filters'

const MyPage = () => {
  const [students, setStudents] = useState<StudentData[]>([...]) // Your data
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>(students)

  return (
    <div>
      <StudentFilters
        students={students}
        onFilterChange={setFilteredStudents}
        availableClasses={['4A', '4B', '4C']}
        availableSubjects={[
          { id: '1', name: 'Matematika' },
          { id: '2', name: 'IPA' }
        ]}
      />
      
      {/* Display filtered students */}
      {filteredStudents.map(student => (
        <div key={student.id}>{student.name}</div>
      ))}
    </div>
  )
}
```

### Advanced Usage with Table

```tsx
import StudentFilters, { StudentData } from '@/components/students/student-filters'

export default function StudentsPage() {
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Data Siswa</h1>
      
      {/* Filter Component */}
      <StudentFilters
        students={allStudents}
        onFilterChange={setFilteredStudents}
        availableClasses={['4A', '4B', '5A', '5B', '6A']}
        availableSubjects={subjects}
      />

      {/* Display Results Count */}
      <p className="text-sm text-gray-600">
        Menampilkan {filteredStudents.length} siswa
      </p>

      {/* Your Table or Cards */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kelas</th>
              <th>Nilai</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.className}</td>
                <td>{student.finalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## 📋 Interface & Types

### StudentData Interface

```typescript
interface StudentData {
  id: string                    // Required: Unique ID
  name: string                  // Required: Nama siswa
  nis?: string                  // Optional: NIS siswa
  className?: string            // Optional: Kelas (4A, 4B, dll)
  subjectId?: string            // Optional: ID mata pelajaran
  subjectName?: string          // Optional: Nama mata pelajaran
  averageGrade?: number         // Optional: Rata-rata nilai
  finalScore?: number           // Optional: Nilai akhir
  ranking?: number              // Optional: Ranking siswa
}
```

### FilterOptions Interface

```typescript
interface FilterOptions {
  searchQuery: string           // Search text
  selectedClass: string         // Class filter ('all' or className)
  selectedSubject: string       // Subject filter ('all' or subjectId)
  minGrade: string              // Minimum grade (0-100)
  maxGrade: string              // Maximum grade (0-100)
  sortBy: 'name-asc' | 'name-desc' | 'grade-desc' | 'grade-asc' | 'ranking-asc'
}
```

### Component Props

```typescript
interface StudentFiltersProps {
  students: StudentData[]                               // Array data siswa
  onFilterChange: (filtered: StudentData[]) => void     // Callback hasil filter
  availableClasses?: string[]                           // Daftar kelas
  availableSubjects?: Array<{ id: string; name: string }> // Daftar mapel
}
```

---

## 🎨 Customization

### Mengubah Styling

Komponen menggunakan Tailwind CSS. Anda bisa customize dengan:

```tsx
// Ubah warna primary button
<Button className="bg-purple-600 hover:bg-purple-700">
  Filter
</Button>

// Ubah styling card
<Card className="border-2 border-blue-500 shadow-xl">
  ...
</Card>
```

### Menambah Filter Custom

Edit file `student-filters.tsx`:

```tsx
// Tambahkan di state filters
const [filters, setFilters] = useState({
  ...existingFilters,
  customFilter: '' // Filter baru Anda
})

// Tambahkan logika di applyFilters
if (newFilters.customFilter) {
  filtered = filtered.filter(student => 
    // Custom logic Anda
  )
}

// Tambahkan UI di render
<div className="space-y-2">
  <Label>Filter Custom</Label>
  <Input
    value={filters.customFilter}
    onChange={(e) => handleFilterChange('customFilter', e.target.value)}
  />
</div>
```

---

## 📊 Contoh Data

```typescript
const sampleStudents: StudentData[] = [
  {
    id: '1',
    name: 'Ahmad Fauzi',
    nis: '2001',
    className: '4A',
    subjectId: 'mtk-001',
    subjectName: 'Matematika',
    finalScore: 92,
    averageGrade: 92,
    ranking: 1
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    nis: '2002',
    className: '4A',
    subjectId: 'ipa-001',
    subjectName: 'IPA',
    finalScore: 88,
    averageGrade: 88,
    ranking: 3
  }
]
```

---

## 🔍 Testing Filter Results

Contoh hasil filtering:

### 1. Search "ahmad" → Returns: [Ahmad Fauzi]
### 2. Filter Kelas "4A" → Returns: Semua siswa kelas 4A
### 3. Filter Nilai 80-95 → Returns: Siswa dengan nilai 80-95
### 4. Sort "Nilai Tertinggi" → Returns: Urut dari nilai terbesar
### 5. Kombinasi: Kelas 4A + Nilai >90 + Sort Nama A-Z

---

## 🎯 Production Tips

### 1. **Performance Optimization**
```tsx
// Gunakan useMemo untuk expensive calculations
const filteredData = useMemo(() => {
  return applyComplexFilters(students)
}, [students, filters])
```

### 2. **Persist Filter State**
```tsx
// Simpan filter state ke localStorage
useEffect(() => {
  localStorage.setItem('studentFilters', JSON.stringify(filters))
}, [filters])
```

### 3. **URL Query Params**
```tsx
// Sync filters dengan URL
const router = useRouter()
const searchParams = useSearchParams()

// Update URL saat filter berubah
router.push(`?class=${selectedClass}&sort=${sortBy}`)
```

### 4. **Debounce Search**
```tsx
// Gunakan debounce untuk search input
import { debounce } from 'lodash'

const debouncedSearch = debounce((query) => {
  handleFilterChange('searchQuery', query)
}, 300)
```

---

## ✅ Checklist Implementation

- [x] Install semua shadcn/ui components
- [x] Copy `student-filters.tsx` ke project
- [x] Import komponen di halaman Anda
- [x] Siapkan data students dengan interface StudentData
- [x] Siapkan availableClasses & availableSubjects
- [x] Implement onFilterChange callback
- [x] Test semua filter & sorting
- [x] Customize styling sesuai brand
- [x] Add loading states (optional)
- [x] Add error handling (optional)

---

## 🐛 Common Issues & Solutions

### Issue: Filter tidak bekerja
**Solution:** Pastikan data students mengikuti interface StudentData dengan benar

### Issue: Sort tidak akurat
**Solution:** Cek apakah field `finalScore` atau `averageGrade` berisi number, bukan string

### Issue: UI tidak responsive
**Solution:** Tambahkan class Tailwind responsive (`sm:`, `md:`, `lg:`)

---

## 📞 Support

Jika ada pertanyaan atau butuh customization lebih lanjut, silakan hubungi tim development.

---

**🎉 Selamat! Komponen filter & sorting Anda siap digunakan!**
