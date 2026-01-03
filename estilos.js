// ============================================
// UTILIDADES COMPARTIDAS
// ============================================

const Utils = {
  // Detectar si es dispositivo móvil/táctil
  isMobileDevice: () => 
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    navigator.msMaxTouchPoints > 0,

  // Detectar si se prefiere movimiento reducido
  prefersReducedMotion: () => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // Verificar si elemento está en viewport
  isElementVisible: (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
};

// ============================================
// MANEJADORES ESPECÍFICOS
// ============================================

const ImageHandler = {
  init: () => {
    const lazyImages = document.querySelectorAll('.img-load-fade');
    
    lazyImages.forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', ImageHandler.onImageLoad);
        img.addEventListener('error', ImageHandler.onImageError);
      }
    });
  },

  onImageLoad: function() {
    this.classList.add('loaded');
  },

  onImageError: function() {
    console.warn('No se pudo cargar la imagen:', this.src);
    this.classList.add('loaded');
  },

  markAllAsLoaded: () => {
    document.querySelectorAll('.img-load-fade:not(.loaded)').forEach(img => {
      img.classList.add('loaded');
    });
  }
};

// ============================================
// MANEJADOR ESPECÍFICO PARA FEATURECARDS EN MÓVIL
// ============================================

const FeatureCardHandler = {
  initialized: false,
  activeCard: null,
  
  init: () => {
    // Solo en móvil
    if (!Utils.isMobileDevice()) return;
    
    FeatureCardHandler.initialized = true;
    
    // Inicializar todos los FeatureCards (NO tech-card)
    const featureCards = document.querySelectorAll('.mobile-active:not(.tech-card)');
    
    featureCards.forEach(card => {
      // Remover cualquier listener previo
      card.removeEventListener('click', FeatureCardHandler.onCardClick);
      card.removeEventListener('touchstart', FeatureCardHandler.onTouchStart);
      card.removeEventListener('touchend', FeatureCardHandler.onTouchEnd);
      
      // Agregar nuevos listeners
      card.addEventListener('click', FeatureCardHandler.onCardClick);
      card.addEventListener('touchstart', FeatureCardHandler.onTouchStart);
      card.addEventListener('touchend', FeatureCardHandler.onTouchEnd);
    });
    
    // También manejar tech-cards si es necesario
    FeatureCardHandler.initTechCards();
    
    // Remover estado activo al hacer clic fuera
    document.addEventListener('click', FeatureCardHandler.onDocumentClick);
    document.addEventListener('touchstart', FeatureCardHandler.onDocumentTouch);
  },
  
  initTechCards: () => {
    const techCards = document.querySelectorAll('.mobile-active.tech-card');
    
    techCards.forEach(card => {
      card.removeEventListener('click', FeatureCardHandler.onTechCardClick);
      card.addEventListener('click', FeatureCardHandler.onTechCardClick);
    });
  },
  
  onTouchStart: function(e) {
    // Evitar que otros manejadores interfieran
    e.stopPropagation();
    // Marcar que este elemento está siendo tocado
    this.setAttribute('data-touching', 'true');
  },
  
  onTouchEnd: function(e) {
    // Quitar marca de touch
    this.removeAttribute('data-touching');
    e.stopPropagation();
  },
  
  onCardClick: function(e) {
    // IMPORTANTE: Prevenir comportamiento por defecto y propagación
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Si ya está activa, desactivarla
    if (this.classList.contains('active-touch')) {
      this.classList.remove('active-touch');
      FeatureCardHandler.activeCard = null;
    } else {
      // Activar esta tarjeta
      this.classList.add('active-touch');
      FeatureCardHandler.activeCard = this;
    }
    
    // Forzar reflow para asegurar que los estilos se apliquen
    void this.offsetWidth;
  },
  
  onTechCardClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const techCards = document.querySelectorAll('.mobile-active.tech-card');
    
    // Solo una tech-card activa a la vez
    if (this.classList.contains('active-touch')) {
      this.classList.remove('active-touch');
    } else {
      techCards.forEach(card => card.classList.remove('active-touch'));
      this.classList.add('active-touch');
    }
  },
  
  onDocumentClick: (e) => {
    // Solo si se hace clic fuera de CUALQUIER FeatureCard
    if (!e.target.closest('.mobile-active:not(.tech-card)')) {
      const featureCards = document.querySelectorAll('.mobile-active:not(.tech-card)');
      featureCards.forEach(card => {
        card.classList.remove('active-touch');
      });
      FeatureCardHandler.activeCard = null;
    }
  },
  
  onDocumentTouch: (e) => {
    // Para touch: si se toca fuera y no es un FeatureCard
    if (!e.target.closest('.mobile-active:not(.tech-card)')) {
      const featureCards = document.querySelectorAll('.mobile-active:not(.tech-card)');
      featureCards.forEach(card => {
        card.classList.remove('active-touch');
      });
      FeatureCardHandler.activeCard = null;
    }
  },
  
  cleanup: () => {
    if (!FeatureCardHandler.initialized) return;
    
    const allCards = document.querySelectorAll('.mobile-active');
    
    allCards.forEach(card => {
      card.removeEventListener('click', FeatureCardHandler.onCardClick);
      card.removeEventListener('click', FeatureCardHandler.onTechCardClick);
      card.removeEventListener('touchstart', FeatureCardHandler.onTouchStart);
      card.removeEventListener('touchend', FeatureCardHandler.onTouchEnd);
      card.removeAttribute('data-touching');
    });
    
    document.removeEventListener('click', FeatureCardHandler.onDocumentClick);
    document.removeEventListener('touchstart', FeatureCardHandler.onDocumentTouch);
    
    FeatureCardHandler.initialized = false;
    FeatureCardHandler.activeCard = null;
  }
};

