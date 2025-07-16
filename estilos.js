
    function toggleCardColor(clickedCard) {
        // Esta parte es importante para asegurar que solo una tarjeta esté "activa" a la vez
        const allCards = document.querySelectorAll('.card-item'); 
        
        allCards.forEach(card => {
            if (card === clickedCard) {
                // Alterna la clase 'active-state' en la tarjeta clicada
                card.classList.toggle('active-state'); 

                // Aplica o remueve los estilos de fondo y texto basados en 'active-state'
                if (card.classList.contains('active-state')) {
                    // Si la tarjeta está activa
                    card.classList.add('bg-blue-900', 'text-white');
                    card.classList.remove('bg-white'); 
                    card.querySelectorAll('h2, p').forEach(el => {
                        el.classList.add('text-white');
                        if (el.tagName === 'H2') el.classList.remove('text-gray-800');
                        if (el.tagName === 'P') el.classList.remove('text-gray-600');
                    });
                } else {
                    // Si la tarjeta se desactiva
                    card.classList.remove('bg-blue-900', 'text-white');
                    card.classList.add('bg-white');
                    card.querySelectorAll('h2, p').forEach(el => {
                        el.classList.remove('text-white');
                        if (el.tagName === 'H2') el.classList.add('text-gray-800');
                        if (el.tagName === 'P') el.classList.add('text-gray-600');
                    });
                }
            } else {
                // Si es otra tarjeta (no la clicada) y está activa, desactívala
                if (card.classList.contains('active-state')) {
                    card.classList.remove('active-state');
                    card.classList.remove('bg-blue-900', 'text-white');
                    card.classList.add('bg-white');
                    card.querySelectorAll('h2, p').forEach(el => {
                        el.classList.remove('text-white');
                        if (el.tagName === 'H2') el.classList.add('text-gray-800');
                        if (el.tagName === 'P') el.classList.add('text-gray-600');
                    });
                }
            }
        });
    }


<style is:global>
    /* Este estilo es crucial para que el estado de clicado sobreescriba el hover */
    .card-item.active-state {
        background-color: #1a202c !important; /* bg-blue-900 */
        transform: translateY(-8px) !important; /* Mantiene el efecto de elevación del hover */
    }

    .card-item.active-state h2,
    .card-item.active-state p {
        color: #fff !important; /* text-white */
    }
</style>