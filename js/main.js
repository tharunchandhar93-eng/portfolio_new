/**
 * THARUN C - PORTFOLIO MAIN INTERACTION ENGINE
 * Navigation, 3D Tilt, Web Audio FX, Toast, Modals, Clipboard, Form handling
 */

// ===================================================================
// 1. SYNTHESIZED WEB AUDIO API SOUND SYSTEM (Zero External MP3s Needed)
// ===================================================================
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('tharun_sound_fx') === 'true';
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn("Web Audio not supported:", e);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('tharun_sound_fx', this.enabled ? 'true' : 'false');
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.enabled;
  }

  playBlip() {
    if (!this.enabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {}
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }

  playKick() {
    if (!this.enabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      // Low punchy kick thump
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {}
  }
}

window.AudioController = new SoundSystem();

// ===================================================================
// 2. TOAST SYSTEM
// ===================================================================
function showToast(message, icon = 'check') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let iconSvg = '';
  if (icon === 'check') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (icon === 'copy') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-text">${message}</div>
  `;

  container.appendChild(toast);
  window.AudioController.playBlip();

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// ===================================================================
// 3. COPY TO CLIPBOARD HELPER
// ===================================================================
function copyToClipboard(text, label) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${label}: ${text}`, 'copy');
    }).catch(() => fallbackCopy(text, label));
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(`Copied ${label}: ${text}`, 'copy');
  } catch (err) {
    showToast(`Could not copy: ${text}`, 'info');
  }
  document.body.removeChild(ta);
}

// ===================================================================
// 4. INTERACTIVE 3D CARD TILT
// ===================================================================
function init3DTilt() {
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

// ===================================================================
// 5. CUSTOM CURSOR
// ===================================================================
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(renderFollower);
  }
  requestAnimationFrame(renderFollower);

  const interactives = document.querySelectorAll('a, button, input, textarea, .glass-panel, [data-tilt]');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ===================================================================
// 6. INITIALIZATION & DOM EVENTS
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Scroll Class
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Scroll spy for active link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        current = section.getAttribute('id');
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile Menu Toggle
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      window.AudioController.playClick();
    });

    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileNav.classList.remove('open'));
    });
  }

  // Sound Toggle Button
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    if (window.AudioController.enabled) {
      soundBtn.classList.add('active');
    }
    soundBtn.addEventListener('click', () => {
      const enabled = window.AudioController.toggle();
      soundBtn.classList.toggle('active', enabled);
      showToast(enabled ? "Sound FX Enabled" : "Sound FX Muted", 'info');
    });
  }

  // 3D Tilt Init
  init3DTilt();

  // Custom Cursor Init
  initCustomCursor();

  // Copy Buttons
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.getAttribute('data-copy');
      const label = btn.getAttribute('data-label') || 'Text';
      copyToClipboard(text, label);
    });
  });

  // Skills Tabs
  const skillTabs = document.querySelectorAll('.skills-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');

      window.AudioController.playClick();

      skillCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => card.style.opacity = '1', 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Modals (Resume Modal & To-Do Demo Modal)
  const modalOpeners = document.querySelectorAll('[data-modal-open]');
  const modalClosers = document.querySelectorAll('[data-modal-close]');

  modalOpeners.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-modal-open');
      const targetModal = document.getElementById(targetId);
      if (targetModal) {
        targetModal.classList.add('open');
        window.AudioController.playClick();
      }
    });
  });

  modalClosers.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('open');
        window.AudioController.playClick();
      }
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });

  // Back to Top Button
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.AudioController.playClick();
    });
  }

  // Contact Form Submission (Mailto + Toast)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('sender-name')?.value || 'Inquirer';
      const email = document.getElementById('sender-email')?.value || '';
      const subject = document.getElementById('message-subject')?.value || 'Portfolio Inquiry';
      const message = document.getElementById('message-text')?.value || '';

      const mailtoUrl = `mailto:tharun282007@gmail.com?subject=${encodeURIComponent(subject + " - from " + name)}&body=${encodeURIComponent("Sender Email: " + email + "\n\n" + message)}`;
      
      window.location.href = mailtoUrl;
      showToast("Drafting email to Tharun C...", 'check');
      contactForm.reset();
    });
  }
});
