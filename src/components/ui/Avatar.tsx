interface AvatarProps {
  name: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showStatus?: boolean
  status?: 'online' | 'away' | 'offline'
  className?: string
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-[72px] h-[72px] text-xl',
}

const statusDotSize = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-3.5 h-3.5 border-2',
}

const statusDotColor = {
  online: 'bg-success-500',
  away: 'bg-warning-500',
  offline: 'bg-neutral-400',
}

/** Deterministic background color based on name hash */
function getInitialsBg(name: string): string {
  const palette = [
    'bg-primary-600',
    'bg-primary-700',
    'bg-primary-500',
    'bg-accent-600',
    'bg-primary-800',
    'bg-accent-500',
    'bg-primary-400',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}

export function Avatar({
  name,
  src,
  size = 'md',
  showStatus = false,
  status = 'offline',
  className = '',
}: AvatarProps) {
  const initials = name ? name.charAt(0).toUpperCase() : '?'
  const bgColor = getInitialsBg(name)

  return (
    <div className={`relative inline-block flex-none ${className}`}>
      {src ? (
        <img
          src={src}
          alt={`${name} 的頭像`}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`
            ${sizeClasses[size]} ${bgColor}
            rounded-full flex items-center justify-center
            text-white font-semibold select-none
          `}
          aria-label={name}
        >
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full
            border-white dark:border-neutral-800
            ${statusDotSize[size]}
            ${statusDotColor[status]}
          `}
          aria-label={`狀態：${status}`}
        />
      )}
    </div>
  )
}

export default Avatar
