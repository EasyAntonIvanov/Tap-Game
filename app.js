// ======================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ======================

// DOM-элементы
const tapBtn = document.getElementById('tap-btn');
const counter = document.getElementById('counter');
const tapSound = document.getElementById('tap-sound');
const topPlayersList = document.getElementById('top-players');

// Переменные состояния
let clicks = localStorage.getItem('clicks') || 0;
counter.textContent = clicks;

// Получаем ID пользователя (из Telegram или генерируем случайный)
const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 
               'guest_' + Math.random().toString(36).substr(2, 9);

// ======================
// FIREBASE (РЕЙТИНГ ИГРОКОВ)
// ======================

// Конфигурация Firebase (ЗАМЕНИТЕ НА СВОЮ!)
const firebaseConfig = {
  apiKey: "AIzaSyAer14dtHsoZZOtyQeCa5J7AoS8oEsSkSw",
  authDomain: "tap-game-easy.firebaseapp.com",
  databaseURL: "https://tap-game-easy-default-rtdb.firebaseio.com",
  projectId: "tap-game-easy",
  storageBucket: "tap-game-easy.firebasestorage.app",
  messagingSenderId: "97724951543",
  appId: "1:97724951543:web:3244cdd53f711ae894dcf2",
  measurementId: "G-0Y1PS1GK0J"
};

// Инициализация Firebase
try {
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    
    // Функция обновления таблицы лидеров
    const updateLeaderboard = () => {
        database.ref('players')
            .orderByChild('clicks')
            .limitToLast(10)
            .on('value', (snapshot) => {
                const players = [];
                
                snapshot.forEach(childSnapshot => {
                    const player = childSnapshot.val();
                    player.id = childSnapshot.key;
                    players.push(player);
                });
                
                // Сортировка по убыванию кликов
                players.sort((a, b) => b.clicks - a.clicks);
                
                // Отрисовка рейтинга
                topPlayersList.innerHTML = players.map((player, index) => `
                    <li>
                        <span class="rank">${index + 1}.</span>
                        <span class="name">${player.name || 'Аноним'}</span>
                        <span class="score">${player.clicks} 👆</span>
                    </li>
                `).join('');
            });
    };
    
    // Сохранение результата в Firebase
    const saveResult = () => {
        database.ref('players/' + userId).set({
            name: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Аноним',
            clicks: clicks,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
    };
    
    // Первоначальная загрузка рейтинга
    updateLeaderboard();
    
} catch (error) {
    console.error("Firebase error:", error);
    topPlayersList.innerHTML = '<li>Рейтинг временно недоступен</li>';
}

// ======================
// ОСНОВНАЯ ЛОГИКА
// ======================

// Обработчик клика
tapBtn.addEventListener('click', () => {
    // 1. Воспроизведение звука
    tapSound.currentTime = 0;
    tapSound.play().catch(e => console.log("Sound error:", e));
  
    // 2. Обновление счетчика
    clicks++;
    counter.textContent = clicks;
    localStorage.setItem('clicks', clicks);
    
    // 3. Анимация счетчика
    counter.classList.add('counter-update');
    setTimeout(() => counter.classList.remove('counter-update'), 300);
    
    // 4. Сохранение в Firebase (если подключен)
    database.ref('players/' + userId).set({
    name: Telegram.WebApp.initDataUnsafe.user?.first_name || 'Аноним',
    clicks: clicks);
    
    // 5. Дополнительная анимация кнопки
    tapBtn.style.transform = 'scale(0.95)';
    setTimeout(() => tapBtn.style.transform = 'scale(1)', 100);
});

// ======================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
// ======================

// Автоматическое сохранение каждые 30 секунд
setInterval(() => {
    if (firebase.apps.length && clicks > 0) {
        saveResult();
    }
}, 30000);

// Проверка WebApp Telegram
if (window.Telegram?.WebApp) {
    Telegram.WebApp.expand(); // Раскрываем на весь экран
    Telegram.WebApp.enableClosingConfirmation(); // Подтверждение закрытия
    
    // Изменяем цвет фона под тему Telegram
    document.body.style.backgroundColor = Telegram.WebApp.themeParams.bg_color || '#f0f8ff';
}