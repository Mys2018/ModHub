import styles from './ModSlot.module.css'
import {getStatusName} from "../../model/types.ts";

interface ModSlotProps {
  title: string,
  description: string,
  version: string,
  author: string,
  status: string,
  created_at: string,
  onClick: () => void
}



export const ModSlot = (
    {title, description, version, author, status, created_at, onClick}: ModSlotProps
) => {
  return (
      <div className={styles.modSlot} onClick={onClick}>
        <h5 className={styles.title}>{title}</h5>
        <p className={styles.description}>{description}</p>
        <div className={styles.modInfo}>
          <div className={styles.verAndAuthor}>
            <p className={styles.version}>{`Версия: ${version}`}</p>
            <p className={styles.author}>{`Автор: ${author}`}</p>
          </div>
          <p className={styles.created}>{created_at}</p>
        </div>
        <p className={`${styles.status} ${styles[status]}`}>{
          getStatusName(status)
        }</p>
      </div>
  )
}