import Image from 'next/image'
import styles from './Logo.module.scss'

/**
 * [Component] Logo for Header
 * @param {boolean} isCompact - 是否為緊湊模式
 * @returns {JSX.Element} Logo 元件
 */
export default function Logo({ isCompact }: { isCompact: boolean }) {
  const handleClick = () => {
    window.location.href = '/'
  }

  return (
    <div
      className={`${styles.logo} ${isCompact ? styles.compact : ''}`}
      onClick={handleClick}
    >
      <Image
        src="/assets/image/home/robotctust-home-image.png"
        alt="中臺機器人研究社"
        width={96}
        height={96}
        className={styles.logoImage}
      />
      <div className={styles.logoText}>
        <h1>中臺機器人研究社</h1>
        <p>Robot Research Club of CTUST</p>
      </div>
    </div>
  )
}
