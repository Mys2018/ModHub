import styles from './ProfilePage.module.css'
import {useAuthStore} from "../../../shared/user/model/store";
import {useQuery} from "@tanstack/react-query";
import {getMyMods} from "../../../shared/mods/api/requests.ts";
import Avatar from '../../../shared/ui/header/assets/avatar.png'
import {getStatusName, type Mod} from "../../../shared/mods/model/types.ts";
import {useModalStore} from "../../../shared/ui/model/useModalStore.ts";

export const ProfilePage = () => {
  const user = useAuthStore(state => state.user)

  const { data: myMods, isLoading} = useQuery({
    queryKey: ['myMods'],
    queryFn: getMyMods
  })

  const { openAddVersionModal } = useModalStore();

  if (isLoading) return <main className={styles.mainContainer}>Загрузка...</main>

  return (
      <section className={styles.mainContainer}>
        <div className={styles.profileContainer}>
          <div className={styles.userInfo}>
            <h2 className={styles.titleProfile}>Профиль пользователя</h2>
            <div className={styles.infoProfile}>
              <img className={styles.avatar} src={Avatar} alt={'Аватар'}/>
                <div className={styles.usernameAndEmail}>
                  <span className={styles.bold}>{user.username}</span>
                  <p>Email: <span>{user.email}</span></p>
                </div>
            </div>
          </div>

          <h3 className={styles.titleMyMods}>Мои моды</h3>

          <div className={styles.modsList}>
            {
              myMods?.map((mod: Mod) => (
                  <div className={styles.modContainer}>
                    <div className={styles.info}>
                      <h5 className={styles.title}>{mod.title}</h5>
                      <div className={styles.modInfo}>
                        <p className={styles.version}>Версия: {mod.versions?.[0]?.version_tag || 'Нет версий'}</p>
                        <p className={styles.createdAt}>Обновлен: {mod.versions?.[0]?.created_at.slice(0, 10) || mod.created_at.slice(0, 10)}</p>
                      </div>
                      <div className={`${styles.status} ${styles[mod.versions?.[0]?.status]}`}>{
                        getStatusName(mod.versions?.[0]?.status)
                      }</div>
                    </div>
                    <div className={styles.buttonContainer}>
                      <svg className={styles.deleteButton} stroke="white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20"  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>

                      <div
                          onClick={() => openAddVersionModal(mod.id, {
                            title: mod.title,
                            description: mod.description,
                            targetDevice: mod.versions[0].target_device,
                            androidVersion: mod.versions[0].android_version
                          })}
                      >
                        <svg
                            className={styles.plusVersionButton}
                            stroke="white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6 12H12M12 12H18M12 12V18M12 12V6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>


                    </div>
                  </div>
              ))
            }
          </div>
        </div>

      </section>
  );
}