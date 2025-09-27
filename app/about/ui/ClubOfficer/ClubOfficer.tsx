import styles from './ClubOfficer.module.scss'
import Image from 'next/image'

/**
 * 社團幹部列表
 */
export default function ClubOfficer() {
  const clubOfficers = [
    {
      name: '藍世錡',
      position: '社長',
      description: '社長',
    },
    {
      name: '趙泰齡',
      position: '副社長',
      description: '副社長',
    },
    {
      name: '王朝育',
      position: '活動',
      description: '活動',
    },
    {
      name: '林廷亘',
      position: '總務',
      description: '總務',
    },
    {
      name: '陳宜均',
      position: '財務',
      description: '財務',
    },
    {
      name: '林昌龍',
      position: '美工',
      description: '美工',
    },
  ]
  return (
    <div className={styles.clubOfficer}>
      <h2>社團幹部</h2>
      <div className={styles.clubOfficerList}>
        {clubOfficers.map((clubOfficer) => (
          <div className={styles.clubOfficerItem} key={clubOfficer.name}>
            <div className={styles.clubOfficerItemImage}>
              <Image
                src="/assets/image/userEmptyAvatar.png" // TODO: 更換為幹部照片
                alt="社團幹部"
                height={240}
                width={240}
              />
            </div>
            <div className={styles.clubOfficerInfo}>
              <div className={styles.clubOfficerItemName}>
                <h1>{clubOfficer.name}</h1>
              </div>
              <div className={styles.clubOfficerItemPosition}>
                <p>{clubOfficer.position}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
