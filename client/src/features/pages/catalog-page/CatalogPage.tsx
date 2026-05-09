import styles from './CatalogPage.module.css'
import {getAllMods} from "../../../shared/mods/api/requests.ts";
import {useQuery} from "@tanstack/react-query";
import {ModSlot} from "../../../shared/mods/ui/mod-slot/ModSlot.tsx";
import type {Mod} from "../../../shared/mods/model/types.ts";
import {useNavigate} from "react-router-dom";


export const CatalogPage = () => {
  const mods = useQuery({
    queryKey: ['mods'],
    queryFn: getAllMods
  })

  const navigate = useNavigate()

  if (mods.isLoading) return <main className={styles.mainContainer}>Загрузка...</main>
  if (mods.isError) return <main className={styles.mainContainer}>Ошибка загрузки каталога</main>

  // console.log(mods.data)
  return (
      <main className={styles.mainContainer}>
        <h3>Каталог</h3>
        <div className={styles.modGrid}>
          {mods.data?.data.map((mod: Mod) => {
            const latestVersion = mod.versions?.[0];
            return (
                <ModSlot
                    onClick={() => navigate(`/mods/${mod.id}`)}
                    key={mod.id}
                    title={mod.title}
                    description={mod.description}
                    version={latestVersion?.version_tag || 'Нет версий'}
                    author={mod.author_name}
                    status={latestVersion?.status || 'pending'}
                    created_at={(latestVersion?.created_at || mod.created_at).slice(0, 10)}
                />
            );
          })}
        </div>
      </main>
  )
}