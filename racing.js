(function () {
  // Config
  const RACERS = [
    { id: 'car1',  speed: 5.8,  startDelay: 0,    lane: 0 },
    { id: 'bike1', speed: 6.5,  startDelay: 0.6,  lane: 1 },
    { id: 'car2',  speed: 5.2,  startDelay: 1.4,  lane: 2 },
    { id: 'bike2', speed: 7.1,  startDelay: 2.2,  lane: 3 },
  ];

  const LANE_OFFSETS = [2, 14, 26, 38]; // px from top of track
  const TRACK_HEIGHT = 52;

  const track = document.getElementById('raceTrack');
  const trackRect = () => track.getBoundingClientRect();

  // Set lane positions
  RACERS.forEach((r, i) => {
    const el = document.getElementById(r.id);
    if (!el) return;
    el.style.top = LANE_OFFSETS[r.lane] + 'px';
  });

  // Animation state
  const state = {};
  RACERS.forEach(r => {
    state[r.id] = {
      x: -120,
      running: false,
      startTime: null,
    };
  });

  function getViewportWidth() {
    return window.innerWidth;
  }

  function resetRacer(id) {
    const el = document.getElementById(id);
    if (!el) return;
    state[id].x = -120;
    el.style.transform = `translateX(-120px)`;
    el.style.opacity = '0';
  }

  function launchRacer(racer) {
    const { id, speed, startDelay } = racer;
    const el = document.getElementById(id);
    if (!el) return;

    setTimeout(() => {
      el.style.opacity = '1';
      state[id].running = true;
      state[id].startTime = performance.now();

      function tick(now) {
        if (!state[id].running) return;
        const elapsed = (now - state[id].startTime) / 1000;
        state[id].x = -120 + elapsed * speed * 100; // px/s = speed * 100
        el.style.transform = `translateX(${state[id].x}px)`;

        const vw = getViewportWidth();
        if (state[id].x > vw + 120) {
          // Reset and loop
          state[id].running = false;
          el.style.opacity = '0';
          setTimeout(() => {
            resetRacer(id);
            launchRacer(racer);
          }, Math.random() * 1200 + 400);
          return;
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, startDelay * 1000);
  }

  // Start race after page loads
  window.addEventListener('load', () => {
    RACERS.forEach(r => {
      resetRacer(r.id);
      launchRacer(r);
    });
  });

  // Wheel spin animation via CSS custom property
  let wheelAngle = 0;
  function spinWheels() {
    wheelAngle += 8;
    document.querySelectorAll('.racer svg circle').forEach(c => {
      // Only rotate the inner wheel circles (r ~2-3)
    });
    requestAnimationFrame(spinWheels);
  }
  spinWheels();
})();
