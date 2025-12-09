import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProfilePage from '@/components/profile/profile-page'

import { Suspense } from 'react'

export const metadata = {
  title: 'Profil Guru - Sekolah App',
  description: 'Kelola profil dan data mengajar Anda'
}

export default async function Profile() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Memuat profil...</p>
        </div>
      </div>
    }>
      <ProfilePage />
    </Suspense>
  )
}
