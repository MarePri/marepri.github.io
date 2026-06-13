(function () {

  // Each racer: id, speed (px/s), startDelay (s), lane (top-lane or bottom-lane)
  const TOP_RACERS = [
    { id: 'f1-red',      speed: 320, startDelay: 0.0  },
    { id: 'moto-yellow', speed: 370, startDelay: 1.4  },
    { id: 'f1-silver',   speed: 290, startDelay: 2.8  },
    { id: 'moto-black',  speed: 410, startDelay: 4.2  },
  ];

  const BOT_RACERS = [
    { id: 'f1-blue',    speed: 350, startDelay: 0.7  },
    { id: 'moto-red',   speed: 390, startDelay: 2.1  },
    { id: 'f1-orange',  speed: 310, startDelay: 3.5  },
    { id: 'moto-blue',  speed: 430, startDelay: 5.0  },
  ];

  const state = {};

  function launchRacer(racer) {
    const { id, speed, startDelay } = racer;
    const el = document.getElementById(id);
    if (!el) return;

    const w = el.offsetWidth || 80;
    state[id] = { x: -(w + 10), startTime: null, running: false };
    el.style.transform = `translateX(${state[id].x}px)`;
    el.style.opacity = '0';

    setTimeout(() => {
      el.style.opacity = '1';
      state[id].running  = true;
      state[id].startTime = performance.now();

      function tick(now) {
        if (!state[id].running) return;
        const dt = (now - state[id].startTime) / 1000;
        state[id].x = -(w + 10) + dt * speed;
        el.style.transform = `translateX(${state[id].x}px)`;

        if (state[id].x > window.innerWidth + 10) {
          state[id].running = false;
          el.style.opacity = '0';
          // random gap 0.5–2.5s before next lap
          const gap = 500 + Math.random() * 2000;
          setTimeout(() => launchRacer(racer), gap);
          return;
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, startDelay * 1000);
  }

  window.addEventListener('load', () => {
    [...TOP_RACERS, ...BOT_RACERS].forEach(r => launchRacer(r));
  });

})();
