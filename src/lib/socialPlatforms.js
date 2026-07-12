import { Globe } from 'lucide-react'
import { GithubIcon, LinkedinIcon, InstagramIcon, FacebookIcon, XIcon, YoutubeIcon } from '../components/icons/BrandIcons'

/** Single source of truth for social platforms — used by the admin editor and the public page. */
export const SOCIAL_PLATFORMS = [
  { value: 'github', label: 'GitHub', icon: GithubIcon },
  { value: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon },
  { value: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { value: 'facebook', label: 'Facebook', icon: FacebookIcon },
  { value: 'x', label: 'X', icon: XIcon },
  { value: 'youtube', label: 'YouTube', icon: YoutubeIcon },
  { value: 'website', label: 'Website', icon: Globe },
]

const FALLBACK_PLATFORM = { value: 'other', label: 'Other', icon: Globe }

export function getSocialPlatform(value) {
  return SOCIAL_PLATFORMS.find((platform) => platform.value === value) ?? FALLBACK_PLATFORM
}
