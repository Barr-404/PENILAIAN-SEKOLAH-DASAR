import SubjectForm from '@/components/subjects/subject-form'

export default function NewSubjectPage() {
  return (
    <div className="space-y-6">
      {/* Professional gradient header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Tambah Mata Pelajaran</h1>
          </div>
          <p className="text-blue-100 text-sm ml-14">
            Buat mata pelajaran baru untuk semester ini
          </p>
        </div>
      </div>

      {/* Form with professional card styling */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <SubjectForm />
      </div>
    </div>
  )
}