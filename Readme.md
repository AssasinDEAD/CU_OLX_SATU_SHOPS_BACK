# README

Этот документ фиксирует архитектуру, решения и порядок действий для нашего бэкенда задач, матчей и заказов с OLX/Satu, включая безопасные денежные операции, аудит, воспроизводимость через Docker, Nginx, PostgreSQL и RabbitMQ. После завершения каждого модуля мы обновляем README: кратко что сделано, что запланировано дальше, и как это запускать.

---

## Проектовый контекст

- Фронт сообщает задачу: например, «купить швабру» с описанием и количеством.
- Бэк принимает задачу, нормализует спецификации, дергает API маркетплейса (сначала OLX, затем Satu), находит подходящие товары, ранжирует, сохраняет матчи, сверху — самый дешевый.
- Заказ оформляется и сохраняется в БД, с фиксацией курса USD→KZT и поставщика, строгой идемпотентностью, транзакциями, аудитом и понятными ошибками.
- **RabbitMQ** используется как шина сообщений: данные из 1С приходят в очередь, наш бэкенд принимает их, сохраняет задачи и запускает бизнес‑логику.

---

## Что уже сделано

- **Структура папок**: controllers, services, repositories, models, db, utils, middleware, routes, config.
- **Docker план**:
  - docker-compose: api (Node.js на порту 3001), db (PostgreSQL), nginx (reverse proxy), mq (RabbitMQ).
  - Nginx проксирует 80/443 на api:3001.
- **Конфиг окружения**:
  - `src/config/env.js`: загрузка `.env`, дефолты, переменные для JWT, Postgres, OLX/Satu, RabbitMQ, URL источника курса валют.
- **База данных и миграции**:
  - Единый JS‑файл миграций: создаёт таблицы `sources`, `suppliers`, `tasks`, `products`, `task_matches`, `orders`, `idempotency_keys`, `audits`.
  - В `products` и `orders` — поле `usd_kzt_rate NUMERIC(10,4)`.
  - UUID как PK, связи между таблицами, индексы.
  - `pool.js`: подключение к Postgres через `env.js`.
  - `migrations-run.js`: запуск миграций.
- **RabbitMQ**:
  - План: папка `src/mq/` с `connection.js`, `producer.js`, `consumer.js`, `queues.js`.
  - Очередь `tasks_queue`: 1С публикует задачи, наш consumer принимает и сохраняет.
  - Очередь `orders_queue`: после оформления заказа публикуем событие для других систем.
- **Инженерные принципы**:
  - Строгая валидация, `AppError`/`ValidationError`, централизованный error middleware.
  - Полный аудит: таблица `audits` + trace_id.
  - Денежные операции только в транзакциях, с идемпотентными ключами.
  - Деньги храним как NUMERIC/минорные единицы, курс — NUMERIC(10,4).
  - Логи как JSON, процесс не падает из‑за одной ошибки.

---

## Структура папок (сводка)

src/ config/ env.js db/ pool.js, migrations/migrations.js, migrations-run.js mq/ connection.js, producer.js, consumer.js, queues.js routes/ controllers/ services/ repositories/ models/ utils/ middleware/ index.js

---

## Схема БД

- **sources**: источники задач/заявок из 1С/EspoCRM.
- **suppliers**: поставщики, связь с продуктами и заказами.
- **tasks**: входящие задачи с specs, количеством, статусом и idempotency_key.
- **products**: товары с маркетплейсов, нормализованные характеристики, цена, валюта, usd_kzt_rate, supplier_id.
- **task_matches**: результаты матчей задачи к товарам.
- **orders**: оформленные заказы, связь с task/product/supplier, количество, цена, валюта, usd_kzt_rate.
- **idempotency_keys**: защита от повторных операций.
- **audits**: аудит действий и изменений.

---

## Запуск и окружение

- **.env**:
  - NODE_ENV, PORT=3001
  - FRONTEND_URL
  - JWT_SECRET, JWT_EXPIRY
  - PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DATABASE
  - OLX_API_URL, SATU_API_URL
  - CURRENCY_SOURCE_URL
  - RABBITMQ_URL (например, `amqp://mq:5672`)
- **Docker**:
  - api (Node.js, порт 3001)
  - db (PostgreSQL)
  - nginx (reverse proxy)
  - mq (RabbitMQ)
- **Миграции**:
  - `node src/db/migrations-run.js`
- **RabbitMQ**:
  - producer публикует задачи/заказы.
  - consumer слушает очереди и сохраняет данные в БД.

---

## Порядок разработки

1. **Utils**: helpers, errors, logger.
2. **Middleware**: requestId, auth, audit.
3. **Repositories**: SQL‑слой для всех таблиц.
4. **Services**: бизнес‑логика (tasks, products, matches, orders, currency).
5. **RabbitMQ**: connection, producer, consumer.
6. **Controllers + Routes**: HTTP‑слой.
7. **Интеграции**: OLX → products/task_matches, затем Satu.
8. **Обновление README** после каждого модуля.

---

## Качество и безопасность

- Идемпотентность обязательна для всех денежных операций.
- Транзакции во всех сервисах, связанных с деньгами.
- Курсы валют фиксируем в момент создания продукта/заказа.
- Ролевые права и проверка доступа.
- Полноценный аудит и трассировка.
- Логи без утечек чувствительных данных.
- RabbitMQ гарантирует доставку и порядок сообщений между 1С и нашим бэкендом.
