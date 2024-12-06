let deckId; // Variable global para almacenar el ID de la baraja

let dealerCards = []; // Array para las cartas del dealer
let playerCards = []; // Array para las cartas del jugador

async function createDeck() {
  const url = 'https://deckofcardsapi.com/api/deck/new/shuffle/';
  try {
    const response = await fetch(url);
    const data = await response.json();
    deckId = data.deck_id; // Asigna el deck ID
    console.log("Deck ID creado:", deckId);
  } catch (error) {
    return console.error('Error creando la baraja:', error);
  }
}


// Función para dibujar cartas y mostrar las sumas
function drawCardsFor(containerId, count, playerType) {
  if (!deckId) {
    console.error('Deck ID no está disponible.');
    return;
  }

  const drawUrl = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`;
  fetch(drawUrl)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(`Cartas para ${containerId}:`, data.cards);
        displayCards(containerId, data.cards); // Muestra las cartas
        if (playerType === 'dealer') {
          dealerCards = dealerCards.concat(data.cards); // Añadir cartas al dealer
        } else {
          playerCards = playerCards.concat(data.cards); // Añadir cartas al jugador
        }
        updateSums(); // Actualiza la suma de las cartas
      } else {
        console.error('No se pudo dibujar cartas.');
      }
    })
    .catch(error => console.error('Error al dibujar cartas:', error));
}

// Muestra las cartas en un contenedor
function displayCards(containerId, cards) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Limpia contenido previo

  for (let i = 0; i < cards.length; i++) {
    let img = document.createElement('img');
    img.src = cards[i].image;
    img.alt = cards[i].value + ' of ' + cards[i].suit;
    img.style.width = '100px';
    img.style.margin = '5px';
    container.appendChild(img);
  }
}





// Definir chips con un valor inicial, si no hay valor en el localStorage, se asume 200 fichas por defecto
// This part is for the bet 
let chips = [localStorage.getItem("chips") ? parseInt(localStorage.getItem("chips")) : 20];

window.onload = function() {
    let playerEl = document.getElementById("chips-display");
    if (playerEl) {
      playerEl.textContent = "Chips: £" + chips[0];
    } else {
      console.error('Elemento no encontrado');
    }
  };
  /// use window.onload in case can not see 
  



let betHistory = []; // Array para almacenar las apuestas
let betAmount = 0; // Inicializar betAmount
console.log(chips)
function bet(amount) {
    if (chips[0] >= amount) {
      betAmount += amount; // Aumenta la apuesta
      const betSum = document.getElementById('betSum');
      betSum.textContent = betAmount; // Muestra el valor actualizado
      updateChips(chips[0] - amount); // Restar fichas con animación
    //  updateBetDisplay();
    //   updateBetImageColor();
    //   betSum.classList.remove("visiblilityNumber");
    //   const PlaceBet = document.querySelector(".PlaceBet");
    //   PlaceBet.classList.add("PlaceBetOut");
    //   PlaceBet.addEventListener(
    //     "transitionend",
    //     () => {
    //       PlaceBet.style.display = "none";
    //     },
    //     { once: true }
    //   );
    //   betImage.classList.remove("spinAndDisappear");
    //   const startGameElement = document.getElementById("startGamePricipal");
    //   startGameElement.style.opacity = 3;

      // Guarda el historial de apuestas
      betHistory.push(betAmount);
    } else {
      toastr.error("Not enough chips to place this bet");
    }
    console.log("Bet amount:", betAmount); // Muestra el valor actual de la apuesta
    console.log("Bet history:", betHistory); // Muestra el historial de apuestas
}


function animateChipsChange(start, end, duration) {
    let range = end - start;
    let startTime = null;
    const chipsDisplay = document.getElementById("chips-display"); // Asegúrate de que este es el ID correcto

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = timestamp - startTime;
        let increment = Math.min(progress / duration, 1); // Calcula el progreso
        let current = Math.floor(start + range * increment); // Calcula el valor actual

        // Actualiza el contenido del texto durante la animación
        if (chipsDisplay) {
            chipsDisplay.textContent = `Chips: £${current}`;
        }

        if (progress < duration) {
            window.requestAnimationFrame(step); // Continúa la animación
        } else {
            // Asegura que el valor final se muestre
            if (chipsDisplay) {
                chipsDisplay.textContent = `Chips: £${end}`;
            }
        }
    }

    window.requestAnimationFrame(step); // Inicia la animación
}

function updateChips(newChipsValue) {
    let currentChips = chips[0]; // Valor actual de las fichas
    chips[0] = newChipsValue; // Actualizar el valor de las fichas
    localStorage.setItem("chips", chips[0]); // Guardar el nuevo valor en localStorage

    // Inicia la animación con la duración de 1000ms (1 segundo)
    animateChipsChange(currentChips, chips[0], 1000); // 1000ms para animación (si se usa)
}

// function getRandomCard() {
//     // Verificar si aún hay cartas disponibles
//     drawCard(5);
//     if (drawnCards.length === 0) {
//       console.error('No hay cartas disponibles. Debes llamar a drawCard primero.');
//       return null;
//     }
//     // Seleccionar un índice aleatorio
//     const randomIndex = Math.floor(Math.random() * drawnCards.length);
//     // Extraer la carta del array drawnCards para asegurar que no se repita
//     const randomCard = drawnCards.splice(randomIndex, 1)[0]; // Eliminar la carta seleccionada de drawnCards
//     return randomCard;
//   }

// Función para actualizar las sumas en el HTML
function updateSums() {
    let dealerTotal = calculateHandTotal(dealerCards);
    let playerTotal = calculateHandTotal(playerCards);
  
    // Actualizar el contenido de los elementos sum-dealer y sum-player
    document.getElementById("sum-dealer").textContent = dealerTotal;
    document.getElementById("sum-player").textContent = playerTotal;


    return { dealerTotal, playerTotal };

    
  }

  
// Inicializa el juego y dibuja cartas
function startGame() {

    if (!deckId) {
      createDeck().then(() => {
        drawCardsFor('cards-delealer', 1, 'dealer');
        drawCardsFor('cards-player', 2, 'player');
      
      });
    }
  }

  
  // Función para calcular el valor de las cartas
function getCardValue(card) {
    if (card.value === 'ACE') {
        return 11; // Asume que el As es 11, puedes modificar esto según las reglas del juego
    }
    if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
        return 10; // Las figuras valen 10
    }
    return parseInt(card.value); // Las cartas numéricas tienen su valor
}

// Función para calcular el total de las cartas de un jugador
function calculateHandTotal(cards) {
    let total = 0;
    let aceCount = 0;

    // Sumar los valores de las cartas
    for (let card of cards) {
        total += getCardValue(card);
        if (card.value === 'ACE') {
            aceCount++;
        }
    }

    // Ajustar si hay Ases y el total es mayor a 21
    while (total > 21 && aceCount > 0) {
        total -= 10; // Convertir un As de 11 a 1
        aceCount--;
    }

    return total;
}



/// los mensajes



let isAlive = true;
let hasBlackJack = false;
    
let messageGame = document.getElementById("message-game");


function newCard() {
    // Verificar si el jugador está vivo y no tiene Blackjack
    if (isAlive === true && hasBlackJack === false) {
        // Llamar a la API para dibujar una nueva carta para el jugador
        drawCardsFor('cards-player', 1, 'player'); // Dibuja una carta para el jugador
        
        // Sumar el valor de la carta al total del jugador
        let playerTotal = calculateHandTotal(playerCards); // Calcula el total de la mano del jugador
        
        // Actualizar el total en el DOM
        document.getElementById("sum-player").textContent = playerTotal; // Muestra la suma actual del jugador

        // Mostrar la carta en el contenedor correspondiente
        displayCards('cards-player', [card]); // Llama a la función para mostrar la carta visualmente

        // Verificar si el jugador ha superado 21 o ha obtenido Blackjack
        if (playerTotal > 21) {
            messageGame.textContent = "You Bust! Dealer Wins!";
            isAlive = false; // Fin del juego
        } else if (playerTotal === 21) {
            messageGame.textContent = "Blackjack!";
            hasBlackJack = true; // Fin del juego
            isAlive = false;
        } else {
            messageGame.textContent = "Do You Want another card?";
        }
    }
}


// Función para obtener el valor de una carta

// Función para mostrar las cartas en el contenedor del jugador
function displayCards(containerId, cards) {
    const container = document.getElementById(containerId);
    cards.forEach(card => {
        let img = document.createElement('img');
        img.src = card.image;
        img.alt = `${card.value} of ${card.suit}`;
        img.style.width = '100px'; // Tamaño de la carta
        img.style.margin = '5px';
        container.appendChild(img);
    });
}

// Función para calcular el total de las cartas de un jugador
function calculateHandTotal(cards) {
    let total = 0;
    let aceCount = 0;
    cards.forEach(card => {
        total += getCardValue(card);
        if (card.value === 'ACE') aceCount++;
    });

    // Ajustar el valor de los Ases si el total supera 21
    while (total > 21 && aceCount > 0) {
        total -= 10; // Convertir un As de 11 a 1
        aceCount--;
    }

    return total;
}
