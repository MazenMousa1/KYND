/* ===== KYND CAFÉ – main.js ===== */

/* -- Navbar scroll effect -- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* -- Active nav link on scroll -- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLinks() {
  const path = window.location.pathname;
  const isMenuPage = path.includes('menu.html') || path.includes('category.html');

  if (isMenuPage) {
    navLinks.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href').includes('menu.html')) {
        l.classList.add('active');
      }
    });
    return;
  }

  // On home page, use IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
}

updateActiveLinks();

/* -- Hamburger / Mobile Menu -- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const menuOverlay = document.getElementById('menuOverlay');

function openMenu() {
  mobileMenu.classList.add('open');
  menuOverlay.classList.add('show');
  hamburger.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  menuOverlay.classList.remove('show');
  hamburger.classList.remove('active');
  document.body.style.overflow = '';
}
hamburger.addEventListener('click', openMenu);
mobileClose.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);
document.querySelectorAll('.mobile-link, .mobile-order').forEach(l => {
  l.addEventListener('click', closeMenu);
});

/* -- Reveal on Scroll -- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

/* -- Testimonials Slider -- */
(function () {
  const track = document.getElementById('testiTrack');
  const dotsContainer = document.getElementById('testiDots');
  if (!track) return;

  const cards = track.querySelectorAll('.testi-card');
  let current = 0;
  let autoTimer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function getCardWidth() {
    return cards[0].offsetWidth + 20; // gap
  }

  function goTo(idx) {
    current = (idx + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    dotsContainer.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  document.getElementById('testiPrev').addEventListener('click', () => {
    goTo(current - 1);
    resetAuto();
  });
  document.getElementById('testiNext').addEventListener('click', () => {
    goTo(current + 1);
    resetAuto();
  });

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }
  resetAuto();

  // Touch swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
  });
})();

