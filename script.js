// script.js

document.addEventListener('DOMContentLoaded', () => {
  // star-button logic (updated)
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card = btn.closest('.card');
      const container = card.parentElement;
      const isStarred = btn.classList.toggle('starred');

      const starredCards = container.querySelectorAll('.star-btn.starred');

      if (isStarred) {
        if (starredCards.length > 5) {
          btn.classList.remove('starred');
          alert('You can only star up to 5 cards.');
          return;
        }
        // Move the card to the top
        container.insertBefore(card, container.firstChild);
      } else {
        // Move unstarred cards to the end
        container.appendChild(card);
      }
    });
  });

  // redirect logic for normal cards
  document.querySelectorAll('.card[data-url]').forEach(card => {
    if (card.classList.contains('expandable-card')) return;
    card.addEventListener('click', () => {
      window.open(card.dataset.url, '_blank');
    });
  });

  // expandable-card popup logic
  const expandableCard = document.querySelector('.expandable-card');
  const nestedCards    = document.getElementById('text2imageCards');

  expandableCard.addEventListener('click', async e => {
    if (e.target.closest('.star-btn')) return;
    if (!nestedCards) return;

    // create overlay & popup container
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');

    const popup = document.createElement('div');
    popup.classList.add('popup-content');

    // close button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('popup-close-btn');
    closeBtn.textContent = '✕';
    overlay.appendChild(closeBtn);

    // clone nested cards and add click-to-open functionality
    nestedCards.querySelectorAll('.card').forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('popup-card');

      // Redirect logic for cloned cards
      const url = card.dataset.url;
      if (url && !card.classList.contains('expandable-card')) {
        clone.addEventListener('click', (e) => {
          if (!e.target.closest('.star-btn')) {
            window.open(url, '_blank');
          }
        });
      }

      popup.appendChild(clone);
    });

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // animate overlay in
    await overlay.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 300, fill: 'forwards' }
    ).finished;

    // animate popup in
    await popup.animate(
      [{ transform: 'scale(0.8)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 400, easing: 'ease-out', fill: 'forwards' }
    ).finished;

    // stagger the cards
    popup.querySelectorAll('.popup-card').forEach((c, i) => {
      c.animate(
        [{ transform: 'scale(0.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
        { duration: 400, easing: 'cubic-bezier(.5,1.5,.5,1)', fill: 'forwards', delay: i * 100 }
      );
    });

    // closing logic
    const closePopup = async () => {
      await popup.animate(
        [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.8)', opacity: 0 }],
        { duration: 300, fill: 'forwards' }
      ).finished;
      await overlay.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 200, fill: 'forwards' }
      ).finished;
      overlay.remove();
    };

    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', evt => {
      if (evt.target === overlay) closePopup();
    });
  });
});
