/**
 * Cabrio Club Dashboard - Mock Data
 * Заглушки данных для демонстрации интерфейса
 */

// Статистика клуба
const mockStats = {
    total_members: 25,
    active_members: 18,
    total_cars: 32,
    pending_invitations: 3,
    successful_invitations: 15,
    upcoming_events: 4,
    total_events: 12,
    recommended_services: 8,
    total_services: 15
};

// Участники клуба
const mockMembers = [
    {
        id: 1,
        telegram_id: '287536885',
        first_name: 'Александр',
        last_name: 'Петров',
        nickname: 'alex_petrov',
        city: 'Москва',
        join_date: '2024-01-15',
        status: 'активный',
        message_count: 245,
        photo_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        cars: [
            {
                id: 1,
                brand: 'BMW',
                model: 'Z4',
                year: 2019,
                reg_number: 'М123АВ777',
                color: 'Белый',
                engine_volume: '2.0'
            },
            {
                id: 5,
                brand: 'BMW',
                model: 'Z3',
                year: 2001,
                reg_number: 'М987УТ123',
                color: 'Серебристый',
                engine_volume: '1.9'
            }
        ]
    },
    {
        id: 2,
        first_name: 'Мария',
        last_name: 'Иванова',
        nickname: 'maria_drive',
        city: 'Санкт-Петербург',
        join_date: '2024-02-03',
        status: 'активный',
        message_count: 189,
        photo_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        cars: [
            {
                id: 2,
                brand: 'Mercedes-Benz',
                model: 'SLK-Class',
                year: 2016,
                reg_number: 'А456ВС199',
                color: 'Красный',
                engine_volume: '1.8'
            }
        ]
    },
    {
        id: 3,
        first_name: 'Дмитрий',
        last_name: 'Козлов',
        nickname: 'dmitry_cabrio',
        city: 'Краснодар',
        join_date: '2024-01-28',
        status: 'участник',
        message_count: 67,
        cars: []
    },
    {
        id: 4,
        first_name: 'Елена',
        last_name: 'Смирнова',
        nickname: 'elena_sun',
        city: 'Екатеринбург',
        join_date: '2024-03-10',
        status: 'активный',
        message_count: 156,
        photo_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        cars: [
            {
                id: 3,
                brand: 'Audi',
                model: 'TT',
                year: 2018,
                reg_number: 'С789ДЕ777',
                color: 'Синий',
                engine_volume: '2.0'
            }
        ]
    },
    {
        id: 5,
        first_name: 'Максим',
        last_name: 'Волков',
        nickname: 'max_wind',
        city: 'Новосибирск',
        join_date: '2024-02-20',
        status: 'активный',
        message_count: 203,
        cars: [
            {
                id: 4,
                brand: 'Porsche',
                model: 'Boxster',
                year: 2017,
                reg_number: 'Р321КЛ555',
                color: 'Черный',
                engine_volume: '2.5'
            }
        ]
    },
    {
        id: 6,
        first_name: 'Андрей',
        last_name: 'Кузнецов',
        nickname: 'andrey_speed',
        city: 'Ростов-на-Дону',
        join_date: '2024-01-05',
        status: 'активный',
        message_count: 178,
        cars: [
            {
                id: 6,
                brand: 'Mazda',
                model: 'MX-5',
                year: 2015,
                reg_number: 'Н654ТР888',
                color: 'Красный',
                engine_volume: '1.5'
            }
        ]
    },
    {
        id: 7,
        first_name: 'Ольга',
        last_name: 'Морозова',
        nickname: 'olga_frost',
        city: 'Казань',
        join_date: '2024-02-15',
        status: 'активный',
        message_count: 89,
        cars: [
            {
                id: 7,
                brand: 'Volkswagen',
                model: 'Eos',
                year: 2014,
                reg_number: 'О987УИ444',
                color: 'Белый',
                engine_volume: '2.0'
            }
        ]
    },
    {
        id: 8,
        first_name: 'Игорь',
        last_name: 'Лебедев',
        nickname: 'igor_eagle',
        city: 'Самара',
        join_date: '2024-03-01',
        status: 'участник',
        message_count: 45,
        cars: []
    },
    {
        id: 9,
        first_name: 'Анна',
        last_name: 'Титова',
        nickname: 'anna_titan',
        city: 'Уфа',
        join_date: '2024-01-30',
        status: 'активный',
        message_count: 134,
        cars: [
            {
                id: 8,
                brand: 'MINI',
                model: 'Cooper Convertible',
                year: 2019,
                reg_number: 'Т234ЫВ111',
                color: 'Синий',
                engine_volume: '1.5'
            }
        ]
    },
    {
        id: 10,
        first_name: 'Владимир',
        last_name: 'Орлов',
        nickname: 'vlad_eagle',
        city: 'Пермь',
        join_date: '2024-02-28',
        status: 'новый',
        message_count: 23,
        cars: []
    }
];

