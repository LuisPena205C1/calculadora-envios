document.addEventListener('DOMContentLoaded', () => {

    const config = {
        aereo: {
            info: "Una vez sale el vuelo de China su compra se entrega de <strong>20 a 30 días</strong>.",
            minShipping: "Envío mínimo 1kg",
            volumetricDivisor: 6000,
            categories: [
                { name: "CARGA GENERAL - $45 📦", value: "general", price: 45 },
                { name: "CARGA SENSIBLE - $65 ⚠️", value: "sensible", price: 65 },
                { name: "CELULARES / TABLETS / LAPTOP 📱", value: "electronica", price: null }
            ]
        },
        maritimo: {
            info: "Una vez zarpa el barco de puerto chino su compra se entrega de <strong>70 a 90 días</strong>.",
            minShipping: "Envío mínimo 0.040 CBM",
            minCBM: 0.040,
            categories: [
                { name: "CARGA GENERAL - $920 📦", value: "general", price: 920 },
                { name: "CARGA SENSIBLE - $980 ⚠️", value: "sensible", price: 980 }
            ]
        },
        contactLink: "https://wa.link/4fmnor"
    };

    // --- Selección de Elementos del DOM ---
    const shippingTypeSelect = document.getElementById('shipping-type');
    const categoryGroup = document.getElementById('category-group');
    const categorySelect = document.getElementById('category');
    const categoryLabel = document.getElementById('category-label');
    const infoBox = document.getElementById('info-box');
    const formFields = document.getElementById('form-fields');
    const sensitiveWarning = document.getElementById('sensitive-warning');
    const sensitiveContactPrompt = document.getElementById('sensitive-contact-prompt');
    const calculateBtn = document.getElementById('calculate-btn');
    const contactBtn = document.getElementById('contact-btn');
    const resultsDiv = document.getElementById('results');
    const weightGroup = document.getElementById('weight-group');
    const lengthInput = document.getElementById('length');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const cbmResult = document.getElementById('cbm-result');
    const priceResult = document.getElementById('price-result');
    const priceNote = document.getElementById('price-note');
    const weightCalcDisplay = document.getElementById('weight-calc-display');
    const volumeCalcDisplay = document.getElementById('volume-calc-display');

    // --- Event Listeners ---
    shippingTypeSelect.addEventListener('change', setupForm);
    categorySelect.addEventListener('change', handleCategoryChange);
    calculateBtn.addEventListener('click', calculateShipping);
    contactBtn.addEventListener('click', () => {
        window.location.href = config.contactLink;
    });

    // --- Funciones ---
    function setupForm() {
        const type = shippingTypeSelect.value;
        if (!type) return;

        const settings = config[type];
        
        infoBox.innerHTML = `${settings.info}<br><span class="min-shipping">${settings.minShipping}</span>`;
        infoBox.classList.remove('d-none'); // Muestra el elemento

        categorySelect.innerHTML = '';
        const initialOption = document.createElement('option');
        initialOption.textContent = 'Seleccione categoría';
        initialOption.disabled = true;
        initialOption.selected = true;
        categorySelect.appendChild(initialOption);
        
        settings.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.value;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
        
        if (type === 'aereo') {
            categoryLabel.textContent = 'Precio KG:';
        } else {
            categoryLabel.textContent = 'Precio CBM:';
        }
        
        resetFieldsAndResults();
        categoryGroup.classList.remove('d-none'); // Muestra el grupo de categorías
    }

    function handleCategoryChange() {
        const categoryValue = categorySelect.value;
        if (!categoryValue || categoryValue === 'Seleccione categoría') return;

        // Oculta todos los mensajes opcionales para empezar de cero
        sensitiveWarning.classList.add('d-none');
        sensitiveContactPrompt.classList.add('d-none');

        if (categoryValue === 'sensible') {
            sensitiveWarning.classList.remove('d-none');
        }

        if (categoryValue === 'electronica') {
            sensitiveContactPrompt.classList.remove('d-none');
            formFields.classList.add('d-none');
            resultsDiv.classList.add('d-none');
            calculateBtn.classList.add('d-none');
            contactBtn.classList.remove('d-none');
        } else {
            formFields.classList.remove('d-none');
            calculateBtn.classList.remove('d-none');
            contactBtn.classList.add('d-none');
        }
    }

    function calculateShipping() {
        const type = shippingTypeSelect.value;
        const length = parseFloat(lengthInput.value) || 0;
        const width = parseFloat(widthInput.value) || 0;
        const height = parseFloat(heightInput.value) || 0;
        
        if (length <= 0 || width <= 0 || height <= 0) {
            alert('Por favor, ingrese todas las dimensiones.');
            return;
        }

        const cbm = (length * width * height) / 1000000;
        cbmResult.value = cbm.toFixed(4) + ' CBM';

        let price = 0;
        weightCalcDisplay.textContent = '';
        volumeCalcDisplay.textContent = '';
        
        const categoryValue = categorySelect.value;
        const category = config[type].categories.find(c => c.value === categoryValue);
        const pricePerUnit = category.price;

        if (type === 'aereo') {
            const actualWeight = parseFloat(weightInput.value) || 0;
            if (actualWeight <= 0) {
                 alert('Por favor, ingrese el peso real en KG.');
                 return;
            }
            
            const volumetricWeight = (length * width * height) / config.aereo.volumetricDivisor;
            const chargeableWeight = Math.max(actualWeight, volumetricWeight);
            price = chargeableWeight * pricePerUnit;
            
            priceNote.textContent = 'Se usa el mayor valor entre peso real y peso volumétrico.';
            weightCalcDisplay.textContent = `Cálculo por peso: $${(actualWeight * pricePerUnit).toFixed(2)}`;
            volumeCalcDisplay.textContent = `Cálculo por volumen: $${(volumetricWeight * pricePerUnit).toFixed(2)}`;

        } else { // Marítimo
            let chargeableCBM = Math.max(cbm, config.maritimo.minCBM);
            price = chargeableCBM * pricePerUnit;
            priceNote.textContent = 'COSTO DE ENVÍO APROXIMADO';
        }
        
        priceResult.value = `$${price.toFixed(2)}`;
        resultsDiv.classList.remove('d-none'); // Muestra la sección de resultados
    }
    
    function resetFieldsAndResults() {
        lengthInput.value = '';
        widthInput.value = '';
        heightInput.value = '';
        weightInput.value = '';
        formFields.classList.add('d-none');
        resultsDiv.classList.add('d-none');
        sensitiveWarning.classList.add('d-none');
        sensitiveContactPrompt.classList.add('d-none');
        calculateBtn.classList.add('d-none');
        contactBtn.classList.add('d-none');
    }
});