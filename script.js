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

// Куда уходит форма (Web3Forms — бесплатный сервис для статических сайтов)
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

// Человекочитаемые темы письма
const SUBJECT_LABELS = {
    collaboration: 'Сотрудничество',
    job: 'Работа',
    other: 'Другое'
};

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

// Сообщение под формой: успех — зелёное, ошибка — красное
function showFormMessage(text, isError) {
    const messageEl = document.getElementById('form-success');
    if (!messageEl) {
        return;
    }
    // Через textContent, а не innerHTML: текст ответа не может выполнить скрипт
    messageEl.textContent = text;
    messageEl.classList.toggle('error', Boolean(isError));
    messageEl.classList.add('show');
}

function hideFormMessage() {
    const messageEl = document.getElementById('form-success');
    if (!messageEl) {
        return;
    }
    messageEl.textContent = '';
    messageEl.classList.remove('show', 'error');
}

// Отправка формы на Web3Forms без перезагрузки страницы
async function sendForm(form) {
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.subject = 'Сообщение с сайта: ' + (SUBJECT_LABELS[payload.subject] || 'без темы');

    const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(payload)
    });

    return response.json();
}

// Обработка отправки формы
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    hideFormMessage();

    if (!validateForm(form)) {
        return;
    }

    // Блокируем кнопку, чтобы сообщение не ушло дважды
    if (submitBtn) {
        submitBtn.disabled = true;
    }

    try {
        const result = await sendForm(form);

        if (result.success) {
            showFormMessage('Сообщение отправлено!', false);
            form.reset();
            ['name', 'email', 'message'].forEach(clearError);
        } else {
            showFormMessage('Ошибка, попробуйте позже', true);
        }
    } catch {
        showFormMessage('Ошибка, попробуйте позже', true);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }
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
