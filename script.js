const STORAGE_KEYS = { events: 'tochka-vstrechi-events', registrations: 'tochka-vstrechi-registrations' };
const initialEvents = [
  { id: 'community-talk', title: 'Встреча «Люди и город»', category: 'Тематическая встреча', description: 'Обсуждаем, как сделать город доброжелательнее и комфортнее для всех.', date: '2026-11-18', timeSlots: ['18:30', '19:00'], location: 'Центр культуры «Площадка», зал № 2' },
  { id: 'volunteer-day', title: 'День добрых дел', category: 'Волонтёрство', description: 'Вместе помогаем местным инициативам и делаем общественное пространство лучше.', date: '2026-11-22', timeSlots: ['10:00', '12:30'], location: 'Парк имени Ленина, вход со стороны улицы Мира' },
  { id: 'school-support', title: 'Как остановить буллинг: разговор и поддержка', category: 'Поддержка школьников', description: 'Безопасная встреча для школьников и взрослых: как распознать травлю и где искать поддержку.', date: '2026-11-25', timeSlots: ['17:00', '18:30'], location: 'Молодёжный центр «Вектор», аудитория 3' },
  { id: 'creative-night', title: 'Творческая встреча «Идеи в действии»', category: 'Мастер-класс', description: 'Знакомимся, делимся идеями и создаём небольшие проекты вместе.', date: '2026-11-29', timeSlots: ['18:00', '19:30'], location: 'Коворкинг «Новый Вектор», 3-й этаж' }
];

function readStorage(key, fallback) {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; }
  catch { return fallback; }
}
function saveStorage(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
let events = readStorage(STORAGE_KEYS.events, initialEvents);
const cards = document.getElementById('eventCards');
const eventSelect = document.getElementById('eventSelect');
const dateInput = document.getElementById('eventDate');
const timeSelect = document.getElementById('eventTime');
const locationInput = document.getElementById('eventLocation');
const form = document.getElementById('registrationForm');
const message = document.getElementById('formMessage');

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}
function appendText(parent, tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  parent.append(node);
  return node;
}
function renderEvents() {
  cards.replaceChildren();
  if (!events.length) { appendText(cards, 'p', 'Сейчас нет запланированных событий. Загляните позже.', 'empty-state'); return; }
  events.forEach((item) => {
    const article = document.createElement('article'); article.className = 'event-card';
    const top = document.createElement('div'); top.className = 'event-card-top';
    appendText(top, 'span', item.category, 'event-category');
    appendText(top, 'span', formatDate(item.date), 'event-date-label'); article.append(top);
    appendText(article, 'h3', item.title);
    appendText(article, 'p', item.description);
    const info = document.createElement('div'); info.className = 'event-card-info';
    const dateLine = document.createElement('span'); dateLine.innerHTML = '<b>◷</b>'; dateLine.append(document.createTextNode(` ${item.timeSlots.join(' · ')}`)); info.append(dateLine);
    const placeLine = document.createElement('span'); placeLine.innerHTML = '<b>⌖</b>'; placeLine.append(document.createTextNode(` ${item.location}`)); info.append(placeLine);
    article.append(info);
    const button = document.createElement('a'); button.className = 'button'; button.href = '#register'; button.append(document.createTextNode('Записаться '));
    const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↗'; button.append(arrow);
    button.addEventListener('click', () => { eventSelect.value = item.id; updateEventDetails(); });
    article.append(button); cards.append(article);
  });
}
function renderOptions(selectedId) {
  eventSelect.replaceChildren();
  events.forEach((item) => { const option = document.createElement('option'); option.value = item.id; option.textContent = item.title; eventSelect.append(option); });
  if (selectedId && events.some((item) => item.id === selectedId)) eventSelect.value = selectedId;
  updateEventDetails();
}
function updateEventDetails() {
  const selected = events.find((item) => item.id === eventSelect.value);
  if (!selected) { dateInput.value = ''; locationInput.value = ''; timeSelect.replaceChildren(); return; }
  dateInput.value = selected.date; locationInput.value = selected.location;
  timeSelect.replaceChildren();
  selected.timeSlots.forEach((slot) => { const option = document.createElement('option'); option.value = slot; option.textContent = slot; timeSelect.append(option); });
}
eventSelect.addEventListener('change', updateEventDetails);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const selected = events.find((item) => item.id === data.get('event'));
  if (!selected) { message.textContent = 'Выберите доступное событие.'; return; }
  const registrations = readStorage(STORAGE_KEYS.registrations, []);
  registrations.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, name: String(data.get('name')).trim(), email: String(data.get('email')).trim(), eventId: selected.id, eventTitle: selected.title, date: String(data.get('date')), time: String(data.get('time')), location: String(data.get('location')), role: String(data.get('role')), comment: String(data.get('message') || '').trim(), createdAt: new Date().toISOString() });
  saveStorage(STORAGE_KEYS.registrations, registrations);
  message.textContent = `Спасибо, ${String(data.get('name')).trim()}! Заявка сохранена в этом браузере. Это демо: организаторы её не получат.`;
  form.reset(); renderOptions();
});
renderEvents(); renderOptions();
