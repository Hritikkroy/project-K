// ====== CONFIGURED SEQUENCE (your base) ======
const sequence = [
    { text: "Hey Kawal", duration: 4000 },
    { text: "Oops", duration: 4000 },
    { text: "Hey Love", duration: 5000, hearts: true },
    { text: "Happy Birthday!!!", duration: 9000, final: true }
  ];
  
  // ====== DOM ELEMENTS ======
  const appEl = document.getElementById("app");
  const messageEl = document.getElementById("message");
  const heartsContainer = document.getElementById("hearts-container");
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d");
  
  // PART 2 + Game elements
  const gameIntroEl = document.getElementById("game-intro");
  const gameStartBtn = document.getElementById("game-start-btn");
  const catchGameEl = document.getElementById("catch-game");
  const gameCanvas = document.getElementById("gameCanvas");
  const g = gameCanvas.getContext("2d");
  
  // ====== HiDPI resize helpers ======
  function resizeFxCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function resizeGameCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const w = gameCanvas.clientWidth;
    const h = gameCanvas.clientHeight;
    gameCanvas.width = Math.floor(w * ratio);
    gameCanvas.height = Math.floor(h * ratio);
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  resizeFxCanvas();
  window.addEventListener("resize", resizeFxCanvas);
  
  // ====== HEARTS ======
  let heartInterval = null;
  function startHearts(ms = 4000) {
    stopHearts();
    heartInterval = setInterval(() => {
      const heart = document.createElement("div");
      heart.className = "heart";
      heart.textContent = "❤";
  
      const size = 18 + Math.random() * 28;
      heart.style.fontSize = size + "px";
      heart.style.left = Math.random() * 100 + "vw";
      heart.style.animationDuration = (4 + Math.random() * 2) + "s";
  
      heartsContainer.appendChild(heart);
      setTimeout(() => heart.remove(), 6000);
    }, 250);
  
    setTimeout(stopHearts, ms);
  }
  function stopHearts() {
    if (heartInterval) {
      clearInterval(heartInterval);
      heartInterval = null;
    }
  }
  
  // ====== CONFETTI + FIREWORKS (kept) ======
  let rafId = null;
  let confettiActive = false;
  let fireworksActive = false;
  const confetti = [];
  const particles = [];
  
  function startConfettiFor(ms = 6000) {
    confettiActive = true;
    for (let i = 0; i < 160; i++) confetti.push(makeConfetto());
    setTimeout(() => (confettiActive = false), ms);
  }
  function startFireworksFor(ms = 5000) {
    fireworksActive = true;
    const launcher = setInterval(() => launchShell(), 600);
    setTimeout(() => {
      fireworksActive = false;
      clearInterval(launcher);
    }, ms);
  }
  function makeConfetto() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    return {
      x: Math.random() * w,
      y: Math.random() * -h,
      vx: (Math.random() - 0.5) * 0.7,
      vy: 2 + Math.random() * 2.5,
      size: 6 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    };
  }
  function launchShell() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const shell = {
      x: Math.random() * (w * 0.8) + w * 0.1,
      y: h + 10,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(5 + Math.random() * 3.5),
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      life: 700 + Math.random() * 400,
      born: performance.now(),
      exploded: false
    };
    particles.push(shell);
  }
  function explode(x, y, baseHue = Math.random() * 360) {
    const count = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.5,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.5,
        life: 900 + Math.random() * 700,
        born: performance.now(),
        size: 2 + Math.random() * 2.5,
        color: `hsl(${baseHue + (Math.random() * 30 - 15)}, 100%, 60%)`,
        glow: true
      });
    }
  }
  function updateAndDraw(now) {
    const w = canvas.clientWidth;
       const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
  
    // Confetti
    if (confettiActive || confetti.length) {
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.restore();
  
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vr;
  
        if (c.y > h + 20) {
          if (confettiActive) {
            confetti[i] = makeConfetto();
            confetti[i].y = -20;
          } else {
            confetti.splice(i, 1);
          }
        }
      }
    }
  
    // Fireworks particles
    if (fireworksActive || particles.length) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
  
        const isShell = p.size === undefined;
        if (isShell && !p.exploded) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
  
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.02;
  
          if (p.vy >= -0.5 || now - p.born > p.life) {
            p.exploded = true;
            const hue = parseFloat((p.color.match(/hsl\(([^,]+)/) || [0, "0"])[1]);
            explode(p.x, p.y, hue);
          }
          if (!p.exploded) continue;
        }
  
        if (!isShell || p.exploded) {
          const age = now - p.born;
          const t = age / p.life;
  
          if (p.glow) ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = p.color;
          const alpha = Math.max(0, 1 - t);
          ctx.globalAlpha = alpha;
  
          ctx.beginPath();
          ctx.arc(p.x, p.y, (p.size || 2) * (1 + 0.2 * Math.sin(age * 0.02)), 0, Math.PI * 2);
          ctx.fill();
  
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
  
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.03;
          p.vx *= 0.995;
          p.vy *= 0.995;
  
          if (t >= 1) {
            particles.splice(i, 1);
          } else if (isShell) {
            particles.splice(i, 1);
          }
        }
      }
    }
  
    if (confettiActive || fireworksActive || confetti.length || particles.length) {
      rafId = requestAnimationFrame(updateAndDraw);
    } else {
      rafId = null;
    }
  }
  
  function ensureAnimationLoop() {
    if (rafId == null) {
      rafId = requestAnimationFrame(updateAndDraw);
    }
  }
  
  // ====== MESSAGE SEQUENCE (unchanged behavior) ======
  function showMessageStep(i = 0) {
    if (i >= sequence.length) return;
  
    const step = sequence[i];
    messageEl.textContent = step.text;
  
    // trigger transition reliably
    void messageEl.offsetWidth;
  
    messageEl.classList.add("show");
    messageEl.classList.remove("hide");
  
    // effects per step
    if (step.hearts) startHearts(step.duration);
    if (step.final) {
      startConfettiFor(6000);     // confetti for 6s
      startFireworksFor(5000);    // fireworks for 5s
      ensureAnimationLoop();
    }
  
    // After its visible duration, fade out then continue / go to Part 2
    setTimeout(() => {
      messageEl.classList.remove("show");
      messageEl.classList.add("hide");
  
      setTimeout(() => {
        const isLast = i === sequence.length - 1;
        if (isLast) {
          goToPart2();
        } else {
          showMessageStep(i + 1);
        }
      }, 820); // match CSS 800ms + a touch
    }, step.duration);
  }
  
  // ====== PART 2: Reveal ======
  function goToPart2() {
    appEl.classList.add("hidden");
    gameIntroEl.classList.remove("hidden");
  }
  
  // ====== GAME: Catch the Hearts (professional, full-screen) ======
  let gameLoopId = null;
  let spawnTimerId = null;
  
  function startCatchGame() {
    gameIntroEl.classList.add("hidden");
    catchGameEl.classList.remove("hidden");
  
    // Prepare canvas size
    resizeGameCanvas();
    window.addEventListener("resize", resizeGameCanvas);
  
    const W = () => gameCanvas.clientWidth;
    const H = () => gameCanvas.clientHeight;
  
    const basket = {
      w: Math.max(110, Math.floor(W() * 0.12)),
      h: 28,
      x: W() * 0.5,
      y: H() - 70,
      speed: Math.max(6, Math.floor(W() / 120))
    };
  
    let hearts = [];
    let score = 0;
    let running = true;
    let lastTime = performance.now();
  
    // Controls: keyboard
    const keys = { left: false, right: false };
    function keydown(e) {
      if (e.key === "ArrowLeft") keys.left = true;
      if (e.key === "ArrowRight") keys.right = true;
    }
    function keyup(e) {
      if (e.key === "ArrowLeft") keys.left = false;
      if (e.key === "ArrowRight") keys.right = false;
    }
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
  
    // Controls: mouse / touch
    function pointerMove(clientX) {
      const rect = gameCanvas.getBoundingClientRect();
      const x = clientX - rect.left;
      basket.x = Math.min(W() - basket.w / 2, Math.max(basket.w / 2, x));
    }
    gameCanvas.addEventListener("mousemove", (e) => pointerMove(e.clientX));
    gameCanvas.addEventListener("touchmove", (e) => {
      if (e.touches[0]) pointerMove(e.touches[0].clientX);
    }, { passive: true });
  
    // Spawn falling hearts
    function spawnHeart() {
      const size = 20 + Math.random() * 14;
      hearts.push({
        x: 20 + Math.random() * (W() - 40),
        y: -30,
        vy: 2.2 + Math.random() * 1.6,
        size
      });
    }
    spawnTimerId = setInterval(spawnHeart, 550);
  
    // Draw helpers
    function drawBasket() {
      // rounded rect basket
      g.save();
      g.shadowColor = "rgba(0,0,0,0.25)";
      g.shadowBlur = 10;
      g.fillStyle = "#e84188";
      const x = basket.x - basket.w / 2;
      const y = basket.y;
      const r = 12;
      g.beginPath();
      g.moveTo(x + r, y);
      g.arcTo(x + basket.w, y, x + basket.w, y + basket.h, r);
      g.arcTo(x + basket.w, y + basket.h, x, y + basket.h, r);
      g.arcTo(x, y + basket.h, x, y, r);
      g.arcTo(x, y, x + basket.w, y, r);
      g.closePath();
      g.fill();
  
      // label
      g.shadowBlur = 0;
      g.fillStyle = "#fff";
      g.font = "bold 16px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      g.textAlign = "center";
      g.fillText("Hritik 💕", basket.x, y + basket.h - 8);
      g.restore();
    }
  
    function drawHeart(h) {
      g.font = `${Math.floor(h.size)}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("❤️", h.x, h.y);
    }
  
    function drawBackground() {
      // soft vignette
      const grd = g.createRadialGradient(W()/2, H(), Math.min(W(),H())*0.1, W()/2, H(), Math.max(W(),H()));
      grd.addColorStop(0, "rgba(255,255,255,0.15)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    }
  
    // Collision
    function intersects(h) {
      const bx1 = basket.x - basket.w / 2;
      const bx2 = basket.x + basket.w / 2;
      const by1 = basket.y;
      const by2 = basket.y + basket.h;
      const hx1 = h.x - h.size * 0.4;
      const hx2 = h.x + h.size * 0.4;
      const hy1 = h.y - h.size * 0.4;
      const hy2 = h.y + h.size * 0.4;
      return !(bx2 < hx1 || bx1 > hx2 || by2 < hy1 || by1 > hy2);
    }
  
    // Main loop
    function loop(now) {
      if (!running) return;
  
      const dt = Math.min(33, now - lastTime);
      lastTime = now;
  
      // move with keys
      if (keys.left) basket.x -= basket.speed;
      if (keys.right) basket.x += basket.speed;
      basket.x = Math.min(W() - basket.w / 2, Math.max(basket.w / 2, basket.x));
  
      // update hearts
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.y += h.vy * (1 + score / 6000); // gently speeds up with score
  
        if (intersects(h)) {
          score += 500;
          hearts.splice(i, 1);
          const scoreEl = document.getElementById("score");
          if (scoreEl) scoreEl.textContent = score;
          continue;
        }
        if (h.y - h.size > H()) {
          hearts.splice(i, 1);
        }
      }
  
      // draw
      g.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
      drawBackground();
      hearts.forEach(drawHeart);
      drawBasket();
  
      if (score >= 3000) {
        endGame();
        return;
      }
  
      gameLoopId = requestAnimationFrame(loop);
    }
  
    // Start loop
    gameLoopId = requestAnimationFrame(loop);
  
    function endGame() {
      running = false;
      clearInterval(spawnTimerId);
      cancelAnimationFrame(gameLoopId);
  
      // Sweet popup
      alert("Wooaaa, You're total score is 3000! now click ok to continue");
  
      // Step 2: Special overlay with floating hearts
      const overlay = document.createElement("div");
      overlay.className = "catch-overlay";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.background = "linear-gradient(to top,#ffdee9,#b5fffc)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.flexDirection = "column";
      overlay.style.zIndex = "9999";
      document.body.appendChild(overlay);
  
      const msg = document.createElement("h1");
      msg.textContent = "You’ve caught all my love and I love you 3000!!!";
      msg.style.fontSize = "2.8rem";
      msg.style.color = "#e84188";
      msg.style.textAlign = "center";
      msg.style.opacity = "0";
      msg.style.transition = "all 0.8s ease";
      overlay.appendChild(msg);
      setTimeout(() => {
        msg.style.opacity = "1";
        msg.style.transform = "scale(1.05)";
        setTimeout(() => msg.style.transform = "scale(1)", 800);
      }, 50);
  
      // After a short delay → remove overlay and start Quiz
      setTimeout(() => {
        try { overlay.remove(); } catch(e){}
        startQuizGame();
      }, 4000);
  
      // cleanup listeners
      window.removeEventListener("resize", resizeGameCanvas);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    }
  }
  
  // Hook Start Game
  if (gameStartBtn) {
    gameStartBtn.addEventListener("click", startCatchGame);
  }
  
  // ====== KICK OFF PART 1 ======
  showMessageStep();
  
  
  // ====== QUIZ GAME ======
  function startQuizGame() {
    // Remove previous overlay if exists
    const prevOverlay = document.querySelector(".catch-overlay");
    if(prevOverlay) prevOverlay.remove();
  
    // Create quiz container
    const quizOverlay = document.createElement("div");
    quizOverlay.className = "quiz-overlay";
    quizOverlay.style.position = "fixed";
    quizOverlay.style.inset = "0";
    quizOverlay.style.background = "linear-gradient(to top,#ffdee9,#b5fffc)";
    quizOverlay.style.display = "flex";
    quizOverlay.style.flexDirection = "column";
    quizOverlay.style.alignItems = "center";
    quizOverlay.style.justifyContent = "center";
    quizOverlay.style.zIndex = "9999";
    document.body.appendChild(quizOverlay);
  
    const quizTitle = document.createElement("h1");
    quizTitle.textContent = " Quiz time!";
    quizTitle.style.color = "#e84188";
    quizTitle.style.fontSize = "2.5rem";
    quizTitle.style.marginBottom = "2rem";
    quizOverlay.appendChild(quizTitle);
  
    const questionEl = document.createElement("p");
    questionEl.style.fontSize = "1.5rem";
    questionEl.style.color = "#2f3640";
    questionEl.style.textAlign = "center";
    questionEl.style.marginBottom = "1rem";
    quizOverlay.appendChild(questionEl);
  
    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.placeholder = "Type your answer...";
    inputEl.style.fontSize = "1.2rem";
    inputEl.style.padding = "0.5rem 1rem";
    inputEl.style.border = "2px solid #e84188";
    inputEl.style.borderRadius = "10px";
    inputEl.style.marginBottom = "1rem";
    quizOverlay.appendChild(inputEl);
  
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.style.padding = "0.6rem 1.2rem";
    submitBtn.style.fontSize = "1.2rem";
    submitBtn.style.background = "#e84188";
    submitBtn.style.color = "#fff";
    submitBtn.style.border = "none";
    submitBtn.style.borderRadius = "10px";
    submitBtn.style.cursor = "pointer";
    quizOverlay.appendChild(submitBtn);
  
    const feedback = document.createElement("p");
    feedback.style.fontSize = "1.2rem";
    feedback.style.marginTop = "1rem";
    feedback.style.color = "#00a8ff";
    quizOverlay.appendChild(feedback);
  
    const questions = [
        { q: "When did we first meet?", a: "Feb 7" },
        { q: "If you would be a food item what would you be", a: "pani puri" },
        { q: "What's Kawal ultimate weapon when she's angry", a: "Silent treatment" },
        { q: "What’s my favorite thing about you?", a: "Everything" },
        { q: "If I had to compare you to something, what would it be?", a: "You're incomparable" }
    ];
  
    let current = 0;
  
    function showQuestion() {
        if (current >= questions.length) {
            finishQuiz();
            return;
        }
        const item = questions[current];
        questionEl.textContent = item.q;
        inputEl.value = "";
        feedback.textContent = "";
        inputEl.focus();
    }
  
    submitBtn.addEventListener("click", () => {
        const answer = inputEl.value.trim();
        const correctAnswer = questions[current].a;
        if(answer.toLowerCase() === correctAnswer.toLowerCase()) {
            feedback.style.color = "#00a8ff";
            feedback.textContent = "✅ Correct!";
        } else {
            feedback.style.color = "#ff3838";
            feedback.textContent = `❌ Not quite! The right answer: "${correctAnswer}"`;
        }
        current++;
        setTimeout(showQuestion, 1400);
    });
  
    showQuestion();
  
    function finishQuiz() {
        quizOverlay.innerHTML = "";
        const finalMsg = document.createElement("h1");
        finalMsg.textContent = "🎈 Well done! 🎈";
        finalMsg.style.color = "#e84188";
        finalMsg.style.fontSize = "2.5rem";
        finalMsg.style.textAlign = "center";
        finalMsg.style.marginBottom = "2rem";
        quizOverlay.appendChild(finalMsg);
  
        const loveMsg = document.createElement("p");
        loveMsg.textContent = "💖 Doesn't matter what you answered, I still love you 💖";
        loveMsg.style.fontSize = "1.5rem";
        loveMsg.style.textAlign = "center";
        loveMsg.style.color = "#2f3640";
        quizOverlay.appendChild(loveMsg);
  
        // Floating balloons 🎈
        const balloonsContainer = document.createElement("div");
        balloonsContainer.style.position = "absolute";
        balloonsContainer.style.inset = "0";
        balloonsContainer.style.pointerEvents = "none";
        quizOverlay.appendChild(balloonsContainer);
  
        const balloonsInterval = setInterval(() => {
            const b = document.createElement("div");
            b.textContent = "🎈";
            b.style.position = "absolute";
            b.style.bottom = "-40px";
            b.style.fontSize = `${25 + Math.random() * 35}px`;
            b.style.left = `${Math.random() * 100}vw`;
            b.style.opacity = "0.9";
            b.style.animation = "floatUp 6s linear forwards";
            balloonsContainer.appendChild(b);
            setTimeout(() => b.remove(), 7000);
        }, 400);
  
        // Add animation keyframes if not already in CSS
        const style = document.createElement("style");
        style.textContent = `
        @keyframes floatUp {
          from { transform: translateY(0) scale(1); opacity: 1; }
          to { transform: translateY(-120vh) scale(1.2); opacity: 0; }
        }`;
        document.head.appendChild(style);

        // >>> Start the typing messages after a short pause <<<
        setTimeout(() => {
          startTypingMessages(); // uses your exact function below
        }, 5000);
    }
  }

// ====== TYPING MESSAGES ======
function startTypingMessages() {
    document.body.innerHTML = "";

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.height = "100vh";
    container.style.background = "linear-gradient(to right, #ffdee9, #b5fffc)";
    container.style.fontFamily = "'Poppins', sans-serif";
    container.style.textAlign = "center";
    container.style.padding = "20px";
    container.style.position = "relative";
    document.body.appendChild(container);

    const messageEl = document.createElement("p");
    messageEl.style.fontSize = "2.5rem";
    messageEl.style.color = "#e84188";
    messageEl.style.maxWidth = "900px";
    messageEl.style.lineHeight = "1.6";
    messageEl.style.transition = "all 0.5s ease";
    container.appendChild(messageEl);

    const messages = [
        "Just to let you know..",
        "If you ever feel unattractive",
        "just to let you know..",
        "I can stare at you for hours..",
        "If you ever feel unwanted",
        "just to let you know..",
        "I check my phone every morning to see if you texted me yet.",
        "If you ever feel underappreciated",
        "just to let you know..",
        "I remember everything you do for me",
        "If you ever feel you have no one to talk to",
        "just to let you know..",
        "I'm here for you always..",
        "If you ever feel unloved",
        "just to let you know..",
        "That I stay up longer just in case you need me..",
        "You're my dream Kawal",
        "and..",
        "I love you in every universe 💖"
    ];

    let msgIndex = 0;
    let charIndex = 0;

    function typeMessage() {
        if (msgIndex >= messages.length) {
            setTimeout(() => startProposal(container), 2000);
            return;
        }
        let currentMsg = messages[msgIndex];
        if (charIndex < currentMsg.length) {
            messageEl.textContent += currentMsg.charAt(charIndex);
            charIndex++;
            setTimeout(typeMessage, 100);
        } else {
            msgIndex++;
            charIndex = 0;
            setTimeout(() => {
                messageEl.textContent = "";
                typeMessage();
            }, 2500);
        }
    }

    typeMessage();
}

// ====== PROPOSAL ======
function startProposal(parent) {
    clearChildren(parent);

    const questionMsg = document.createElement("h1");
    questionMsg.textContent = "I have one last question for you...";
    questionMsg.style.fontSize = "3rem";
    questionMsg.style.color = "#e84188";
    questionMsg.style.textAlign = "center";
    questionMsg.style.marginBottom = "50px";
    parent.appendChild(questionMsg);

    setTimeout(() => {
        questionMsg.remove();
        showProposalOptions(parent);
    }, 2500);
}

function showProposalOptions(parent) {
    clearChildren(parent);

    const proposalMsg = document.createElement("h1");
    proposalMsg.textContent = "Would you like to be my girlfriend...again??";
    proposalMsg.style.fontSize = "2.5rem";
    proposalMsg.style.color = "#e84188";
    proposalMsg.style.textAlign = "center";
    proposalMsg.style.marginBottom = "30px";
    parent.appendChild(proposalMsg);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.gap = "40px";
    buttonsContainer.style.justifyContent = "center";
    parent.appendChild(buttonsContainer);

    const yesButton = document.createElement("button");
    yesButton.textContent = "💍 Yes";
    styleProposalButton(yesButton);
    buttonsContainer.appendChild(yesButton);

    const noButton = document.createElement("button");
    noButton.textContent = "❌ No";
    styleProposalButton(noButton);
    buttonsContainer.appendChild(noButton);

    noButton.addEventListener("click", () => {
        proposalMsg.textContent = "Try again ❌";
        // small shake effect to make it fun
        proposalMsg.animate([
            { transform: "translateX(0px)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(0px)" }
        ], { duration: 400 });
    });

    yesButton.addEventListener("click", () => {
        clearChildren(parent);
        celebrateProposal(parent);
    });
}

function styleProposalButton(btn) {
    btn.style.padding = "15px 40px";
    btn.style.fontSize = "1.5rem";
    btn.style.border = "none";
    btn.style.borderRadius = "15px";
    btn.style.cursor = "pointer";
    btn.style.background = "#e84188";
    btn.style.color = "#fff";
    btn.style.transition = "transform 0.3s ease";
    btn.addEventListener("mouseover", () => { btn.style.transform = "scale(1.1)"; });
    btn.addEventListener("mouseout", () => { btn.style.transform = "scale(1)"; });
}

// ====== CELEBRATION ======
function celebrateProposal(parent) {
    clearChildren(parent);

    const congrats = document.createElement("h1");
    congrats.textContent = "She said YES!";
    congrats.style.position = "absolute";
    congrats.style.top = "50%";
    congrats.style.left = "50%";
    congrats.style.transform = "translate(-50%, -50%)";
    congrats.style.fontSize = "3rem";
    congrats.style.color = "#ff6b81";
    congrats.style.textAlign = "center";
    congrats.style.opacity = "0";
    congrats.style.transition = "opacity 2s ease";
    parent.appendChild(congrats);
    setTimeout(() => { congrats.style.opacity = "1"; }, 500);

    // Create a container for floating emojis/fireworks to avoid overlap
    const effectsContainer = document.createElement("div");
    effectsContainer.style.position = "absolute";
    effectsContainer.style.inset = "0";
    effectsContainer.style.pointerEvents = "none";
    parent.appendChild(effectsContainer);

    // Floating emojis
    for (let i = 0; i < 80; i++) spawnFloatingEmoji(effectsContainer, "❤️");
    for (let i = 0; i < 50; i++) spawnFloatingEmoji(effectsContainer, "🎈");
    for (let i = 0; i < 50; i++) spawnFloatingEmoji(effectsContainer, "✨");

    // Firecrackers
    for (let i = 0; i < 20; i++) spawnFirecracker(effectsContainer);

    // Remove congrats message after 6s, keep emojis for a few more seconds
    setTimeout(() => { congrats.remove(); }, 6000);
    setTimeout(() => { effectsContainer.remove(); }, 8000);
}

// ====== HELPERS ======
function clearChildren(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

function spawnFloatingEmoji(parent, emoji) {
    const e = document.createElement("div");
    e.textContent = emoji;
    e.style.position = "absolute";
    e.style.left = `${Math.random() * 100}vw`;
    e.style.top = `${Math.random() * 100}vh`;
    e.style.fontSize = `${10 + Math.random() * 30}px`;
    e.style.opacity = "0.9";
    parent.appendChild(e);
    e.animate([
        { transform: "translateY(0) scale(0.5)", opacity: 1 },
        { transform: "translateY(-100vh) scale(1.5)", opacity: 0 }
    ], { duration: 6000 + Math.random() * 2000, easing: "ease-out" });
    setTimeout(() => e.remove(), 7000);
}

function spawnFirecracker(parent) {
    const fire = document.createElement("div");
    fire.textContent = "🎆";
    fire.style.position = "absolute";
    fire.style.left = `${Math.random() * 80 + 10}vw`;
    fire.style.bottom = "0";
    fire.style.fontSize = `${25 + Math.random() * 20}px`;
    fire.style.zIndex = "9999";
    parent.appendChild(fire);

    const peak = 60 + Math.random() * 20;
    const duration = 2000 + Math.random() * 1000;

    fire.animate([
        { transform: "translateY(0) scale(0.5)", opacity: 1 },
        { transform: `translateY(-${peak}vh) scale(1)`, opacity: 1 }
    ], { duration: duration / 2, easing: "ease-out", fill: "forwards" });

    setTimeout(() => {
        const burstCount = 10 + Math.floor(Math.random() * 10);
        for (let i = 0; i < burstCount; i++) {
            const spark = document.createElement("div");
            spark.textContent = "✨";
            spark.style.position = "absolute";
            spark.style.left = fire.offsetLeft + "px";
            spark.style.top = fire.offsetTop + "px";
            spark.style.fontSize = `${5 + Math.random() * 15}px`;
            spark.style.zIndex = "9999";
            parent.appendChild(spark);

            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 50;
            spark.animate([
                { transform: "translate(0,0)", opacity: 1 },
                { transform: `translate(${Math.cos(angle)*distance}px, ${Math.sin(angle)*distance}px)`, opacity: 0 }
            ], { duration: 1500, easing: "ease-out", fill: "forwards" });

            setTimeout(() => spark.remove(), 1500);
        }
        fire.remove();
    }, duration / 2);
}
