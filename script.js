const designStylesheet = document.createElement('link');
designStylesheet.rel = 'stylesheet';
designStylesheet.href = 'design.css';
document.head.append(designStylesheet);

const STORAGE_KEYS = { events: 'slkk-events-v1', registrations: 'slkk-registrations-v1' };
let events = readStorage(STORAGE_KEYS.events, []);
const cards = document.getElementById('eventCards');
const eventSelect = document.getElementById('eventSelect');
const dateInput = document.getElementById('eventDate');
const timeSelect = document.getElementById('eventTime');
const locationInput = document.getElementById('eventLocation');
const form = document.getElementById('registrationForm');
const message = document.getElementById('formMessage');
const submitButton = form.querySelector('[type="submit"]');

function readStorage(key, fallback) {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; }
  catch { return fallback; }
}
function saveStorage(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
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
function refreshEvents() {
  events = readStorage(STORAGE_KEYS.events, []);
  renderEvents();
  renderOptions();
}
function renderEvents() {
  cards.replaceChildren();
  if (!events.length) {
    const empty = appendText(cards, 'p', 'Скоро здесь появятся анонсы встреч и волонтёрских событий в Каменске-Уральском.', 'empty-state');
    const link = document.createElement('a'); link.className = 'text-link'; link.href = '#register'; link.textContent = 'Следить за анонсами';
    empty.append(document.createTextNode(' ')); empty.append(link);
    return;
  }
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
  const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = events.length ? 'Выберите событие' : 'Пока нет открытых событий'; placeholder.disabled = true; placeholder.selected = true; eventSelect.append(placeholder);
  events.forEach((item) => { const option = document.createElement('option'); option.value = item.id; option.textContent = item.title; eventSelect.append(option); });
  if (selectedId && events.some((item) => item.id === selectedId)) eventSelect.value = selectedId;
  submitButton.disabled = events.length === 0;
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
  if (!selected) { message.textContent = 'Сейчас нет доступных событий для записи.'; return; }
  const registrations = readStorage(STORAGE_KEYS.registrations, []);
  const name = String(data.get('name')).trim();
  registrations.push({ id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, name, email: String(data.get('email')).trim(), eventId: selected.id, eventTitle: selected.title, date: String(data.get('date')), time: String(data.get('time')), location: String(data.get('location')), role: String(data.get('role')), comment: String(data.get('message') || '').trim(), createdAt: new Date().toISOString() });
  saveStorage(STORAGE_KEYS.registrations, registrations);
  message.textContent = `Спасибо, ${name}! Заявка сохранена в этом браузере. Это демо: организаторы её не получат.`;
  form.reset(); renderOptions();
});
window.addEventListener('storage', (event) => { if (event.key === STORAGE_KEYS.events) refreshEvents(); });
refreshEvents();
