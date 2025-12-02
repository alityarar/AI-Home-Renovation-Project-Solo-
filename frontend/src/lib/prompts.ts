import { StyleKey } from '@/store/useAppStore'

export interface StylePreset {
  key: StyleKey
  name: string
  description: string
  icon: string
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    key: 'modern',
    name: 'Modern',
    description: 'Clean lines, neutral palette, sleek finishes',
    icon: '🏢'
  },
  {
    key: 'scandi',
    name: 'Scandinavian',
    description: 'Bright, light oak, soft textiles, plants',
    icon: '🌿'
  },
  {
    key: 'industrial',
    name: 'Industrial',
    description: 'Concrete, exposed metal, dark wood, moody lighting',
    icon: '🏭'
  },
  {
    key: 'minimal',
    name: 'Minimal',
    description: 'Uncluttered, clean lines, carefully chosen elements',
    icon: '⚪'
  },
  {
    key: 'boho',
    name: 'Boho',
    description: 'Warm earthy palette, layered textiles, artisanal accents',
    icon: '🌺'
  }
]