document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // Popup Elements
    const popupOverlay = document.getElementById('popup-overlay');
    const btnClosePopup = document.getElementById('btn-close-popup');
    
    // Form Elements
    const form = document.getElementById('eligibility-form');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const progressBar = document.getElementById('progress-bar');
    
    const totalInputSteps = 7;
    let currentStep = 0;

    // ----- DYNAMIC REVENUE OPTIONS CONFIGURATION (2026) -----

    const REVENUE_THRESHOLDS = {
        ile_de_france: {
            1: [24031, 29253, 40851],
            2: [35270, 42933, 60051],
            3: [42357, 51594, 71846],
            4: [49455, 60208, 84562],
            5: [56580, 68877, 96817]
        },
        province: {
            1: [17363, 22259, 31185],
            2: [25393, 32553, 45842],
            3: [30540, 39148, 55196],
            4: [35676, 45735, 64550],
            5: [40835, 52348, 73907]
        }
    };

    const formatThreshold = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    const getActiveRegion = () => {
        const step5 = document.getElementById('step-5');
        if (step5.querySelector('input[name="region"][value="ile_de_france"]:checked')) {
            return 'ile_de_france';
        }
        if (step5.querySelector('input[name="region"][value="province"]:checked')) {
            return 'province';
        }
        return null;
    };

    const getHouseholdSize = () => {
        const checked = document.querySelector('input[name="household_size"]:checked');
        if (!checked) return null;
        return checked.value === '5_plus' ? 5 : parseInt(checked.value, 10);
    };

    const updateRevenueOptions = () => {
        const step5 = document.getElementById('step-5');
        const revenueInput = step5.querySelector('input[name="tax_income"]');
        if (!revenueInput) return;

        const revenueGroup = revenueInput.closest('.radio-group');
        const region = getActiveRegion();
        const householdSize = getHouseholdSize();

        if (!region || !householdSize) return;

        const thresholds = REVENUE_THRESHOLDS[region]?.[householdSize];
        if (!thresholds) return;

        revenueGroup.querySelectorAll('.radio-card').forEach(card => card.remove());

        thresholds.forEach((threshold, i) => {
            const isUpper = i === thresholds.length - 1;
            const labelText = isUpper
                ? `Plus de ${formatThreshold(threshold)} €`
                : `Moins de ${formatThreshold(threshold)} €`;
            const inputValue = isUpper ? `plus_${threshold}` : `moins_${threshold}`;

            const label = document.createElement('label');
            label.className = 'radio-card';
            label.innerHTML = `
                <input type="radio" name="tax_income" value="${inputValue}" ${i === 0 ? 'required' : ''}>
                <span class="radio-content">${labelText}</span>
            `;
            revenueGroup.appendChild(label);
        });

        const staticOptions = [
            { value: 'je_ne_sais_pas', label: "Je ne sais pas" },
            { value: 'plus_tard', label: "Je ne souhaite pas le communiquer" }
        ];

        staticOptions.forEach(opt => {
            const label = document.createElement('label');
            label.className = 'radio-card';
            label.innerHTML = `
                <input type="radio" name="tax_income" value="${opt.value}">
                <span class="radio-content">${opt.label}</span>
            `;
            revenueGroup.appendChild(label);
        });
    };

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

    // Close on click outside
    popupOverlay.addEventListener('click', (e) => {
        if(e.target === popupOverlay) {
            closePopup();
        }
    });

    // ----- FORM NAVIGATION -----

    const updateProgress = () => {
        if(currentStep < totalInputSteps) {
            const progressPercentage = ((currentStep + 1) / totalInputSteps) * 100;
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
                // Move to success step
                currentStep = totalInputSteps;
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

    const step5 = document.getElementById('step-5');
    step5.querySelectorAll('input[name="region"]').forEach(input => {
        input.addEventListener('change', updateRevenueOptions);
    });
    step5.querySelectorAll('input[name="household_size"]').forEach(input => {
        input.addEventListener('change', updateRevenueOptions);
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