// Автомобили с информацией о владельцах
const mockCars = [
    {
        id: 1,
        member_id: 1,
        brand: 'BMW',
        model: 'Z4',
        year: 2019,
        reg_number: 'М123АВ777',
        color: 'Белый',
        engine_volume: '2.0',
        owner_name: 'Александр Петров',
        owner_nickname: 'alex_petrov',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    },
    {
        id: 2,
        member_id: 2,
        brand: 'Mercedes-Benz',
        model: 'SLK-Class',
        year: 2016,
        reg_number: 'А456ВС199',
        color: 'Красный',
        engine_volume: '1.8',
        owner_name: 'Мария Иванова',
        owner_nickname: 'maria_drive',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    },
    {
        id: 3,
        member_id: 4,
        brand: 'Audi',
        model: 'TT',
        year: 2018,
        reg_number: 'С789ДЕ777',
        color: 'Синий',
        engine_volume: '2.0',
        owner_name: 'Елена Смирнова',
        owner_nickname: 'elena_sun',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1719649/pexels-photo-1719649.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    },
    {
        id: 4,
        member_id: 5,
        brand: 'Porsche',
        model: 'Boxster',
        year: 2017,
        reg_number: 'Р321КЛ555',
        color: 'Черный',
        engine_volume: '2.5',
        owner_name: 'Максим Волков',
        owner_nickname: 'max_wind',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    },
    {
        id: 5,
        member_id: 1,
        brand: 'BMW',
        model: 'Z3',
        year: 2001,
        reg_number: 'М987УТ123',
        color: 'Серебристый',
        engine_volume: '1.9',
        owner_name: 'Александр Петров',
        owner_nickname: 'alex_petrov',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    },
    {
        id: 6,
        member_id: 6,
        brand: 'Mazda',
        model: 'MX-5',
        year: 2015,
        reg_number: 'Н654ТР888',
        color: 'Красный',
        engine_volume: '1.5',
        owner_name: 'Андрей Кузнецов',
        owner_nickname: 'andrey_speed',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    },
    {
        id: 7,
        member_id: 7,
        brand: 'Volkswagen',
        model: 'Eos',
        year: 2014,
        reg_number: 'О987УИ444',
        color: 'Белый',
        engine_volume: '2.0',
        owner_name: 'Ольга Морозова',
        owner_nickname: 'olga_frost',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1719649/pexels-photo-1719649.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    },
    {
        id: 8,
        member_id: 9,
        brand: 'MINI',
        model: 'Cooper Convertible',
        year: 2019,
        reg_number: 'Т234ЫВ111',
        color: 'Синий',
        engine_volume: '1.5',
        owner_name: 'Анна Титова',
        owner_nickname: 'anna_titan',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    }
];

