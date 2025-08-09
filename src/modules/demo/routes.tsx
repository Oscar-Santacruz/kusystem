import type { RouteObject } from 'react-router-dom'
import { DemoHome } from '@/modules/demo/pages/DemoHome'

export const publicRoutes: RouteObject[] = []

export const privateRoutes: RouteObject[] = [
  {
    path: 'demo',
    children: [
      { path: 'home', element: <DemoHome /> },
    ],
  },
]
