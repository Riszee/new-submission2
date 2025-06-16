document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-link');

  if (skipLink && mainContent) {
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    });

    skipLink.addEventListener('focus', () => {
      skipLink.style.opacity = '1';
      skipLink.style.transform = 'translateY(0)';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.opacity = '0';
      skipLink.style.transform = 'translateY(-100%)';
    });
  }
});