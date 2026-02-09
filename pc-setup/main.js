document.querySelectorAll('a[href^="/"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const url = link.getAttribute('href');
    document.body.classList.add('fade-out');
    setTimeout(() => {
      window.location.href = url;
    }, 250);
  });
});