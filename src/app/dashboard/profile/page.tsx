import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProfilePage from '@/components/profile/profile-page'

export const metadata = {
  title: 'Profil Guru - Sekolah App',
  description: 'Kelola profil dan data mengajar Anda'
}

export default async function Profile() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return <ProfilePage />
}
