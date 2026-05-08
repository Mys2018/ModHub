import styles from './CatalogPage.module.css'
import {getAllMods} from "../../../shared/mods/api/requests.ts";
import {useQuery} from "@tanstack/react-query";
import {ModSlot} from "../../../shared/mods/ui/mod-slot/ModSlot.tsx";
import type {Mod} from "../../../shared/mods/model/types.ts";


export const CatalogPage = () => {
  const mods = useQuery({
    queryKey: ['mods'],
    queryFn: getAllMods
  })

  console.log(mods.data)

  return (
      <main className={styles.mainContainer}>
        <h3>Каталог</h3>
        <div className={styles.modGrid}>
          {mods.data?.data.map((mod : Mod) => (
            <ModSlot
                title={mod.title}
                description={mod.description}
                version={mod.version}
                author={mod.author}
                status={mod.status}
                created_at={'09.05.2026'}
            />
          ))}
        </div>
      </main>
  )
}