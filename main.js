function haptic(ms = 15) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    haptic(15);

    if (href && href.startsWith('/')) {
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => location.href = href, 220);
    }
  });
});