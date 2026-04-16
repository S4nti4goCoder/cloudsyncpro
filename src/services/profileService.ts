import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/authTypes'

const AVATAR_BUCKET = 'avatars'
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2 MB

export const profileService = {
  /**
   * Update profile fields (full_name)
   */
  async updateProfile(
    userId: string,
    input: { full_name: string }
  ): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: input.full_name })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as UserProfile
  },

  /**
   * Upload avatar to Supabase Storage and update profile.avatar_url
   */
  async uploadAvatar(userId: string, file: File): Promise<UserProfile> {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      throw new Error('Formato no soportado. Usá JPG, PNG, WebP o GIF.')
    }
    if (file.size > MAX_AVATAR_SIZE) {
      throw new Error('La imagen supera los 2 MB.')
    }

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png'
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)

    const avatarUrl = `${publicUrl}?t=${Date.now()}`

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as UserProfile
  },

  /**
   * Remove avatar from storage and clear profile.avatar_url
   */
  async removeAvatar(userId: string): Promise<UserProfile> {
    const { data: existing } = await supabase.storage
      .from(AVATAR_BUCKET)
      .list(userId)

    if (existing && existing.length > 0) {
      const paths = existing.map((f) => `${userId}/${f.name}`)
      await supabase.storage.from(AVATAR_BUCKET).remove(paths)
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as UserProfile
  },

  /**
   * Update account password via Supabase Auth
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  },

  /**
   * Permanently delete the current account via Edge Function.
   * Requires the user to confirm by providing their own email.
   */
  async deleteAccount(confirmEmail: string): Promise<void> {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) throw new Error('No hay sesión activa')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ confirmEmail }),
      }
    )

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      throw new Error(data.error ?? 'Error al eliminar cuenta')
    }

    await supabase.auth.signOut()
  },
}
