// Inicialización del slider de testimonios para móviles
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;
  
  const prevButton = document.querySelector('.testimonial-prev');
  const nextButton = document.querySelector('.testimonial-next');
  const cards = document.querySelectorAll('.testimonial-card');
  let currentIndex = 0;
  const cardCount = cards.length;
  let cardWidth = 0;

  const updateCardWidth = () => {
    if (cards.length > 0) {
      cardWidth = cards[0].offsetWidth + 24; // Ancho de la tarjeta + margen
    }
  };

  const updateSliderPosition = () => {
    slider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  };

  const goToSlide = (index) => {
    if (index < 0) {
      currentIndex = cardCount - 1;
    } else if (index >= cardCount) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateSliderPosition();
  };

  // Inicializar
  if (window.innerWidth < 768) {
    updateCardWidth();
    updateSliderPosition();

    // Navegación
    if (prevButton && nextButton) {
      prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));
      nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));
    }

    // Actualizar en redimensionamiento
    window.addEventListener('resize', () => {
      updateCardWidth();
      updateSliderPosition();
    });
  }
});
