/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: 'https://robotctust.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,

  //* 排除特定頁面不納入 sitemap
  exclude: [
    '/admin', // 排除管理員頁面
    '/admin/*', // 排除所有管理員子頁面
    '/api/*', // 排除所有 API 路由
    '/privacy', // 排除隱私政策頁面
    '/terms', // 排除服務條款頁面
    '/_*', // 排除所有以底線開頭的頁面
    '/blog', // 排除 blog 頁面
    '/blog/*', // 排除所有 blog 子頁面
    '/dashboard', // 排除 dashboard 頁面
    '/dashboard/*', // 排除所有 dashboard 子頁面
    '/*/edit', // 排除所有編輯頁面
    '/onboarding', // 排除 onboarding 頁面
    '/onboarding/*', // 排除所有 onboarding 子頁面
  ],

  transform: (config, path) => {
    if (path.includes('/test/') || path.includes('/draft/')) {
      return null
    }

    const lastmod = config.autoLastmod ? new Date().toISOString() : undefined

    /** @param {Partial<import('next-sitemap').ISitemapField>} overrides */
    const field = (overrides) => ({
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod,
      ...overrides,
    })

    if (path === '/') {
      return field({ changefreq: 'daily', priority: 1.0 })
    }

    // `/update` 列表與 `/update/[slug]` 單篇
    if (path === '/update' || path.startsWith('/update/')) {
      return field({ changefreq: 'daily', priority: 0.8 })
    }

    return field({})
  },

  //* robots.txt 的額外設定
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/dashboard', '/onboarding'],
      },
    ],
  },
}
