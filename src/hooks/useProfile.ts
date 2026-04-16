import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { profileService } from '@/services/profileService'
import { useAuthStore } from '@/store/authStore'

export function useUpdateProfile() {
  const setProfile = useAuthStore((s) => s.setProfile)

  return useMutation({
    mutationFn: ({
      userId,
      full_name,
    }: {
      userId: string
      full_name: string
    }) => profileService.updateProfile(userId, { full_name }),
    onSuccess: (profile) => {
      setProfile(profile)
      toast.success('Perfil actualizado')
    },
    onError: (e: Error) => toast.error(e.message ?? 'Error al actualizar perfil'),
  })
}

export function useUploadAvatar() {
  const setProfile = useAuthStore((s) => s.setProfile)

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      profileService.uploadAvatar(userId, file),
    onSuccess: (profile) => {
      setProfile(profile)
      toast.success('Avatar actualizado')
    },
    onError: (e: Error) => toast.error(e.message ?? 'Error al subir avatar'),
  })
}

export function useRemoveAvatar() {
  const setProfile = useAuthStore((s) => s.setProfile)

  return useMutation({
    mutationFn: (userId: string) => profileService.removeAvatar(userId),
    onSuccess: (profile) => {
      setProfile(profile)
      toast.success('Avatar eliminado')
    },
    onError: (e: Error) => toast.error(e.message ?? 'Error al eliminar avatar'),
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) =>
      profileService.updatePassword(newPassword),
    onSuccess: () => toast.success('Contraseña actualizada'),
    onError: (e: Error) =>
      toast.error(e.message ?? 'Error al actualizar contraseña'),
  })
}
