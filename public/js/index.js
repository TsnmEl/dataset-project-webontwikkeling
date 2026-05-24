document.addEventListener('DOMContentLoaded', function () {
  /* LOADING SCREEN */
  const loading = document.getElementById('loading');
  if (loading && new URLSearchParams(window.location.search).has('welcome')) {
    loading.classList.remove('loading-hidden');
    setTimeout(() => {
      loading.style.transition = 'opacity 0.5s';
      loading.style.opacity = '0';
      setTimeout(() => loading.style.display = 'none', 500);
    }, 3000);
  }

  /* AGENT ROWS */
  document.querySelectorAll('.agent-row[data-agent-id]').forEach(row => {
    row.addEventListener('click', () => window.location.href = '/agents/' + row.dataset.agentId);
  });

  /* PREVENT ERROR VIEW LINKS */
  document.querySelectorAll('.action-link').forEach(link => {
    link.addEventListener('click', e => e.stopPropagation());
  });

  /* SEARCH BAR */
  const input = document.getElementById('search-input');
  const form = document.getElementById('search-form');
  if (input && form) {
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => form.submit(), 500);
    });
  }
});