/**
 * Real API Client для CabrioRide Dashboard
 * Заменяет mock API на реальные запросы к серверу
 */

class RealAPI {
    constructor() {
        // Автоматически определяем URL в зависимости от режима разработки
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.protocol === 'file:';
        
        this.baseUrl = isDevelopment 
            ? 'https://club.cabrioride.by/backend/api.php'  // Удаленный сервер для разработки
            : 'backend/api.php';                           // Локальный сервер для продакшена
        
        console.log(`🔧 API Mode: ${isDevelopment ? 'Development (Remote)' : 'Production (Local)'}`);
        console.log(`🌐 API URL: ${this.baseUrl}`);
    }

    async makeRequest(action, data = null) {
        try {
            const url = `${this.baseUrl}?action=${action}`;
            const options = {
                method: data ? 'POST' : 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Неизвестная ошибка API');
            }

            return result;
        } catch (error) {
            console.error(`API Error (${action}):`, error);
            throw error;
        }
    }

    async getStats() {
        return await this.makeRequest('stats');
    }

    async getMembers() {
        const result = await this.makeRequest('members');
        
        // Обрабатываем данные участников
        if (result.data) {
            result.data = result.data.map(member => {
                // URL фотографии уже обработан в API, не добавляем путь повторно
                
                // Преобразуем статус для совместимости с фронтендом
                if (member.status === 'без авто') {
                    member.status = 'участник';
                }
                
                // Добавляем количество сообщений, если не указано
                if (!member.message_count) {
                    member.message_count = 0;
                }
                
                return member;
            });
        }
        
        return result;
    }

    async getCars() {
        const result = await this.makeRequest('cars');
        
        // Обрабатываем данные автомобилей
        if (result.data) {
            result.data = result.data.map(car => {
                // Фотографии уже обработаны в API, не добавляем путь повторно
                
                // Добавляем отсутствующие поля для совместимости
                if (!car.owner_name && car.member_id) {
                    car.owner_name = 'Неизвестно';
                }
                
                return car;
            });
        }
        
        return result;
    }

    async getInvitations() {
        const result = await this.makeRequest('invitations');
        
        // Обрабатываем данные приглашений
        if (result.data) {
            result.data = result.data.map(invitation => {
                // Фотографии уже обработаны в API, не добавляем путь повторно
                
                // Преобразуем статусы для совместимости
                const statusMap = {
                    'новое': 'приглашение',
                    'на связи': 'приглашение',
                    'встреча назначена': 'приглашение',
                    'встреча проведена': 'приглашение',
                    'вступил в клуб': 'вступил в клуб',
                    'отказ': 'отказ'
                };
                
                if (statusMap[invitation.status]) {
                    invitation.status = statusMap[invitation.status];
                }
                
                return invitation;
            });
        }
        
        return result;
    }

    async getEvents() {
        const result = await this.makeRequest('events');
        
        // Обрабатываем данные событий
        if (result.data) {
            result.data = result.data.map(event => {
                // Обрабатываем фотографии
                if (event.photos) {
                    try {
                        const photos = JSON.parse(event.photos);
                        if (Array.isArray(photos)) {
                            event.photos = JSON.stringify(photos.map(photo => {
                                if (!photo.startsWith('http') && !photo.startsWith('uploads/')) {
                                    return `uploads/events/${photo}`;
                                }
                                return photo;
                            }));
                        }
                    } catch (e) {
                        console.warn('Error parsing event photos:', e);
                    }
                }
                
                return event;
            });
        }
        
        return result;
    }

    async getServices() {
        const result = await this.makeRequest('services');
        
        // Обрабатываем данные сервисов
        if (result.data) {
            result.data = result.data.map(service => {
                // Обрабатываем фотографии
                if (service.photos) {
                    try {
                        const photos = JSON.parse(service.photos);
                        if (Array.isArray(photos)) {
                            service.photos = JSON.stringify(photos.map(photo => {
                                if (!photo.startsWith('http') && !photo.startsWith('uploads/')) {
                                    return `uploads/services/${photo}`;
                                }
                                return photo;
                            }));
                        }
                    } catch (e) {
                        console.warn('Error parsing service photos:', e);
                    }
                }
                
                return service;
            });
        }
        
        return result;
    }

    async verifyUser(userData) {
        return await this.makeRequest('verify_user', userData);
    }
}

// Создаем экземпляр реального API
window.realAPI = new RealAPI();

// НЕ заменяем mockAPI на realAPI, чтобы избежать конфликтов
// window.mockAPI = window.realAPI;

console.log('🔄 Real API initialized - теперь используется реальная база данных!'); 