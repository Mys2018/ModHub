import styles from './LoginPage.module.css'
import {useAuthStore} from "../../../shared/user/model/store";
import {Navigate} from "react-router-dom";
import {useState} from "react";
import {login, register} from "../../../shared/user/api/requests.ts";
import * as React from "react";

export const LoginPage = () => {
  const store = useAuthStore()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const [isLoginMode, setIsLoginMode] = useState(true)

  if (store.status === 'authenticated') {
    return <Navigate to={'/mods'} replace />
  }

  const handleClick = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      if (isLoginMode) {
        const response = await login({ email, password })

        if (response.message === 'Успешный вход') {
          store.setToken(response.token)
          store.setUser(response.user)
          store.setStatus('authenticated')
        } else {
          setMessage('Неверный логин или пароль')
        }
      } else {
        const response = await register({ username, email, password })

        if (response.message === 'Пользователь создан') {
          setMessage('Регистрация успешна! Теперь вы можете войти.')
          setIsLoginMode(true)
          setPassword('')
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Произошла ошибка"
      setMessage(errorMsg)
      console.error(error)
    }
  }

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoginMode(!isLoginMode)
    setMessage('')
    setPassword('')
  }

  return (
      <main className={styles.mainContainer}>

        <form className={styles.form} onSubmit={handleClick}>
          <h3 className={styles.title}>{isLoginMode ? 'Вход' : 'Регистрация'}</h3>

          {!isLoginMode && (
              <div className={styles.usernameForm}>
                <label className={styles.label}>Введите никнейм</label>
                <input
                    id='username'
                    className={styles.input}
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLoginMode}
                />
              </div>
          )}

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

          {message && <p className={styles.messageText}>{message}</p>}

          <p className={styles.registerText}>
            {isLoginMode ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <a href="#" onClick={toggleMode}>
              {isLoginMode ? 'Зарегистрируйтесь' : 'Войдите'}
            </a>
          </p>

          <button className={styles.button} type='submit'>
            {isLoginMode ? 'Вход' : 'Зарегистрироваться'}
          </button>
        </form>

      </main>
  )
}