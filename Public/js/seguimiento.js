let pasoActual = 0;
const totalPasos = 5;

document.addEventListener('DOMContentLoaded', function() {
    actualizarUI();

    const radiosRepresentacion = document.querySelectorAll('input[name="representacion"]');
    const inputRepresentante = document.getElementById('nombreRepresentante');
    radiosRepresentacion.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'representante') {
                inputRepresentante.classList.remove('oculto');
                inputRepresentante.required = true;
            } else {
                inputRepresentante.classList.add('oculto');
                inputRepresentante.required = false;
                inputRepresentante.value = '';
            }
        });
    });

    const radiosValor = document.querySelectorAll('input[name="valorDemandado"]');
    const inputMonto = document.getElementById('montoDemandado');
    radiosValor.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'determinado') {
                inputMonto.classList.remove('oculto');
                inputMonto.required = true;
            } else {
                inputMonto.classList.add('oculto');
                inputMonto.required = false;
                inputMonto.value = '';
            }
        });
    });

    const radiosAdmision = document.querySelectorAll('input[name="resolucionAdmision"]');
    const labelCorreccion = document.getElementById('labelCorreccion');
    const campoCorreccion = document.getElementById('correccionPrevencion');
    radiosAdmision.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'prevencion') {
                labelCorreccion.classList.remove('oculto');
                campoCorreccion.classList.remove('oculto');
                campoCorreccion.required = true;
            } else {
                labelCorreccion.classList.add('oculto');
                campoCorreccion.classList.add('oculto');
                campoCorreccion.required = false;
                campoCorreccion.value = '';
            }
        });
    });

    document.getElementById('formularioEtapa1').addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validarPaso(pasoActual)) {
            return;
        }
        document.getElementById('formularioEtapa1').classList.add('oculto');
        document.getElementById('mensajeFinal').classList.remove('oculto');
        document.getElementById('macroEtapa1').classList.remove('activo');
        document.getElementById('macroEtapa1').classList.add('completado');
        document.getElementById('macroEtapa1').querySelector('.numero').innerHTML = '<i class="fas fa-check"></i>';
    });
});

function validarPaso(paso) {
    const panel = document.querySelector('.step-panel[data-step="' + paso + '"]');
    const campos = panel.querySelectorAll('[required]');
    for (const campo of campos) {
        if (!campo.checkValidity()) {
            campo.reportValidity();
            return false;
        }
    }
    return true;
}

function siguientePaso(paso) {
    if (!validarPaso(paso)) {
        return;
    }
    if (paso < totalPasos - 1) {
        pasoActual = paso + 1;
        actualizarUI();
        window.scrollTo({ top: 300, behavior: 'smooth' });
    }
}

function pasoAnterior(paso) {
    if (paso > 0) {
        pasoActual = paso - 1;
        actualizarUI();
        window.scrollTo({ top: 300, behavior: 'smooth' });
    }
}

function actualizarUI() {
    const panels = document.querySelectorAll('.step-panel');
    const indicators = document.querySelectorAll('.step-indicator');
    const progressBar = document.getElementById('progressBar');

    panels.forEach((panel, index) => {
        panel.classList.toggle('active', index === pasoActual);
    });

    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index === pasoActual) {
            indicator.classList.add('active');
        } else if (index < pasoActual) {
            indicator.classList.add('completed');
        }
    });

    const progreso = (pasoActual / (totalPasos - 1)) * 100;
    progressBar.style.width = progreso + '%';
}
