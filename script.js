document.addEventListener('DOMContentLoaded', () => {
  const maxStars = 5;
  const container = document.getElementById('cardContainer');
  const storedStars = JSON.parse(localStorage.getItem('starredCards')) || [];

  const cards = Array.from(document.querySelectorAll('.card'));

  // Initialize star state
  cards.forEach(card => {
    const id = card.dataset.id;
    const starBtn = card.querySelector('.star-btn');
    if (storedStars.includes(id)) {
      starBtn.classList.add('starred');
    }

    // Card click to open URL
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('star-btn')) {
        const url = card.dataset.url;
        window.open(url, '_blank');
      }
    });

    // Star button click
    starBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = storedStars.indexOf(id);
      if (index === -1) {
        if (storedStars.length < maxStars) {
          storedStars.push(id);
          starBtn.classList.add('starred');
        } else {
          alert('You can only star up to 5 cards. Unstar one to add another.');
          return;
        }
      } else {
        storedStars.splice(index, 1);
        starBtn.classList.remove('starred');
      }

      localStorage.setItem('starredCards', JSON.stringify(storedStars));
      reorderCards();
    });
  });

  // Move starred cards to top
  function reorderCards() {
    const starred = [];
    const unstarred = [];

    cards.forEach(card => {
      const id = card.dataset.id;
      if (storedStars.includes(id)) {
        starred.push(card);
      } else {
        unstarred.push(card);
      }
    });

    container.innerHTML = '';
    [...starred, ...unstarred].forEach(card => container.appendChild(card));
  }

  reorderCards(); // Initial order on page load
});
