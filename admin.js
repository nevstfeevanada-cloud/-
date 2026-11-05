const KEYS = { events: 'slkk-events-v1', registrations: 'slkk-registrations-v1' };
function load(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function addText(parent, tag, text, className) { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; parent.append(el); return el; }
const eventList = document.getElementById('adminEvents');
const signupList = document.getElementById('signupList');
const form = document.getElementById('eventForm');
const dateInput = document.getElementById('eventDateAdmin');
dateInput.min = new Date().toISOString().slice(0, 10);
function render() {
  const events = load(KEYS.events, []); const registrations = load(KEYS.registrations, []);
  eventList.replaceChildren();
  if (!events.length) addText(eventList, 'p', 'Событий пока нет. Добавьте подтверждённое мероприятие, чтобы оно появилось в списке.', 'empty-state');
  events.forEach((item) => {
    const row = document.createElement('article'); row.className = 'admin-event'; const copy = document.createElement('div');
    addText(copy, 'h3', item.title); addText(copy, 'p', `${item.date} · ${item.timeSlots.join(', ')} · ${item.location}`); row.append(copy);
    const remove = addText(row, 'button', 'Удалить', 'danger-button'); remove.type = 'button';
    remove.addEventListener('click', () => { if (!confirm(`Удалить событие «${item.title}»?`)) return; save(KEYS.events, events.filter((event) => event.id !== item.id)); render(); }); eventList.append(row);
  });
  document.getElementById('signupCount').textContent = `(${registrations.length})`; signupList.replaceChildren();
  if (!registrations.length) addText(signupList, 'p', 'Заявок пока нет. Учтите: это локальная демо-версия, заявки с устройств посетителей сюда не поступают.', 'empty-state');
  [...registrations].reverse().forEach((item) => {
    const row = document.createElement('article'); row.className = 'signup-row'; const copy = document.createElement('div');
    addText(copy, 'h3', item.name); addText(copy, 'p', `${item.eventTitle} · ${item.role} · ${item.email}`); if (item.comment) addText(copy, 'p', `Комментарий: ${item.comment}`); row.append(copy);
    const meta = document.createElement('div'); meta.className = 'signup-meta'; addText(meta, 'div', new Intl.DateTimeFormat('ru-RU').format(new Date(`${item.date}T00:00:00`))); addText(meta, 'div', item.time); row.append(meta); signupList.append(row);
  });
}
form.addEventListener('submit', (event) => {
  event.preventDefault(); const data = new FormData(form);
  const timeSlots = String(data.get('times')).split(',').map((slot) => slot.trim()).filter(Boolean);
  if (!timeSlots.length) return;
  const events = load(KEYS.events, []);
  events.push({ id: globalThis.crypto?.randomUUID?.() || `event-${Date.now()}`, title: String(data.get('title')).trim(), category: String(data.get('category')), description: String(data.get('description')).trim(), date: String(data.get('date')), timeSlots, location: String(data.get('location')).trim() });
  save(KEYS.events, events); form.reset(); dateInput.min = new Date().toISOString().slice(0, 10); render();
});
document.getElementById('clearSignups').addEventListener('click', () => { if (confirm('Удалить все заявки, сохранённые в этом браузере?')) { save(KEYS.registrations, []); render(); } });
document.getElementById('exportCsv').addEventListener('click', () => {
  const rows = load(KEYS.registrations, []); if (!rows.length) { alert('Заявок пока нет.'); return; }
  const columns = ['Имя', 'Email', 'Событие', 'Дата', 'Время', 'Место', 'Роль', 'Комментарий'];
  const values = rows.map((row) => [row.name, row.email, row.eventTitle, row.date, row.time, row.location, row.role, row.comment]);
  const csv = [columns, ...values].map((line) => line.map((value) => { let safe = String(value ?? ''); if (/^[=+@\-\t\r]/.test(safe)) safe = `'${safe}`; return `"${safe.replaceAll('"', '""')}"`; }).join(';')).join('\r\n');
  const link = document.createElement('a'); const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' })); link.href = url; link.download = 'slkk-zayavki.csv'; link.click(); URL.revokeObjectURL(url);
});
window.addEventListener('storage', (event) => { if (event.key === KEYS.events || event.key === KEYS.registrations) render(); });
render();
