import SubjectForm from '@/components/subjects/subject-form'

export default function NewSubjectPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Tambah Mata Pelajaran Baru
        </h1>
        <p className="text-gray-600 mt-2">
          Buat mata pelajaran baru untuk mulai mengelola nilai siswa
        </p>
      </div>

      <SubjectForm />
    </div>
  )
}