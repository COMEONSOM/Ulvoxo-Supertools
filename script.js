// script.js

document.addEventListener('DOMContentLoaded', () => {
  const PIN_KEY = 'ulvoxo_pinned_cards';
  const ORIGINAL_ORDER_KEY = 'ulvoxo_original_order';

  const container = document.getElementById('cardContainer');
  let cards = Array.from(container.querySelectorAll('.card'));

  // Save original order if not stored
  if (!localStorage.getItem(ORIGINAL_ORDER_KEY)) {
    const originalOrder = cards.map(card => card.dataset.id);
    localStorage.setItem(ORIGINAL_ORDER_KEY, JSON.stringify(originalOrder));
  }

  const originalOrder = JSON.parse(localStorage.getItem(ORIGINAL_ORDER_KEY));
  let pinnedIds = JSON.parse(localStorage.getItem(PIN_KEY)) || [];

  // ========== Re-render Cards ==========
  function renderCards(withAnimation = true) {
    const pinnedCards = [];
    const unpinnedCards = [];

    // Separate pinned and unpinned based on current state
    originalOrder.forEach(id => {
      const card = container.querySelector(`.card[data-id="${id}"]`);
      if (!card) return;

      if (pinnedIds.includes(id)) {
        card.classList.add('pinned-card');
        addPinBadge(card);
        pinnedCards.push(card);
      } else {
        card.classList.remove('pinned-card');
        removePinBadge(card);
        unpinnedCards.push(card);
      }
    });

    const newOrder = [...pinnedCards, ...unpinnedCards];

    if (withAnimation) {
      animateReorder(container, newOrder);
    } else {
      container.innerHTML = '';
      newOrder.forEach(c => container.appendChild(c));
    }
  }

  // ========== Animate Reordering ==========
  function animateReorder(parent, newOrder) {
    const oldRects = Array.from(parent.children).map(el => el.getBoundingClientRect());
    parent.innerHTML = '';
    newOrder.forEach(c => parent.appendChild(c));
    const newRects = newOrder.map(el => el.getBoundingClientRect());

    newOrder.forEach((el, i) => {
      const deltaX = oldRects[i].left - newRects[i].left;
      const deltaY = oldRects[i].top - newRects[i].top;

      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      el.style.transition = 'transform 0s';

      requestAnimationFrame(() => {
        el.style.transition = 'transform 300ms ease';
        el.style.transform = '';
      });
    });
  }

  // ========== Pin Button Logic ==========
  container.addEventListener('click', e => {
    const btn = e.target.closest('.pin-btn');
    if (!btn) return;

    e.stopPropagation();
    const card = btn.closest('.card');
    const cardId = card.dataset.id;
    const isPinned = btn.classList.toggle('pinned');

    if (isPinned) {
      if (!pinnedIds.includes(cardId)) pinnedIds.push(cardId);
    } else {
      pinnedIds = pinnedIds.filter(id => id !== cardId);
    }

    localStorage.setItem(PIN_KEY, JSON.stringify(pinnedIds));
    renderCards();
  });

  // ========== Card Click Redirect ==========
  container.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card || card.classList.contains('expandable-card')) return;
    if (e.target.closest('.pin-btn')) return; // Ignore pin button
    const url = card.dataset.url;
    if (url) window.open(url, '_blank');
  });

  // ========== Drag-and-Drop Reordering ==========
  let draggedCard = null;

  container.addEventListener('dragstart', e => {
    if (!e.target.classList.contains('pinned-card')) return;
    draggedCard = e.target;
    setTimeout(() => draggedCard.classList.add('dragging'), 0);
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    if (afterElement == null) {
      container.insertBefore(draggedCard, container.firstChild);
    } else {
      container.insertBefore(draggedCard, afterElement);
    }
  });

  container.addEventListener('drop', () => {
    draggedCard.classList.remove('dragging');
    updatePinnedOrder();
    draggedCard = null;
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.pinned-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  function updatePinnedOrder() {
    const newPinnedIds = [...container.querySelectorAll('.pinned-card')].map(card => card.dataset.id);
    pinnedIds = newPinnedIds;
    localStorage.setItem(PIN_KEY, JSON.stringify(pinnedIds));
  }

  // ========== Helpers ==========
  function addPinBadge(card) {
    if (!card.querySelector('.pin-badge')) {
      const badge = document.createElement('span');
      badge.className = 'pin-badge';
      badge.textContent = '📌 Pinned';
      card.appendChild(badge);
    }
  }

  function removePinBadge(card) {
    const badge = card.querySelector('.pin-badge');
    if (badge) badge.remove();
  }

  renderCards();
});
