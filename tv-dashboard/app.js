(function () {
  var timeEl = document.getElementById('time');
  var dateEl = document.getElementById('date');
  var secsEl = document.getElementById('secs');
  var barEl = document.getElementById('bar-fill');
  var canvas = document.getElementById('wave');
  var ctx = canvas.getContext('2d');
  var t = 0;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    var now = new Date();
    timeEl.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    var s = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    secsEl.textContent = s.toLocaleString();
    barEl.style.width = ((s / 86400) * 100).toFixed(2) + '%';
  }

  function drawWave() {
    t += 0.03;
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#4fc3f7';
    ctx.beginPath();
    for (var x = 0; x <= w; x += 4) {
      var y = h / 2 + Math.sin(x * 0.02 + t) * (h * 0.3) * Math.sin(t * 0.5 + x * 0.003);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    requestAnimationFrame(drawWave);
  }

  tick();
  setInterval(tick, 1000);
  drawWave();
})();
