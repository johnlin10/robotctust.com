'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import styles from './LanguageSwitcher.module.scss'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLanguage } from '@fortawesome/free-solid-svg-icons'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations('LanguageSwitcher')
  const pathname = usePathname()
  const router = useRouter()

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value as any
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <div className={styles.container}>
      <label htmlFor="language-select" className={styles.label}>
        <FontAwesomeIcon icon={faLanguage} className={styles.icon} />
        <span className={styles.text}>{t('label')}</span>
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={handleLanguageChange}
        className={styles.select}
        aria-label={t('label')}
      >
        {routing.locales.map((cur) => (
          <option key={cur} value={cur}>
            {t('languages.' + cur)}
          </option>
        ))}
      </select>
    </div>
  )
}