// Приглашения
const mockInvitations = [
    {
        id: 1,
        car_id: 1,
        inviter_member_id: 1,
        invitation_date: '2024-01-10',
        location: 'Красная площадь',
        status: 'вступил в клуб',
        car_brand: 'BMW',
        car_model: 'Z4',
        car_reg_number: 'М123АВ777',
        inviter_name: 'Александр Петров',
        inviter_nickname: 'alex_petrov',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    },
    {
        id: 2,
        car_id: 2,
        inviter_member_id: 2,
        invitation_date: '2024-01-25',
        location: 'Дворцовая площадь',
        status: 'вступил в клуб',
        car_brand: 'Mercedes-Benz',
        car_model: 'SLK-Class',
        car_reg_number: 'А456ВС199',
        inviter_name: 'Мария Иванова',
        inviter_nickname: 'maria_drive'
    },
    {
        id: 3,
        car_id: 3,
        inviter_member_id: 1,
        invitation_date: '2024-03-15',
        location: 'Арбат',
        status: 'вступил в клуб',
        car_brand: 'Audi',
        car_model: 'TT',
        car_reg_number: 'С789ДЕ777',
        inviter_name: 'Александр Петров',
        inviter_nickname: 'alex_petrov',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1719649/pexels-photo-1719649.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    },
    {
        id: 4,
        car_id: 4,
        inviter_member_id: 2,
        invitation_date: '2024-03-20',
        location: 'Парк Горького',
        status: 'приглашение',
        car_brand: 'Porsche',
        car_model: 'Boxster',
        car_reg_number: 'Р321КЛ555',
        inviter_name: 'Мария Иванова',
        inviter_nickname: 'maria_drive'
    },
    {
        id: 5,
        car_id: 5,
        inviter_member_id: 1,
        invitation_date: '2024-03-25',
        location: 'Воробьевы горы',
        status: 'приглашение',
        car_brand: 'BMW',
        car_model: 'Z3',
        car_reg_number: 'М987УТ123',
        inviter_name: 'Александр Петров',
        inviter_nickname: 'alex_petrov',
        photos: JSON.stringify([
            'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400'
        ])
    },
    {
        id: 6,
        car_id: 6,
        inviter_member_id: 6,
        invitation_date: '2024-02-10',
        location: 'Набережная Дона',
        status: 'вступил в клуб',
        car_brand: 'Mazda',
        car_model: 'MX-5',
        car_reg_number: 'Н654ТР888',
        inviter_name: 'Андрей Кузнецов',
        inviter_nickname: 'andrey_speed'
    },
    {
        id: 7,
        car_id: 7,
        inviter_member_id: 7,
        invitation_date: '2024-02-28',
        location: 'Кремль Казани',
        status: 'вступил в клуб',
        car_brand: 'Volkswagen',
        car_model: 'Eos',
        car_reg_number: 'О987УИ444',
        inviter_name: 'Ольга Морозова',
        inviter_nickname: 'olga_frost'
    }
];

