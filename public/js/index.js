document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.agent-row[data-agent-id]').forEach(row => {
    row.addEventListener('click', () => window.location.href = '/agents/' + row.dataset.agentId);
  });

  document.querySelectorAll('.action-link').forEach(link => {
    link.addEventListener('click', e => e.stopPropagation());
  });

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