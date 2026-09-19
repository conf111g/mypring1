/**
 * Портфолио - скрипт для работы темы и формы
 */

// === Тема (Dark/Light Mode) ===

const THEME_KEY = 'portfolio-theme';

function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
        return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
}

// Применяем тему при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setTheme(getPreferredTheme());
    
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
});

// === Валидация формы контактов ===

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[а-яА-ЯёЁa-zA-Z\s\-]+$/;

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    
    if (errorEl) {
        errorEl.textContent = message;
    }
    if (inputEl) {
        inputEl.classList.add('error');
    }
}

function clearError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    
    if (errorEl) {
        errorEl.textContent = '';
    }
    if (inputEl) {
        inputEl.classList.remove('error');
    }
}

function validateName(name) {
    if (!name || name.trim().length === 0) {
        return 'Имя обязательно';
    }
    if (name.trim().length < 2) {
        return 'Имя слишком короткое';
    }
    if (!nameRegex.test(name)) {
        return 'Имя содержит недопустимые символы';
    }
    return '';
}

function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return 'Email обязателен';
    }
    if (!emailRegex.test(email)) {
        return 'Некорректный формат email';
    }
    return '';
}

function validateMessage(message) {
    if (!message || message.trim().length === 0) {
        return 'Сообщение обязательно';
    }
    if (message.trim().length < 10) {
        return 'Сообщение слишком короткое (минимум 10 символов)';
    }
    if (message.length > 5000) {
        return 'Сообщение слишком длинное (максимум 5000 символов)';
    }
    return '';
}

function validateForm(form) {
    let isValid = true;
    
    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const message = form.querySelector('#message').value;
    
    // Валидация имени
    const nameError = validateName(name);
    if (nameError) {
        showError('name', nameError);
        isValid = false;
    } else {
        clearError('name');
    }
    
    // Валидация email
    const emailError = validateEmail(email);
    if (emailError) {
        showError('email', emailError);
        isValid = false;
    } else {
        clearError('email');
    }
    
    // Валидация сообщения
    const messageError = validateMessage(message);
    if (messageError) {
        showError('message', messageError);
        isValid = false;
    } else {
        clearError('message');
    }
    
    return isValid;
}

// Обработка отправки формы
function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const successEl = document.getElementById('form-success');
    
    if (!validateForm(form)) {
        successEl.classList.remove('show');
        successEl.textContent = '';
        return;
    }
    
    // Санитизация и сбор данных (для демонстрации)
    const formData = {
        name: escapeHtml(form.querySelector('#name').value.trim()),
        email: escapeHtml(form.querySelector('#email').value.trim()),
        subject: form.querySelector('#subject').value,
        message: escapeHtml(form.querySelector('#message').value.trim())
    };
    
    // В реальном приложении здесь была бы отправка на сервер
    console.log('Данные формы (sanitized):', formData);
    
    // Показываем успешное сообщение.
    // Пользовательские данные подставляются через textContent, а не innerHTML,
    // поэтому любые HTML-теги из ввода не исполняются (защита от XSS).
    successEl.textContent = 'Спасибо, ' + formData.name +
        '! Сообщение получено (демонстрация, отправка на сервер не выполняется).';
    successEl.classList.add('show');
    
    // Очищаем форму
    form.reset();
    ['name', 'email', 'message'].forEach(clearError);
}

// Инициализация формы
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
        
        // Очистка ошибок при вводе
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.id === 'name' || input.id === 'email' || input.id === 'message') {
                    clearError(input.id);
                }
            });
        });
    }
});
