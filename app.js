// Получаем элементы
const tapBtn = document.getElementById('tap-btn');
const counter = document.getElementById('counter');

// Загружаем сохранённые клики (или 0)
let clicks = localStorage.getItem('clicks') || 0;
counter.textContent = clicks;

// Обработчик нажатия
tapBtn.addEventListener('click', () => {
    clicks++;
    counter.textContent = clicks;
    localStorage.setItem('clicks', clicks); // Сохраняем
});