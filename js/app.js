/**
 * CabrioRide Dashboard - Vanilla JavaScript Application
 * Mobile-first SPA for club members management
 */

class CabrioRideApp {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'dashboard';
        this.data = {
            stats: null,
            members: [],
            cars: [],
            invitations: [],
            events: [],
            services: []
        };
        this.filters = {
            members: { name: '', city: '', status: '' },
            cars: { brand: '', number: '', owner: '', year: '' },
            invitations: { number: '', inviter: '', brand: '', status: '' },
            events: { title: '', city: '', type: '', status: '' },
            services: { name: '', city: '', type: '', recommendation: '' }
        };
        this.filteredData = {
            members: [],
            cars: [],
            invitations: [],
            events: [],
            services: []
        };
        this.currentPhotos = [];
        this.currentPhotoIndex = 0;
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing CabrioRide app...');
            
            // Проверяем режим разработки
            const urlParams = new URLSearchParams(window.location.search);
            const isTestMode = urlParams.has('test');
            
            if (isTestMode) {
                console.log('🔧 Тестовый режим активирован - пропускаем авторизацию');
                this.testMode = true;
                this.showLoading();
                
                // Создаем тестового пользователя
                this.currentUser = {
                    id: 'test_user',
                    first_name: 'Тестовый',
                    last_name: 'Пользователь',
                    username: 'test_user',
                    photo_url: null
                };
                
                // Инициализируем API
                this.api = window.realAPI || window.mockAPI;
                
                // Загружаем данные
                console.log('🔧 Тестовый режим: загружаем данные...');
                await this.loadAllData();
                console.log('🔧 Тестовый режим: данные загружены');
                
                // Показываем приложение
                await this.showApp();
                this.hideLoading();
                return;
            }
            
            // Инициализируем API
            this.api = window.realAPI || window.mockAPI;
            
            // Проверяем флаг принудительной авторизации через Telegram
            const forceTelegramAuth = localStorage.getItem('force_telegram_auth');
            if (forceTelegramAuth === 'true') {
                console.log('🔒 Обнаружен флаг принудительной авторизации через Telegram');
                console.log('🚫 Блокируем автоматическую авторизацию');
                this.clearStoredUser();
                this.showLogin();
                return;
            }
            
            // Проверяем URL параметры для автоматической авторизации
            const hasAutoAuth = await this.handleAutoAuth();
            if (hasAutoAuth) {
                return; // Авто-авторизация обработана
            }
            
