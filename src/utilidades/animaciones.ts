// Utilidades para animaciones y efectos visuales

export const animaciones = {
  // Animación de entrada suave
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },

  // Animación de escala
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3 }
  },

  // Animación de deslizamiento desde la izquierda
  slideInLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.5 }
  },

  // Animación de deslizamiento desde la derecha
  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.5 }
  },

  // Animación de rebote
  bounce: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { 
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  },

  // Animación de pulso
  pulse: {
    animate: { 
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1]
    },
    transition: { 
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Efectos de hover para elementos interactivos
export const efectosHover = {
  boton: 'transition-all duration-200 hover:scale-105 hover:shadow-lg',
  tarjeta: 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
  enlace: 'transition-colors duration-200 hover:text-blue-600',
  imagen: 'transition-transform duration-300 hover:scale-110'
}

// Clases CSS para animaciones comunes
export const clasesAnimacion = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  shake: 'animate-shake'
}




























