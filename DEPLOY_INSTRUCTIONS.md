# Пошаговая инструкция: GitHub → Timeweb → .ru домен

## Шаг 1: Выгрузка на GitHub

### Вариант А: Через интерфейс Replit (самый простой)

1. В Replit нажмите кнопку "Version Control" (слева)
2. Нажмите "Create a Git Repo"
3. Нажмите "Connect to GitHub"
4. Выберите "Create new repository"
5. Введите название репозитория (например, `crimea-factories`)
6. Выберите "Public" или "Private"
7. Нажмите "Create"
8. Готово! Проект загружен на GitHub

### Вариант Б: Через Git команды

```bash
# В Shell Replit выполните:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_USERNAME/ВАШ_РЕПОЗИТОРИЙ.git
git push -u origin main
```

## Шаг 2: Настройка Timeweb

### 2.1 Создание приложения

1. Откройте https://timeweb.cloud/
2. Войдите в аккаунт
3. Перейдите: **Приложения** → **Создать приложение**
4. Выберите: **Node.js приложение**

### 2.2 Подключение GitHub

1. Нажмите **"Подключить Git репозиторий"**
2. Авторизуйте Timeweb в вашем GitHub аккаунте
3. Выберите репозиторий из списка
4. Выберите ветку: **main**

### 2.3 Настройка команд

- **Build command**: `npm install && npm run build`
- **Start command**: `npm start`
- **Node version**: `20.x`
- **Root directory**: `/` (оставить пустым)

### 2.4 Переменные окружения

Скопируйте все переменные из Replit. В Replit откройте "Secrets" (замок слева), скопируйте значения:

В Timeweb добавьте переменные:

| Переменная | Где взять в Replit |
|------------|-------------------|
| `DATABASE_URL` | Secrets → DATABASE_URL |
| `SESSION_SECRET` | Secrets → SESSION_SECRET |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Secrets → DEFAULT_OBJECT_STORAGE_BUCKET_ID |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Secrets → PUBLIC_OBJECT_SEARCH_PATHS |
| `PRIVATE_OBJECT_DIR` | Secrets → PRIVATE_OBJECT_DIR |
| `PGHOST` | Secrets → PGHOST |
| `PGPORT` | Secrets → PGPORT |
| `PGUSER` | Secrets → PGUSER |
| `PGPASSWORD` | Secrets → PGPASSWORD |
| `PGDATABASE` | Secrets → PGDATABASE |

**Важно**: `PORT` добавлять НЕ нужно - Timeweb сам установит нужный порт!

### 2.5 Запуск

1. Нажмите **"Создать приложение"**
2. Timeweb начнёт деплой (3-5 минут)
3. После завершения получите адрес приложения

## Шаг 3: Автодеплой из GitHub

1. В панели Timeweb откройте ваше приложение
2. Перейдите в раздел **"Настройки"**
3. Найдите **"Автодеплой"**
4. Включите переключатель **"Деплоить при push в main"**
5. Готово! Теперь при каждом `git push` проект обновится автоматически

## Шаг 4: Привязка .ru домена

### 4.1 В Timeweb

1. Откройте раздел **"Домены"**
2. Нажмите **"Добавить домен"**
3. Введите ваш домен (например, `zavody-crimea.ru`)
4. Timeweb покажет DNS записи для настройки

### 4.2 У регистратора домена

1. Войдите в панель управления доменом (Reg.ru, Nic.ru и т.д.)
2. Перейдите в **"DNS настройки"**
3. Добавьте записи, которые показал Timeweb:
   
   **Если Timeweb дал A-запись:**
   ```
   Тип: A
   Имя: @
   Значение: XXX.XXX.XXX.XXX (IP от Timeweb)
   ```
   
   **Если Timeweb дал CNAME:**
   ```
   Тип: CNAME
   Имя: @
   Значение: xxxxxxx.timeweb.cloud
   ```

4. Сохраните изменения
5. Подождите 1-24 часа (обычно 10-30 минут)

### 4.3 Проверка

1. Откройте ваш домен в браузере
2. Должен открыться ваш сайт
3. Готово! 🎉

## Шаг 5: Обновление проекта

Теперь для обновления сайта:

1. Внесите изменения в Replit
2. В Version Control нажмите "Commit & Push"
3. Введите описание изменений
4. Нажмите "Commit"
5. Timeweb автоматически обновит сайт (1-2 минуты)

## Проверка работы

### Если сайт не открывается:

1. **Проверьте логи** в Timeweb (раздел "Логи")
2. **Проверьте переменные окружения** - все должны быть заполнены
3. **Проверьте команду запуска** - должно быть `npm start`

### Если БД недоступна из РФ:

1. Создайте PostgreSQL в Timeweb
2. Замените `DATABASE_URL` на новую БД
3. Выполните в Shell Replit: `npm run db:push` (чтобы создать таблицы)
4. Экспортируйте данные из старой БД и импортируйте в новую

### Если фотографии не загружаются:

1. Object Storage Replit может быть заблокирован в РФ
2. Настройте S3 хранилище в Timeweb
3. Обновите код для работы с новым S3

## Готово!

Ваш сайт теперь:
- ✅ Доступен пользователям из РФ
- ✅ Работает на .ru домене
- ✅ Автоматически обновляется при изменениях в GitHub
- ✅ Имеет резервную копию на GitHub