            // Проверяем сохраненного пользователя
            const storedUser = this.getStoredUser();
            if (storedUser) {
                console.log('🔍 Найден сохраненный пользователь:', storedUser.first_name);
                
                // Проверяем время последней авторизации (24 часа)
                const authTimestamp = localStorage.getItem('auth_timestamp');
                if (authTimestamp) {
                    const authTime = parseInt(authTimestamp);
                    const currentTime = Date.now();
                    const timeDiff = currentTime - authTime;
                    const maxAge = 24 * 60 * 60 * 1000; // 24 часа
                    
                    if (timeDiff > maxAge) {
                        console.log('⏰ Данные пользователя устарели (24+ часов), очищаем...');
                        this.clearStoredUser();
                        this.showLogin();
                        return;
                    } else {
                        console.log(`✅ Данные пользователя актуальны (${Math.round(timeDiff / 1000 / 60)} минут назад)`);
                    }
                }
                
                console.log('🔐 Проверяем доступ сохраненного пользователя...');
                this.showLoading();
                
                try {
                    // ВСЕГДА проверяем актуальный статус
                    const response = await this.verifyUser(storedUser);
                    console.log('Stored user verification:', response);
                    
                    if (response.success && response.data.access) {
                        // Доступ разрешен
                        this.currentUser = storedUser;
                        await this.showApp();
                        console.log('✅ Access granted for stored user');
                    } else {
                        // Доступ запрещен - статус изменился
                        console.log('❌ Access denied for stored user, status changed');
                        const status = response.data?.status || 'неизвестный';
                        const message = response.data?.message || 'Ваш статус изменился. Доступ запрещен.';
                        
                        this.clearStoredUser();
                        this.showAccessDenied(status, message);
                    }
                } catch (error) {
                    console.error('❌ Error verifying stored user:', error);
                    this.clearStoredUser();
                    this.showError('Ошибка проверки доступа. Попробуйте авторизоваться заново.');
                    this.showLogin();
                }
                
                this.hideLoading();
        } else {
                // Нет сохраненного пользователя
                console.log('No stored user found');
            this.showLogin();
        }
        
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError('Ошибка инициализации приложения');
            this.showLogin();
        }
    }

    setupEventListeners() {
        // Telegram login button (legacy - теперь используется Widget)
        const telegramBtn = document.getElementById('telegram-login-btn');
        if (telegramBtn) {
            telegramBtn.addEventListener('click', () => this.handleTelegramLogin());
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Unlink account button
        const unlinkBtn = document.getElementById('unlink-btn');
        console.log('🔍 Ищем кнопку отвязки аккаунта:', unlinkBtn);
        if (unlinkBtn) {
            console.log('✅ Кнопка отвязки найдена, добавляем обработчик');
            unlinkBtn.addEventListener('click', () => {
                console.log('🔗 Кнопка отвязки аккаунта нажата');
                this.unlinkAccount();
            });
        } else {
            console.warn('❌ Кнопка отвязки аккаунта не найдена');
        }

        // Add buttons
        const addCarBtn = document.getElementById('btn-add-car');
        if (addCarBtn) {
            addCarBtn.addEventListener('click', () => this.showAddCarModal());
        }

        const addInvitationBtn = document.getElementById('btn-add-invitation');
        if (addInvitationBtn) {
            addInvitationBtn.addEventListener('click', () => this.showAddInvitationModal());
        }

        const addEventBtn = document.getElementById('btn-add-event');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => this.showAddEventModal());
        }

        const addServiceBtn = document.getElementById('btn-add-service');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => this.showAddServiceModal());
        }

        // Profile button
        const profileBtn = document.getElementById('btn-profile');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.showProfileModal());
        }

        // Navigation tabs
        document.querySelectorAll('.nav-btn').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                if (tab) {
                this.switchTab(tab);
                }
            });
        });

        // Filter toggles
        document.querySelectorAll('.filter-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const filterCard = toggle.closest('.filter-card');
                if (filterCard) {
                    filterCard.classList.toggle('expanded');
                }
            });
        });

        // Clear filter buttons
        document.querySelectorAll('.clear-filters-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const section = btn.id.replace('clear-', '').replace('-filters', '');
                this.clearFilters(section);
            });
        });

        // Photo modal close
        const modal = document.getElementById('photo-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
                    this.closePhotoModal();
                }
            });

            // Photo navigation
            const prevBtn = document.getElementById('modal-prev');
            const nextBtn = document.getElementById('modal-next');
            
            if (prevBtn) prevBtn.addEventListener('click', () => this.prevPhoto());
            if (nextBtn) nextBtn.addEventListener('click', () => this.nextPhoto());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('photo-modal');
            if (modal && !modal.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    this.closePhotoModal();
                } else if (e.key === 'ArrowLeft') {
                    this.prevPhoto();
                } else if (e.key === 'ArrowRight') {
                    this.nextPhoto();
                }
            }
        });

        // Header search button
        const headerSearchBtn = document.getElementById('header-search-btn');
        if (headerSearchBtn) {
            headerSearchBtn.addEventListener('click', () => this.openModal('check-number-modal'));
        }
    }

    setupFilterListeners() {
        console.log('🔧 Настраиваем обработчики фильтров...');
        
        // Filter toggles - настраиваем переключение фильтров
        const filterToggles = document.querySelectorAll('.filter-toggle');
        console.log('Найдено элементов filter-toggle:', filterToggles.length);
        
        filterToggles.forEach((toggle, index) => {
            console.log(`Настраиваем toggle ${index}:`, toggle);
            
            // Удаляем старые обработчики
            toggle.removeEventListener('click', toggle._filterToggleHandler);
            
            // Создаем новый обработчик
            toggle._filterToggleHandler = () => {
                const filterCard = toggle.closest('.filter-card');
                if (filterCard) {
                    filterCard.classList.toggle('expanded');
                    console.log('Filter toggle clicked:', filterCard.classList.contains('expanded'));
                } else {
                    console.error('Не найден .filter-card для toggle:', toggle);
                }
            };
            
            // Добавляем обработчик
            toggle.addEventListener('click', toggle._filterToggleHandler);
        });

        // Clear filter buttons
        const clearButtons = document.querySelectorAll('.clear-filters-btn');
        console.log('Найдено кнопок clear-filters-btn:', clearButtons.length);
        
        clearButtons.forEach(btn => {
            // Удаляем старые обработчики
            btn.removeEventListener('click', btn._clearFilterHandler);
            
            // Создаем новый обработчик
            btn._clearFilterHandler = (e) => {
                e.stopPropagation();
                const section = btn.id.replace('clear-', '').replace('-filters', '');
                this.clearFilters(section);
            };
            
            // Добавляем обработчик
            btn.addEventListener('click', btn._clearFilterHandler);
        });

        // Members filters
        const memberFilters = ['member-name-filter', 'member-city-filter', 'member-status-filter'];
        memberFilters.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.applyFilters('members'));
                element.addEventListener('change', () => this.applyFilters('members'));
            } else {
                console.warn('Не найден элемент фильтра:', id);
            }
        });

        // Cars filters
        const carFilters = ['car-brand-filter', 'car-number-filter', 'car-owner-filter', 'car-year-filter'];
        carFilters.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.applyFilters('cars'));
            } else {
                console.warn('Не найден элемент фильтра:', id);
            }
        });

        // Invitations filters
        const invitationFilters = ['invitation-number-filter', 'invitation-inviter-filter', 'invitation-brand-filter', 'invitation-status-filter'];
        invitationFilters.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.applyFilters('invitations'));
                element.addEventListener('change', () => this.applyFilters('invitations'));
            } else {
                console.warn('Не найден элемент фильтра:', id);
            }
        });

        // Events filters
        const eventFilters = ['event-title-filter', 'event-city-filter', 'event-type-filter', 'event-status-filter'];
        eventFilters.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.applyFilters('events'));
                element.addEventListener('change', () => this.applyFilters('events'));
            } else {
                console.warn('Не найден элемент фильтра:', id);
            }
        });

        // Services filters
        const serviceFilters = ['service-name-filter', 'service-city-filter', 'service-type-filter', 'service-recommendation-filter'];
        serviceFilters.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.applyFilters('services'));
                element.addEventListener('change', () => this.applyFilters('services'));
            } else {
                console.warn('Не найден элемент фильтра:', id);
            }
        });
        
        console.log('✅ Обработчики фильтров настроены');
    }

    setupPhotoModal() {
        const modal = document.getElementById('photo-modal');
        const overlay = modal?.querySelector('.modal-overlay');
        const closeBtn = modal?.querySelector('.modal-close');
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');

        if (overlay) overlay.addEventListener('click', () => this.closePhotoModal());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closePhotoModal());
        if (prevBtn) prevBtn.addEventListener('click', () => this.showPrevPhoto());
        if (nextBtn) nextBtn.addEventListener('click', () => this.showNextPhoto());

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
                this.closePhotoModal();
            }
        });
    }

    async handleAutoAuth() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Проверяем URL параметр для принудительной авторизации разработки
        const devAuth = urlParams.get('dev_auth');
        if (devAuth) {
            console.log('🔧 Dev auth parameter detected');
            return await this.autoAuthForDev();
        }
        
        // Проверяем обычные данные авторизации из URL
        const authData = urlParams.get('auth');
        if (authData) {
            console.log('URL auth data found, processing...');
            try {
                const userData = JSON.parse(decodeURIComponent(authData));
                console.log('Auto-auth data received:', userData);
                
                const response = await this.verifyUser(userData);
                if (response.success && response.data.access) {
                    this.currentUser = userData;
                    this.storeUser(userData);
                    await this.showApp();
                    
                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    console.error('Auto-auth failed:', response);
                    this.clearStoredUser();
                    this.showLogin();
                }
            } catch (error) {
                console.error('Auto-auth error:', error);
                this.clearStoredUser();
                this.showLogin();
            }
            
            this.hideLoading();
            return true; // Указываем, что обработали URL auth
        }
        
        // Проверяем автоматическую авторизацию для разработческой среды
        if (this.isDevMode) {
            console.log('🔧 Development mode detected - attempting auto auth');
            return await this.autoAuthForDev();
        }
        
        return false; // Нет данных для авторизации
    }

    // Проверка режима разработки
    get isDevMode() {
        // Проверяем URL параметр для принудительной авторизации
        if (window.location.search.includes('dev_auth')) {
            return true;
        }
        
        // Проверяем локальную разработку
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.protocol === 'file:';
        
        // Проверяем поддомен разработки (если есть)
        const isDevSubdomain = window.location.hostname.includes('dev.') || 
                              window.location.hostname.includes('test.');
        
        return isLocalhost || isDevSubdomain;
    }

    // Автоматическая авторизация для разработки
    async autoAuthForDev() {
        console.log('🔧 Attempting auto auth for development...');
        
        try {
            // Создаем тестового пользователя для разработки
            const devUser = {
                id: 287536885, // ID из конфигурации (ADMIN_IDS)
                first_name: 'Разработчик',
                last_name: 'CabrioRide',
                username: 'dev_cabrio',
                photo_url: null,
                status: 'активный',
                member_id: 1
            };
            
            // Проверяем пользователя через API
            const response = await this.verifyUser(devUser);
            console.log('Dev auth response:', response);
            
            if (response.success && response.data.access) {
                console.log('✅ Auto auth successful');
                this.currentUser = devUser;
                this.storeUser(devUser);
                await this.showApp();
                
                // Показываем уведомление о режиме разработки
                this.showNotification('🔧 Режим разработки: автоматическая авторизация', 'info');
                
                return true;
            } else {
                console.log('❌ Auto auth failed - user not found or no access');
                return false;
            }
        } catch (error) {
            console.error('❌ Auto auth error:', error);
            return false;
        }
    }

    async handleTelegramLogin() {
        // Эта функция теперь не используется - авторизация через Telegram Widget
        console.log('Legacy telegram login called - redirecting to widget');
        this.showError('Используйте кнопку "Войти через Telegram" ниже');
    }

    // Новый обработчик для реального Telegram Widget
    async handleTelegramAuth(telegramUser) {
        console.log('🔐 Telegram auth received:', telegramUser);
        this.showLoading();
        
        try {
            // Проверяем, что получили корректные данные от Telegram
            if (!telegramUser || !telegramUser.id) {
                throw new Error('Некорректные данные от Telegram');
            }
            
            // Проверяем, не изменился ли пользователь
            const storedUser = this.getStoredUser();
            if (storedUser && storedUser.id !== telegramUser.id) {
                console.log('🔄 Обнаружена смена пользователя, очищаем старые данные...');
                console.log('Старый пользователь:', storedUser.id, storedUser.first_name);
                console.log('Новый пользователь:', telegramUser.id, telegramUser.first_name);
                
                // Полная очистка данных предыдущего пользователя
                this.clearStoredUser();
                this.currentUser = null;
                
                // Показываем уведомление о смене пользователя
                this.showNotification(`Выполнен вход под пользователем ${telegramUser.first_name}`, 'info');
            }
            
            // Обязательная проверка статуса пользователя
            const response = await this.verifyUser(telegramUser);
            console.log('User verification response:', response);

            if (response.success && response.data.access) {
                // Пользователь имеет доступ
                this.currentUser = telegramUser;
                this.storeUser(telegramUser);
                
                // Снимаем флаг принудительной авторизации после успешной авторизации
                localStorage.removeItem('force_telegram_auth');
                console.log('🔓 Снят флаг принудительной авторизации через Telegram');
                
                console.log('✅ Доступ разрешен, показываем приложение...');
                await this.showApp();
                console.log('✅ Access granted for user:', telegramUser.first_name);
            } else {
                // Доступ запрещен
                const status = response.data?.status || 'неизвестный';
                const message = response.data?.message || 'Доступ запрещен';
                
                console.log('❌ Access denied:', { status, message });
                this.showAccessDenied(status, message);
                this.clearStoredUser();
            }
        } catch (error) {
            console.error('❌ Auth error:', error);
            
            // Улучшенная обработка ошибок
            let errorMessage = 'Ошибка проверки доступа. Попробуйте позже.';
            
            if (error.message.includes('HTTP 404')) {
                errorMessage = 'Сервер недоступен. Проверьте подключение к интернету.';
            } else if (error.message.includes('HTTP 500')) {
                errorMessage = 'Ошибка сервера. Попробуйте позже.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Нет подключения к серверу. Проверьте интернет.';
            } else if (error.message.includes('Некорректные данные')) {
                errorMessage = 'Ошибка авторизации через Telegram. Попробуйте еще раз.';
            }
            
            this.showError(errorMessage);
            this.clearStoredUser();
            this.showLogin();
        } finally {
            this.hideLoading();
        }
    }

    logout() {
        console.log('User logout - clearing session but keeping account linked');
        // Очищаем только сессию, но оставляем связь аккаунта
        this.currentUser = null;
        sessionStorage.clear();
        this.showLogin();
    }

    unlinkAccount() {
        console.log('🔗 Начинаем процесс отвязки аккаунта...');
        console.log('🔍 Текущий пользователь:', this.currentUser);
        
        // Проверяем, есть ли активный пользователь
        if (!this.currentUser) {
            console.log('❌ Нет активного пользователя для отвязки');
            this.showError('Нет активного аккаунта для отвязки');
            return;
        }
        
        const userName = this.currentUser.first_name || 'Пользователь';
        console.log(`👤 Отвязываем аккаунт пользователя: ${userName}`);
        
        if (confirm(`Вы уверены, что хотите отвязать аккаунт Telegram (${userName})?\n\nВам потребуется заново авторизоваться через Telegram для доступа к сайту.`)) {
            console.log('✅ Пользователь подтвердил отвязку аккаунта');
            
            try {
                // Устанавливаем флаг принудительной авторизации
                localStorage.setItem('force_telegram_auth', 'true');
                console.log('🔒 Установлен флаг принудительной авторизации через Telegram');
                
                // Полная очистка всех данных
                this.clearStoredUser();
                console.log('✅ Данные пользователя очищены');
                
                // Очищаем текущего пользователя
                this.currentUser = null;
                console.log('✅ Текущий пользователь очищен');
                
                // Очищаем sessionStorage
                sessionStorage.clear();
                console.log('✅ SessionStorage очищен');
                
                // Показываем экран входа
                this.showLogin();
                console.log('✅ Показываем экран входа');
                
                // Показываем уведомление об успешной отвязке
                setTimeout(() => {
                    this.showNotification('Аккаунт успешно отвязан. Для повторного доступа авторизуйтесь через Telegram.', 'success');
                }, 500);
                
                console.log('✅ Процесс отвязки аккаунта завершен');
                
            } catch (error) {
                console.error('❌ Ошибка при отвязке аккаунта:', error);
                this.showError('Ошибка при отвязки аккаунта. Попробуйте еще раз.');
            }
        } else {
            console.log('❌ Пользователь отменил отвязку аккаунта');
        }
    }

    async showApp() {
        console.log('🚀 Показываем приложение...');
        
        // Получаем member_id текущего пользователя
        if (this.currentUser && !this.currentUser.member_id) {
            this.currentUser.member_id = await this.getCurrentMemberId();
            console.log('Получен member_id:', this.currentUser.member_id);
        }
        
        // Показываем тестовый режим если нужно
        if (this.isTestMode) {
            this.showTestModeIndicator();
        }
        
        // Обновляем информацию о пользователе
        this.updateUserInfo();
        
        // Загружаем все данные
        await this.loadAllData();
        
        // Показываем приложение
        const loginScreen = document.getElementById('login-screen');
        const app = document.getElementById('app');
        
        console.log('Элементы интерфейса:', { loginScreen, app });
        
        if (loginScreen && app) {
            loginScreen.classList.add('hidden');
            app.classList.remove('hidden');
            console.log('✅ Интерфейс переключен');
        } else {
            console.error('❌ Не найдены необходимые элементы: login-screen или app');
        }
        
        // Настраиваем обработчики событий ПОСЛЕ показа приложения
        this.setupEventListeners();
        
        // Настраиваем модальное окно проверки номера
        this.setupCheckNumberModal();
        
        // Настраиваем обработчики фильтров после загрузки данных
        this.setupFilterListeners();
        
        // Активируем первую вкладку
        console.log('🔄 Активируем вкладку stats...');
        this.switchTab('stats');
        
        console.log('✅ Приложение загружено');
    }

    showLogin() {
        const loginScreen = document.getElementById('login-screen');
        const app = document.getElementById('app');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loginScreen && app && loadingScreen) {
            loadingScreen.classList.add('hidden');
            app.classList.add('hidden');
            loginScreen.classList.remove('hidden');
            
            // Очищаем предыдущие сообщения об ошибках
            const existingError = loginScreen.querySelector('.access-denied-message');
            if (existingError) {
                existingError.remove();
            }
            
            const existingErrorMsg = loginScreen.querySelector('.error-message');
            if (existingErrorMsg) {
                existingErrorMsg.remove();
            }
        }
    }

    showLoading() {
        document.getElementById('loading-screen')?.classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-screen')?.classList.add('hidden');
    }

    updateUserInfo() {
        console.log('Updating user info for:', this.currentUser);
        
        if (!this.currentUser) {
            console.log('No current user, skipping user info update');
            return;
        }

        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userNickname = document.getElementById('user-nickname');

        if (userAvatar) {
            // Проверяем, есть ли фото профиля в данных пользователя
            if (this.currentUser.photo_url) {
                console.log('Loading Telegram profile photo:', this.currentUser.photo_url);
                
                // Создаем изображение для аватара
                const img = document.createElement('img');
                img.src = this.currentUser.photo_url;
                img.alt = 'Profile Photo';
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid var(--border-accent);
                `;
                
                // Очищаем содержимое и добавляем изображение
                userAvatar.innerHTML = '';
                userAvatar.appendChild(img);
                
                // Обработка ошибки загрузки изображения
                img.onerror = () => {
                    console.warn('Failed to load profile photo, falling back to initials');
                    this.setAvatarInitials(userAvatar);
                };
            } else {
                console.log('No profile photo available, using initials');
                this.setAvatarInitials(userAvatar);
            }
        }

        if (userName) {
            const fullName = `${this.currentUser.first_name} ${this.currentUser.last_name || ''}`.trim();
            userName.textContent = fullName;
            console.log('Set user name:', fullName);
        }

        if (userNickname) {
            const nickname = this.currentUser.username || this.currentUser.nickname;
            if (nickname) {
                userNickname.textContent = `@${nickname}`;
                console.log('Set user nickname:', nickname);
            } else {
                userNickname.textContent = '';
                console.log('No nickname available');
            }
        }
    }

    setAvatarInitials(avatarElement) {
        const initials = this.getInitials(
            this.currentUser.first_name, 
            this.currentUser.last_name
        );
        avatarElement.innerHTML = initials;
        console.log('Set avatar initials:', initials);
    }

    async loadAllData() {
        try {
            console.log('🔄 Загружаем все данные...');
            console.log('Состояние данных до загрузки:', this.data);
            
            await Promise.all([
                this.loadStats(),
                this.loadMembers(),
                this.loadCars(),
                this.loadInvitations(),
                this.loadEvents(),
                this.loadServices()
            ]);
            
            console.log('✅ Все данные загружены:', this.data);
            
            // Заполняем фильтры после загрузки всех данных
            this.populateMemberFilters();
            this.populateInvitationFilters();
            this.populateEventFilters();
            this.populateServiceFilters();
            
            // Диагностика фотографий после загрузки всех данных
            this.debugPhotos();
        } catch (error) {
            console.error('❌ Ошибка загрузки данных:', error);
            this.showError('Ошибка загрузки данных');
        }
    }

    async loadStats() {
        try {
            console.log('📊 Загружаем статистику...');
            const response = await this.api.getStats();
            console.log('Ответ API статистики:', response);
            
            if (response.success) {
                this.data.stats = response.data;
                console.log('✅ Статистика загружена:', this.data.stats);
            } else {
                console.error('❌ Ошибка загрузки статистики:', response);
            }
        } catch (error) {
            console.error('❌ Исключение при загрузке статистики:', error);
        }
    }

    async loadMembers() {
        try {
            const response = await this.api.getMembers();
            if (response.success) {
                this.data.members = response.data;
            }
        } catch (error) {
            console.error('Failed to load members:', error);
        }
    }

    async loadCars() {
        try {
            const response = await this.api.getCars();
            if (response.success) {
                this.data.cars = response.data;
            }
        } catch (error) {
            console.error('Failed to load cars:', error);
        }
    }

    async loadInvitations() {
        try {
            const response = await this.api.getInvitations();
            if (response.success) {
                this.data.invitations = response.data;
            }
        } catch (error) {
            console.error('Failed to load invitations:', error);
        }
    }

    async loadEvents() {
        try {
            const response = await this.api.getEvents();
            if (response.success) {
                this.data.events = response.data;
            }
        } catch (error) {
            console.error('Failed to load events:', error);
        }
    }

    async loadServices() {
        try {
            const response = await this.api.getServices();
            if (response.success) {
                this.data.services = response.data;
            }
        } catch (error) {
            console.error('Failed to load services:', error);
        }
    }

    switchTab(tabName) {
        console.log('🔄 Переключаем на вкладку:', tabName);
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        this.currentTab = tabName;

        // Рендерим данные для текущей вкладки
        switch (tabName) {
            case 'stats':
                this.renderStats();
                break;
            case 'members':
                this.renderMembers();
                this.applyFilters('members');
                break;
            case 'cars':
                this.renderCars();
                this.applyFilters('cars');
                break;
            case 'invitations':
                this.renderInvitations();
                this.applyFilters('invitations');
                break;
            case 'events':
                this.renderEvents();
                this.applyFilters('events');
                break;
            case 'services':
                this.renderServices();
                this.applyFilters('services');
                break;
        }
        
        console.log('✅ Вкладка переключена:', tabName);
    }

    renderStats() {
        console.log('📊 Рендерим статистику...');
        console.log('Данные статистики:', this.data.stats);
        
        const statsGrid = document.getElementById('stats-grid');
        console.log('Элемент stats-grid:', statsGrid);
        
        if (!statsGrid) {
            console.error('❌ Не найден элемент stats-grid');
            return;
        }
        
        if (!this.data.stats) {
            console.error('❌ Нет данных статистики');
            return;
        }

        const stats = [
            { title: 'Всего участников', value: this.data.stats.total_members, icon: '👥', color: 'blue' },
            { title: 'Активные участники', value: this.data.stats.active_members, icon: '✓', color: 'green' },
            { title: 'Автомобилей', value: this.data.stats.total_cars, icon: '🚗', color: 'purple' },
            { title: 'Предстоящие события', value: this.data.stats.upcoming_events, icon: '🎉', color: 'orange' },
            { title: 'Рекомендуемые сервисы', value: this.data.stats.recommended_services, icon: '🔧', color: 'green' }
        ];

        console.log('Статистика для отображения:', stats);

        statsGrid.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <div class="stat-info">
                    <h3>${stat.title}</h3>
                    <div class="stat-value">${stat.value}</div>
                </div>
                <div class="stat-icon ${stat.color}">
                    ${stat.icon}
                </div>
            </div>
        `).join('');

        console.log('✅ Статистика отрендерена');

        // Update progress bars
        this.updateProgressBars();
    }

    updateProgressBars() {
        if (!this.data.stats) return;

        const activityPercent = Math.round((this.data.stats.active_members / this.data.stats.total_members) * 100);
        const invitationsPercent = this.data.stats.successful_invitations + this.data.stats.pending_invitations > 0 
            ? Math.round((this.data.stats.successful_invitations / (this.data.stats.successful_invitations + this.data.stats.pending_invitations)) * 100)
            : 0;

        const activityProgress = document.getElementById('activity-progress');
        const activityValue = document.getElementById('activity-value');
        const invitationsProgress = document.getElementById('invitations-progress');
        const invitationsValue = document.getElementById('invitations-value');

        if (activityProgress && activityValue) {
            setTimeout(() => {
                activityProgress.style.width = `${activityPercent}%`;
                activityValue.textContent = `${activityPercent}%`;
            }, 500);
        }

        if (invitationsProgress && invitationsValue) {
            setTimeout(() => {
                invitationsProgress.style.width = `${invitationsPercent}%`;
                invitationsValue.textContent = `${invitationsPercent}%`;
            }, 700);
        }
    }

    populateMemberFilters() {
        const cityFilter = document.getElementById('member-city-filter');
        const statusFilter = document.getElementById('member-status-filter');

        if (cityFilter) {
            const cities = [...new Set(this.data.members.map(m => m.city).filter(Boolean))].sort();
            cityFilter.innerHTML = '<option value="">Все города</option>' + 
                cities.map(city => `<option value="${city}">${city}</option>`).join('');
        }

        if (statusFilter) {
            const statuses = [...new Set(this.data.members.map(m => m.status))].sort();
            statusFilter.innerHTML = '<option value="">Все статусы</option>' + 
                statuses.map(status => `<option value="${status}">${status}</option>`).join('');
        }
    }

    populateInvitationFilters() {
        const brandFilter = document.getElementById('invitation-brand-filter');
        const statusFilter = document.getElementById('invitation-status-filter');

        if (brandFilter) {
            const brands = [...new Set(this.data.invitations.map(i => i.car_brand).filter(Boolean))].sort();
            brandFilter.innerHTML = '<option value="">Все марки</option>' + 
                brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
        }

        if (statusFilter) {
            const statuses = [...new Set(this.data.invitations.map(i => i.status))].sort();
            statusFilter.innerHTML = '<option value="">Все статусы</option>' + 
                statuses.map(status => `<option value="${status}">${status}</option>`).join('');
        }
    }

    populateEventFilters() {
        const cityFilter = document.getElementById('event-city-filter');
        const typeFilter = document.getElementById('event-type-filter');
        const statusFilter = document.getElementById('event-status-filter');

        if (cityFilter) {
            const cities = [...new Set(this.data.events.map(e => e.city).filter(Boolean))].sort();
            cityFilter.innerHTML = '<option value="">Все города</option>' + 
                cities.map(city => `<option value="${city}">${city}</option>`).join('');
        }

        if (typeFilter) {
            const types = [...new Set(this.data.events.map(e => e.type))].sort();
            typeFilter.innerHTML = '<option value="">Все типы</option>' + 
                types.map(type => `<option value="${type}">${type}</option>`).join('');
        }

        if (statusFilter) {
            const statuses = [...new Set(this.data.events.map(e => e.status))].sort();
            statusFilter.innerHTML = '<option value="">Все статусы</option>' + 
                statuses.map(status => `<option value="${status}">${status}</option>`).join('');
        }
    }

    populateServiceFilters() {
        const cityFilter = document.getElementById('service-city-filter');
        const typeFilter = document.getElementById('service-type-filter');

        if (cityFilter) {
            const cities = [...new Set(this.data.services.map(s => s.city).filter(Boolean))].sort();
            cityFilter.innerHTML = '<option value="">Все города</option>' + 
                cities.map(city => `<option value="${city}">${city}</option>`).join('');
        }

        if (typeFilter) {
            const types = [...new Set(this.data.services.map(s => s.type))].sort();
            typeFilter.innerHTML = '<option value="">Все типы</option>' + 
                types.map(type => `<option value="${type}">${type}</option>`).join('');
        }
    }

    applyFilters(type) {
        this.updateFilters(type);
        
        switch (type) {
            case 'members':
                this.filterMembers();
                this.renderMembers();
                break;
            case 'cars':
                this.filterCars();
                this.renderCars();
                break;
            case 'invitations':
                this.filterInvitations();
                this.renderInvitations();
                break;
            case 'events':
                this.filterEvents();
                this.renderEvents();
                break;
            case 'services':
                this.filterServices();
                this.renderServices();
                break;
        }
    }

    updateFilters(type) {
        switch (type) {
            case 'members':
                this.filters.members = {
                    name: document.getElementById('member-name-filter')?.value.toLowerCase() || '',
                    city: document.getElementById('member-city-filter')?.value || '',
                    status: document.getElementById('member-status-filter')?.value || ''
                };
                break;
            case 'cars':
                this.filters.cars = {
                    brand: document.getElementById('car-brand-filter')?.value.toLowerCase() || '',
                    number: document.getElementById('car-number-filter')?.value.toLowerCase() || '',
                    owner: document.getElementById('car-owner-filter')?.value.toLowerCase() || '',
                    year: document.getElementById('car-year-filter')?.value || ''
                };
                break;
            case 'invitations':
                this.filters.invitations = {
                    number: document.getElementById('invitation-number-filter')?.value.toLowerCase() || '',
                    inviter: document.getElementById('invitation-inviter-filter')?.value.toLowerCase() || '',
                    brand: document.getElementById('invitation-brand-filter')?.value || '',
                    status: document.getElementById('invitation-status-filter')?.value || ''
                };
                break;
            case 'events':
                this.filters.events = {
                    title: document.getElementById('event-title-filter')?.value.toLowerCase() || '',
                    city: document.getElementById('event-city-filter')?.value || '',
                    type: document.getElementById('event-type-filter')?.value || '',
                    status: document.getElementById('event-status-filter')?.value || ''
                };
                break;
            case 'services':
                this.filters.services = {
                    name: document.getElementById('service-name-filter')?.value.toLowerCase() || '',
                    city: document.getElementById('service-city-filter')?.value || '',
                    type: document.getElementById('service-type-filter')?.value || '',
                    recommendation: document.getElementById('service-recommendation-filter')?.value || ''
                };
                break;
        }
    }

    filterMembers() {
        const filters = this.filters.members;
        this.filteredData.members = this.data.members.filter(member => {
            const fullName = `${member.first_name} ${member.last_name || ''}`.toLowerCase();
            const nickname = (member.nickname || '').toLowerCase();
            const city = (member.city || '').toLowerCase();

            const nameMatch = fullName.includes(filters.name) || nickname.includes(filters.name);
            const cityMatch = !filters.city || city === filters.city.toLowerCase();
            const statusMatch = !filters.status || member.status === filters.status;

            return nameMatch && cityMatch && statusMatch;
        });
    }

    filterCars() {
        const filters = this.filters.cars;
        this.filteredData.cars = this.data.cars.filter(car => {
            const brandModel = `${car.brand} ${car.model}`.toLowerCase();
            const regNumber = (car.reg_number || '').toLowerCase();
            const ownerName = (car.owner_name || '').toLowerCase();
            const year = car.year?.toString() || '';

            const brandMatch = brandModel.includes(filters.brand);
            const numberMatch = regNumber.includes(filters.number);
            const ownerMatch = ownerName.includes(filters.owner);
            const yearMatch = year.includes(filters.year);

            return brandMatch && numberMatch && ownerMatch && yearMatch;
        });
    }

    filterInvitations() {
        const filters = this.filters.invitations;
        this.filteredData.invitations = this.data.invitations.filter(invitation => {
            const carNumber = (invitation.car_reg_number || '').toLowerCase();
            const inviterName = (invitation.inviter_name || '').toLowerCase();

            const numberMatch = carNumber.includes(filters.number);
            const inviterMatch = inviterName.includes(filters.inviter);
            const brandMatch = !filters.brand || invitation.car_brand === filters.brand;
            const statusMatch = !filters.status || invitation.status === filters.status;

            return numberMatch && inviterMatch && brandMatch && statusMatch;
        });
    }

    filterEvents() {
        const filters = this.filters.events;
        this.filteredData.events = this.data.events.filter(event => {
            const title = event.title.toLowerCase();
            const city = (event.city || '').toLowerCase();

            const titleMatch = title.includes(filters.title);
            const cityMatch = !filters.city || city === filters.city.toLowerCase();
            const typeMatch = !filters.type || event.type === filters.type;
            const statusMatch = !filters.status || event.status === filters.status;

            return titleMatch && cityMatch && typeMatch && statusMatch;
        });
    }

    filterServices() {
        const filters = this.filters.services;
        this.filteredData.services = this.data.services.filter(service => {
            const name = service.name.toLowerCase();
            const city = (service.city || '').toLowerCase();

            const nameMatch = name.includes(filters.name);
            const cityMatch = !filters.city || city === filters.city.toLowerCase();
            const typeMatch = !filters.type || service.type === filters.type;
            const recommendationMatch = !filters.recommendation || service.recommendation === filters.recommendation;

            return nameMatch && cityMatch && typeMatch && recommendationMatch;
        });
    }

    clearFilters(type) {
        switch (type) {
            case 'members':
                document.getElementById('member-name-filter').value = '';
                document.getElementById('member-city-filter').value = '';
                document.getElementById('member-status-filter').value = '';
                break;
            case 'cars':
                document.getElementById('car-brand-filter').value = '';
                document.getElementById('car-number-filter').value = '';
                document.getElementById('car-owner-filter').value = '';
                document.getElementById('car-year-filter').value = '';
                break;
            case 'invitations':
                document.getElementById('invitation-number-filter').value = '';
                document.getElementById('invitation-inviter-filter').value = '';
                document.getElementById('invitation-brand-filter').value = '';
                document.getElementById('invitation-status-filter').value = '';
                break;
            case 'events':
                document.getElementById('event-title-filter').value = '';
                document.getElementById('event-city-filter').value = '';
                document.getElementById('event-type-filter').value = '';
                document.getElementById('event-status-filter').value = '';
                break;
            case 'services':
                document.getElementById('service-name-filter').value = '';
                document.getElementById('service-city-filter').value = '';
                document.getElementById('service-type-filter').value = '';
                document.getElementById('service-recommendation-filter').value = '';
                break;
        }
        this.applyFilters(type);
    }

    renderMembers() {
        const grid = document.getElementById('members-grid');
        const empty = document.getElementById('members-empty');
        const count = document.getElementById('members-count');

        if (!grid) return;

        if (count) {
            count.textContent = `Всего участников: ${this.data.members.length} • Отображено: ${this.filteredData.members.length}`;
        }

        if (this.filteredData.members.length === 0) {
            grid.classList.add('hidden');
            empty?.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');
        empty?.classList.add('hidden');

        grid.innerHTML = this.filteredData.members.map(member => this.renderMemberCard(member)).join('');
    }

    renderMemberCard(member) {
        const hasPhoto = member.photo_url && member.photo_url.trim() !== '';
        
        // Получаем фото первого автомобиля для фона
        let backgroundImage = '';
        if (member.cars && member.cars.length > 0) {
            const firstCar = member.cars[0];
            console.log('🚗 Первый автомобиль участника:', firstCar);
            if (firstCar.photos) {
                try {
                    const photos = JSON.parse(firstCar.photos);
                    console.log('📸 Фото автомобиля:', photos);
                    if (Array.isArray(photos) && photos.length > 0) {
                        backgroundImage = `background-image: url('${photos[0]}');`;
                        console.log('🎨 Установлен фон:', backgroundImage);
                    }
                } catch (error) {
                    console.error('❌ Ошибка парсинга фото автомобиля:', error);
                }
            }
        }
        
        return `
            <div class="member-card" ${backgroundImage ? `style="${backgroundImage}; background-size: cover; background-position: center; background-repeat: no-repeat;"` : ''}>
                ${backgroundImage ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 0;"></div>' : ''}
                <div class="member-main">
                    <div class="member-left">
                        ${hasPhoto ? `
                            <img src="${member.photo_url}" alt="${member.first_name}" class="member-photo" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                 onload="this.nextElementSibling.style.display='none';">
                            <div class="member-placeholder" style="display:none;">👤</div>
                        ` : `
                            <div class="member-placeholder">👤</div>
                        `}
                        <div class="member-status ${member.status}">${member.status}</div>
                    </div>
                    <div class="member-right">
                        <h3 class="member-name">${member.first_name}${member.last_name ? ` ${member.last_name}` : ''}</h3>
                        <div class="member-details">
                            ${member.nickname ? `
                                <div class="member-detail">
                                    <div class="member-detail-icon">@</div>
                                    <span>${member.nickname}</span>
                                </div>
                            ` : ''}
                            ${member.city ? `
                                <div class="member-detail">
                                    <div class="member-detail-icon">📍</div>
                                    <span>${member.city}</span>
                                </div>
                            ` : ''}
                            <div class="member-detail">
                                <div class="member-detail-icon">📅</div>
                                <span>В клубе с ${this.formatDate(member.join_date)}</span>
                            </div>
                            <div class="member-detail">
                                <div class="member-detail-icon">💬</div>
                                <span>${member.message_count || 0} сообщений</span>
                            </div>
                        </div>
                    </div>
                </div>
                ${member.cars && member.cars.length > 0 ? `
                    <div class="member-cars">
                        <div class="member-cars-list">
                        ${member.cars.map(car => {
                            let carPhoto = '';
                            console.log('🚗 Обрабатываем автомобиль в карточке:', car);
                            if (car.photos) {
                                try {
                                    const photos = JSON.parse(car.photos);
                                    console.log('📸 Фото для карточки:', photos);
                                    if (Array.isArray(photos) && photos.length > 0) {
                                        carPhoto = `<img src='${photos[0]}' alt='${car.brand} ${car.model}' class='member-car-photo'>`;
                                        console.log('✅ Установлено фото:', carPhoto);
                                    }
                                } catch (error) {
                                    console.error('❌ Ошибка парсинга фото в карточке:', error);
                                }
                            }
                            if (!carPhoto) {
                                carPhoto = `<div class='member-car-placeholder'>🚗</div>`;
                                console.log('🚗 Используем placeholder для:', car.brand, car.model);
                            }
                            return `
                                <div class="member-car" onclick="app.openCarPhotos('${car.brand}', '${car.model}')">
                                    ${carPhoto}
                                    <span>${car.brand} ${car.model}${car.year ? ` (${car.year})` : ''}</span>
                                </div>
                            `;
                        }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    openCarPhotos(brand, model) {
        // Найти автомобиль в данных и открыть его фотографии
        const car = this.data.cars.find(c => c.brand === brand && c.model === model);
        if (car && car.photos) {
            const photos = this.parsePhotos(car.photos);
            if (photos.length > 0) {
                this.openPhotoModal(photos, 0);
            }
        }
    }

    renderCars() {
        const grid = document.getElementById('cars-grid');
        const empty = document.getElementById('cars-empty');
        const count = document.getElementById('cars-count');

        if (!grid) return;

        if (count) {
            count.textContent = `Всего автомобилей: ${this.data.cars.length} • Отображено: ${this.filteredData.cars.length}`;
        }

        if (this.filteredData.cars.length === 0) {
            grid.classList.add('hidden');
            empty?.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');
        empty?.classList.add('hidden');

        grid.innerHTML = this.filteredData.cars.map(car => this.renderCarCard(car)).join('');
    }

    async getCurrentMemberId() {
        if (!this.currentUser || !this.currentUser.id) {
            return null;
        }
        
        try {
            const apiUrl = this.getApiUrl('get_member_id');
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ telegram_id: this.currentUser.id })
            });
            
            const result = await response.json();
            if (result.success) {
                // Сохраняем member_id и isAdmin в currentUser
                this.currentUser.member_id = result.data.member_id;
                this.currentUser.isAdmin = result.data.isAdmin;
                console.log('Получены данные пользователя:', { 
                    member_id: this.currentUser.member_id, 
                    isAdmin: this.currentUser.isAdmin 
                });
                return result.data.member_id;
            }
        } catch (error) {
            console.error('Error getting member ID:', error);
        }
        
        return null;
    }

    renderCarCard(car) {
        const photos = this.parsePhotos(car.photos);
        const hasPhotos = photos && photos.length > 0;
        const isOwner = this.currentUser && (car.member_id == this.currentUser.member_id || this.currentUser.isAdmin);

        return `
            <div class="car-card" ${hasPhotos ? `onclick=\"app.openPhotoModal(${JSON.stringify(photos).replace(/\"/g, '&quot;')}, 0)\"` : ''}>
                ${isOwner ? `<button class="car-edit-btn" title="Изменить" onclick="event.stopPropagation(); app.openEditCarModal(${car.id})">✏️</button>` : ''}
                <div class="car-main">
                    <div class="car-left">
                        ${hasPhotos ? `
                            <img src="${photos[0]}" alt="${car.brand} ${car.model}" class="car-photo" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                 onload="this.nextElementSibling.style.display='none';">
                            <div class="car-placeholder" style="display:none;">🚗</div>
                        ` : `
                            <div class="car-placeholder">🚗</div>
                        `}
                        ${car.reg_number ? `<div class="car-number-badge">${car.reg_number}</div>` : ''}
                    </div>
                    <div class="car-right">
                        <h3 class="car-name">${car.brand} ${car.model}</h3>
                        <div class="car-details">
                            ${car.year ? `
                                <div class="car-detail">
                                    <div class="car-detail-icon">📅</div>
                                    <span>${car.year} год</span>
                                </div>
                            ` : ''}
                            ${car.color ? `
                                <div class="car-detail">
                                    <div class="car-detail-icon">🎨</div>
                                    <span>${car.color}</span>
                                </div>
                            ` : ''}
                            ${car.engine_volume ? `
                                <div class="car-detail">
                                    <div class="car-detail-icon">⚙️</div>
                                    <span>${car.engine_volume}L</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                ${car.owner_name ? `
                    <div class="car-owner">
                        <span>👤</span>
                        <span>${car.owner_name}${car.owner_nickname ? ` (@${car.owner_nickname})` : ''}</span>
                    </div>
                ` : ''}
                ${hasPhotos && photos.length > 1 ? `
                    <div class="photo-indicator">
                        <div class="photo-dots">
                            ${photos.slice(1, 4).map(() => '<div class="photo-dot">📷</div>').join('')}
                        </div>
                        ${photos.length > 4 ? `<span>+${photos.length - 4} еще</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    openEditCarModal(carId) {
        const car = this.data.cars.find(c => c.id == carId);
        if (!car) return;
        // Открываем модальное окно и заполняем форму данными авто
        this.openModal('add-car-modal');
        const form = document.getElementById('add-car-form');
        if (!form) return;
        form.querySelector('[name=brand]').value = car.brand || '';
        form.querySelector('[name=model]').value = car.model || '';
        form.querySelector('[name=year]').value = car.year || '';
        form.querySelector('[name=color]').value = car.color || '';
        form.querySelector('[name=reg_number]').value = car.reg_number || '';
        form.querySelector('[name=engine_volume]').value = car.engine_volume || '';
        // TODO: заполнить превью фото
        // Меняем кнопку submit на 'Сохранить изменения', добавляем кнопку 'Удалить'
        const actions = form.querySelector('.form-actions');
        if (actions && !form.querySelector('.btn-delete')) {
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn-delete';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
                    this.deleteCar(car.id);
                }
            };
            actions.prepend(deleteBtn);
        }
        const submitBtn = form.querySelector('[type=submit]');
        if (submitBtn) submitBtn.textContent = 'Сохранить изменения';
        // Устанавливаем собственный обработчик для редактирования
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleEditCarSubmit(car.id, form);
        };
    }

    async handleEditCarSubmit(carId, form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = await this.updateCar(carId, data);
            if (response.success) {
                this.showNotification('🚗 Автомобиль обновлен!', 'success');
                await this.loadAllData();
                this.closeModal('add-car-modal');
            } else {
                throw new Error(response.error || 'Неизвестная ошибка');
            }
        } catch (error) {
            this.showNotification('❌ Ошибка: ' + error.message, 'error');
        }
    }

    async updateCar(carId, data) {
        const apiUrl = this.getApiUrl('update_car');
        const carData = { 
            ...data, 
            id: carId,
            telegram_id: this.currentUser.id 
        };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData)
        });
        return await response.json();
    }

    async deleteCar(carId) {
        const apiUrl = this.getApiUrl('delete_car');
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: carId,
                telegram_id: this.currentUser.id 
            })
        });
        const result = await response.json();
        if (result.success) {
            this.showNotification('🚗 Автомобиль удален!', 'success');
            await this.loadAllData();
            this.closeModal('add-car-modal');
        } else {
            this.showNotification('❌ Ошибка: ' + (result.error || 'Не удалось удалить'), 'error');
        }
    }

    renderInvitations() {
        const grid = document.getElementById('invitations-grid');
        const empty = document.getElementById('invitations-empty');
        const count = document.getElementById('invitations-count');

        if (!grid) return;

        if (count) {
            count.textContent = `Всего приглашений: ${this.data.invitations.length} • Отображено: ${this.filteredData.invitations.length}`;
        }

        if (this.filteredData.invitations.length === 0) {
            grid.classList.add('hidden');
            empty?.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');
        empty?.classList.add('hidden');

        grid.innerHTML = this.filteredData.invitations.map(invitation => this.renderInvitationCard(invitation)).join('');
    }

    renderInvitationCard(invitation) {
        const photos = this.parsePhotos(invitation.photos);
        const hasPhotos = photos && photos.length > 0;
        const isOwner = this.currentUser && (invitation.inviter_member_id == this.currentUser.member_id || this.currentUser.isAdmin);

        return `
            <div class="invitation-card" ${hasPhotos ? `onclick=\"app.openPhotoModal(${JSON.stringify(photos).replace(/\"/g, '&quot;')}, 0)\"` : ''}>
                ${isOwner ? `<button class="invitation-edit-btn" title="Изменить" onclick="event.stopPropagation(); app.openEditInvitationModal(${invitation.id})">✏️</button>` : ''}
                <div class="invitation-header">
                    <div class="invitation-title">${invitation.car_brand} ${invitation.car_model}</div>
                    <div class="invitation-status ${invitation.status.replace(' ', '-')}">${invitation.status}</div>
                </div>
                <div class="invitation-main">
                    <div class="invitation-left">
                        ${hasPhotos ? `
                            <img src="${photos[0]}" alt="Приглашение" class="invitation-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="invitation-placeholder" style="display:none;">📨</div>
                        ` : `
                            <div class="invitation-placeholder">📨</div>
                        `}
                        ${invitation.car_reg_number ? `<div class="invitation-reg-number">${invitation.car_reg_number}</div>` : ''}
                    </div>
                    <div class="invitation-right">
                        <div class="invitation-details">
                            <div class="invitation-detail">
                                <div class="invitation-detail-icon">📅</div>
                                <span>Дата: ${this.formatDate(invitation.invitation_date)}</span>
                            </div>
                            ${invitation.location ? `
                                <div class="invitation-detail">
                                    <div class="invitation-detail-icon">📍</div>
                                    <span>Место: ${invitation.location}</span>
                                </div>
                            ` : ''}
                            ${invitation.inviter_name ? `
                                <div class="invitation-detail">
                                    <div class="invitation-detail-icon">👤</div>
                                    <span>Пригласил: ${invitation.inviter_name}${invitation.inviter_nickname ? ` (@${invitation.inviter_nickname})` : ''}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                ${hasPhotos && photos.length > 1 ? `
                    <div class="photo-indicator">
                        <div class="photo-dots">
                            ${photos.slice(1, 4).map(() => '<div class="photo-dot">📷</div>').join('')}
                        </div>
                        ${photos.length > 4 ? `<span>+${photos.length - 4} еще</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderEvents() {
        const grid = document.getElementById('events-grid');
        const empty = document.getElementById('events-empty');
        const count = document.getElementById('events-count');

        if (!grid) return;

        if (count) {
            count.textContent = `Всего событий: ${this.data.events.length} • Отображено: ${this.filteredData.events.length}`;
        }

        if (this.filteredData.events.length === 0) {
            grid.classList.add('hidden');
            empty?.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');
        empty?.classList.add('hidden');

        grid.innerHTML = this.filteredData.events.map(event => this.renderEventCard(event)).join('');
    }

    renderEventCard(event) {
        const photos = this.parsePhotos(event.photos);
        const hasPhotos = photos && photos.length > 0;
        const isOwner = this.currentUser && (event.organizer_id == this.currentUser.member_id || this.currentUser.isAdmin);

        return `
            <div class="event-card" ${hasPhotos ? `onclick=\"app.openPhotoModal(${JSON.stringify(photos).replace(/\"/g, '&quot;')}, 0)\"` : ''}>
                ${isOwner ? `<button class="event-edit-btn" title="Изменить" onclick="event.stopPropagation(); app.openEditEventModal(${event.id})">✏️</button>` : ''}
                <div class="event-header">
                    <div class="event-title">${event.title}</div>
                    <div class="event-status ${event.status}">${event.status}</div>
                </div>
                <div class="event-main">
                    <div class="event-left">
                        ${hasPhotos ? `
                            <img src="${photos[0]}" alt="${event.title}" class="event-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="event-placeholder" style="display:none;">🎉</div>
                        ` : `
                            <div class="event-placeholder">🎉</div>
                        `}
                        <div class="event-type-badge">${event.type}</div>
                    </div>
                    <div class="event-right">
                        <div class="event-details">
                            <div class="event-detail">
                                <div class="event-detail-icon">📅</div>
                                <span>${this.formatDate(event.event_date)} ${event.event_time || ''}</span>
                            </div>
                            ${event.location ? `
                                <div class="event-detail">
                                    <div class="event-detail-icon">📍</div>
                                    <span>${event.location}</span>
                                </div>
                            ` : ''}
                            ${event.price ? `
                                <div class="event-detail">
                                    <div class="event-detail-icon">💰</div>
                                    <span>Стоимость: ${event.price} ₽</span>
                                </div>
                            ` : ''}
                            ${event.organizer_name ? `
                                <div class="event-detail">
                                    <div class="event-detail-icon">👤</div>
                                    <span>Организатор: ${event.organizer_name}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                ${event.description ? `
                    <div class="event-description">${event.description}</div>
                ` : ''}
            </div>
        `;
    }

    renderServices() {
        const grid = document.getElementById('services-grid');
        const empty = document.getElementById('services-empty');
        const count = document.getElementById('services-count');

        if (!grid) return;

        if (count) {
            count.textContent = `Всего сервисов: ${this.data.services.length} • Отображено: ${this.filteredData.services.length}`;
        }

        if (this.filteredData.services.length === 0) {
            grid.classList.add('hidden');
            empty?.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');
        empty?.classList.add('hidden');

        grid.innerHTML = this.filteredData.services.map(service => this.renderServiceCard(service)).join('');
    }

    renderServiceCard(service) {
        const serviceIcons = {
            'автосервис': '🔧',
            'детейлинг': '✨',
            'шиномонтаж': '🛞',
            'электрик': '⚡',
            'автомойка': '🧽'
        };
        const isOwner = this.currentUser && (service.added_by_member_id == this.currentUser.member_id || this.currentUser.isAdmin);

        return `
            <div class="service-card">
                ${isOwner ? `<button class="service-edit-btn" title="Изменить" onclick="app.openEditServiceModal(${service.id})">✏️</button>` : ''}
                <div class="service-header">
                    <div class="service-title">${service.name}</div>
                    <div class="service-recommendation ${service.recommendation}">${service.recommendation}</div>
                </div>
                <div class="service-main">
                    <div class="service-left">
                        <div class="service-icon">${serviceIcons[service.type] || '🏢'}</div>
                        <div class="service-type-badge">${service.type}</div>
                    </div>
                    <div class="service-right">
                        <div class="service-details">
                            ${service.city ? `
                                <div class="service-detail">
                                    <div class="service-detail-icon">📍</div>
                                    <span>${service.city}</span>
                                </div>
                            ` : ''}
                            ${service.phone ? `
                                <div class="service-detail">
                                    <div class="service-detail-icon">📞</div>
                                    <span>${service.phone}</span>
                                </div>
                            ` : ''}
                            ${service.rating ? `
                                <div class="service-detail">
                                    <div class="service-detail-icon">⭐</div>
                                    <span>Рейтинг: ${service.rating}/5 (${service.reviews_count || 0} отзывов)</span>
                                </div>
                            ` : ''}
                            ${service.added_by_name ? `
                                <div class="service-detail">
                                    <div class="service-detail-icon">👤</div>
                                    <span>Добавил: ${service.added_by_name}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                ${service.description ? `
                    <div class="service-description">${service.description}</div>
                ` : ''}
                ${service.services && service.services.length > 0 ? `
                    <div class="service-services">
                        <h4>Услуги:</h4>
                        <div class="service-tags">
                            ${service.services.map(s => `<span class="service-tag">${s}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    openPhotoModal(photos, index) {
        if (!photos || photos.length === 0) return;

        this.currentPhotos = photos;
        this.currentPhotoIndex = index;

        const modal = document.getElementById('photo-modal');
        const image = document.getElementById('modal-image');
        const current = document.getElementById('modal-current');
        const total = document.getElementById('modal-total');
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');

        if (modal && image) {
            image.src = photos[index];
            current.textContent = index + 1;
            total.textContent = photos.length;
            
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index === photos.length - 1;
            
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closePhotoModal() {
        const modal = document.getElementById('photo-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    showPrevPhoto() {
        if (this.currentPhotoIndex > 0) {
            this.openPhotoModal(this.currentPhotos, this.currentPhotoIndex - 1);
        }
    }

    showNextPhoto() {
        if (this.currentPhotoIndex < this.currentPhotos.length - 1) {
            this.openPhotoModal(this.currentPhotos, this.currentPhotoIndex + 1);
        }
    }

    // API Methods
    async verifyUser(userData) {
        return await this.api.verifyUser(userData);
    }

    async verifyUserSession(userData) {
        try {
            console.log('Verifying user session for:', userData);
            
            // Проверяем, есть ли мобильная авторизация
            const authMethod = localStorage.getItem('auth_method');
            const userVerified = localStorage.getItem('user_verified');
            const authToken = localStorage.getItem('auth_token');
            
            // Если это мобильная авторизация и есть токен - считаем валидной
            if (authMethod === 'mobile_link' && userVerified === 'true' && authToken) {
                console.log('Mobile auth detected, skipping API verification');
                return true;
            }
            
            // Для остальных случаев проверяем через API
            const response = await this.verifyUser(userData);
            console.log('Session verification response:', response);
            
            if (response.success && response.data && response.data.access) {
                console.log('Session valid, user has access');
                return true;
            } else {
                console.log('Session invalid or no access:', response.data);
                return false;
            }
        } catch (error) {
            console.error('Session verification error:', error);
            
            // Если ошибка API, но есть мобильная авторизация - разрешаем доступ
            const authMethod = localStorage.getItem('auth_method');
            const userVerified = localStorage.getItem('user_verified');
            if (authMethod === 'mobile_link' && userVerified === 'true') {
                console.log('API error but mobile auth valid, allowing access');
                return true;
            }
            
            return false;
        }
    }

    // Storage Methods
    storeUser(user) {
        try {
            console.log('💾 Сохраняем данные пользователя:', user);
            
            // Сохраняем основные данные пользователя
            localStorage.setItem('cabrioride_user', JSON.stringify(user));
            
            // Сохраняем время авторизации
            const authTimestamp = Date.now().toString();
            localStorage.setItem('auth_timestamp', authTimestamp);
            
            // Сохраняем ID пользователя для быстрой проверки
            localStorage.setItem('current_user_id', user.id.toString());
            
            // Сохраняем метод авторизации
            localStorage.setItem('auth_method', 'telegram_widget');
            
            // Сохраняем статус верификации
            localStorage.setItem('user_verified', 'true');
            
            console.log('✅ Данные пользователя сохранены:', {
                id: user.id,
                name: user.first_name,
                timestamp: authTimestamp
            });
        } catch (error) {
            console.error('❌ Ошибка при сохранении пользователя:', error);
            throw error;
        }
    }

    getStoredUser() {
        try {
            // Проверяем разные источники данных пользователя
            let stored = localStorage.getItem('cabrioride_user');
            
            // Если нет основных данных, проверяем данные от Telegram авторизации
            if (!stored) {
                const telegramUser = localStorage.getItem('telegram_user');
                if (telegramUser) {
                    console.log('Found telegram_user data, using it');
                    stored = telegramUser;
                }
            }
            
            if (stored) {
                const user = JSON.parse(stored);
                
                // Проверяем, есть ли токен авторизации
                const authToken = localStorage.getItem('auth_token');
                const authMethod = localStorage.getItem('auth_method');
                const userVerified = localStorage.getItem('user_verified');
                const authFallback = localStorage.getItem('auth_fallback');
                
                // Если есть токен или это мобильная авторизация - пользователь валиден
                if (authToken || authMethod === 'mobile_link' || userVerified === 'true' || authFallback === 'true') {
                    console.log('User found with valid auth:', {
                        user: user,
                        authToken: !!authToken,
                        authMethod: authMethod,
                        verified: userVerified,
                        fallback: authFallback
                    });
                    return user;
                } else {
                    console.log('User found but no valid auth token');
                    return null;
                }
            }
            
            console.log('No stored user found');
            return null;
        } catch (error) {
            console.error('Failed to get stored user:', error);
            return null;
        }
    }

    clearStoredUser() {
        try {
            console.log('🧹 Начинаем очистку данных пользователя...');
            
            // Список всех ключей для очистки
            const keysToRemove = [
                'cabrioride_user',
                'telegram_user',
                'auth_token',
                'auth_method',
                'user_verified',
                'auth_fallback',
                'auth_timestamp',
                'telegram_auth_data',
                'user_session',
                'app_state'
            ];
            
            // Очищаем каждый ключ
            keysToRemove.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    console.log(`🗑️ Удален ключ: ${key}`);
                }
            });
            
            // Очищаем sessionStorage
            sessionStorage.clear();
            console.log('🗑️ SessionStorage очищен');
            
            // Очищаем все куки, связанные с приложением
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            console.log('🍪 Куки очищены');
            
            // НЕ удаляем флаг force_telegram_auth при обычной очистке
            // Он должен остаться для блокировки автоматической авторизации
            
            console.log('✅ Очистка данных пользователя завершена');
        } catch (error) {
            console.error('❌ Ошибка при очистке данных пользователя:', error);
            throw error;
        }
    }

    // Utility Methods
    getInitials(firstName, lastName) {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return first + last;
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        } catch (error) {
            return dateString;
        }
    }

    parsePhotos(photosJson) {
        if (!photosJson) return [];
        try {
            const parsed = JSON.parse(photosJson);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    showError(message) {
        // Simple error display - in production you might want a more sophisticated solution
        alert(message);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Диагностика фотографий
    debugPhotos() {
        console.log('=== ДИАГНОСТИКА ФОТОГРАФИЙ ===');
        
        if (this.data.members) {
            console.log('Участники с фотографиями:');
            this.data.members.forEach(member => {
                if (member.photo_url) {
                    console.log(`${member.first_name}: ${member.photo_url}`);
                }
            });
        }
        
        if (this.data.cars) {
            console.log('Автомобили с фотографиями:');
            this.data.cars.forEach(car => {
                if (car.photos) {
                    const photos = this.parsePhotos(car.photos);
                    console.log(`${car.brand} ${car.model}:`, photos);
                }
            });
        }
        
        console.log('=== КОНЕЦ ДИАГНОСТИКИ ===');
    }

    showAccessDenied(status, message) {
        const loginScreen = document.getElementById('login-screen');
        const app = document.getElementById('app');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loginScreen && app && loadingScreen) {
            loadingScreen.classList.add('hidden');
            app.classList.add('hidden');
            loginScreen.classList.remove('hidden');
            
            // Удаляем предыдущие сообщения об ошибках
            const existingAccessDenied = loginScreen.querySelector('.access-denied-message');
            if (existingAccessDenied) {
                existingAccessDenied.remove();
            }
            
            // Показываем сообщение об отказе
            const errorDiv = document.createElement('div');
            errorDiv.className = 'access-denied-message';
            
            // Определяем тип сообщения в зависимости от статуса
            let icon = '🚫';
            let title = 'Доступ запрещен';
            let helpText = '';
            
            if (status === 'не зарегистрирован') {
                icon = '📝';
                title = 'Регистрация не завершена';
                helpText = 'Обратитесь к администратору клуба для завершения регистрации.';
            } else if (status === 'участник') {
                icon = '⏳';
                title = 'Ожидание активации';
                helpText = 'Ваш статус: "Участник". Для получения полного доступа необходимо стать активным участником клуба.';
            } else if (status === 'новый') {
                icon = '🆕';
                title = 'Новый участник';
                helpText = 'Ваш статус: "Новый участник". Для получения доступа необходимо пройти процедуру активации.';
            } else if (status === 'вышел') {
                icon = '👋';
                title = 'Вы вышли из клуба';
                helpText = 'Ваш статус: "Вышел из клуба". Доступ к контенту заблокирован.';
            } else if (status === 'заблокирован') {
                icon = '🔒';
                title = 'Аккаунт заблокирован';
                helpText = 'Ваш статус: "Заблокирован". Обратитесь к администратору клуба.';
            }
            
            errorDiv.innerHTML = `
                <div class="access-denied-content">
                    <div class="access-denied-icon">${icon}</div>
                    <h3>${title}</h3>
                    <p><strong>Ваш статус:</strong> ${status}</p>
                    <p>${message}</p>
                    ${helpText ? `<p class="help-text">${helpText}</p>` : ''}
                    <div class="access-denied-actions">
                        <button onclick="app.showLogin()" class="retry-btn">Попробовать снова</button>
                    </div>
                </div>
            `;
            
            loginScreen.appendChild(errorDiv);
        }
    }

    // Модальные окна для добавления записей
    showAddCarModal() {
        console.log('Показать модальное окно добавления автомобиля');
        this.openModal('add-car-modal');
        this.setupFormHandlers('add-car-form', 'car');
    }

    showAddInvitationModal() {
        console.log('Показать модальное окно добавления приглашения');
        this.openModal('add-invitation-modal');
        this.setupFormHandlers('add-invitation-form', 'invitation');
    }

    showAddEventModal() {
        console.log('Показать модальное окно добавления события');
        this.openModal('add-event-modal');
        this.setupFormHandlers('add-event-form', 'event');
    }

    showAddServiceModal() {
        console.log('Показать модальное окно добавления сервиса');
        this.openModal('add-service-modal');
        this.setupFormHandlers('add-service-form', 'service');
    }

    showProfileModal() {
        console.log('Показать модальное окно редактирования профиля');
        this.openModal('profile-modal');
        this.fillProfileForm();
        this.setupFormHandlers('profile-form', 'profile');
    }

    // Общие функции для работы с модальными окнами
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            this.clearForm(modalId);
        }
    }

    clearForm(modalId) {
        const form = document.querySelector(`#${modalId} form`);
        if (form) {
            form.reset();
            const preview = form.querySelector('.file-preview');
            if (preview) {
                preview.innerHTML = '';
            }
        }
    }

    setupFormHandlers(formId, type) {
        console.log(`🔧 Настройка обработчиков для формы ${formId} типа ${type}`);
        
        const form = document.getElementById(formId);
        if (!form) {
            console.error(`❌ Форма с id "${formId}" не найдена!`);
            this.showNotification(`❌ Ошибка: форма "${formId}" не найдена`, 'error');
            return;
        }

        console.log(`✅ Форма ${formId} найдена, настраиваем обработчики...`);

        // Удаляем старые обработчики
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Добавляем новые обработчики
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log(`📝 Отправка формы ${formId} типа ${type}`);
            this.handleFormSubmit(type, newForm);
        });

        // Обработчики для файлов
        const fileInputs = newForm.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleFilePreview(e.target);
            });
        });

        // Обработчики для закрытия модального окна
        const modal = newForm.closest('.modal');
        if (modal) {
            const closeButtons = modal.querySelectorAll('.modal-close, .modal-overlay');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.closeModal(modal.id);
                });
            });
        }

        console.log(`✅ Обработчики для формы ${formId} настроены`);
    }

    handleFilePreview(fileInput) {
        const preview = fileInput.parentNode.querySelector('.file-preview');
        if (!preview) return;

        preview.innerHTML = '';
        
        Array.from(fileInput.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    async handleFormSubmit(type, form) {
        console.log(`🔄 Обработка формы ${type}:`, form);
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('📋 Данные формы:', data);
        
        // Проверяем, что данные не пустые
        if (!data || Object.keys(data).length === 0) {
            console.warn('⚠️ Форма пустая или не содержит данных');
            this.showNotification('❌ Форма не содержит данных', 'error');
            return;
        }
        
        try {
            let response;
            
            console.log(`🎯 Обрабатываем тип формы: ${type}`);
            
            switch (type) {
                case 'car':
                    console.log('🚗 Добавляем автомобиль...');
                    response = await this.addCar(data);
                    break;
                case 'edit-car':
                    // Для редактирования автомобиля нужен carId, который передается отдельно
                    // Этот случай обрабатывается в handleEditCarSubmit
                    throw new Error('Редактирование автомобиля должно обрабатываться через handleEditCarSubmit');
                case 'invitation':
                    console.log('📋 Добавляем приглашение...');
                    response = await this.addInvitation(data);
                    break;
                case 'event':
                    console.log('🎉 Добавляем событие...');
                    response = await this.addEvent(data);
                    break;
                case 'service':
                    console.log('🔧 Добавляем сервис...');
                    response = await this.addService(data);
                    break;
                case 'profile':
                    console.log('👤 Обновляем профиль...');
                    response = await this.updateProfile(data);
                    break;
                default:
                    console.error(`❌ Неизвестный тип формы: ${type}`);
                    throw new Error(`Неизвестный тип формы: ${type}`);
            }
            
            console.log('📤 Ответ сервера:', response);
            
            if (response.success) {
                // Показываем уведомление об успехе в зависимости от типа
                let successMessage = '✅ Запись успешно добавлена!';
                switch (type) {
                    case 'car':
                        successMessage = '🚗 Автомобиль успешно добавлен!';
                        break;
                    case 'edit-car':
                        successMessage = '🚗 Автомобиль успешно обновлен!';
                        break;
                    case 'invitation':
                        successMessage = '📋 Приглашение успешно добавлено!';
                        break;
                    case 'event':
                        successMessage = '🎉 Событие успешно добавлено!';
                        break;
                    case 'service':
                        successMessage = '🔧 Сервис успешно добавлен!';
                        break;
                    case 'profile':
                        successMessage = '👤 Профиль успешно обновлен!';
                        break;
                }
                
                console.log('✅ Успех:', successMessage);
                this.showNotification(successMessage, 'success');
                
                // Обновляем данные на странице
                console.log('🔄 Обновляем данные...');
                await this.loadAllData();
                
                // Закрываем модальное окно
                const modalId = form.closest('.modal').id;
                console.log('🚪 Закрываем модальное окно:', modalId);
                this.closeModal(modalId);
    } else {
                console.error('❌ Ошибка сервера:', response.error);
                throw new Error(response.error || 'Неизвестная ошибка');
            }
            
        } catch (error) {
            console.error('💥 Ошибка отправки формы:', error);
            this.showNotification(`❌ Ошибка: ${error.message}`, 'error');
        }
    }

    // Функции для отправки данных на сервер
    async addCar(data) {
        const apiUrl = this.getApiUrl('add_car');
        
        // Получаем member_id текущего пользователя
        const memberId = await this.getCurrentMemberId();
        if (!memberId) {
            throw new Error('Не удалось определить ID участника');
        }
        
        const carData = {
            member_id: memberId,
            brand: data.brand,
            model: data.model,
            year: parseInt(data.year),
            reg_number: data.reg_number,
            color: data.color || 'Не указан',
            engine_volume: data.engine_volume || null
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(carData)
        });
        
        return await response.json();
    }

    async addInvitation(data) {
        const apiUrl = this.getApiUrl('add_invitation');
        
        // Получаем member_id текущего пользователя
        const memberId = await this.getCurrentMemberId();
        if (!memberId) {
            throw new Error('Не удалось определить ID участника');
        }
        
        const invitationData = {
            inviter_member_id: memberId,
            car_number: data.car_number,
            car_brand: data.car_brand || null,
            location: data.location || null,
            meeting_date: data.meeting_date || null
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invitationData)
        });
        
        return await response.json();
    }

    async addEvent(data) {
        const apiUrl = this.getApiUrl('add_event');
        
        // Получаем member_id текущего пользователя
        const memberId = await this.getCurrentMemberId();
        if (!memberId) {
            throw new Error('Не удалось определить ID участника');
        }
        
        const eventData = {
            organizer_id: memberId,
            title: data.title,
            type: data.type,
            event_date: data.event_date,
            event_time: data.event_time || null,
            location: data.location,
            price: data.price ? parseFloat(data.price) : null
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        
        return await response.json();
    }

    async addService(data) {
        const apiUrl = this.getApiUrl('add_service');
        
        // Получаем member_id текущего пользователя
        const memberId = await this.getCurrentMemberId();
        if (!memberId) {
            throw new Error('Не удалось определить ID участника');
        }
        
        const serviceData = {
            added_by_member_id: memberId,
            name: data.name,
            type: data.type,
            address: data.address,
            phone: data.phone || null,
            rating: data.rating ? parseInt(data.rating) : null,
            recommendation: data.recommendation || null
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(serviceData)
        });
        
        return await response.json();
    }

    async updateProfile(data) {
        const apiUrl = this.getApiUrl('update_profile');
        
        const profileData = {
            telegram_id: this.currentUser.id,
            first_name: data.first_name,
            last_name: data.last_name || null,
            city: data.city || null,
            phone: data.phone || null,
            birth_date: data.birth_date || null
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        });
        
        return await response.json();
    }

    // Вспомогательная функция для получения URL API
    getApiUrl(action) {
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.protocol === 'file:';
        
        const baseUrl = isDevelopment 
            ? 'https://club.cabrioride.by/backend/api.php'
            : 'backend/api.php';
        
        return `${baseUrl}?action=${action}`;
    }

    // Функция для показа уведомлений
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = message;
        
        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Цвета в зависимости от типа
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, var(--primary-green) 0%, #00cc66 100%)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, var(--primary-red) 0%, #cc0033 100%)';
        } else {
            notification.style.background = 'linear-gradient(135deg, var(--primary-blue) 0%, #0077cc 100%)';
        }
        
        // Добавляем на страницу
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    fillProfileForm() {
        if (!this.currentUser) return;

        const form = document.getElementById('profile-form');
        if (!form) return;

        // Заполняем поля данными текущего пользователя
        const fields = {
            'profile-first-name': this.currentUser.first_name || '',
            'profile-last-name': this.currentUser.last_name || '',
            'profile-username': this.currentUser.username || '',
            'profile-city': this.currentUser.city || '',
            'profile-phone': this.currentUser.phone || '',
            'profile-birth-date': this.currentUser.birth_date || ''
        };

        Object.entries(fields).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) {
                field.value = value;
            }
        });
    }

    showTestModeIndicator() {
        const testModeIndicator = document.createElement('div');
        testModeIndicator.className = 'test-mode-indicator';
        testModeIndicator.innerHTML = `
            <div class="test-mode-content">
                <div class="test-mode-icon">🔧</div>
                <p>Тестовый режим</p>
            </div>
        `;
        
        const app = document.getElementById('app');
        if (app) {
            app.appendChild(testModeIndicator);
        }
    }

    // Заглушки для редактирования остальных сущностей
    openEditInvitationModal(invitationId) {
        console.log('Редактирование приглашения:', invitationId);
        this.showNotification('📋 Редактирование приглашений пока не реализовано', 'info');
    }

    openEditEventModal(eventId) {
        console.log('Редактирование события:', eventId);
        this.showNotification('🎉 Редактирование событий пока не реализовано', 'info');
    }

    openEditServiceModal(serviceId) {
        console.log('Редактирование сервиса:', serviceId);
        this.showNotification('🔧 Редактирование сервисов пока не реализовано', 'info');
    }

    setupCheckNumberModal() {
        // Карточка открытия (теперь это feature-card)
        const card = document.getElementById('btn-check-number');
        if (card) {
            card.addEventListener('click', () => this.openModal('check-number-modal'));
            // Добавляем hover эффект
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });
        }
        // Валидация поля ввода
        const input = document.getElementById('car-number-input');
        const submitBtn = document.getElementById('btn-submit-check-number');
        if (input && submitBtn) {
            input.addEventListener('input', () => {
                const value = input.value.trim();
                // Только латиница и цифры, минимум 3 символа, максимум 8
                const valid = /^[A-Za-z0-9]{3,8}$/.test(value);
                submitBtn.disabled = !valid;
                this.clearCheckResult();
            });
            
            // Автоматическое преобразование в верхний регистр
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }
        // Обработка формы
        const form = document.getElementById('check-number-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const value = input.value.trim();
                if (!/^[A-Za-z0-9]{3,8}$/.test(value)) return;
                submitBtn.disabled = true;
                this.showCheckResult('Проверка...', 'loading');
                try {
                    const result = await this.checkCarNumber(value);
                    if (result.found) {
                        this.showDetailedCheckResult(result);
                    } else {
                        this.showCheckResult('❌ Совпадений не найдено', 'not-found');
                    }
                } catch (err) {
                    console.error('❌ Ошибка поиска:', err);
                    const errorMessage = err.message || '⚠️ Ошибка проверки. Попробуйте позже.';
                    this.showCheckResult(errorMessage, 'error');
                }
                submitBtn.disabled = false;
            };
        }
    }

    clearCheckResult() {
        const resultElement = document.getElementById('check-number-result');
        if (resultElement) {
            resultElement.textContent = '';
            resultElement.className = 'check-result';
        }
    }

    showCheckResult(message, type = 'info') {
        const resultElement = document.getElementById('check-number-result');
        if (resultElement) {
            resultElement.textContent = message;
            resultElement.className = `check-result ${type}`;
        }
    }

    showDetailedCheckResult(result) {
        const resultElement = document.getElementById('check-number-result');
        if (!resultElement) return;

        let html = '';
        
        if (result.type === 'member') {
            const regNumber = result.data.reg_number;
            const status = result.data.status;
            
            html = `
                <div class="check-result found">
                    <div class="result-header">
                        <span class="result-icon">✅</span>
                        <span class="result-title">Машина участника клуба</span>
                    </div>
                    <div class="result-details">
                        <div class="car-info">
                            <div class="car-details">
                                <span class="car-number">${regNumber}</span>
                                <span class="status-badge status-${status}">${this.getStatusDisplayName(status)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (result.type === 'invitation') {
            const carNumber = result.data.car_number;
            const status = result.data.status;
            
            html = `
                <div class="check-result invitation">
                    <div class="result-header">
                        <span class="result-icon">📨</span>
                        <span class="result-title">Приглашение в клуб</span>
                    </div>
                    <div class="result-details">
                        <div class="car-info">
                            <div class="car-details">
                                <span class="car-number">${carNumber}</span>
                                <span class="status-badge status-${status.replace(' ', '-')}">${this.getInvitationStatusDisplayName(status)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        resultElement.innerHTML = html;
        resultElement.className = 'check-result detailed';
    }

    getStatusDisplayName(status) {
        const statusMap = {
            'активный': 'Активный участник',
            'участник': 'Участник',
            'новый': 'Новый участник',
            'без авто': 'Без автомобиля',
            'приглашение': 'Приглашён',
            'вышел': 'Покинул клуб',
            'заблокирован': 'Заблокирован'
        };
        return statusMap[status] || status;
    }

    getInvitationStatusDisplayName(status) {
        const statusMap = {
            'новое': 'Новое приглашение',
            'на связи': 'На связи',
            'встреча назначена': 'Встреча назначена',
            'вступил в клуб': 'Вступил в клуб',
            'отклонено': 'Отклонено'
        };
        return statusMap[status] || status;
    }

    async checkCarNumber(number) {
        // Запрос к API
        const apiUrl = this.getApiUrl('check_car_number');
        console.log('🔍 Отправляем запрос:', { url: apiUrl, number: number });
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reg_number: number })
        });
        
        console.log('📡 Получен ответ:', { status: response.status, statusText: response.statusText });
        
        const result = await response.json();
        console.log('📋 Результат API:', result);
        
        if (result.success && result.data) {
            return result.data;
        }
        
        // Если API вернул ошибку, выбрасываем её с сообщением
        const errorMessage = result.error || 'Неизвестная ошибка API';
        console.error('❌ Ошибка API:', errorMessage);
        throw new Error(errorMessage);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.app = new CabrioRideApp();
    console.log('App initialized:', window.app);
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Handle offline/online status
window.addEventListener('online', () => {
    console.log('🌐 Connection restored');
});

window.addEventListener('offline', () => {
    console.log('📴 Connection lost');
});