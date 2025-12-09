export default function EditSubjectLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="h-4 w-96 bg-gray-200 rounded mt-2"></div>
      </div>

      {/* Form skeleton */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>

        {/* Form fields skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-3 w-64 bg-gray-200 rounded"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-3 w-80 bg-gray-200 rounded"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-3 w-48 bg-gray-200 rounded"></div>
        </div>

        {/* Buttons skeleton */}
        <div className="flex gap-3 pt-4">
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}
