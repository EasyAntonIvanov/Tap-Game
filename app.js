// Получаем элементы
const tapBtn = document.getElementById('tap-btn');
const counter = document.getElementById('counter');
const tapSound = document.getElementById('tap-sound');

// Конфиг Firebase (замените на свой!)
const firebaseConfig = {
    apiKey: "AIzaSyABCD...",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "1234567890"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Получаем ID пользователя Telegram
const userId = Telegram.WebApp.initDataUnsafe.user?.id || 'guest_' + Math.random().toString(36).substr(2, 9);

// Функция обновления рейтинга
function updateLeaderboard() {
    const topPlayersRef = database.ref('players').orderByChild('clicks').limitToLast(10);
    
    topPlayersRef.on('value', (snapshot) => {
        const players = [];
        snapshot.forEach((childSnapshot) => {
            players.push(childSnapshot.val());
        });
        
        players.sort((a, b) => b.clicks - a.clicks);  // Сортировка по убыванию
        
        const leaderboard = document.getElementById('top-players');
        leaderboard.innerHTML = players.map(player => 
            `<li>${player.name}: ${player.clicks} 👆</li>`
        ).join('');
    });
}

// В обработчике клика (дополните существующий код):
tapBtn.addEventListener('click', () => {
    // ... предыдущий код ...
    
    // Сохраняем в Firebase
    database.ref('players/' + userId).set({
        name: Telegram.WebApp.initDataUnsafe.user?.first_name || 'Аноним',
        clicks: clicks
    });
      // Анимация счетчика
    counter.classList.add('counter-update');
    setTimeout(() => counter.classList.remove('counter-update'), 300);
});
    updateLeaderboard();
});

// Первый запуск рейтинга
updateLeaderboard();
// Загружаем сохранённые клики (или 0)
let clicks = localStorage.getItem('clicks') || 0;
counter.textContent = clicks;

// Обработчик нажатия
tapBtn.addEventListener('click', () => {
    tapSound.currentTime = 0;  // Перематываем звук на начало
    tapSound.play();           // Проигрываем
    // ... остальной код клика ...
});
tapBtn.addEventListener('click', () => {
    clicks++;
    counter.textContent = clicks;
    localStorage.setItem('clicks', clicks); // Сохраняем
});