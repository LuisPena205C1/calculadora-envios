document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN PRINCIPAL ---
    // Modifica estos valores para tu empresa
    const config = {
        aereo: {
            info: "Una vez sale el vuelo de China su compra se entrega de <strong>20 a 30 días</strong>.",
            minShipping: "Envío mínimo 1kg",
            volumetricDivisor: 6000, // Divisor estándar IATA para kg (cm³/kg)
            categories: [
                { name: "CARGA GENERAL - $45 📦", value: "general", price: 45 },
                { name: "CARGA SENSIBLE - $65 ⚠️", value: "sensible", price: 65 },
                { name: "CELULARES / TABLETS / LAPTOP 📱", value: "electronica", price: null } // Null price means contact advisor
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
        }
    };

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const shippingTypeSelect = document.getElementById('shipping-type');
    const categoryGroup = document.getElementById('category-group');
    const categorySelect = document.getElementById('category');
    const categoryLabel = document.getElementById('category-label');
    const infoBox = document.getElementById('info-box');
    const formFields = document.getElementById('form-fields');
    const weightGroup = document.getElementById('weight-group');
    const sensitiveWarning = document.getElementById('sensitive-warning');
    const calculateBtn = document.getElementById('calculate-btn');
    const contactBtn = document.getElementById('contact-btn');
    const resultsDiv = document.getElementById('results');
    
    // Inputs
    const lengthInput = document.getElementById('length');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');

    // Outputs
    const cbmResult = document.getElementById('cbm-result');
    const priceResult = document.getElementById('price-result');
    const priceNote = document.getElementById('price-note');
    const weightCalcDisplay = document.getElementById('weight-calc-display');
    const volumeCalcDisplay = document.getElementById('volume-calc-display');


    // --- EVENT LISTENERS ---
    shippingTypeSelect.addEventListener('change', setupForm);
    categorySelect.addEventListener('change', handleCategoryChange);
    calculateBtn.addEventListener('click', calculateShipping);


    // --- FUNCIONES ---
    function setupForm() {
        const type = shippingTypeSelect.value;
        if (!type) return;

        const settings = config[type];
        
        // Actualizar caja de información
        infoBox.innerHTML = `${settings.info}<br><span class="min-shipping">${settings.minShipping}</span>`;
        infoBox.style.display = 'block';

        // Llenar categorías
        categorySelect.innerHTML = ''; // Limpiar opciones anteriores
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
        
        // Configurar UI para Aéreo o Marítimo
        if (type === 'aereo') {
            categoryLabel.textContent = 'Precio KG:';
            weightGroup.style.display = 'block';
        } else { // Marítimo
            categoryLabel.textContent = 'Precio CBM:';
            weightGroup.style.display = 'none';
        }
        
        // Resetear y mostrar campos
        resetFieldsAndResults();
        categoryGroup.style.display = 'block';
        formFields.style.display = 'block';
        calculateBtn.style.display = 'none';
        contactBtn.style.display = 'none';
    }

    function handleCategoryChange() {
        const type = shippingTypeSelect.value;
        const categoryValue = categorySelect.value;
        if (!categoryValue || categoryValue === 'Seleccione categoría') return;

        const category = config[type].categories.find(c => c.value === categoryValue);

        sensitiveWarning.style.display = categoryValue === 'sensible' ? 'block' : 'none';

        if (category.value === 'electronica') {
            calculateBtn.style.display = 'none';
            contactBtn.style.display = 'block';
            resultsDiv.style.display = 'none';
        } else {
            calculateBtn.style.display = 'block';
            contactBtn.style.display = 'none';
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
        resultsDiv.style.display = 'block';
    }
    
    function resetFieldsAndResults() {
        lengthInput.value = '';
        widthInput.value = '';
        heightInput.value = '';
        weightInput.value = '';
        resultsDiv.style.display = 'none';
        sensitiveWarning.style.display = 'none';
    }
});