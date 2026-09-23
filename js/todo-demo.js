/**
 * THARUN C - INTERACTIVE TO-DO WEB APPLICATION DEMO
 * Interactive demonstration of the To-Do List Web Application from Tharun's resume roadmap.
 * Demonstrates DOM manipulation, state management, and event handling.
 */

(function () {
  const initialTodos = [
    { id: 1, text: "Master HTML5 semantic layout structures", completed: true },
    { id: 2, text: "Deep dive into CSS Grid, Flexbox & Glassmorphism", completed: true },
    { id: 3, text: "Build Python scripts for Student Management System", completed: false },
    { id: 4, text: "Practice Data Structures & Algorithms problem solving", completed: false },
    { id: 5, text: "Prepare for Junior Front-End Developer interviews", completed: false }
  ];

  let todos = [];

  function loadTodos() {
    try {
      const saved = localStorage.getItem('tharun_portfolio_todos');
      if (saved) {
        todos = JSON.parse(saved);
      } else {
        todos = [...initialTodos];
      }
    } catch (e) {
      todos = [...initialTodos];
    }
    renderTodos();
  }

  function saveTodos() {
    try {
      localStorage.setItem('tharun_portfolio_todos', JSON.stringify(todos));
    } catch (e) {
      console.warn("Storage warning:", e);
    }
  }

  function renderTodos() {
    const container = document.getElementById('todo-list-container');
    const countBadge = document.getElementById('todo-count-badge');
    if (!container) return;

    container.innerHTML = '';

    const activeCount = todos.filter(t => !t.completed).length;
    if (countBadge) {
      countBadge.textContent = `${activeCount} pending`;
    }

    if (todos.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-dim); padding: 1.5rem; font-size: 0.9rem;">
          No active tasks. Add one above!
        </div>
      `;
      return;
    }

    todos.forEach((todo) => {
      const item = document.createElement('div');
      item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="todo-item-left">
          <input type="checkbox" class="todo-check" data-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
          <span>${escapeHtml(todo.text)}</span>
        </div>
        <button class="todo-del-btn" data-id="${todo.id}" title="Remove task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;
      container.appendChild(item);
    });

    // Attach listeners
    container.querySelectorAll('.todo-check').forEach(box => {
      box.addEventListener('change', (e) => {
        const id = Number(e.target.dataset.id);
        toggleTodo(id);
      });
    });

    container.querySelectorAll('.todo-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(btn.dataset.id);
        deleteTodo(id);
      });
    });
  }

  function addTodo(text) {
    if (!text.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false
    };
    todos.unshift(newTodo);
    saveTodos();
    renderTodos();
    if (window.AudioController) window.AudioController.playClick();
  }

  function toggleTodo(id) {
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTodos();
    renderTodos();
    if (window.AudioController) window.AudioController.playBlip();
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
    if (window.AudioController) window.AudioController.playClick();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadTodos();

    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        addTodo(input.value);
        input.value = '';
      });
    }
  });
})();
