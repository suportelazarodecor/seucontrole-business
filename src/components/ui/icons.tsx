import { SVGProps } from 'react'

type IconProps = { size?: number } & SVGProps<SVGSVGElement>

function base(paths: JSX.Element, { size = 16, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths}
    </svg>
  )
}

export const ArrowUpRight = (p: IconProps) => base(<><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>, p)
export const ArrowDownRight = (p: IconProps) => base(<><path d="m7 7 10 10" /><path d="M17 7v10H7" /></>, p)
export const Sun = (p: IconProps) => base(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>, p)
export const Moon = (p: IconProps) => base(<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />, p)
export const Menu = (p: IconProps) => base(<><path d="M3 6h18M3 12h18M3 18h18" /></>, p)
export const Search = (p: IconProps) => base(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>, p)
export const Plus = (p: IconProps) => base(<><path d="M12 5v14M5 12h14" /></>, p)
export const Trash = (p: IconProps) => base(<><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>, p)
export const Edit = (p: IconProps) => base(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>, p)
export const LogOut = (p: IconProps) => base(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>, p)
export const Building2 = (p: IconProps) => base(<><path d="M6 22V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v18" /><path d="M14 9h5a1 1 0 0 1 1 1v12" /><path d="M9 22v-4h2v4M9 7h1M9 11h1M9 15h1M14 13h2M14 17h2" /></>, p)
export const Home = (p: IconProps) => base(<><path d="m3 10 9-7 9 7" /><path d="M5 9v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" /></>, p)
export const LayoutDashboard = (p: IconProps) => base(<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>, p)
export const Receipt = (p: IconProps) => base(<><path d="M4 2h16v20l-3-2-3 2-2-2-2 2-3-2-3 2Z" /><path d="M8 7h8M8 11h8M8 15h5" /></>, p)
export const Wallet = (p: IconProps) => base(<><path d="M20 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v3" /><path d="M20 12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7" /><circle cx="17" cy="15" r="1" /></>, p)
export const TrendingUp = (p: IconProps) => base(<><path d="m3 17 6-6 4 4 8-8" /><path d="M17 7h4v4" /></>, p)
export const FileText = (p: IconProps) => base(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></>, p)
export const Target = (p: IconProps) => base(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>, p)
export const Tag = (p: IconProps) => base(<><path d="M12 2H2v10l10 10 10-10Z" transform="translate(0 0)" /><circle cx="7.5" cy="7.5" r="1.5" /></>, p)
export const SettingsIcon = (p: IconProps) => base(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>, p)
export const ChevronDown = (p: IconProps) => base(<path d="m6 9 6 6 6-6" />, p)
export const X = (p: IconProps) => base(<><path d="M18 6 6 18M6 6l12 12" /></>, p)
export const Upload = (p: IconProps) => base(<><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>, p)
export const Download = (p: IconProps) => base(<><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>, p)
export const AlertTriangle = (p: IconProps) => base(<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>, p)
export const CheckCircle = (p: IconProps) => base(<><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 5-5" /></>, p)
export const Clock = (p: IconProps) => base(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>, p)
export const Filter = (p: IconProps) => base(<path d="M22 3H2l8 9.5V19l4 2v-8.5Z" />, p)
export const Paperclip = (p: IconProps) => base(<path d="M21.4 11.6 12.6 20.4a4.5 4.5 0 0 1-6.4-6.4l9-9a3 3 0 0 1 4.2 4.2l-9 9a1.5 1.5 0 0 1-2.1-2.1l8.3-8.3" />, p)
export const User = (p: IconProps) => base(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></>, p)
export const Lock = (p: IconProps) => base(<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>, p)
export const Mail = (p: IconProps) => base(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m3 6 9 6 9-6" /></>, p)
