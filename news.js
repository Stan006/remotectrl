(function () {
  const searchInput = document.querySelector('[data-news-search]');
  const filterButtons = document.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll('[data-news-item]');
  const emptyState = document.getElementById('news-empty');

  let activeFilter = 'all';

  function normalize(text) {
    return (text || '').toLowerCase().trim();
  }

  function applyFilters() {
    const query = normalize(searchInput ? searchInput.value : '');

    let visibleCount = 0;

    items.forEach((item) => {
      const categories = (item.getAttribute('data-category') || '').split(/\s+/);
      const text = normalize(item.innerText || item.textContent || '');

      const matchesCategory =
        activeFilter === 'all' || categories.includes(activeFilter);

      const matchesSearch =
        !query || text.indexOf(query) !== -1;

      const visible = matchesCategory && matchesSearch;
      item.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    if (emptyState) {
      emptyState.classList.toggle('visible', visibleCount === 0);
    }
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter');

      filterButtons.forEach((b) =>
        b.classList.toggle('is-active', b === btn)
      );

      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilters();
    });
  }

  applyFilters();
})();
