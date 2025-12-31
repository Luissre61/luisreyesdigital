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

const TouchHandler = {
  init: () => {
    if (!Utils.isMobileDevice()) return;
    
    const touchElements = document.querySelectorAll('.touch-feedback, .mobile-active, .wave-effect');
    
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
// MANEJADOR PARA ESTADO ACTIVO EN MÓVIL (NUEVO)
// ============================================

const MobileActiveHandler = {
  init: () => {
    if (!Utils.isMobileDevice()) return;
    
    const tarjetas = document.querySelectorAll('.mobile-active');
    
    tarjetas.forEach(tarjeta => {
      tarjeta.addEventListener('click', MobileActiveHandler.onCardClick);
    });
    
    // Remover estado activo al hacer clic fuera
    document.addEventListener('click', MobileActiveHandler.onDocumentClick);
  },

  onCardClick: function(e) {
    const tarjetas = document.querySelectorAll('.mobile-active');
    
    // Si ya está activa, quitar estado activo
    if (this.classList.contains('active-touch')) {
      this.classList.remove('active-touch');
    } else {
      // Remover estado activo de todas las tarjetas
      tarjetas.forEach(t => t.classList.remove('active-touch'));
      // Agregar estado activo a esta tarjeta
      this.classList.add('active-touch');
    }
    
    // Prevenir comportamiento por defecto si es un enlace
    if (this.tagName === 'A') {
      e.preventDefault();
    }
  },

  onDocumentClick: (e) => {
    // Si se hace clic fuera de una tarjeta, remover todos los estados activos
    if (!e.target.closest('.mobile-active')) {
      const tarjetas = document.querySelectorAll('.mobile-active');
      tarjetas.forEach(t => t.classList.remove('active-touch'));
    }
  },

  cleanup: () => {
    if (!Utils.isMobileDevice()) return;
    
    const tarjetas = document.querySelectorAll('.mobile-active');
    
    tarjetas.forEach(tarjeta => {
      tarjeta.removeEventListener('click', MobileActiveHandler.onCardClick);
    });
    
    document.removeEventListener('click', MobileActiveHandler.onDocumentClick);
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
  TouchHandler.init();
  MotionPreferenceHandler.init();
  ButtonStateHandler.init();
  ScrollObserver.init();
  
  // INICIALIZAR MANEJADOR PARA ESTADO ACTIVO EN MÓVIL
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

  // Inicialización
  inicializar: inicializarAnimaciones
};

// Inicialización automática opcional
// Animaciones.inicializar();