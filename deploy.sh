#!/bin/bash

# Скрипт для автоматического деплоя на сервере
# Использование: ./deploy.sh [branch_name]

echo "🚀 Начинаем деплой..."

# Проверяем аргументы
BRANCH=${1:-main}
echo "📋 Ветка: $BRANCH"

# Переходим в директорию проекта
cd /path/to/your/project

# Проверяем статус
echo "📊 Проверяем статус Git..."
git status

# Переключаемся на нужную ветку
echo "🔄 Переключаемся на ветку $BRANCH..."
git checkout $BRANCH

# Пул изменений
echo "⬇️ Пулим изменения..."
git pull origin $BRANCH

# Проверяем результат
echo "✅ Проверяем результат..."
git log --oneline -3

echo "🎉 Деплой завершен!" 