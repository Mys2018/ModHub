# ModHub 

Платформа для безопасной публикации, хранения и управления системными модификациями. Проект спроектирован с упором на строгую изоляцию сервисов, инженерную автономию и отказоустойчивость.

## Технологический стек

### Frontend
- **Core:** React + TypeScript (Vite)
- **State Management:** Zustand (UI-стейты, модальные окна)
- **Data Fetching:** TanStack Query (v5) — синхронизация кэша и оптимистичные обновления.
- **Styling:** CSS Modules.

### Backend & Infrastructure
- **API Gateway:** Nginx (Reverse Proxy, Load Balancer).
- **Core API:** Node.js (Express).
- **Database:** PostgreSQL 15.
- **Object Storage:** MinIO (S3-совместимое хранилище) для хранения архивов.
- **Message Broker:** Apache Kafka — для асинхронной обработки задач.
- **Security:** ClamAV — антивирусное сканирование загружаемых файлов.
- **Orchestration:** Docker & Docker Compose.

## Архитектура системы

Система построена на принципах микросервисной архитектуры с полной изоляцией внутренней сети:
1.  **Сетевой периметр:** Все инфраструктурные порты (DB, S3, Kafka, API) закрыты для внешнего доступа. Доступ к системе осуществляется исключительно через Nginx на порту `80`.
2.  **Процесс загрузки (Async Scan):** - Пользователь загружает мод через React-интерфейс.
    - `core-api` сохраняет файл в MinIO и отправляет событие в Kafka.
    - `scanner-worker` получает событие, сканирует файл через ClamAV и обновляет статус в БД.
3.  **Безопасность:** Авторизация осуществляется с помощью JWT токенов, что не позволяет не авторизированным пользователям загружать и изменять моды

## Быстрый старт

### Требования
- Docker & Docker Compose

### Установка
1. Клонируйте репозиторий:
   ```bash
   git clone [https://github.com/mys2018/modhub.git](https://github.com/Mys2018/ModHub.git)
   cd modhub
   ```
2. Создайте .env в корне проекта и заполните данные:
   ```
   # ============================
    # POSTGRES
    # ============================
    POSTGRES_USER=admin
    POSTGRES_PASSWORD=supersecretpassword
    POSTGRES_DB=modhub
    
    # ============================
    # CORE API
    # ============================
    CORE_API_PORT=3001
    DB_HOST=postgres
    DB_PORT=5432
    JWT_SECRET=999
    
    # ============================
    # KAFKA
    # ============================
    KAFKA_NODE_ID=1
    KAFKA_PROCESS_ROLES=broker,controller
    KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
    KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
    KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
    KAFKA_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
    KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1
    KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1
    
    # ============================
    # MINIO
    # ============================
    MINIO_ROOT_USER=admin
    MINIO_ROOT_PASSWORD=supersecretpassword
    MINIO_BUCKET=mods
   ```
3. Запустите инфраструктуру:
  ```bash
   docker-compose up -d --build
   ```
4. Инициализируйте базу данных:
Выполните SQL-скрипты из папки database/db_tables.sql для создания таблиц users, mods и mod_versions.

## Структура проекта
- ```/client``` — React-приложение (Vite, TS).
- ```/services/core-api``` — Основной API-сервис.
- ```/services/scanner-worker``` — Воркер для антивирусной проверки.
- ```nginx.conf``` — Конфигурация балансировщика и статики.
- ```docker-compose.yml``` — Описание всей инфраструктуры.

## Скриншоты сайта
### Главная страница
<img width="1920" height="912" alt="image" src="https://github.com/user-attachments/assets/c621186c-5652-47f2-83bc-60ccf2bd6502" />

### Страница мода
<img width="1920" height="912" alt="image" src="https://github.com/user-attachments/assets/92c9ab70-a6e5-4add-bb8e-8488c1c09ff0" />

### Профиль пользователя
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/df2c742d-6e9a-4105-8e24-b7fe379af785" />

### Модальные окна загрузки и добавления версии модификации
<img width="1920" height="913" alt="image" src="https://github.com/user-attachments/assets/d21cc7fe-3b47-49ca-8331-3559867da98b" />
<img width="1920" height="912" alt="image" src="https://github.com/user-attachments/assets/7a85ccd2-01dd-401d-99a9-a75f79e9a131" />

### Авторизация
<img width="460" height="520" alt="image" src="https://github.com/user-attachments/assets/4b33f0ec-78f0-4336-ad04-1ea48e634e4c" /> 
<img width="495" height="649" alt="image" src="https://github.com/user-attachments/assets/653591e8-537a-4fb3-8928-9c14f5d4b62b" />






