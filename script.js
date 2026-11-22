document.addEventListener('DOMContentLoaded', () => {
  // Año dinámico en footer
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Dark / Light Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

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

  // Menú móvil
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

  // ========================================================
  // SIMULACIÓN: JUEGO DE LA VIDA DE CONWAY (GREEN PIXELS)
  // ========================================================
  const canvas = document.getElementById('lifeCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const CELL_SIZE = 12; // Tamaño de cada pixel / celda
  let cols = 0;
  let rows = 0;
  let grid = [];
  let nextGrid = [];
  let animFrameId = null;
  let lastUpdate = 0;
  const FPS = 12; // Velocidad de generación estilo retro / bajo consumo
  const interval = 1000 / FPS;
  let stepCount = 0;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / CELL_SIZE);
    rows = Math.floor(canvas.height / CELL_SIZE);
    initGrids();
  }

  function initGrids() {
    grid = new Uint8Array(cols * rows);
    nextGrid = new Uint8Array(cols * rows);

    // Semilla inicial aleatoria dispersa (~14% de vida)
    for (let i = 0; i < cols * rows; i++) {
      grid[i] = Math.random() < 0.14 ? 1 : 0;
    }
  }

  function getIdx(x, y) {
    // Toroide (los bordes se conectan)
    const wrapX = (x + cols) % cols;
    const wrapY = (y + rows) % rows;
    return wrapY * cols + wrapX;
  }

  function countNeighbors(x, y) {
    let sum = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        sum += grid[getIdx(x + i, y + j)];
      }
    }
    return sum;
  }

  // Añadir un "glider" (nave viajera) periódicamente
  function spawnGlider(startX, startY) {
    const pattern = [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1]
    ];
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        if (pattern[dy][dx]) {
          grid[getIdx(startX + dx, startY + dy)] = 1;
        }
      }
    }
  }

  function stepLife() {
    stepCount++;

    // Inyectar un glider cada 70 pasos para mantener vida continua
    if (stepCount % 70 === 0) {
      const rx = Math.floor(Math.random() * (cols - 5));
      const ry = Math.floor(Math.random() * (rows - 5));
      spawnGlider(rx, ry);
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        const state = grid[idx];
        const neighbors = countNeighbors(x, y);

        // Reglas de Conway
        if (state === 1 && (neighbors === 2 || neighbors === 3)) {
          nextGrid[idx] = 1; // Supervivencia
        } else if (state === 0 && neighbors === 3) {
          nextGrid[idx] = 1; // Reproducción
        } else {
          nextGrid[idx] = 0; // Muerte por soledad o sobrepoblación
        }
      }
    }

    // Intercambiar buffers
    const temp = grid;
    grid = nextGrid;
    nextGrid = temp;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[y * cols + x] === 1) {
          const px = x * CELL_SIZE;
          const py = y * CELL_SIZE;

          // Color pixel verde con suave brillo fósforo
          ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
          ctx.fillRect(px, py, CELL_SIZE - 2, CELL_SIZE - 2);

          // Núcleo más brillante
          ctx.fillStyle = 'rgba(74, 222, 128, 0.7)';
          ctx.fillRect(px + 2, py + 2, CELL_SIZE - 6, CELL_SIZE - 6);
        }
      }
    }
  }

  function loop(timestamp) {
    if (timestamp - lastUpdate > interval) {
      stepLife();
      draw();
      lastUpdate = timestamp;
    }
    animFrameId = requestAnimationFrame(loop);
  }

  // Interacción: Mover el ratón crea células vivas
  window.addEventListener('mousemove', (e) => {
    const mouseCol = Math.floor(e.clientX / CELL_SIZE);
    const mouseRow = Math.floor(e.clientY / CELL_SIZE);

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (Math.random() < 0.6) {
          grid[getIdx(mouseCol + dx, mouseRow + dy)] = 1;
        }
      }
    }
  }, { passive: true });

  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();
  animFrameId = requestAnimationFrame(loop);
});
