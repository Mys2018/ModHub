import styles from './MainLayout.module.css'
import {Outlet, useNavigate} from "react-router-dom";
import {Header} from "../../../shared/ui/header";
import {useAuthStore} from "../../../shared/user/model/store";
import {ModUploadModal} from "../../modals/mod-upload-modal/ModUploadModal.tsx";
import {useModalStore} from "../../../shared/ui/model/useModalStore.ts";

export const MainLayout = () => {
  const userStore = useAuthStore()
  const useModal = useModalStore()
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
            navigateToProfilePage={
              () => {
                navigate('/profile')
              }
            }
            openUploadModal={
              useModal.openCreateModal
            }
        />
        <Outlet/>
        <ModUploadModal />
      </main>
  )
}