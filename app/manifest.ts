import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: 'robotctust.com',
    name: '中臺機器人研究社',
    short_name: '中臺機器人研究社',
    description:
      '中臺機器人研究社是一個由中臺科技大學學生組成的社團，主要研究機器人技術，並且提供學生一個學習機器人技術的平台。',
    start_url: '/',
    display: 'standalone',
    background_color: 'oklch(0.2 0.03 300)',
    theme_color: 'oklch(0.5 0.24 290)',
    icons: [
      {
        src: '/assets/icons/rounded-app-icon/robotctust-rounded-app-icon-1024.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
      {
        src: '/assets/icons/rounded-app-icon/robotctust-rounded-app-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/icons/rounded-app-icon/robotctust-rounded-app-icon-180.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/assets/icons/rounded-app-icon/robotctust-rounded-app-icon-167.png',
        sizes: '167x167',
        type: 'image/png',
      },
      {
        src: '/assets/icons/rounded-app-icon/robotctust-rounded-app-icon-128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/assets/icons/rounded-app-icon/robotctust-rounded-app-icon-120.png',
        sizes: '120x120',
        type: 'image/png',
      },
      {
        src: '/assets/icons/rounded-app-icon/robotctust-rounded-app-icon-76.png',
        sizes: '76x76',
        type: 'image/png',
      },
      {
        src: '/assets/icons/rounded-app-icon/robotctust-rounded-app-icon-57.png',
        sizes: '57x57',
        type: 'image/png',
      },
    ],
  }
}
