import styles from './ModLoadPage.module.css'
import {useState} from "react";
import * as React from "react";
import {uploadFile} from "../../../shared/mods/api/requests.ts";
import {useNavigate} from "react-router-dom";

export const ModLoadPage = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [version, setVersion] = useState('')
  const [targetDevice, setTargetDevice] = useState('')
  const [androidVersion, setAndroidVersion] = useState('')

  const navigate = useNavigate()

  const [file, setFile] = useState<File | null>(null)
  const [isLoad, setIsLoad] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()

    if (!title || !file) {
      setMessage('Название и сам мод обязательны')
      return
    }

    setIsLoad(true)

    try {
      const formData = new FormData()

      formData.append('title', title)
      formData.append('description', description)
      formData.append('version', version)
      formData.append('targetDevice', targetDevice)
      formData.append('androidVersion', androidVersion)

      formData.append('mod_file', file)

      const response = await uploadFile(formData)
      if (response.status == 201) {
        console.log('Загрузка прошла успешно, теперь мод на проверке')

        setTitle('');
        setDescription('');
        setVersion('');
        setTargetDevice('');
        setAndroidVersion('');
        setFile(null);

        navigate('/')
      }

    } catch (e) {
      console.error(e);
      setMessage('Ошибка загрузки мода');
    } finally {
      setIsLoad(false)
    }
  }

  return (
      <section className={styles.mainContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>

          <h3>Загрузка мода</h3>

          <div className={styles.info}>
            <div className={styles.mainInfo}>
              <div className={styles.name}>
                <label className={styles.label}>Название</label>
                <input
                    id='name'
                    className={styles.input}
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.description}>
                <label className={styles.label}>Описание</label>
                <textarea
                    id='description'
                    className={`${styles.input} ${styles.textarea}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.secondInfo}>
              <div className={styles.version}>
                <label className={styles.label}>Версия</label>
                <input
                    id='version'
                    className={styles.input}
                    type='text'
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                />
              </div>

              <div className={styles.targetDevice}>
                <label className={styles.label}>Устройство</label>
                <input
                    id='targetDevice'
                    className={styles.input}
                    type='text'
                    value={targetDevice}
                    onChange={(e) => setTargetDevice(e.target.value)}
                />
              </div>

              <div className={styles.androidVersion}>
                <label className={styles.label}>Версия OS</label>
                <input
                    id='androidVersion'
                    className={styles.input}
                    type='text'
                    value={androidVersion}
                    onChange={(e) => setAndroidVersion(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.file}>
            <label className={styles.label}>Загрузите файл</label>
            <input
                id='name'
                className={styles.inputFile}
                type='file'
                accept='.zip,.rar,.7z'
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                required
            />
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.button} type='submit'>
              {isLoad ? "Загрузка на сервер" : "Отправить на проверку" }
            </button>
            <label className={styles.message}>{message}</label>
          </div>
        </form>
      </section>
  )
}