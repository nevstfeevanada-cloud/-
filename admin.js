const KEYS = { events: 'tochka-vstrechi-events', registrations: 'tochka-vstrechi-registrations' };
const defaults = [
  { id: 'community-talk', title: 'Встреча «Люди и город»', category: 'Тематическая встреча', description: 'Обсуждаем, как сделать город доброжелательнее и комфортнее для всех.', date: '2026-11-18', timeSlots: ['18:30', '19:00'], location: 'Центр культуры «Площадка», зал № 2' },
  { id: 'volunteer-day', title: 'День добрых дел', category: 'Волонтёрство', description: 'Вместе помогаем местным инициативам и делаем общественное пространство лучше.', date: '2026-11-22', timeSlots: ['10:00', '12:30'], location: 'Парк имени Ленина, вход со стороны улицы Мира' },
  { id: 'school-support', title: 'Как остановить буллинг: разговор и поддержка', category: 'Поддержка школьников', description: 'Безопасная встреча для школьников и взрослых: как распознать травлю и где искать поддержку.', date: '2026-11-25', timeSlots: ['17:00', '18:30'], location: 'Молодёжный центр «Вектор», аудитория 3' },
  { id: 'creative-night', title: 'Творческая встреча «Идеи в действии»', category: 'Мастер-класс', description: 'Знакомимся, делимся идеями и создаём небольшие проекты вместе.', date: '2026-11-29', timeSlots: ['18:00', '19:30'], location: 'Коворкинг «Новый Вектор», 3-й этаж' }
];
function load(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function addText(parent, tag, text, className) { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; parent.append(el); return el; }
let events = load(KEYS.events, defaults);
const eventList = document.getElementById('adminEvents');
const signupList = document.getElementById('signupList');
const form = document.getElementById('eventForm');
function render() {
  events = load(KEYS.events, defaults); const registrations = load(KEYS.registrations, []);
  eventList.replaceChildren();
  if (!events.length) addText(eventList, 'p', 'Событий пока нет.', 'empty-state');
  events.forEach((item) => { const row = document.createElement('article'); row.className = 'admin-event'; const copy = document.createElement('div'); addText(copy, 'h3', item.title); addText(copy, 'p', `${item.date} · ${item.timeSlots.join(', ')} · ${item.location}`); row.append(copy); const remove = addText(row, 'button', 'Удалить', 'danger-button'); remove.type = 'button'; remove.addEventListener('click', () => { if (!confirm(`Удалить событие «${item.title}»?`)) return; events = events.filter((event) => event.id !== item.id); save(KEYS.events, events); render(); }); eventList.append(row); });
  document.getElementById('signupCount').textContent = `(${registrations.length})`; signupList.replaceChildren();
  if (!registrations.length) addText(signupList, 'p', 'Заявок пока нет. В демо-версии они видны только в этом браузере.', 'empty-state');
  [...registrations].reverse().forEach((item) => { const row = document.createElement('article'); row.className = 'signup-row'; const copy = document.createElement('div'); addText(copy, 'h3', item.name); addText(copy, 'p', `${item.eventTitle} · ${item.role} · ${item.email}`); if (item.comment) addText(copy, 'p', `Комментарий: ${item.comment}`); row.append(copy); const meta = document.createElement('div'); meta.className = 'signup-meta'; addText(meta, 'div', new Intl.DateTimeFormat('ru-RU').format(new Date(`${item.date}T00:00:00`))); addText(meta, 'div', item.time); row.append(meta); signupList.append(row); });
}
form.addEventListener('submit', (event) => { event.preventDefault(); const data = new FormData(form); const timeSlots = String(data.get('times')).split(',').map((slot) => slot.trim()).filter(Boolean); if (!timeSlots.length) return; events = load(KEYS.events, defaults); events.push({ id: `event-${Date.now()}`, title: String(data.get('title')).trim(), category: String(data.get('category')), description: String(data.get('description')).trim(), date: String(data.get('date')), timeSlots, location: String(data.get('location')).trim() }); save(KEYS.events, events); form.reset(); render(); });
document.getElementById('clearSignups').addEventListener('click', () => { if (confirm('Удалить все сохранённые в этом браузере заявки?')) { save(KEYS.registrations, []); render(); } });
document.getElementById('exportCsv').addEventListener('click', () => { const rows = load(KEYS.registrations, []); if (!rows.length) { alert('Заявок пока нет.'); return; } const columns = ['Имя', 'Email', 'Событие', 'Дата', 'Время', 'Место', 'Роль', 'Комментарий']; const values = rows.map((row) => [row.name, row.email, row.eventTitle, row.date, row.time, row.location, row.role, row.comment]); const csv = [columns, ...values].map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\r\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' })); link.download = 'zayavki-tochka-vstrechi.csv'; link.click(); URL.revokeObjectURL(link.href); });
render();
