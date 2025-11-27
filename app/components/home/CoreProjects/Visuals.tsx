'use client'

import Image from 'next/image'
import { useSpring, animated, config } from '@react-spring/web'
import styles from './CoreProjects.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGear,
  faCode,
  faTerminal,
  faBell,
  faCheckCircle,
  faBars,
  faMicrochip,
  faBatteryFull,
} from '@fortawesome/free-solid-svg-icons'
import { faReact, faApple } from '@fortawesome/free-brands-svg-icons'

export const WebVisual = () => {
  const props = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: config.gentle,
  })

  return (
    <animated.div className={styles.visualContainer} style={props}>
      <div className={styles.webWindow}>
        <div className={styles.windowHeader}>
          <div className={`${styles.dot} ${styles.red}`} />
          <div className={`${styles.dot} ${styles.yellow}`} />
          <div className={`${styles.dot} ${styles.green}`} />
        </div>
        <div className={styles.windowContent}>
          <div className={styles.header}>
            <Image
              src="/assets/image/home/robotctust-home-image.png"
              alt="logo"
              className={styles.logo}
              width={100}
              height={100}
            />
            <div>
              <p>最新資訊</p>
              <p>行事曆</p>
              <p>關於</p>
            </div>
            <FontAwesomeIcon icon={faBars} />
          </div>
          <div className={styles.heroArea}>
            <Image
              src="/assets/image/home/robotctust-home-image.png"
              alt="logo"
              width={100}
              height={100}
            />
            <div className={styles.subtitle}></div>
            <div className={styles.title1}></div>
            <div className={styles.title2}></div>
            <div className={styles.description}></div>
          </div>
        </div>
      </div>
      <div className={styles.backgroundBlur} />
    </animated.div>
  )
}

const SensorLight = ({ active }: { active: boolean }) => {
  const style = useSpring({
    opacity: active ? 1 : 0.3,
    boxShadow: active ? '0 0 8px #ef4444' : '0 0 0px #ef4444',
    config: { duration: 100 },
  })
  return <animated.div className={styles.sensor} style={style} />
}

export const RoboticsVisual = () => {
  // 無限滾動背景 (模擬前進)
  const { scrollY } = useSpring({
    from: { scrollY: 0 },
    to: { scrollY: 100 },
    loop: true,
    config: { duration: 2000, easing: (t) => t },
  })

  // 模擬 PID 修正動作 (左右擺動 + 旋轉)
  const { x, r, leftSensor, rightSensor } = useSpring({
    from: { x: 0, r: 0, leftSensor: 0, rightSensor: 0 },
    to: async (next) => {
      while (true) {
        // 模擬隨機修正
        const randomDir = Math.random() > 0.5 ? 1 : -1

        // 偏移
        await next({
          x: 8 * randomDir,
          r: 3 * randomDir,
          leftSensor: randomDir > 0 ? 1 : 0,
          rightSensor: randomDir < 0 ? 1 : 0,
        })
        // 回正
        await next({ x: 0, r: 0, leftSensor: 0, rightSensor: 0 })

        // 等待一下
        await new Promise((resolve) =>
          setTimeout(resolve, 200 + Math.random() * 300)
        )
      }
    },
    config: { tension: 120, friction: 14 },
  })

  return (
    <div className={styles.visualContainer}>
      <div className={styles.roboticsScene}>
        <animated.div
          className={styles.trackLine}
          style={{
            backgroundPosition: scrollY.to((y) => `center ${y}%`),
          }}
        />

        <animated.div
          className={styles.robotBody}
          style={{
            x,
            rotate: r,
          }}
        >
          <div className={styles.robotBodyInner}></div>
          <div className={`${styles.wheel} ${styles.left}`}>
            <div className={styles.tread} />
          </div>
          <div className={`${styles.wheel} ${styles.right}`}>
            <div className={styles.tread} />
          </div>

          <div className={styles.chassisInner}>
            <div className={styles.components}>
              <FontAwesomeIcon icon={faMicrochip} className={styles.chip} />
              <div className={styles.battery}>
                <FontAwesomeIcon icon={faBatteryFull} />
              </div>
            </div>
            <div className={styles.wires} />
          </div>

          <div className={styles.sensors}>
            <SensorLight active={true} /> {/* 中間 */}
            <SensorLight active={false} /> {/* 裝飾 */}
            <SensorLight active={false} /> {/* 裝飾 */}
          </div>
        </animated.div>
      </div>
    </div>
  )
}

export const IOSVisual = () => {
  const slideUp = useSpring({
    from: { transform: 'translateY(100%)', opacity: 0 },
    to: { transform: 'translateY(0%)', opacity: 1 },
    delay: 400,
    config: config.wobbly,
  })

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 800,
  })

  return (
    <div className={styles.visualContainer}>
      <div className={styles.phoneFrame}>
        <div className={styles.notch} />
        <div className={styles.screen}>
          <div className={styles.statusBar}>
            <span>9:41</span>
            <div className={styles.statusIcons} />
          </div>
          <div className={styles.appHeader}>
            <FontAwesomeIcon icon={faApple} />
            <span>Robotics</span>
          </div>
          <div className={styles.contentArea}>
            <div className={styles.calendarWidget} />
            <animated.div className={styles.notificationCard} style={slideUp}>
              <div className={styles.iconBox}>
                <FontAwesomeIcon icon={faBell} />
              </div>
              <div className={styles.textBox}>
                <div className={styles.lineLong} />
                <div className={styles.lineShort} />
              </div>
            </animated.div>
            <animated.div className={styles.checkInButton} style={fadeIn}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>Check In</span>
            </animated.div>
          </div>
        </div>
      </div>
    </div>
  )
}
