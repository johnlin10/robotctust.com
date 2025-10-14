import Link from 'next/link'
import styles from './WebsiteMap.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

const LinkWithIcon = ({
  href,
  blank,
  onClick,
  children,
}: {
  href: string
  blank?: boolean
  onClick?: () => void
  children: React.ReactNode
}) => {
  return (
    <Link
      href={href}
      target={blank ? '_blank' : '_self'}
      className={blank ? styles.blank : ''}
      onClick={onClick}
    >
      {children}
      <FontAwesomeIcon icon={faArrowRight} />
    </Link>
  )
}

/**
 * [Component] 網站地圖
 * @returns {JSX.Element} 網站地圖
 */
export default function WebsiteMap({ onClose }: { onClose?: () => void }) {
  const handleLinkClick = () => {
    onClose?.()
  }
  return (
    <div className={styles.websiteMap}>
      <div className={styles.websiteMap_group}>
        <p>資訊</p>
        <div className={styles.websiteMap_group_items}>
          <LinkWithIcon href="/schedules" onClick={handleLinkClick}>
            行事曆
          </LinkWithIcon>
          <LinkWithIcon href="/update" onClick={handleLinkClick}>
            最新資訊
          </LinkWithIcon>
          <LinkWithIcon href="/competitions" onClick={handleLinkClick}>
            競賽
          </LinkWithIcon>
        </div>
      </div>
      <div className={styles.websiteMap_group}>
        <p>關於</p>
        <div className={styles.websiteMap_group_items}>
          <LinkWithIcon href="/about" onClick={handleLinkClick}>
            關於我們
          </LinkWithIcon>
          <LinkWithIcon href="/contact" onClick={handleLinkClick}>
            聯絡我們
          </LinkWithIcon>
        </div>
      </div>
      <div className={styles.websiteMap_group}>
        <p>資料</p>
        <div className={styles.websiteMap_group_items}>
          <LinkWithIcon href="/docs" onClick={handleLinkClick}>
            文檔
          </LinkWithIcon>
          <LinkWithIcon href="/terms" onClick={handleLinkClick}>
            使用條款
          </LinkWithIcon>
          <LinkWithIcon href="/privacy" onClick={handleLinkClick}>
            隱私權政策
          </LinkWithIcon>
        </div>
      </div>
      <div className={styles.websiteMap_group}>
        <p>Open Source</p>
        <div className={styles.websiteMap_group_items}>
          <LinkWithIcon
            href="https://github.com/johnlin10/robot-ctust"
            onClick={handleLinkClick}
            blank
          >
            Website
          </LinkWithIcon>
        </div>
      </div>
    </div>
  )
}
