import styles from './Loading.module.scss'

export default function Loading({
  align = 'center',
  text = '載入中',
}: {
  align?: 'center' | 'left' | 'right'
  text?: string
}) {
  return (
    <div className={`${styles.loading} ${styles[align]}`}>
      <div className={styles.spinner}></div>
      <span>{text}</span>
    </div>
  )
}
