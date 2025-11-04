'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient as createClientClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClientClient()
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [edad, setEdad] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error, status } = await supabase
        .from('perfil')
        .select(`nombre, username, edad, avatar_url`)
        .eq('id', user?.id)
        .single()
      if (error && status !== 406) {
        console.log(error)
        throw error
      }
      if (data) {
        setNombre(data.nombre)
        setUsername(data.username)
        setEdad(data.edad)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      alert('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  async function updateProfile({
    nombre,
    edad,
    avatar_url,
  }: {
    username: string | null
    nombre: string | null
    edad: string | null
    avatar_url: string | null
  }) {
    try {
      setLoading(true)
      const { error } = await supabase.from('perfil').upsert({
        id: user?.id as string,
        nombre: nombre,
        username,
        edad,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      alert('Error updating the data!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-widget p-8">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={user?.email} disabled className="input" />
      </div>
      <div>
        <label htmlFor="fullName">Nombre</label>
        <input id="fullName" type="text" value={nombre || ''} onChange={(e) => setNombre(e.target.value)} className="input" />
      </div>
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" value={username || ''} onChange={(e) => setUsername(e.target.value)} className="input" />
      </div>
      <div>
        <label htmlFor="website">Website</label>
        <input id="website" type="url" value={edad || ''} onChange={(e) => setEdad(e.target.value)} className="input" />
      </div>
      <div className="mt-4">
        <button className="button primary" onClick={() => updateProfile({ nombre, username, edad, avatar_url })} disabled={loading}>
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>
      <div className="mt-4">
        <form action="/auth/signout" method="post">
          <button className="button" type="submit">Sign out</button>
        </form>
      </div>
    </div>
  )
}
