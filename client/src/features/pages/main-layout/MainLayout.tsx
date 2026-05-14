import styles from './MainLayout.module.css'
import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "../../../shared/ui/header";
import { useAuthStore } from "../../../shared/user/model/store";
import { ModUploadModal } from "../../modals/mod-upload-modal/ModUploadModal.tsx";
import { ConfirmModal } from "../../../shared/ui/confirm-modal/ConfirmModal.tsx";

export const MainLayout = () => {
  const userStore = useAuthStore()
  const navigate = useNavigate()

  return (
    <main className={styles.mainContainer}>
      <Header
        userName={userStore.user.username}
        toLogout={() => userStore.logout()}
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
      />
      <Outlet />
      <ModUploadModal />
      <ConfirmModal />
    </main>
  )
}