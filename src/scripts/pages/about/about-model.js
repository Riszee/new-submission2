export default class AboutModel {
  getProfile() {
    return {
      name: 'Aufarist Ziandhani Roy Keane Rais',
      bio: "I'm a dedicated developer with a passion for creating intuitive and dynamic user experiences. My expertise spans across front-end and back-end development, enabling me to build complete and efficient web solutions.",
      image: '/images/Bojji1.jpeg',
      skills: [
        {
          id: 'frontend',
          icon: 'fas fa-laptop-code',
          title: 'Front-End Development',
          description: 'Building responsive and interactive web interfaces with modern frameworks and CSS animations.',
        },
        {
          id: 'backend',
          icon: 'fas fa-server',
          title: 'Back-End Development',
          description: 'Developing scalable and secure server-side applications using Node.js, Express, and RESTful APIs.',
        },
      ],
    };
  }
}