// ============================================
// TOUCH HANDLER SIMPLIFICADO (solo para elementos generales)
// ============================================

const TouchHandler = {
  init: () => {
    if (!Utils.isMobileDevice()) return;
    
    // Solo elementos que NO sean FeatureCards
    const touchElements = document.querySelectorAll('.touch-feedback:not(.mobile-active), .wave-effect:not(.mobile-active)');
    
    touchElements.forEach(el => {
      el.addEventListener('touchstart', TouchHandler.onTouchStart);
      el.addEventListener('touchend', TouchHandler.onTouchEnd);
    });
  },

  onTouchStart: function() {
    // Solo si no es un FeatureCard
    if (!this.classList.contains('mobile-active')) {
      this.classList.add('active-touch');
    }
  },

  onTouchEnd: function() {
    // Solo si no es un FeatureCard
    if (!this.classList.contains('mobile-active')) {
      setTimeout(() => {
        this.classList.remove('active-touch');
      }, 150);
    }
  }
};

const ScrollObserver = {
  observer: null,

  init: () => {
    ScrollObserver.observer = new IntersectionObserver(ScrollObserver.onIntersection, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      ScrollObserver.observer.observe(el);
    });
  },

  onIntersection: (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target.classList.contains('animated')) return;
      
      entry.target.classList.add('animated');
      
      if (entry.target.classList.contains('stagger-animation')) {
        const children = entry.target.children;
        Array.from(children).forEach((child, index) => {
          child.style.animationDelay = `${index * 150}ms`;
        });
      }
      
      ScrollObserver.observer.unobserve(entry.target);
    });
  },

  observeElements: (selector, onVisible) => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  }
};

const MotionPreferenceHandler = {
  mediaQuery: null,

  init: () => {
    MotionPreferenceHandler.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    MotionPreferenceHandler.updateClass();
    MotionPreferenceHandler.mediaQuery.addEventListener('change', MotionPreferenceHandler.updateClass);
  },

  updateClass: () => {
    if (MotionPreferenceHandler.mediaQuery.matches) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }
};

const ButtonStateHandler = {
  init: () => {
    // Solo en desktop
    if (Utils.isMobileDevice()) return;
    
    document.addEventListener('mousedown', ButtonStateHandler.onMouseDown);
    document.addEventListener('mouseup', ButtonStateHandler.onMouseUp);
  },

  onMouseDown: (e) => {
    const target = e.target.closest('.touch-feedback, .wave-effect');
    if (target) {
      target.classList.add('active-mouse');
    }
  },

  onMouseUp: () => {
    document.querySelectorAll('.active-mouse').forEach(el => {
      el.classList.remove('active-mouse');
    });
  }
};

// ============================================
// INICIALIZADOR PRINCIPAL
// ============================================

export function inicializarAnimaciones() {
  // Detectar dispositivo
  const deviceClass = Utils.isMobileDevice() ? 'is-mobile' : 'is-desktop';
  document.body.classList.add(deviceClass);
  document.body.classList.remove(deviceClass === 'is-mobile' ? 'is-desktop' : 'is-mobile');

  // Inicializar todos los manejadores
  ImageHandler.init();
  TouchHandler.init(); // Solo para elementos generales
  MotionPreferenceHandler.init();
  ButtonStateHandler.init();
  ScrollObserver.init();
  
  // INICIALIZAR MANEJADOR ESPECÍFICO PARA FEATURECARDS
  FeatureCardHandler.init();

  // Manejar carga completa
  const handleCompleteLoad = () => {
    ImageHandler.markAllAsLoaded();
    setTimeout(() => {
      document.body.classList.add('page-loaded');
    }, 100);
  };

  // Configurar listeners de carga
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleCompleteLoad);
  } else {
    handleCompleteLoad();
  }

  window.addEventListener('load', handleCompleteLoad);
}

// ============================================
// API PÚBLICA
// ============================================

export const Animaciones = {
  // Manejo de clases de animación
  agregar: (elemento, clase) => {
    if (!elemento.classList.contains(clase)) {
      elemento.classList.add(clase);
    }
  },

  remover: (elemento, clase) => {
    elemento.classList.remove(clase);
  },

  // Observadores
  observar: (selector, claseAnimacion) => {
    ScrollObserver.observeElements(selector, (element) => {
      element.classList.add(claseAnimacion);
    });
  },

  // Utilidades
  esVisible: Utils.isElementVisible,
  
  // Función para limpiar listeners
  limpiar: () => {
    FeatureCardHandler.cleanup();
  },

  // Función para actualizar si se agregan elementos dinámicamente
  actualizar: () => {
    if (Utils.isMobileDevice()) {
      FeatureCardHandler.init();
    }
  },

  // Inicialización
  inicializar: inicializarAnimaciones
};

// Inicialización automática opcional
// Animaciones.inicializar();