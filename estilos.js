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
// TOUCH HANDLER MODIFICADO - SIN COMPETENCIA CON FEATURECARDS
// ============================================

const TouchHandler = {
  init: () => {
    if (!Utils.isMobileDevice()) return;
    
    // SOLO elementos que NO sean FeatureCards o TechCards (elementos generales)
    const touchElements = document.querySelectorAll('.touch-feedback:not(.mobile-active), .wave-effect:not(.mobile-active)');
    
    touchElements.forEach(el => {
      el.addEventListener('touchstart', TouchHandler.onTouchStart);
      el.addEventListener('touchend', TouchHandler.onTouchEnd);
      el.addEventListener('touchmove', TouchHandler.onTouchMove);
    });
  },

  onTouchStart: function() {
    this.classList.add('active-touch');
  },

  onTouchEnd: function() {
    setTimeout(() => {
      this.classList.remove('active-touch');
    }, 150);
  },

  onTouchMove: function(e) {
    if (this.classList.contains('active-touch')) {
      e.preventDefault();
    }
  }
};

// ============================================
// MANEJADOR PARA ESTADO ACTIVO EN MÓVIL - VERSIÓN SIMPLIFICADA Y FUNCIONAL
// ============================================

const MobileActiveHandler = {
  initialized: false,

  init: () => {
    if (!Utils.isMobileDevice()) return;
    
    MobileActiveHandler.initialized = true;
    
    // Inicializar listeners para todos los elementos .mobile-active
    MobileActiveHandler.initAllCards();
    
    // Remover estado activo al hacer clic fuera de CUALQUIER tarjeta
    document.addEventListener('click', MobileActiveHandler.onDocumentClick, true); // Use capture phase
  },

  initAllCards: () => {
    const allCards = document.querySelectorAll('.mobile-active');
    
    allCards.forEach(card => {
      // Remover cualquier listener previo
      card.removeEventListener('click', MobileActiveHandler.onCardClick);
      card.removeEventListener('touchstart', MobileActiveHandler.onTouchStart);
      
      // Agregar nuevos listeners
      card.addEventListener('click', MobileActiveHandler.onCardClick);
      card.addEventListener('touchstart', MobileActiveHandler.onTouchStart);
    });
  },

  onTouchStart: function(e) {
    // Prevenir que TouchHandler interfiera con FeatureCards
    e.stopPropagation();
  },

  onCardClick: function(e) {
    // Prevenir propagación para que no active otros listeners
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Determinar si es FeatureCard (sin tech-card) o TechCard
    const isTechCard = this.classList.contains('tech-card');
    
    if (isTechCard) {
      // COMPORTAMIENTO PARA TECHCARDS: solo una activa a la vez
      const techCards = document.querySelectorAll('.mobile-active.tech-card');
      
      if (this.classList.contains('active-touch')) {
        this.classList.remove('active-touch');
      } else {
        techCards.forEach(t => t.classList.remove('active-touch'));
        this.classList.add('active-touch');
      }
    } else {
      // COMPORTAMIENTO PARA FEATURECARDS: múltiples activas, toggle individual
      if (this.classList.contains('active-touch')) {
        this.classList.remove('active-touch');
      } else {
        this.classList.add('active-touch');
      }
    }
    
    // Prevenir comportamiento por defecto si es un enlace
    if (this.tagName === 'A' || this.closest('a')) {
      e.preventDefault();
    }
  },

  onDocumentClick: (e) => {
    // Si se hace clic FUERA de cualquier elemento .mobile-active
    if (!e.target.closest('.mobile-active')) {
      // Remover active-touch de TODOS los elementos .mobile-active
      const allCards = document.querySelectorAll('.mobile-active');
      allCards.forEach(card => {
        card.classList.remove('active-touch');
      });
    }
  },

  cleanup: () => {
    if (!MobileActiveHandler.initialized) return;
    
    const allCards = document.querySelectorAll('.mobile-active');
    
    allCards.forEach(card => {
      card.removeEventListener('click', MobileActiveHandler.onCardClick);
      card.removeEventListener('touchstart', MobileActiveHandler.onTouchStart);
    });
    
    document.removeEventListener('click', MobileActiveHandler.onDocumentClick, true);
    
    MobileActiveHandler.initialized = false;
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
  TouchHandler.init(); // Ahora solo maneja elementos generales, NO FeatureCards
  MotionPreferenceHandler.init();
  ButtonStateHandler.init();
  ScrollObserver.init();
  
  // INICIALIZAR MANEJADOR PARA FEATURECARDS Y TECHCARDS
  MobileActiveHandler.init();

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
  
  // Función para limpiar listeners (útil para SPA)
  limpiar: () => {
    MobileActiveHandler.cleanup();
  },

  // Función para actualizar listeners si se agregan elementos dinámicamente
  actualizar: () => {
    if (Utils.isMobileDevice()) {
      MobileActiveHandler.initAllCards();
    }
  },

  // Inicialización
  inicializar: inicializarAnimaciones
};

// Inicialización automática opcional
// Animaciones.inicializar();