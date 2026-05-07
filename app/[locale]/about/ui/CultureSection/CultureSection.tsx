import styles from './CultureSection.module.scss'
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWrench, faBug, faQuestion } from '@fortawesome/free-solid-svg-icons'

const workshopMoments = [
  {
    icon: faWrench,
    title: '調整與測試',
    description:
      '感測器、馬達、韌體參數——每一個數字都可能是解答，也可能是新問題的起點。',
  },
  {
    icon: faBug,
    title: '追那個 Bug',
    description:
      '邏輯上說得通，執行起來卻不行。有時候問題卡了整個下午——但這就是工程的日常。',
  },
  {
    icon: faQuestion,
    title: '一起面對玄學',
    description:
      '偶爾出現、無法重現的奇怪現象。我們稱它玄學問題，能一起面對，本身就是一種樂趣。',
  },
] as const

/**
 * 社團文化區域
 */
export default function CultureSection() {
  return (
    <section className={styles.culture}>
      <div className={styles.container}>
        {/* sectionLabel + h2 同步進場 */}
        <ScrollAnimation
          className={styles.headingGroup}
          animation="fadeInUp"
          once={false}
        >
          <span>社團文化</span>
          <h2>走進來，就像走進一間工作坊</h2>
        </ScrollAnimation>

        {/* 敘述段落 */}
        <ScrollAnimation
          className={styles.narrative}
          animation="fadeInUp"
          delay={60}
          once={false}
        >
          <p>
            有人在調感測器參數，有人在追一個奇怪的韌體 Bug，有人對著螢幕沉默地想很久。沒有制式的課程表，只有一個共同的目標——搞清楚眼前這件事。
          </p>
        </ScrollAnimation>

        {/* 工作坊情境卡片（className 在 ScrollAnimation 上，animated.div 即為卡片本體） */}
        <div className={styles.momentGrid}>
          {workshopMoments.map((moment, index) => (
            <ScrollAnimation
              key={moment.title}
              className={styles.momentCard}
              animation="fadeInUp"
              delay={index * 80}
              once={false}
              threshold={0.2}
            >
              <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={moment.icon} />
              </div>
              <h3>{moment.title}</h3>
              <p>{moment.description}</p>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  )
}
