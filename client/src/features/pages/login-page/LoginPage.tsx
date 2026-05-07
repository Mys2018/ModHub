import styles from './LoginPage.module.css'
import {useAuthStore} from "../../../shared/user/model/store";
import {Navigate} from "react-router-dom";
import {useState} from "react";
import {login} from "../../../shared/user/api/requests.ts";
import * as React from "react";

export const LoginPage = () => {
  const store = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (store.status === 'authenticated') {
    return <Navigate to={'/mods'} replace />
  }

  const handleClick = async (e: React.SubmitEvent) => {
    e.preventDefault()

    try {
      const response = await login(
          {
            email: email,
            password: password
          }
      )

      store.setToken(response.token)
      store.setUser(response.user)

      console.log(response)

      if (response.message === 'Успешный вход') {
        store.setStatus('authenticated')
      } else {
        console.log('Неверный логин или пароль')
      }

    } catch (e) {
      console.log("Ошибка входа")
    }
  }

  return (
      <main className={styles.mainContainer}>

        <form className={styles.form} onSubmit={handleClick}>
          <h1 className={styles.title}>Вход</h1>
          <div className={styles.emailForm}>
            <label className={styles.label}>Введите почту</label>
            <input
                id='email'
                className={styles.input}
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.passwordForm}>
            <label className={styles.label}>Введите пароль</label>
            <input
                id='password'
                className={styles.input}
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className={styles.button} type='submit'>
            Вход
          </button>
        </form>

      </main>
  )
}