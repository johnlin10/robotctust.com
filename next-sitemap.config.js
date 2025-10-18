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
  ],

  //* 進階排除方法：使用自定義函數
  transform: async (config, path) => {
    // 可以根據條件動態排除頁面
    if (path.includes('/test/') || path.includes('/draft/')) {
      return null // 返回 null 表示排除此頁面
    }

    // 為特定頁面設定不同的優先級和更新頻率
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      }
    }

    if (path.startsWith('/update/')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.8,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      }
    }

    // 預設設定
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },

  //* robots.txt 的額外設定
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
  },
}
