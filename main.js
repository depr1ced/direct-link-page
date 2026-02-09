// fade-out navigation
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

// active link highlight
const path = window.location.pathname;
document.querySelectorAll('.links a').forEach(link => {
  if (link.getAttribute('href') === path) {
    link.classList.add('active');
  }
});