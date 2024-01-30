let messageElement;
let canBlowOutCandles = false; // This variable will control the candle blowing

document.addEventListener('DOMContentLoaded', () => {
    messageElement = document.getElementById('birthdayMessage');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const popSound = document.getElementById('popSound');
    const celebrateButton = document.getElementById('celebrateButton');
    const countdownTimer = document.getElementById('countdownTimer');
    const animationContainer = document.getElementById('animationContainer');
  
    celebrateButton.addEventListener('click', startCelebration);

    function createPoppingEffect(name) {
        const numberOfElements = 10; // Number of elements to generate
        for (let i = 0; i < numberOfElements; i++) {
            const element = document.createElement('div');
            element.className = 'popping-element animate__animated animate__zoomIn';
            element.textContent = name; // Display the person's name
            element.style.position = 'absolute'; // Ensure absolute positioning
            element.style.left = Math.random() * window.innerWidth + 'px';
            element.style.top = Math.random() * window.innerHeight + 'px';
            document.body.appendChild(element);
    
            // Add animation end event listener to remove the element after animation
            element.addEventListener('animationend', () => {
                element.remove();
            });
        }
    }


    function startCelebration() {
        const name = document.getElementById('nameField').value;
        if (!name) {
            alert('Please enter a name to celebrate!');
            return;
        }

        messageElement.innerHTML = `<h2>🎉 Happy Birthday, ${name}! 🎉</h2>`;
        messageElement.classList.remove('hidden');
        backgroundMusic.play();

        let countdown = 10;
        countdownTimer.textContent = countdown;

        const interval = setInterval(() => {
            countdown -= 1;
            countdownTimer.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(interval);
                showAnimations();
                popSound.play(); // Play pop sound after countdown
                createPoppingEffect(name); // Create popping effects with the name
                canBlowOutCandles = true; // Allow candles to be blown out
                startListening(); // Start listening for blow
            }
        }, 1000);
    }

    function showAnimations() {
        animationContainer.classList.add('show');
    }

    function blowOutCandles() {
        const candles = document.querySelectorAll('.candle');
        candles.forEach(candle => {
            candle.style.visibility = 'hidden'; // Hide the candle
        });

// Show SweetAlert2 alert message
        Swal.fire({
            title: 'Happy Birthday!',
            text: 'Your candles are blown out! Make a wish!',
            icon: 'success',
            confirmButtonText: 'Congrats On Your Big Day!'
        });

        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // Reset the music
        canBlowOutCandles = false; // Reset the blowing out control
    }

    function startListening() {
        if (!canBlowOutCandles) {
            console.log("Candles cannot be blown out yet.");
            return; // Exit the function if celebration has not started.
        }

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);
                analyser.fftSize = 256;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                function checkForBlow() {
                    analyser.getByteFrequencyData(dataArray);
                    let sum = dataArray.reduce((a, b) => a + b, 0);
                
                    // Adjust this threshold value for mobile devices
                    const blowThreshold = isMobileDevice() ? 3000 : 7500;
                
                    if (sum > blowThreshold) {
                        blowOutCandles();
                        stream.getTracks().forEach(track => track.stop());
                    } else {
                        requestAnimationFrame(checkForBlow);
                    }
                }
                
                function isMobileDevice() {
                    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                }
                

                checkForBlow();
            })
            .catch(err => {
                console.error('Error accessing the microphone: ', err);
                alert('Cannot access the microphone. Please ensure you have given the necessary permissions.');
            });
    }
});