// События клуба
const mockEvents = [
    {
        id: 1,
        title: 'Весенний заезд в Подмосковье',
        description: 'Традиционный весенний заезд по живописным дорогам Подмосковья. Маршрут включает остановки в исторических местах и фотосессии.',
        event_date: '2024-04-15',
        event_time: '10:00',
        location: 'Москва, Красная площадь',
        city: 'Москва',
        type: 'заезд',
        status: 'запланировано',
        organizer_id: 1,
        organizer_name: 'Александр Петров',
        organizer_nickname: 'alex_petrov',
        participants_count: 12,
        max_participants: 20,
        price: 0,
        photos: JSON.stringify([
            'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]),
        created_at: '2024-03-01'
    },
    {
        id: 2,
        title: 'Техническая встреча: Подготовка к сезону',
        description: 'Обсуждение технических вопросов подготовки кабриолетов к летнему сезону. Приглашены эксперты по обслуживанию.',
        event_date: '2024-04-08',
        event_time: '14:00',
        location: 'Автосервис "Кабрио Центр"',
        city: 'Москва',
        type: 'встреча',
        status: 'запланировано',
        organizer_id: 2,
        organizer_name: 'Мария Иванова',
        organizer_nickname: 'maria_drive',
        participants_count: 8,
        max_participants: 15,
        price: 500,
        created_at: '2024-02-20'
    },
    {
        id: 3,
        title: 'Фотосессия в центре Санкт-Петербурга',
        description: 'Профессиональная фотосессия участников клуба на фоне архитектуры Северной столицы.',
        event_date: '2024-04-22',
        event_time: '11:00',
        location: 'Дворцовая площадь',
        city: 'Санкт-Петербург',
        type: 'фотосессия',
        status: 'запланировано',
        organizer_id: 2,
        organizer_name: 'Мария Иванова',
        organizer_nickname: 'maria_drive',
        participants_count: 6,
        max_participants: 10,
        price: 1500,
        photos: JSON.stringify([
            'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]),
        created_at: '2024-03-05'
    },
    {
        id: 4,
        title: 'Майские праздники в Сочи',
        description: 'Большой заезд в Сочи на майские праздники. Проживание в отеле, экскурсии, совместные ужины.',
        event_date: '2024-05-01',
        event_time: '08:00',
        location: 'Сочи, набережная',
        city: 'Сочи',
        type: 'поездка',
        status: 'запланировано',
        organizer_id: 4,
        organizer_name: 'Елена Смирнова',
        organizer_nickname: 'elena_sun',
        participants_count: 15,
        max_participants: 25,
        price: 15000,
        created_at: '2024-02-15'
    },
    {
        id: 5,
        title: 'Зимняя встреча в гараже',
        description: 'Зимняя встреча участников клуба для обсуждения планов на следующий сезон и обмена опытом.',
        event_date: '2024-01-20',
        event_time: '15:00',
        location: 'Гараж "Автолюбитель"',
        city: 'Москва',
        type: 'встреча',
        status: 'завершено',
        organizer_id: 1,
        organizer_name: 'Александр Петров',
        organizer_nickname: 'alex_petrov',
        participants_count: 18,
        max_participants: 20,
        price: 0,
        created_at: '2024-01-01'
    },
    {
        id: 6,
        title: 'Новогодний банкет клуба',
        description: 'Торжественный новогодний банкет участников клуба кабриолетов с развлекательной программой.',
        event_date: '2023-12-30',
        event_time: '19:00',
        location: 'Ресторан "Панорама"',
        city: 'Москва',
        type: 'банкет',
        status: 'завершено',
        organizer_id: 5,
        organizer_name: 'Максим Волков',
        organizer_nickname: 'max_wind',
        participants_count: 22,
        max_participants: 25,
        price: 3500,
        photos: JSON.stringify([
            'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]),
        created_at: '2023-11-15'
    }
];

// Сервисы и отзывы
const mockServices = [
    {
        id: 1,
        name: 'Автосервис "Кабрио Центр"',
        description: 'Специализированный сервис по обслуживанию кабриолетов. Ремонт крыш, диагностика, ТО.',
        city: 'Москва',
        address: 'ул. Автомобильная, 15',
        phone: '+7 (495) 123-45-67',
        website: 'www.cabrio-center.ru',
        services: ['Ремонт крыш', 'Диагностика', 'ТО', 'Кузовной ремонт'],
        type: 'автосервис',
        recommendation: 'рекомендуется',
        rating: 4.8,
        reviews_count: 15,
        added_by_id: 1,
        added_by_name: 'Александр Петров',
        added_by_nickname: 'alex_petrov',
        created_at: '2024-01-10',
        reviews: [
            {
                id: 1,
                member_id: 1,
                member_name: 'Александр Петров',
                member_nickname: 'alex_petrov',
                rating: 5,
                comment: 'Отличный сервис! Быстро и качественно отремонтировали крышу на Z4. Рекомендую!',
                date: '2024-02-15'
            },
            {
                id: 2,
                member_id: 2,
                member_name: 'Мария Иванова',
                member_nickname: 'maria_drive',
                rating: 4,
                comment: 'Хороший сервис, но цены немного завышены. Качество работы на высоте.',
                date: '2024-03-01'
            }
        ]
    },
    {
        id: 2,
        name: 'Детейлинг "Блеск"',
        description: 'Профессиональная химчистка и детейлинг автомобилей. Специальные программы для кабриолетов.',
        city: 'Москва',
        address: 'ул. Чистая, 8',
        phone: '+7 (495) 987-65-43',
        services: ['Химчистка салона', 'Полировка кузова', 'Защитные покрытия', 'Чистка крыши'],
        type: 'детейлинг',
        recommendation: 'рекомендуется',
        rating: 4.9,
        reviews_count: 12,
        added_by_id: 4,
        added_by_name: 'Елена Смирнова',
        added_by_nickname: 'elena_sun',
        created_at: '2024-01-25',
        reviews: [
            {
                id: 3,
                member_id: 4,
                member_name: 'Елена Смирнова',
                member_nickname: 'elena_sun',
                rating: 5,
                comment: 'Превосходная работа! Машина выглядит как новая. Особенно хорошо почистили тканевую крышу.',
                date: '2024-02-20'
            }
        ]
    },
    {
        id: 3,
        name: 'Шиномонтаж "Быстрые колеса"',
        description: 'Круглосуточный шиномонтаж с выездом. Хранение сезонных шин.',
        city: 'Санкт-Петербург',
        address: 'пр. Колесный, 22',
        phone: '+7 (812) 555-12-34',
        services: ['Шиномонтаж', 'Балансировка', 'Хранение шин', 'Выездной сервис'],
        type: 'шиномонтаж',
        recommendation: 'рекомендуется',
        rating: 4.3,
        reviews_count: 8,
        added_by_id: 2,
        added_by_name: 'Мария Иванова',
        added_by_nickname: 'maria_drive',
        created_at: '2024-02-01',
        reviews: [
            {
                id: 4,
                member_id: 2,
                member_name: 'Мария Иванова',
                member_nickname: 'maria_drive',
                rating: 4,
                comment: 'Удобно, что работают круглосуточно. Качество нормальное, цены приемлемые.',
                date: '2024-03-10'
            }
        ]
    },
    {
        id: 4,
        name: 'Автоэлектрик Иван',
        description: 'Частный мастер по автоэлектрике. Специализируется на электрических крышах кабриолетов.',
        city: 'Москва',
        phone: '+7 (903) 123-45-67',
        services: ['Ремонт электрики', 'Диагностика', 'Ремонт крыш', 'Установка сигнализации'],
        type: 'электрик',
        recommendation: 'рекомендуется',
        rating: 4.7,
        reviews_count: 6,
        added_by_id: 5,
        added_by_name: 'Максим Волков',
        added_by_nickname: 'max_wind',
        created_at: '2024-02-10',
        reviews: [
            {
                id: 5,
                member_id: 5,
                member_name: 'Максим Волков',
                member_nickname: 'max_wind',
                rating: 5,
                comment: 'Золотые руки! Починил крышу на Porsche, которую не могли отремонтировать в официальном сервисе.',
                date: '2024-02-25'
            }
        ]
    },
    {
        id: 5,
        name: 'СТО "Гараж 77"',
        description: 'Сомнительный сервис с плохой репутацией. Были случаи некачественного ремонта.',
        city: 'Москва',
        address: 'ул. Темная, 13',
        phone: '+7 (495) 000-00-00',
        services: ['Ремонт двигателя', 'Кузовной ремонт', 'ТО'],
        type: 'автосервис',
        recommendation: 'не рекомендуется',
        rating: 2.1,
        reviews_count: 4,
        added_by_id: 3,
        added_by_name: 'Дмитрий Козлов',
        added_by_nickname: 'dmitry_cabrio',
        created_at: '2024-01-15',
        reviews: [
            {
                id: 6,
                member_id: 3,
                member_name: 'Дмитрий Козлов',
                member_nickname: 'dmitry_cabrio',
                rating: 1,
                comment: 'Ужасный сервис! Сделали еще хуже, чем было. Не рекомендую никому!',
                date: '2024-01-20'
            },
            {
                id: 7,
                member_id: 8,
                member_name: 'Игорь Лебедев',
                member_nickname: 'igor_eagle',
                rating: 3,
                comment: 'Дешево, но качество соответствующее. Лучше доплатить и поехать в нормальный сервис.',
                date: '2024-02-05'
            }
        ]
    },
    {
        id: 6,
        name: 'Автомойка "Кристалл"',
        description: 'Качественная автомойка с бесконтактной мойкой и ручной сушкой.',
        city: 'Екатеринбург',
        address: 'ул. Чистая, 45',
        phone: '+7 (343) 777-88-99',
        services: ['Бесконтактная мойка', 'Ручная сушка', 'Мойка двигателя', 'Чернение шин'],
        type: 'автомойка',
        recommendation: 'рекомендуется',
        rating: 4.5,
        reviews_count: 10,
        added_by_id: 4,
        added_by_name: 'Елена Смирнова',
        added_by_nickname: 'elena_sun',
        created_at: '2024-02-20',
        reviews: [
            {
                id: 8,
                member_id: 4,
                member_name: 'Елена Смирнова',
                member_nickname: 'elena_sun',
                rating: 5,
                comment: 'Отличная мойка! Аккуратно моют, не повреждают крышу. Рекомендую!',
                date: '2024-03-01'
            }
        ]
    }
];

// API заглушки
const mockAPI = {
    async getStats() {
        await this.delay(300);
        return { success: true, data: mockStats };
    },

    async getMembers() {
        await this.delay(500);
        return { success: true, data: mockMembers };
    },

    async getCars() {
        await this.delay(400);
        return { success: true, data: mockCars };
    },

    async getInvitations() {
        await this.delay(450);
        return { success: true, data: mockInvitations };
    },

    async getEvents() {
        await this.delay(400);
        return { success: true, data: mockEvents };
    },

    async getServices() {
        await this.delay(350);
        return { success: true, data: mockServices };
    },

    async verifyUser(userData) {
        await this.delay(200);
        // Заглушка проверки - всегда разрешаем доступ
        return { 
            success: true, 
            data: { access: true, status: 'активный' } 
        };
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Экспорт для использования в app.js
window.mockAPI = mockAPI;
window.mockData = {
    stats: mockStats,
    members: mockMembers,
    cars: mockCars,
    invitations: mockInvitations,
    events: mockEvents,
    services: mockServices
};