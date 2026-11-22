document.addEventListener('DOMContentLoaded', () => {
  // Año dinámico en footer
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Dark / Light Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Cargar preferencia guardada o respetar la del sistema
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = body.classList.contains('dark-theme');
      if (isDark) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
      } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // Menú móvil básico
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.style.display === 'flex';
      navMenu.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) {
        navMenu.style.position = 'absolute';
        navMenu.style.top = '70px';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = 'var(--bg-primary)';
        navMenu.style.padding = '1.5rem';
        navMenu.style.borderBottom = '1px solid var(--border-color)';
        navMenu.querySelector('.nav-links').style.flexDirection = 'column';
      }
    });
  }
});
