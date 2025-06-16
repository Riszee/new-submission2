export default class AboutView {
  render() {
    return `
      <section class="container about-section">
        <div class="about-header">
          <h1>About Me</h1>
          <p class="subtitle">Passionate Developer & Tech Enthusiast</p>
        </div>
        <div class="about-content">
          <div class="profile-card">
            <div class="profile-image">
              <img src="" alt="Profile Picture" class="profile-img">
            </div>
            <h2 class="profile-name"></h2>
            <p class="profile-bio"></p>
          </div>
          <div class="skills-section">
            <h2>My Expertise</h2>
            <div class="skills-grid"></div>
          </div>
        </div>
        <div class="loading-container">
          <div class="loader"></div>
        </div>
      </section>
    `;
  }

  renderProfile(profileDataku) {
    const profileImage = document.querySelector('.profile-img');
    const profileName = document.querySelector('.profile-name');
    const profileBio = document.querySelector('.profile-bio');
    const skillsGrid = document.querySelector('.skills-grid');

    profileImage.src = profileDataku.image;
    profileImage.alt = `Profile picture of ${profileDataku.name}`;
    profileName.textContent = profileDataku.name;
    profileBio.textContent = profileDataku.bio;

    skillsGrid.innerHTML = profileDataku.skills
      .map(
        (skill) => `
          <div class="skill-card" data-skill="${skill.id}">
            <i class="${skill.icon}"></i>
            <h3>${skill.title}</h3>
            <p>${skill.description}</p>
          </div>
        `
      )
      .join('');

    this.setupAnimation();
  }

  setupAnimation() {
    const loadingContainer = document.querySelector('.loading-container');
    loadingContainer.classList.add('active');
    setTimeout(() => {
      loadingContainer.classList.remove('active');
    }, 1000);

    const skillCards = document.querySelectorAll('.skill-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    skillCards.forEach((card) => {
      observer.observe(card);
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
        card.style.boxShadow = '0 8px 16px var(--shadow)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 2px 4px var(--shadow)';
      });
    });
  }
}