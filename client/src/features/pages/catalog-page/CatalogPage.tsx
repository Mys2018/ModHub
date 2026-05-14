import styles from './CatalogPage.module.css'
import {getAllMods} from "../../../shared/mods/api/requests.ts";
import {useQuery} from "@tanstack/react-query";
import {ModSlot} from "../../../shared/mods/ui/mod-slot/ModSlot.tsx";
import type {Mod} from "../../../shared/mods/model/types.ts";
import {useNavigate} from "react-router-dom";
import {Search} from "../../../shared/ui/search/Search.tsx";
import {useState} from "react";


export const CatalogPage = () => {
  const [valueSearch, setValueSearch] = useState('')

  const mods = useQuery({
    queryKey: ['mods'],
    queryFn: getAllMods
  })

  const modsArray = mods.data?.data || []

  const filteredMods = modsArray.filter((mod: Mod) => {
    if (!valueSearch.trim()) return true

    const searchLower = valueSearch.toLowerCase()

    return (
        mod.title.toLowerCase().trim().includes(searchLower) ||
        mod.author_name.toLowerCase().includes(searchLower)
    )
  })

  const navigate = useNavigate()

  if (mods.isLoading) return <main className={styles.mainContainer}>Загрузка...</main>
  if (mods.isError) return <main className={styles.mainContainer}>Ошибка загрузки каталога</main>

  // console.log(mods.data)
  return (
      <main className={styles.mainContainer}>
        <div className={styles.catalogContainer}>
          <h2 className={styles.title}>Каталог</h2>
          <Search
              value={valueSearch}
              onChange={(e) => {setValueSearch(e.target.value)}}
              placeholder={'Введите имя мода или автора...'}/>
          <div className={styles.modGrid}>
            {filteredMods.map((mod: Mod) => {
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
        </div>
      </main>
  )
}