/* -- Gallery Carousel -- */
(function () {
  const track = document.getElementById('galleryTrack');
  const dotsWrap = document.getElementById('galDots');
  const prevBtn = document.getElementById('galPrev');
  const nextBtn = document.getElementById('galNext');
  if (!track) return;

  const slides = track.querySelectorAll('.gallery-slide');
  const total = slides.length;
  let current = 0;
  let autoTimer;
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Image ${i + 1}`);
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsWrap.appendChild(dot);
  });

  function getSlideWidth() {
    return slides[0].offsetWidth + 16; // gap=16px
  }

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
    dotsWrap.querySelectorAll('.gallery-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 3800);
  }
  resetAuto();

  // Touch / drag swipe
  function onDragStart(clientX) {
    isDragging = true;
    startX = clientX;
    track.classList.add('dragging');
  }
  function onDragEnd(clientX) {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    const diff = startX - clientX;
    if (Math.abs(diff) > 48) {
      goTo(diff > 0 ? current + 1 : current - 1);
      resetAuto();
    }
  }

  // Mouse drag
  track.addEventListener('mousedown', e => onDragStart(e.clientX));
  window.addEventListener('mouseup', e => onDragEnd(e.clientX));
  track.addEventListener('mousemove', e => { if (isDragging) e.preventDefault(); });

  // Touch
  track.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchend', e => onDragEnd(e.changedTouches[0].clientX));

  // Recalc on resize
  window.addEventListener('resize', () => goTo(current));
})();

/* -- Newsletter Form -- */
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const input = this.querySelector('input');
    const btn = this.querySelector('button');
    const origText = btn.textContent;
    btn.textContent = 'Thanks! ✦';
    btn.style.background = 'var(--matcha-deep)';
    input.value = '';
    setTimeout(() => {
      btn.textContent = origText;
      btn.style.background = 'var(--text-dark)';
    }, 3000);
  });
}

/* -- Add to cart buttons -- */
function setupCartButtons() {
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const orig = this.textContent;
      this.textContent = '✓ Added!';
      this.style.background = 'var(--matcha-deep)';
      setTimeout(() => {
        this.textContent = orig;
        this.style.background = '';
      }, 1800);
    });
  });
}
setupCartButtons();

/* -- Dynamic Category Rendering -- */
(function() {
  const grid = document.getElementById('category-drinks-grid');
  if (!grid) return;

  try {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'matcha';

    const menuData = {
      matcha: {
        title: "Matcha Drinks",
        desc: "Ceremonial grade matcha blended perfectly for your daily ritual.",
        items: [
          { name: "Signature Matcha Latte", desc: "Ceremonial grade matcha with oat milk", price: "$6.50", img: "https://images.unsplash.com/photo-1536514072410-5019a3c69182?auto=format&fit=crop&w=400&q=80", badge: "Bestseller" },
          { name: "Rose Strawberry Cloud", desc: "Iced strawberry latte with rose syrup", price: "$7.50", img: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=400&q=80", badge: "New" },
          { name: "Vanilla Matcha Frappe", desc: "Blended icy matcha with vanilla bean", price: "$7.00", img: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=400&q=80" },
          { name: "Peach Matcha Fizz", desc: "Sparkling matcha with peach purée", price: "$6.80", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80", badge: "Seasonal" }
        ]
      },
      coffee: {
        title: "Signature Coffee",
        desc: "Premium roasted beans crafted into beautiful, smooth espresso drinks.",
        items: [
          { name: "Lavender Honey Latte", desc: "Calming lavender espresso with golden honey", price: "$6.00", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80", badge: "Bestseller" },
          { name: "Oat Milk Flat White", desc: "Smooth double ristretto with creamy oat milk", price: "$5.50", img: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?auto=format&fit=crop&w=400&q=80" },
          { name: "Kynd Caramel Macchiato", desc: "Vanilla milk, espresso, and house caramel", price: "$6.50", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=80" }
        ]
      },
      refreshers: {
        title: "Refreshers & Fruit",
        desc: "Vibrant, sparkling, and fruity sips to brighten your afternoon.",
        items: [
          { name: "Yuzu Lemon Sparkler", desc: "Fresh yuzu, mint, and sparkling water", price: "$5.50", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80" },
          { name: "Hibiscus Berry Tea", desc: "Iced hibiscus tea with fresh mixed berries", price: "$5.00", img: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=400&q=80", badge: "New" }
        ]
      },
      desserts: {
        title: "Desserts & Pastries",
        desc: "Sweet, soft, and buttery treats baked fresh every morning.",
        items: [
          { name: "Matcha Tiramisu", desc: "Mascarpone layered with matcha soaked ladyfingers", price: "$8.50", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80", badge: "Bestseller" },
          { name: "Strawberry Shortcake", desc: "Light sponge cake with fresh cream and berries", price: "$7.50", img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&q=80" },
          { name: "Butter Croissant", desc: "Classic flaky French pastry", price: "$4.00", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80" }
        ]
      }
    };

    const data = menuData[type] || menuData['matcha'];
    
    const titleEl = document.getElementById('category-title');
    const descEl = document.getElementById('category-desc');
    
    if (titleEl) titleEl.innerHTML = `<em>${data.title}</em>`;
    if (descEl) descEl.textContent = data.desc;

    let html = '';
    data.items.forEach((item, index) => {
      const delay = index * 100;
      const badgeHtml = item.badge ? `<div class="drink-badge ${item.badge.toLowerCase() === 'new' ? 'new' : ''}">${item.badge}</div>` : '';
      
      html += `
        <div class="drink-card reveal-up" style="animation-delay: ${delay}ms">
          <div class="drink-img-wrap">
            <img src="${item.img}" alt="${item.name}" style="width: 100%; height: 200px; object-fit: cover;" />
            ${badgeHtml}
          </div>
          <div class="drink-info">
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
            <div class="drink-footer">
              <span class="price">${item.price}</span>
              <button class="add-btn">+ Add</button>
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
    setupCartButtons();
  } catch (err) {
    console.error("Error rendering category:", err);
  }
})();

/* -- Copy current hero image to assets if available -- */
(function setupAssets() {
  const heroImg = document.querySelector('.hero-drink-img');
  if (heroImg) {
    heroImg.addEventListener('error', () => {
      heroImg.style.display = 'none';
      const fallback = document.querySelector('.hero-img-fallback');
      if (fallback) fallback.style.display = 'flex';
    });
  }
})();
