import styles from './MainLayout.module.css'
import {Outlet, useNavigate} from "react-router-dom";
import {Header} from "../../../shared/ui/header";
import {useAuthStore} from "../../../shared/user/model/store";

export const MainLayout = () => {
  const userStore = useAuthStore()
  const navigate = useNavigate()

  return (
      <main className={styles.mainContainer}>
        <Header
            userName={userStore.user.username}
            toLogout={() => userStore.logout()}
            navigateToModLoadPage={
              () => {
                navigate("/load")
              }
            }
            navigateToMainPage={
              () => {
                navigate("/mods")
              }
            }
        />
        <Outlet/>
      </main>
  )
}