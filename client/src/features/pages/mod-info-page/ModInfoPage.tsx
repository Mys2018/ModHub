import styles from './ModInfoPage.module.css'
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStatusName, type Mod, type ModVersion } from "../../../shared/mods/model/types.ts";
import { getModById } from "../../../shared/mods/api/requests.ts";

export const ModInfoPage = () => {
  const { id } = useParams<{ id: string }>()

  const { data: mod, isLoading, isError } = useQuery<Mod>({
    queryKey: ['mod', id],
    queryFn: () => getModById(id!),
    enabled: !!id
  })

  if (isLoading) return <main className={styles.mainContainer}>Загрузка...</main>
  if (isError || !mod) return <main className={styles.mainContainer}>Ошибка загрузки мода...</main>

  return (
    <main className={styles.mainContainer}>
      <div className={styles.infoContainer}>
        <div className={styles.return}>
          <h3>О модификации</h3>
        </div>

        <div className={styles.modHeader}>
          <h5 className={styles.title}>{mod.title}</h5>

          <p className={styles.description}><span className={styles.desc}>Описание: </span>{mod.description}</p>

          <div className={styles.modInfo}>
            <p className={styles.author}>Автор: <span>{mod.author_name}</span></p>
            <p className={styles.updated}>Последнее обновление: <span>{mod.created_at.slice(0, 10)}</span></p>
          </div>

          <div className={styles.modDeviceInfo}>
            <p className={styles.version}>Версия: <span>{mod.versions?.[0]?.version_tag}</span></p>
            <p className={styles.device}>Устройство: <span>{mod.versions?.[0]?.target_device}</span></p>
            <p className={styles.android}>Версия Android: <span>{mod.versions?.[0]?.android_version}</span></p>
          </div>

        </div>
        <div className={styles.versionsContainer}>
          <h3 className={styles.versionsTitle}>Доступные версии</h3>

          {
            mod.versions.length === 0 ? ('Нет доступных версий') : (
              <div className={styles.versionsList}>
                {
                  mod.versions.map((modVersion: ModVersion) => (
                    <div className={styles.modVersion} key={modVersion.version_id}>
                      <div className={styles.versionInfo}>
                        <p className={styles.versionSlot}>Версия: <span>{modVersion.version_tag}</span></p>
                        <p className={styles.deviceSlot}>Устройство: <span>{modVersion.target_device}</span></p>
                        <p className={styles.androidSlot}>Версия Android: <span>{modVersion.android_version}</span></p>
                      </div>

                      <div className={styles.versionActions}>
                        <p className={`${styles.status} ${styles[modVersion.status]}`}>{
                          getStatusName(modVersion.status)
                        }</p>
                        <a
                          className={`${styles.downloadButton} ${modVersion.status === 'approved' ? '' : styles.unactive}`}
                          href={modVersion.status === 'approved' ? modVersion.file_path : '#'}
                          onClick={(e) => {
                            if (modVersion.status !== 'approved') e.preventDefault();
                          }}
                        >
                          Скачать
                        </a>
                      </div>
                    </div>
                  ))
                }
              </div>
            )
          }
        </div>
      </div>
    </main>
  )
}