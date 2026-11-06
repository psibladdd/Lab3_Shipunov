'use strict';

const GET_URL = 'https://jsonplaceholder1.typicode.com/posts?_limit=5';
const POST_URL = 'https://jsonplaceholder.typicode.com/posts';

const loadButton = document.querySelector('#load-button');
const createButton = document.querySelector('#create-button');
const postsContainer = document.querySelector('#posts');
const createdPostContainer = document.querySelector('#created-post');
const loadMessage = document.querySelector('#load-message');
const createMessage = document.querySelector('#create-message');
const form = document.querySelector('#post-form');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#body');

function showMessage(element, text, type = '') {
  element.textContent = text;
  element.className = type ? `message ${type}` : 'message';
}

function createPostElement(post, showId = false) {
  const article = document.createElement('article');
  article.className = 'post';
  const heading = document.createElement('h3');
  heading.textContent = post.title;
  article.append(heading);
  if (showId) {
    const id = document.createElement('p');
    id.className = 'post-id';
    id.textContent = `ID публикации: ${post.id}`;
    article.append(id);
  }
  const text = document.createElement('p');
  text.textContent = post.body;
  article.append(text);
  return article;
}

function describeError(error) {
  if (error instanceof TypeError) {
    return 'Не удалось связаться с сервером. Проверьте подключение к интернету и повторите попытку.';
  }
  return `Ошибка: ${error.message}. Попробуйте ещё раз.`;
}

async function loadPosts() {
  if (loadButton.disabled) return;
  loadButton.disabled = true;
  loadButton.textContent = 'Загрузка…';
  postsContainer.setAttribute('aria-busy', 'true');
  showMessage(loadMessage, 'Загружаем публикации…', 'loading');

  try {
    const response = await fetch(GET_URL);
    if (!response.ok) {
      throw new Error(`сервер вернул HTTP ${response.status}`);
    }
    const posts = await response.json();
    if (!Array.isArray(posts)) {
      throw new Error('сервер вернул некорректный список публикаций');
    }
    const fragment = document.createDocumentFragment();
    posts.forEach(post => fragment.append(createPostElement(post)));
    postsContainer.replaceChildren(fragment);
    showMessage(loadMessage, `Загружено публикаций: ${posts.length}.`, 'success');
  } catch (error) {
    showMessage(loadMessage, describeError(error), 'error');
  } finally {
    loadButton.disabled = false;
    loadButton.textContent = 'Загрузить публикации';
    postsContainer.setAttribute('aria-busy', 'false');
  }
}

async function createPost(event) {
  event.preventDefault();
  if (createButton.disabled) return;
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  titleInput.setAttribute('aria-invalid', String(!title));
  bodyInput.setAttribute('aria-invalid', String(!body));

  if (!title || !body) {
    showMessage(createMessage, 'Заполните заголовок и текст: поля не могут быть пустыми или состоять только из пробелов.', 'error');
    (!title ? titleInput : bodyInput).focus();
    return;
  }

  createButton.disabled = true;
  createButton.textContent = 'Отправка…';
  titleInput.disabled = true;
  bodyInput.disabled = true;
  createdPostContainer.replaceChildren();
  showMessage(createMessage, 'Отправляем публикацию…', 'loading');

  try {
    const response = await fetch(POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, userId: 1 })
    });
    if (!response.ok) {
      throw new Error(`сервер вернул HTTP ${response.status}`);
    }
    const post = await response.json();
    createdPostContainer.append(createPostElement(post, true));
    showMessage(createMessage, `Публикация успешно создана! HTTP ${response.status}.`, 'success');
    form.reset();
    titleInput.removeAttribute('aria-invalid');
    bodyInput.removeAttribute('aria-invalid');
  } catch (error) {
    showMessage(createMessage, describeError(error), 'error');
  } finally {
    createButton.disabled = false;
    createButton.textContent = 'Создать публикацию';
    titleInput.disabled = false;
    bodyInput.disabled = false;
  }
}

loadButton.addEventListener('click', loadPosts);
form.addEventListener('submit', createPost);
