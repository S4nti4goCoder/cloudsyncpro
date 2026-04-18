export type FolderColor =
  | 'blue'
  | 'red'
  | 'orange'
  | 'amber'
  | 'emerald'
  | 'teal'
  | 'violet'
  | 'pink'
  | 'slate'

export const FOLDER_COLORS: { id: FolderColor; label: string; hex: string }[] = [
  { id: 'blue', label: 'Azul', hex: '#60a5fa' },
  { id: 'red', label: 'Rojo', hex: '#f87171' },
  { id: 'orange', label: 'Naranja', hex: '#fb923c' },
  { id: 'amber', label: 'Ámbar', hex: '#fbbf24' },
  { id: 'emerald', label: 'Verde', hex: '#34d399' },
  { id: 'teal', label: 'Turquesa', hex: '#2dd4bf' },
  { id: 'violet', label: 'Violeta', hex: '#a78bfa' },
  { id: 'pink', label: 'Rosa', hex: '#f472b6' },
  { id: 'slate', label: 'Gris', hex: '#94a3b8' },
]

interface ColorClasses {
  iconBg: string
  iconFg: string
  gradient: string
}

const COLOR_CLASSES: Record<FolderColor, ColorClasses> = {
  blue:    { iconBg: 'bg-blue-500/10',    iconFg: 'text-blue-400',    gradient: 'from-blue-400 to-blue-500' },
  red:     { iconBg: 'bg-red-500/10',     iconFg: 'text-red-400',     gradient: 'from-red-400 to-red-500' },
  orange:  { iconBg: 'bg-orange-500/10',  iconFg: 'text-orange-400',  gradient: 'from-orange-400 to-orange-500' },
  amber:   { iconBg: 'bg-amber-500/10',   iconFg: 'text-amber-400',   gradient: 'from-amber-400 to-amber-500' },
  emerald: { iconBg: 'bg-emerald-500/10', iconFg: 'text-emerald-400', gradient: 'from-emerald-400 to-emerald-500' },
  teal:    { iconBg: 'bg-teal-500/10',    iconFg: 'text-teal-400',    gradient: 'from-teal-400 to-teal-500' },
  violet:  { iconBg: 'bg-violet-500/10',  iconFg: 'text-violet-400',  gradient: 'from-violet-400 to-violet-500' },
  pink:    { iconBg: 'bg-pink-500/10',    iconFg: 'text-pink-400',    gradient: 'from-pink-400 to-pink-500' },
  slate:   { iconBg: 'bg-slate-500/10',   iconFg: 'text-slate-400',   gradient: 'from-slate-400 to-slate-500' },
}

export function getFolderColor(color: string | null | undefined): FolderColor {
  if (color && color in COLOR_CLASSES) return color as FolderColor
  return 'blue'
}

export function getFolderColorClasses(color: string | null | undefined): ColorClasses {
  return COLOR_CLASSES[getFolderColor(color)]
}

export function folderColorFromMetadata(metadata: unknown): FolderColor {
  if (metadata && typeof metadata === 'object' && 'color' in metadata) {
    return getFolderColor((metadata as { color?: string }).color)
  }
  return 'blue'
}
