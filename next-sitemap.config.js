/** @type {import('next-sitemap').IConfig} */

const SITE_URL = 'https://robotctust.com'

/**
 * 為每個 canonical (zh-TW) 路徑產生 hreflang alternateRefs。
 * hrefIsAbsolute: true 告訴 next-sitemap 直接使用完整 href，不再附加當前頁面路徑。
 * x-default 指向預設語系 zh-TW，符合 Google 建議。
 */
function buildAlternateRefs(canonicalPath) {
  // 首頁用空字串避免產生尾部斜線 (https://robotctust.com/ → https://robotctust.com)
  const canon = canonicalPath === '/' ? '' : canonicalPath
  const enPath = `/en${canon}`
  return [
    { href: `${SITE_URL}${canon}`,  hreflang: 'zh-TW',      hrefIsAbsolute: true },
    { href: `${SITE_URL}${enPath}`, hreflang: 'en',         hrefIsAbsolute: true },
    { href: `${SITE_URL}${canon}`,  hreflang: 'x-default',  hrefIsAbsolute: true },
  ]
}

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  sitemapSize: 7000,

  // 排除私有路由，同時覆蓋 zh-TW（無前綴）和 en（/en/ 前綴）兩個版本
  exclude: [
    '/admin', '/admin/*', '/en/admin', '/en/admin/*',
    '/api/*',
    '/dashboard', '/dashboard/*', '/en/dashboard', '/en/dashboard/*',
    '/onboarding', '/onboarding/*', '/en/onboarding', '/en/onboarding/*',
    '/login', '/en/login',
    '/profile', '/en/profile',
    '/privacy', '/en/privacy',
    '/terms', '/en/terms',
    '/blog', '/blog/*', '/en/blog', '/en/blog/*',
    '/*/edit', '/en/*/edit',
    '/_*',
    '/zh-TW', '/zh-TW/*',
    '/manifest.webmanifest',
  ],

  transform: async (config, rawPath) => {
    if (rawPath.includes('/test/') || rawPath.includes('/draft/')) return null

    // 防禦性：strip /zh-TW 前綴（as-needed 策略下不應出現，但以防萬一）
    const path =
      rawPath.startsWith('/zh-TW/')
        ? rawPath.replace('/zh-TW', '')
        : rawPath === '/zh-TW'
          ? '/'
          : rawPath

    const isEn = path === '/en' || path.startsWith('/en/')
    const canonicalPath = isEn
      ? path === '/en' ? '/' : path.replace(/^\/en/, '')
      : path
    const alternateRefs = buildAlternateRefs(canonicalPath)
    const lastmod = new Date().toISOString()

    if (path === '/' || path === '/en')
      return { loc: path, changefreq: 'daily', priority: 1.0, lastmod, alternateRefs }
    if (path.includes('/news'))
      return { loc: path, changefreq: 'weekly', priority: 0.8, lastmod, alternateRefs }
    if (path.includes('/competitions'))
      return { loc: path, changefreq: 'weekly', priority: 0.8, lastmod, alternateRefs }
    if (path.includes('/courses'))
      return { loc: path, changefreq: 'monthly', priority: 0.7, lastmod, alternateRefs }
    if (path.includes('/calendar'))
      return { loc: path, changefreq: 'daily', priority: 0.7, lastmod, alternateRefs }

    return { loc: path, changefreq: config.changefreq, priority: config.priority, lastmod, alternateRefs }
  },

  additionalPaths: async (config) => {
    const results = []
    const lastmod = new Date().toISOString()

    // 推入 canonical (zh-TW) + /en/ 兩個版本
    const addBoth = (canonicalPath, changefreq, priority, overrideLastmod) => {
      const enPath = canonicalPath === '/' ? '/en' : `/en${canonicalPath}`
      const alternateRefs = buildAlternateRefs(canonicalPath)
      const lm = overrideLastmod || lastmod
      results.push({ loc: canonicalPath, changefreq, priority, lastmod: lm, alternateRefs })
      results.push({ loc: enPath, changefreq, priority, lastmod: lm, alternateRefs })
    }

    // -------------------------------------------------------------------------
    // 靜態路由 — 自動掃描 app/[locale]/ 目錄下的 page.tsx
    // 新增頁面後不需要手動更新此 config
    // -------------------------------------------------------------------------
    const fs = require('fs')
    const nodePath = require('path')
    const EXCLUDED_DIRS = new Set([
      'admin', 'dashboard', 'onboarding', 'auth',
      'profile', 'login', 'privacy', 'terms', 'blog',
    ])

    function scanStaticPages(dir, baseDir) {
      const found = []
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          // 跳過：動態 segment、parallel route、排除清單
          if (entry.name.startsWith('[') || entry.name.startsWith('@')) continue
          if (EXCLUDED_DIRS.has(entry.name)) continue
          found.push(...scanStaticPages(nodePath.join(dir, entry.name), baseDir))
        } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
          const rel = nodePath.relative(baseDir, dir).replace(/\\/g, '/')
          found.push(rel ? `/${rel}` : '/')
        }
      }
      return found
    }

    const localeDir = nodePath.join(process.cwd(), 'app', '[locale]')
    const staticPages = scanStaticPages(localeDir, localeDir)

    const getPriority = (p) =>
      p === '/' ? 1.0
      : ['/news', '/competitions'].some((r) => p.startsWith(r)) ? 0.8
      : p === '/calendar' ? 0.7
      : 0.6

    const getChangefreq = (p) =>
      ['/', '/calendar'].includes(p) ? 'daily'
      : ['/news', '/competitions'].some((r) => p.startsWith(r)) ? 'weekly'
      : 'monthly'

    for (const p of staticPages) {
      addBoth(p, getChangefreq(p), getPriority(p))
    }

    // -------------------------------------------------------------------------
    // docs/[slug] — 靜態清單（mainDocs IDs，來自 app/[locale]/docs/docs.ts）
    // -------------------------------------------------------------------------
    for (const slug of [
      'org-charter',
      'financial-management',
      'equipment-borrowing-guidelines',
      'future-plans',
    ]) {
      addBoth(`/docs/${slug}`, 'monthly', 0.6)
    }

    // -------------------------------------------------------------------------
    // news/[slug] — Supabase posts 表
    // -------------------------------------------------------------------------
    try {
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
      const { data: posts, error } = await supabase
        .from('posts')
        .select('id, updated_at')
      if (!error && posts) {
        for (const post of posts) {
          const lm = post.updated_at ? new Date(post.updated_at).toISOString() : lastmod
          addBoth(`/news/${post.id}`, 'weekly', 0.8, lm)
        }
      }
    } catch (err) {
      console.warn('[next-sitemap] posts 查詢失敗:', err.message)
    }

    // -------------------------------------------------------------------------
    // competitions/[slug] — Firebase Firestore（firebase-admin）
    // -------------------------------------------------------------------------
    try {
      const admin = require('firebase-admin')
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(
            require('./robot-group-firebase-sa.json'),
          ),
        })
      }
      const snap = await admin
        .firestore()
        .collection('competitions')
        .where('published', '==', true)
        .get()
      for (const doc of snap.docs) {
        const data = doc.data()
        const lm = data.updatedAt?.toDate?.()?.toISOString() ?? lastmod
        addBoth(`/competitions/${doc.id}`, 'weekly', 0.8, lm)
      }
    } catch (err) {
      console.warn('[next-sitemap] competitions 查詢失敗:', err.message)
    }

    // -------------------------------------------------------------------------
    // courses/[slug] — Supabase courses 表
    // -------------------------------------------------------------------------
    try {
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
      const { data: courses, error } = await supabase
        .from('courses')
        .select('id, updated_at')
        .eq('is_published', true)
      if (!error && courses) {
        for (const course of courses) {
          const lm = course.updated_at ? new Date(course.updated_at).toISOString() : lastmod
          addBoth(`/courses/${course.id}`, 'monthly', 0.7, lm)
        }
      }
    } catch (err) {
      console.warn('[next-sitemap] courses 查詢失敗:', err.message)
    }

    return results
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin', '/en/admin',
          '/api',
          '/dashboard', '/en/dashboard',
          '/onboarding', '/en/onboarding',
          '/login', '/en/login',
          '/profile', '/en/profile',
        ],
      },
    ],
  },
}
