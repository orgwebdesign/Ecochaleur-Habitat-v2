document.addEventListener('DOMContentLoaded', () => {
    // Popup Elements
    const popupOverlay = document.getElementById('popup-overlay');
    const btnClosePopup = document.getElementById('btn-close-popup');
    const btnCloseModal = document.querySelector('.btn-close-modal');
    
    // Form Elements
    const form = document.getElementById('eligibility-form');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const progressBar = document.getElementById('progress-bar');
    
    // Total input steps = 2. Index 0 = Part A, Index 1 = Part B.
    // Index 2 = Rejected, Index 3 = Success
    let currentStep = 0;

    // ----- POPUP MANAGEMENT -----

    const openPopup = () => {
        currentStep = 0;
        form.reset();
        showStep(currentStep);
        popupOverlay.classList.remove('hidden');
        document.body.classList.add('popup-open');
    };

    const closePopup = () => {
        popupOverlay.classList.add('hidden');
        document.body.classList.remove('popup-open');
    };

    // Event delegation — catches ALL .btn-open-popup buttons on the page
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-open-popup')) {
            e.preventDefault();
            openPopup();
        }
    });

    btnClosePopup.addEventListener('click', closePopup);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closePopup);

    // Close on click outside
    popupOverlay.addEventListener('click', (e) => {
        if(e.target === popupOverlay) {
            closePopup();
        }
    });

    // ----- FORM NAVIGATION -----

    const updateProgress = () => {
        const totalSteps = 2; 
        if(currentStep < totalSteps) {
            const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
            progressBar.style.width = `${progressPercentage}%`;
        } else {
            progressBar.style.width = '100%';
        }
    };

    const showStep = (stepIndex) => {
        steps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        updateProgress();
        // Scroll popup to top
        document.querySelector('.popup-container').scrollTo(0, 0);
    };

    // ----- STRICT EXCLUSION LOGIC (Part A) -----

    const radioInputs = document.querySelectorAll('#step-1 input[type="radio"]');
    
    radioInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const radioCard = e.target.closest('.radio-card');
            if(radioCard && radioCard.classList.contains('exclusion-trigger')) {
                // Immediate Exclusion
                currentStep = 2; // Index 2 is step-rejected
                setTimeout(() => {
                    showStep(currentStep);
                }, 300); // Small delay for visual feedback of the red click
            }
        });
    });

    // ----- VALIDATION -----

    const validateStep = (stepIndex) => {
        const currentStepEl = steps[stepIndex];
        const inputs = Array.from(currentStepEl.querySelectorAll('input[required], select[required], textarea[required]'));
        
        let isValid = true;

        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                const name = input.name;
                const checked = currentStepEl.querySelector(`input[name="${name}"]:checked`);
                if (!checked) {
                    isValid = false;
                    const group = input.closest('.form-group');
                    if(group) {
                        group.style.animation = 'shake 0.5s';
                        setTimeout(() => group.style.animation = '', 500);
                    }
                }
            } else {
                if (!input.value.trim() || !input.checkValidity()) {
                    isValid = false;
                    input.style.borderColor = 'red';
                    setTimeout(() => input.style.borderColor = '', 2000);
                }
            }
        });

        return isValid;
    };

    // Next Button Click
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    // Prev Button Click
    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
    });

    // ----- FORM SUBMIT -----
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateStep(currentStep)) {
            // Simulate API call
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Move to success step (Index 3)
                currentStep = 3;
                showStep(currentStep);
                
                // Close popup automatically after 3 seconds
                setTimeout(() => {
                    closePopup();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
                
            }, 1000);
        }
    });

    // ----- FAQ ACCORDION -----

    const faqItems = Array.from(document.querySelectorAll('.faq-item'));

    faqItems.forEach((item) => {
        const trigger = item.querySelector('.faq-question');
        if (!trigger) return;

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach((faqItem) => {
                faqItem.classList.remove('active');
                const faqButton = faqItem.querySelector('.faq-question');
                if (faqButton) {
                    faqButton.setAttribute('aria-expanded', 'false');
                }
            });

            if (!isActive) {
                item.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Dynamic validation animation style
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);
});
