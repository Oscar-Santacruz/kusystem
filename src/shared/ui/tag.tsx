import { clsx } from 'clsx'

export type TagColor = 'gray' | 'blue' | 'red' | 'green' | 'yellow' | 'purple'

interface TagProps {
  color?: TagColor
  children: React.ReactNode
  className?: string
}

export function Tag({ color = 'gray', children, className }: TagProps) {
  const colorClasses = {
    gray: 'bg-slate-700 text-slate-200 border-slate-600',
    blue: 'bg-blue-900/50 text-blue-200 border-blue-700',
    red: 'bg-red-900/50 text-red-200 border-red-700',
    green: 'bg-green-900/50 text-green-200 border-green-700',
    yellow: 'bg-yellow-900/50 text-yellow-200 border-yellow-700',
    purple: 'bg-purple-900/50 text-purple-200 border-purple-700',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-1 text-xs font-medium border rounded-full',
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  )
}
