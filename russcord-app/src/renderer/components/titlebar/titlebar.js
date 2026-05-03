import { svgMinimize, svgMaximize, svgRestore, svgClose } from './caption-symbols.js';

/**
 * Кастомный title bar (frameless окно): разметка + обработчики кнопок.
 * @param {HTMLElement} root
 */
export function mountTitlebar(root) {
  if (!root) return;

  root.innerHTML = `
    <header class="titlebar" role="banner" data-focused="true">
      <div class="titlebar-drag">
        <img class="titlebar-logo" src="../assets/icons/favicon-96x96.png" alt="" width="18" height="18" />
        <span class="titlebar-title">Russcord</span>
      </div>
      <div class="titlebar-controls">
        <button type="button" id="btn-minimize" class="titlebar-btn" aria-label="Свернуть">
          ${svgMinimize}
        </button>
        <button type="button" id="btn-maximize" class="titlebar-btn" aria-label="Развернуть">
          ${svgMaximize}
        </button>
        <button type="button" id="btn-close" class="titlebar-btn titlebar-btn-close" aria-label="Закрыть">
          ${svgClose}
        </button>
      </div>
    </header>
  `;

  const shell = window.russcordShell;
  if (!shell) return;

  const bind = (id, fn) => {
    const el = root.querySelector(`#${id}`);
    if (el) el.addEventListener('click', fn);
  };

  bind('btn-minimize', () => shell.minimize());
  bind('btn-maximize', () => shell.maximize());
  bind('btn-close', () => shell.close());

  const btnMax = root.querySelector('#btn-maximize');
  function applyMaximizedUI(isMaximized) {
    if (!btnMax) return;
    btnMax.innerHTML = isMaximized ? svgRestore : svgMaximize;
    btnMax.setAttribute('aria-label', isMaximized ? 'Восстановить размер окна' : 'Развернуть');
  }

  if (typeof shell.getWindowState === 'function') {
    shell.getWindowState().then((s) => applyMaximizedUI(Boolean(s?.isMaximized))).catch(() => {});
  }
  if (typeof shell.onWindowState === 'function') {
    shell.onWindowState((s) => applyMaximizedUI(Boolean(s?.isMaximized)));
  }

  const bar = root.querySelector('.titlebar');
  if (bar && typeof shell.onTitlebarFocus === 'function') {
    shell.onTitlebarFocus((focused) => {
      bar.classList.toggle('titlebar--inactive', !focused);
      bar.dataset.focused = focused ? 'true' : 'false';
    });
  }

  const logo = root.querySelector('.titlebar-logo');
  if (logo) {
    logo.addEventListener('error', () => {
      logo.style.display = 'none';
    });
  }
}
