# Реестр бетонных заводов Крыма

Веб-приложение для управления информацией о бетонных заводах Крыма с интерактивной картой и фильтрацией.

## Технологии

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **База данных**: PostgreSQL (Neon)
- **Карта**: Leaflet
- **Хранилище фото**: Replit Object Storage

## Деплой на Timeweb

### 1. Подготовка GitHub репозитория

1. Создайте новый репозиторий на GitHub
2. Загрузите весь проект в репозиторий
3. **Важно**: Файл `.env` автоматически исключён из Git (в `.gitignore`)

### 2. Создание проекта в Timeweb

1. Войдите в панель Timeweb
2. Перейдите в раздел "Приложения" → "Создать приложение"
3. Выберите "Node.js приложение"
4. Подключите GitHub аккаунт
5. Выберите ваш репозиторий
6. Настройки деплоя:
   - **Build command**: `npm install && npm run build`
   - **Start command**: `npm start`
   - **Node version**: 20.x

### 3. Настройка переменных окружения в Timeweb

В разделе "Переменные окружения" добавьте:

```
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=your-secret-key-here
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your-bucket-id
PUBLIC_OBJECT_SEARCH_PATHS=your-search-paths
PRIVATE_OBJECT_DIR=your-private-dir
PGHOST=ep-xxx.aws.neon.tech
PGPORT=5432
PGUSER=neondb_owner
PGPASSWORD=your-password
PGDATABASE=neondb
```

**Где взять значения:**
- Все переменные можно скопировать из настроек вашего проекта на Replit
- `DATABASE_URL` - из секретов Replit
- Object Storage переменные - из секретов Replit

### 4. Настройка автодеплоя

1. В настройках проекта Timeweb включите "Автодеплой при push"
2. Теперь при каждом `git push` в GitHub проект автоматически обновится на Timeweb

### 5. Привязка .ru домена

1. В панели Timeweb перейдите в "Домены"
2. Добавьте ваш .ru домен
3. Привяжите домен к созданному приложению
4. Настройте DNS записи у вашего регистратора домена:
   - Добавьте A-запись или CNAME на серверы Timeweb (Timeweb покажет нужные значения)

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm start
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

## Структура проекта

- `client/` - React frontend
- `server/` - Express backend
- `shared/` - Общие типы и схемы
- `db/` - Миграции и схемы базы данных

## Возможные проблемы

### База данных недоступна из РФ
Если Neon заблокирован в РФ, создайте PostgreSQL базу данных на Timeweb:
1. Создайте базу данных PostgreSQL в Timeweb
2. Замените `DATABASE_URL` на адрес новой БД
3. Выполните миграции: `npm run db:push`

### Object Storage недоступен
Если Replit Object Storage заблокирован:
1. Настройте Timeweb S3 хранилище
2. Обновите код для работы с S3
