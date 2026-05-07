import styles from './OriginSection.module.scss'
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'

const founders = [
  { name: '藍世錡', role: '社長' },
  { name: '趙泰齡', role: '副社長' },
  { name: '林昌龍', role: '技術' },
]

/**
 * 創社緣起區域
 */
export default function OriginSection() {
  return (
    <section className={styles.origin}>
      <div className={styles.container}>
        {/* 左欄：故事敘述 */}
        <div className={styles.textCol}>
          {/* sectionLabel + h2 同步進場 */}
          <ScrollAnimation
            className={styles.headingGroup}
            animation="fadeInUp"
            once={false}
          >
            <span>創社緣起</span>
            <h2>從一個缺口開始</h2>
          </ScrollAnimation>
          <ScrollAnimation
            className={styles.paragraph}
            animation="fadeInUp"
            delay={60}
            once={false}
          >
            <p>
              2025 年 5
              月，三位對機器人技術同樣著迷的同學在學校發現了一件事：校內有許多充滿活力的社團，卻幾乎沒有一個以「學習」本身為核心的地方。
            </p>
          </ScrollAnimation>
          <ScrollAnimation
            className={styles.paragraph}
            animation="fadeInUp"
            delay={100}
            once={false}
          >
            <p>
              沒有一個讓你真正動手做事的地方，沒有一個可以花一整個下午研究一個問題的地方。於是，一個念頭慢慢成形：如果我們來做這件事呢？
            </p>
          </ScrollAnimation>
          <ScrollAnimation
            className={styles.paragraph}
            animation="fadeInUp"
            delay={140}
            once={false}
          >
            <p>
              三個人以共同的興趣出發，從課程設計到機器人製作，每一個環節都是第一次。我們又找了幾位夥伴，邊做邊學，把不確定的事情拿出來一起面對。
            </p>
          </ScrollAnimation>
        </div>

        {/* 右欄：創辦資訊卡片（className 在 ScrollAnimation 上） */}
        <div className={styles.accentCol}>
          <ScrollAnimation
            className={styles.accentCard}
            animation="fadeInUp"
            delay={80}
            once={false}
          >
            <div className={styles.accentYear}>
              <span className={styles.year}>2025</span>
              <span className={styles.yearLabel}>創社年份</span>
            </div>
            <hr className={styles.divider} />
            <div className={styles.foundersList}>
              <span className={styles.foundersLabel}>創辦人</span>
              {founders.map((founder) => (
                <div key={founder.name} className={styles.founderItem}>
                  {/* <span className={styles.founderDot} aria-hidden="true" /> */}
                  <span className={styles.founderName}>{founder.name}</span>
                  <span className={styles.founderRole}>{founder.role}</span>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}
