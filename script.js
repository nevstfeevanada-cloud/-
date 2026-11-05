const eventData = [
  {
    id: 'community-talk',
    title: 'Клуб обсуждений “Люди и город”',
    category: 'Встреча',
    description:
      'Тематический разговор о том, как сделать город более дружелюбным, безопасным и интересным для каждого жителя.',
    date: '2026-11-18',
    timeSlots: ['18:30', '19:00'],
    location: 'Центр культуры “Площадка”, зал №2',
    tags: ['Нетворкинг', 'Идеи', 'Диалог']
  },
  {
    id: 'volunteer-day',
    title: 'Волонтёрский день сообществ',
    category: 'Волонтёрство',
    description:
      'Совместная помощь в благоустройстве общественного пространства, сбор материалов и поддержка местных инициатив.',
    date: '2026-11-22',
    timeSlots: ['10:00', '12:30'],
    location: 'Парк им. Ленина, вход со стороны улицы Мира',
    tags: ['Помощь', 'Сообщество', 'Улица']
  },
  {
    id: 'creative-night',
    title: 'Творческая встреча “Идеи в действии”',
    category: 'Мастер-класс',
    description:
      'Небольшой формат общения, обмена идеями и интерактивного созидания в среде творческих людей и активистов.',
    date: '2026-11-29',
    timeSlots: ['18:00', '19:30'],
    location: 'Коворкинг “Новый Вектор”, 3-й этаж',
    tags: ['Творчество', 'Мастер-класс', 'Идеи']
  }
];

const eventCardsContainer = document.getElementById('eventCards');
const eventSelect = document.getElementById('eventSelect');
const eventDateInput = document.getElementById('eventDate');
const eventTimeSelect = document.getElementById('eventTime');
const eventLocationInput = document.getElementById('eventLocation');
const form = document.getElementById('registrationForm');
const formMessage = document.getElementById('formMessage');

function renderEventCards() {
  eventCardsContainer.innerHTML = eventData
    .map(
      (event) => `
        <article class="event-card">
          <div class="event-top">
            <h3>${event.title}</h3>
            <span class="badge">${event.category}</span>
          </div>
          <p>${event.description}</p>
          <div class="event-info">
            <span>📅 ${formatDate(event.date)}</span>
            <span>🕒 ${event.timeSlots.join(', ')}</span>
            <span>📍 ${event.location}</span>
          </div>
          <div class="mini-row">
            ${event.tags.map((tag) => `<span>${tag}</span>`).join('')}
          </div>
        </article>
      `
    )
    .join('');
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function populateEventSelect() {
  eventSelect.innerHTML = eventData
    .map(
      (event) => `<option value="${event.id}">${event.title}</option>`
    )
    .join('');

  updateEventDetails();
}

function updateEventDetails() {
  const selected = eventData.find((event) => event.id === eventSelect.value) || eventData[0];

  eventDateInput.value = selected.date;
  eventTimeSelect.innerHTML = selected.timeSlots
    .map((slot) => `<option value="${slot}">${slot}</option>`)
    .join('');
  eventLocationInput.value = selected.location;
}

function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const name = formData.get('name');
  const eventTitle = eventData.find((item) => item.id === formData.get('event'))?.title || 'мероприятие';
  const selectedTime = formData.get('time');
  const selectedDate = formData.get('date');
  const location = formData.get('location');

  formMessage.textContent = `Спасибо, ${name}! Ваша заявка на ${eventTitle} на ${formatDate(selectedDate)} в ${selectedTime} по адресу ${location} успешно отправлена.`;
  formMessage.style.color = '#2d6a4f';
  form.reset();
  populateEventSelect();
}

eventSelect.addEventListener('change', updateEventDetails);
form.addEventListener('submit', handleSubmit);

renderEventCards();
populateEventSelect();







































































