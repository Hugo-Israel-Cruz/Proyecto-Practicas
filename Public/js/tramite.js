let pasoActual = 0;
const totalPasos = 6;
let fechaBaseDemanda = null;

const infoTipos = {
    administrativo: {
        titulo: 'Divorcio Administrativo',
        requisitos: '1. Común acuerdo. 2. Liquidada la sociedad conyugal. 3. Sin hijos tutelados. 4. Ante el Oficial del Registro Civil.',
        nota: 'Este divorcio NO pasa por juez. Va directo al Registro Civil.'
    },
    notarial: {
        titulo: 'Divorcio Notarial',
        requisitos: '1. Ambas partes. 2. Ante notario. 3. Sin hijos tutelados.',
        nota: 'Este divorcio NO pasa por juez. Va directo al Registro Civil.'
    },
    voluntario: {
        titulo: 'Divorcio Voluntario',
        requisitos: '1. Solicitan ambas partes. 2. Ante juez civil. 3. Convenio (domicilio, alimentos, guarda y custodia, convivencia, bienes).',
        nota: 'Este divorcio SÍ pasa por juez. Requiere convenio completo.'
    },
    incausado: {
        titulo: 'Divorcio Incausado',
        requisitos: '1. Solicita una parte (Demanda). 2. Ante juez civil.',
        nota: 'Este divorcio SÍ pasa por juez. No requiere causa.'
    }
};

document.addEventListener('DOMContentLoaded', function() {

    actualizarUI();
    actualizarContadores();
    inicializarCalendario();
    inicializarReajustes();

    const selectTipoDivorcio = document.getElementById('tipoDivorcio');
    const infoTipoDivorcio = document.getElementById('infoTipoDivorcio');
    const gruposRequisitos = {
        administrativo: document.getElementById('grupoRequisitosAdmin'),
        notarial: document.getElementById('grupoRequisitosNotarial'),
        voluntario: document.getElementById('grupoRequisitosVoluntario'),
        incausado: document.getElementById('grupoRequisitosIncausado')
    };

    selectTipoDivorcio.addEventListener('change', function() {
        const valor = this.value;

        Object.values(gruposRequisitos).forEach(g => {
            if (g) {
                g.classList.add('oculto');
            }
        });

        if (infoTipoDivorcio && infoTipos[valor]) {
            infoTipoDivorcio.innerHTML = '<strong>' + infoTipos[valor].titulo + '</strong><br>' +
                '<span>' + infoTipos[valor].requisitos + '</span><br>' +
                '<em>' + infoTipos[valor].nota + '</em>';
            infoTipoDivorcio.classList.remove('oculto');
        }

        if (gruposRequisitos[valor]) {
            gruposRequisitos[valor].classList.remove('oculto');
        }
    });

    const codigoPostal = document.getElementById('codigoPostal');
    const infoJuzgado = document.getElementById('infoJuzgado');
    codigoPostal.addEventListener('input', function() {
        if (this.value.length === 5) {
            infoJuzgado.innerHTML = '<strong>Juzgado más cercano (Estado de México):</strong><br>' +
                '<span>Juzgado Familiar del Estado de México, con sede en la zona correspondiente al C.P. ' + this.value + '</span>';
            infoJuzgado.classList.remove('oculto');
        } else {
            infoJuzgado.classList.add('oculto');
        }
    });

    const radiosHijos = document.querySelectorAll('input[name="tieneHijos"]');
    const grupoCantidadHijos = document.getElementById('grupoCantidadHijos');
    const grupoEdadesHijos = document.getElementById('grupoEdadesHijos');
    const contenedorEdades = document.getElementById('contenedorEdades');
    const selectCantidadHijos = document.getElementById('cantidadHijos');

    function generarEdades(cantidad) {
        contenedorEdades.innerHTML = '';
        for (let i = 1; i <= cantidad; i++) {
            const div = document.createElement('div');
            div.className = 'edad-hijo';

            const label = document.createElement('label');
            label.textContent = 'Hijo ' + i + ':';

            const select = document.createElement('select');
            select.name = 'edadHijo' + i;

            const optDefault = document.createElement('option');
            optDefault.value = '';
            optDefault.disabled = true;
            optDefault.selected = true;
            optDefault.textContent = 'Selecciona la edad';
            select.appendChild(optDefault);

            for (let edad = 0; edad <= 17; edad++) {
                const opt = document.createElement('option');
                opt.value = edad;
                opt.textContent = edad + (edad === 1 ? ' año' : ' años');
                select.appendChild(opt);
            }

            const optMas = document.createElement('option');
            optMas.value = '18_mas';
            optMas.textContent = '18 o más';
            select.appendChild(optMas);

            div.appendChild(label);
            div.appendChild(select);
            contenedorEdades.appendChild(div);
        }
    }

    function actualizarHijos() {
        const seleccionado = document.querySelector('input[name="tieneHijos"]:checked');
        if (seleccionado && seleccionado.value === 'si') {
            grupoCantidadHijos.classList.remove('oculto');
            selectCantidadHijos.disabled = false;
        } else {
            grupoCantidadHijos.classList.add('oculto');
            grupoEdadesHijos.classList.add('oculto');
            selectCantidadHijos.disabled = true;
            selectCantidadHijos.value = '';
            contenedorEdades.innerHTML = '';
        }
    }

    radiosHijos.forEach(radio => radio.addEventListener('change', actualizarHijos));
    actualizarHijos();

    selectCantidadHijos.addEventListener('change', function() {
        const cantidad = parseInt(this.value);
        if (cantidad > 0) {
            grupoEdadesHijos.classList.remove('oculto');
            generarEdades(cantidad);
        } else {
            grupoEdadesHijos.classList.add('oculto');
            contenedorEdades.innerHTML = '';
        }
    });

    const radiosBienes = document.querySelectorAll('input[name="tieneBienes"]');
    const grupoTipoBienes = document.getElementById('grupoTipoBienes');
    const checkBienesOtros = document.getElementById('checkBienesOtros');
    const bienesOtros = document.getElementById('bienesOtros');

    function actualizarBienes() {
        const seleccionado = document.querySelector('input[name="tieneBienes"]:checked');
        if (seleccionado && seleccionado.value === 'si') {
            grupoTipoBienes.classList.remove('oculto');
        } else {
            grupoTipoBienes.classList.add('oculto');
            document.querySelectorAll('input[name="tipoBienes"]').forEach(cb => {
                cb.checked = false;
            });
            bienesOtros.classList.add('oculto');
            bienesOtros.value = '';
        }
    }

    radiosBienes.forEach(radio => radio.addEventListener('change', actualizarBienes));
    actualizarBienes();

    checkBienesOtros.addEventListener('change', function() {
        if (this.checked) {
            bienesOtros.classList.remove('oculto');
        } else {
            bienesOtros.classList.add('oculto');
            bienesOtros.value = '';
        }
    });

    const checkPrestacionesOtros = document.getElementById('checkPrestacionesOtros');
    const prestacionesOtros = document.getElementById('prestacionesOtros');
    checkPrestacionesOtros.addEventListener('change', function() {
        if (this.checked) {
            prestacionesOtros.classList.remove('oculto');
        } else {
            prestacionesOtros.classList.add('oculto');
            prestacionesOtros.value = '';
        }
    });

    const checkPruebasOtros = document.getElementById('checkPruebasOtros');
    const pruebasOtros = document.getElementById('pruebasOtros');
    checkPruebasOtros.addEventListener('change', function() {
        if (this.checked) {
            pruebasOtros.classList.remove('oculto');
        } else {
            pruebasOtros.classList.add('oculto');
            pruebasOtros.value = '';
        }
    });

    const radiosAdmision = document.querySelectorAll('input[name="resolucionAdmision"]');
    const grupoAdmisionMedidas = document.getElementById('grupoAdmisionMedidas');
    const grupoTipoPrevencion = document.getElementById('grupoTipoPrevencion');
    const campoCorreccion = document.getElementById('correccionPrevencion');

    radiosAdmision.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'admitida') {
                grupoAdmisionMedidas.classList.remove('oculto');
                grupoTipoPrevencion.classList.add('oculto');
                campoCorreccion.value = '';
                document.querySelectorAll('input[name="tipoPrevencion"]').forEach(cb => cb.checked = false);
            } else {
                grupoAdmisionMedidas.classList.add('oculto');
                grupoTipoPrevencion.classList.remove('oculto');
                document.querySelectorAll('input[name="medidasAdmitidas"]').forEach(cb => cb.checked = false);
            }
        });
    });

    const radiosContesto = document.querySelectorAll('input[name="contesto"]');
    const grupoReconvencion = document.getElementById('grupoReconvencion');
    const radiosReconvencion = document.querySelectorAll('input[name="reconvencion"]');
    const grupoPrestacionesReconvencion = document.getElementById('grupoPrestacionesReconvencion');

    radiosContesto.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'si') {
                grupoReconvencion.classList.remove('oculto');
                radiosReconvencion.forEach(r => r.disabled = false);
            } else {
                grupoReconvencion.classList.add('oculto');
                grupoPrestacionesReconvencion.classList.add('oculto');
                radiosReconvencion.forEach(r => {
                    r.checked = false;
                    r.disabled = true;
                });
            }
        });
    });

    radiosReconvencion.forEach(r => {
        r.disabled = true;
        r.addEventListener('change', function() {
            if (this.value === 'si') {
                grupoPrestacionesReconvencion.classList.remove('oculto');
            } else {
                grupoPrestacionesReconvencion.classList.add('oculto');
            }
        });
    });

    const checkPrestacionesReconvencionOtros = document.getElementById('checkPrestacionesReconvencionOtros');
    const prestacionesReconvencionOtros = document.getElementById('prestacionesReconvencionOtros');
    if (checkPrestacionesReconvencionOtros) {
        checkPrestacionesReconvencionOtros.addEventListener('change', function() {
            if (this.checked) {
                prestacionesReconvencionOtros.classList.remove('oculto');
            } else {
                prestacionesReconvencionOtros.classList.add('oculto');
                prestacionesReconvencionOtros.value = '';
            }
        });
    }

    const radiosConciliacion = document.querySelectorAll('input[name="huboConciliacion"]');
    const grupoAcuerdosConciliacion = document.getElementById('grupoAcuerdosConciliacion');
    radiosConciliacion.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'si') {
                grupoAcuerdosConciliacion.classList.remove('oculto');
            } else {
                grupoAcuerdosConciliacion.classList.add('oculto');
                grupoAcuerdosConciliacion.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = false;
                });
            }
        });
    });

    const radiosApelacion = document.querySelectorAll('input[name="huboApelacion"]');
    const grupoDetalleApelacion = document.getElementById('grupoDetalleApelacion');
    const campoDetalleApelacion = document.getElementById('detalleApelacion');
    radiosApelacion.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'si') {
                grupoDetalleApelacion.classList.remove('oculto');
            } else {
                grupoDetalleApelacion.classList.add('oculto');
                campoDetalleApelacion.value = '';
            }
        });
    });

    const fechaPresentacionDemanda = document.getElementById('fechaPresentacionDemanda');
    if (fechaPresentacionDemanda) {
        fechaPresentacionDemanda.addEventListener('change', function() {
            fechaBaseDemanda = this.value;
            actualizarContadores();
            actualizarCalendario();
        });
    }

    document.getElementById('formularioDivorcio').addEventListener('submit', function(e) {
        e.preventDefault();
    });

    document.getElementById('formularioEtapa2').addEventListener('submit', function(e) {
        e.preventDefault();
    });

    document.getElementById('formularioEtapa3').addEventListener('submit', function(e) {
        e.preventDefault();
    });

    document.getElementById('formularioEtapa4').addEventListener('submit', function(e) {
        e.preventDefault();
    });

});

function siguientePaso(paso) {
    if (paso < totalPasos - 1) {
        pasoActual = paso + 1;
        actualizarUI();
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }
}

function pasoAnterior(paso) {
    if (paso > 0) {
        pasoActual = paso - 1;
        actualizarUI();
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }
}

function actualizarUI() {
    const panels = document.querySelectorAll('#formularioDivorcio .step-panel');
    panels.forEach((panel, index) => {
        panel.classList.toggle('active', index === pasoActual);
    });

    const macro0 = document.getElementById('macro-0');
    const macro1 = document.getElementById('macro-1');
    const subEtapa = document.getElementById('subEtapaPostulatoria');

    if (pasoActual === 0) {
        macro0.classList.add('activo');
        macro0.classList.remove('completado');
        macro1.classList.remove('activo');
        macro1.classList.add('pendiente');
        subEtapa.classList.add('oculto');
        return;
    }

    macro0.classList.remove('activo');
    macro0.classList.add('completado');
    macro0.querySelector('.numero').innerHTML = '✓';
    macro1.classList.remove('pendiente');
    macro1.classList.add('activo');
    subEtapa.classList.remove('oculto');

    const indicators = document.querySelectorAll('#subEtapaPostulatoria .step-indicator');
    indicators.forEach((indicator, index) => {
        const numeroPaso = index + 1;
        indicator.classList.remove('active', 'completed');
        if (numeroPaso === pasoActual) {
            indicator.classList.add('active');
        } else if (numeroPaso < pasoActual) {
            indicator.classList.add('completed');
        }
    });

    const progressBar = document.getElementById('progressBar');
    const progreso = ((pasoActual - 1) / (totalPasos - 2)) * 100;
    progressBar.style.width = progreso + '%';
}

function copiarPrestaciones() {
    const marcadasDemanda = document.querySelectorAll('input[name="prestaciones"]:checked');
    const valoresDemanda = Array.from(marcadasDemanda).map(cb => cb.value);

    document.querySelectorAll('input[name="prestacionesDemandaEtapa2"]').forEach(cb => {
        if (valoresDemanda.includes(cb.value)) {
            cb.checked = true;
        }
    });

    const marcadasContestacion = document.querySelectorAll('input[name="prestacionesReconvencion"]:checked');
    const valoresContestacion = Array.from(marcadasContestacion).map(cb => cb.value);

    document.querySelectorAll('input[name="prestacionesContestacionEtapa2"]').forEach(cb => {
        if (valoresContestacion.includes(cb.value)) {
            cb.checked = true;
        }
    });
}

let pasoActualEtapa2 = 0;
const totalPasosEtapa2 = 2;

function iniciarEtapa2() {
    copiarPrestaciones();
    document.getElementById('formularioDivorcio').classList.add('oculto');
    document.getElementById('subEtapaPostulatoria').classList.add('oculto');
    document.getElementById('etapaPreliminar').classList.remove('oculto');

    document.getElementById('macro-1').classList.remove('activo');
    document.getElementById('macro-1').classList.add('completado');
    document.getElementById('macro-1').querySelector('.numero').innerHTML = '✓';

    document.getElementById('macro-2').classList.remove('pendiente');
    document.getElementById('macro-2').classList.add('activo');

    pasoActualEtapa2 = 0;
    actualizarUIEtapa2();
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

function actualizarUIEtapa2() {
    const panels = document.querySelectorAll('#formularioEtapa2 .step-panel');
    panels.forEach((panel, index) => {
        panel.classList.toggle('active', index === pasoActualEtapa2);
    });

    const indicators = document.querySelectorAll('#etapaPreliminar .step-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index === pasoActualEtapa2) {
            indicator.classList.add('active');
        } else if (index < pasoActualEtapa2) {
            indicator.classList.add('completed');
        }
    });

    const progressBar = document.getElementById('progressBarEtapa2');
    if (progressBar) {
        const progreso = (pasoActualEtapa2 / (totalPasosEtapa2 - 1)) * 100;
        progressBar.style.width = progreso + '%';
    }
}

function siguientePasoEtapa2(paso) {
    if (paso < totalPasosEtapa2 - 1) {
        pasoActualEtapa2 = paso + 1;
        actualizarUIEtapa2();
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }
}

function pasoAnteriorEtapa2(paso) {
    if (paso > 0) {
        pasoActualEtapa2 = paso - 1;
        actualizarUIEtapa2();
        window.scrollTo({ top: 200, behavior: 'smooth' });
    } else {
        document.getElementById('etapaPreliminar').classList.add('oculto');
        document.getElementById('formularioDivorcio').classList.remove('oculto');
        document.getElementById('subEtapaPostulatoria').classList.remove('oculto');
        pasoActual = totalPasos - 1;
        actualizarUI();
        document.getElementById('macro-1').classList.remove('completado');
        document.getElementById('macro-1').classList.add('activo');
        document.getElementById('macro-2').classList.remove('activo');
        document.getElementById('macro-2').classList.add('pendiente');
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }
}

function finalizarEtapa2() {
    document.getElementById('etapaPreliminar').classList.add('oculto');
    document.getElementById('macro-2').classList.remove('activo');
    document.getElementById('macro-2').classList.add('completado');
    document.getElementById('macro-2').querySelector('.numero').innerHTML = '✓';

    document.getElementById('macro-3').classList.remove('pendiente');
    document.getElementById('macro-3').classList.add('activo');

    iniciarEtapa3();
}

let pasoActualEtapa3 = 0;
const totalPasosEtapa3 = 4;

function iniciarEtapa3() {
    document.getElementById('etapaJuicio').classList.remove('oculto');
    pasoActualEtapa3 = 0;
    actualizarUIEtapa3();
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

function actualizarUIEtapa3() {
    const panels = document.querySelectorAll('#formularioEtapa3 .step-panel');
    panels.forEach((panel, index) => {
        panel.classList.toggle('active', index === pasoActualEtapa3);
    });

    const indicators = document.querySelectorAll('#etapaJuicio .step-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index === pasoActualEtapa3) {
            indicator.classList.add('active');
        } else if (index < pasoActualEtapa3) {
            indicator.classList.add('completed');
        }
    });

    const progressBar = document.getElementById('progressBarEtapa3');
    if (progressBar) {
        const progreso = (pasoActualEtapa3 / (totalPasosEtapa3 - 1)) * 100;
        progressBar.style.width = progreso + '%';
    }
}

function siguientePasoEtapa3(paso) {
    if (paso < totalPasosEtapa3 - 1) {
        pasoActualEtapa3 = paso + 1;
        actualizarUIEtapa3();
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }
}

function pasoAnteriorEtapa3(paso) {
    if (paso > 0) {
        pasoActualEtapa3 = paso - 1;
        actualizarUIEtapa3();
        window.scrollTo({ top: 200, behavior: 'smooth' });
    } else {
        document.getElementById('etapaJuicio').classList.add('oculto');
        document.getElementById('etapaPreliminar').classList.remove('oculto');
        pasoActualEtapa2 = totalPasosEtapa2 - 1;
        actualizarUIEtapa2();
        document.getElementById('macro-2').classList.remove('completado');
        document.getElementById('macro-2').classList.add('activo');
        document.getElementById('macro-3').classList.remove('activo');
        document.getElementById('macro-3').classList.add('pendiente');
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }
}

function finalizarEtapa3() {
    document.getElementById('etapaJuicio').classList.add('oculto');
    document.getElementById('macro-3').classList.remove('activo');
    document.getElementById('macro-3').classList.add('completado');
    document.getElementById('macro-3').querySelector('.numero').innerHTML = '✓';

    document.getElementById('macro-4').classList.remove('pendiente');
    document.getElementById('macro-4').classList.add('activo');

    iniciarEtapa4();
}

let pasoActualEtapa4 = 0;

function iniciarEtapa4() {
    document.getElementById('etapaRegistroCivil').classList.remove('oculto');
    pasoActualEtapa4 = 0;
    actualizarUIEtapa4();
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

function actualizarUIEtapa4() {
    const panels = document.querySelectorAll('#formularioEtapa4 .step-panel');
    panels.forEach((panel, index) => {
        panel.classList.toggle('active', index === pasoActualEtapa4);
    });

    const indicators = document.querySelectorAll('#etapaRegistroCivil .step-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index === pasoActualEtapa4) {
            indicator.classList.add('active');
        } else if (index < pasoActualEtapa4) {
            indicator.classList.add('completed');
        }
    });

    const progressBar = document.getElementById('progressBarEtapa4');
    if (progressBar) {
        progressBar.style.width = '100%';
    }
}

function pasoAnteriorEtapa4(paso) {
    if (paso > 0) {
        pasoActualEtapa4 = paso - 1;
        actualizarUIEtapa4();
        window.scrollTo({ top: 200, behavior: 'smooth' });
    } else {
        document.getElementById('etapaRegistroCivil').classList.add('oculto');
        document.getElementById('etapaJuicio').classList.remove('oculto');
        pasoActualEtapa3 = totalPasosEtapa3 - 1;
        actualizarUIEtapa3();
        document.getElementById('macro-3').classList.remove('completado');
        document.getElementById('macro-3').classList.add('activo');
        document.getElementById('macro-4').classList.remove('activo');
        document.getElementById('macro-4').classList.add('pendiente');
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }
}

function finalizarEtapa4() {
    document.getElementById('etapaRegistroCivil').classList.add('oculto');
    document.getElementById('macro-4').classList.remove('activo');
    document.getElementById('macro-4').classList.add('completado');
    document.getElementById('macro-4').querySelector('.numero').innerHTML = '✓';

    document.getElementById('mensajeFinal').classList.remove('oculto');
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

function calcularDiasHabiles(diasTotales, fechaInicio) {
    let contados = 0;
    let fecha = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : new Date();

    while (contados < diasTotales) {
        fecha.setDate(fecha.getDate() + 1);
        const dia = fecha.getDay();
        if (dia !== 0 && dia !== 6) {
            contados++;
        }
    }

    return fecha;
}

function actualizarContadores() {
    const campoFecha = document.getElementById('fechaPresentacionDemanda');
    const fechaBase = campoFecha && campoFecha.value ? campoFecha.value : fechaBaseDemanda;

    const contadores = document.querySelectorAll('.plazo-conteo');

    contadores.forEach(contador => {
        const dias = parseInt(contador.dataset.dias);
        if (!dias) return;

        const fechaLimite = calcularDiasHabiles(dias, fechaBase);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const msRestantes = fechaLimite - hoy;
        const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));

        contador.classList.remove('peligro');
        contador.querySelector('.dias').textContent = diasRestantes > 0 ? diasRestantes : 0;
        contador.querySelector('.unidad').textContent = diasRestantes > 0 ? 'días hábiles restantes' : 'plazo vencido';

        if (diasRestantes <= 3 && diasRestantes > 0) {
            contador.classList.add('peligro');
        }
        if (diasRestantes <= 0) {
            contador.classList.add('peligro');
        }
    });
}

function inicializarCalendario() {
    const calendarEl = document.getElementById('calendario');
    if (!calendarEl) return;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        height: 'auto',
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'next'
        },
        events: [],
        dateClick: function(info) {
            const detalle = document.getElementById('detalleDia');
            detalle.innerHTML = '<strong>' + info.dateStr + '</strong><br>Sin eventos este día';
            detalle.classList.remove('oculto');
        }
    });

    calendar.render();
    window.calendarioGlobal = calendar;
}

function actualizarCalendario() {
    if (!window.calendarioGlobal) return;

    const events = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const plazos = [
        { dias: 3, titulo: 'Admisión de la demanda' },
        { dias: 9, titulo: 'Contestación' },
        { dias: 15, titulo: 'Audiencia Preliminar' },
        { dias: 40, titulo: 'Audiencia de Juicio' }
    ];

    plazos.forEach(p => {
        const fechaLimite = calcularDiasHabiles(p.dias, fechaBaseDemanda);
        const color = fechaLimite < hoy ? '#c0392b' : (fechaLimite - hoy < 3 * 24 * 60 * 60 * 1000 ? '#927009' : '#27ae60');

        events.push({
            title: p.titulo,
            date: fechaLimite.toISOString().split('T')[0],
            backgroundColor: color,
            borderColor: color
        });
    });

    window.calendarioGlobal.removeAllEvents();
    events.forEach(e => window.calendarioGlobal.addEvent(e));
}

function inicializarReajustes() {
    document.querySelectorAll('.check-reajustar-input').forEach(check => {
        check.addEventListener('change', function() {
            const contenedor = this.closest('.reajustar-container');
            const grupoMotivo = contenedor.querySelector('.grupo-motivo');
            const grupoCalendario = contenedor.querySelector('.grupo-calendario');

            if (this.checked) {
                grupoMotivo.classList.remove('oculto');
            } else {
                grupoMotivo.classList.add('oculto');
                grupoCalendario.classList.add('oculto');
                contenedor.querySelector('.input-motivo').value = '';
                contenedor.querySelector('.input-reajuste').value = '';
            }
        });
    });

    document.querySelectorAll('.input-motivo').forEach(input => {
        input.addEventListener('input', function() {
            const palabras = this.value.trim().split(/\s+/).filter(p => p.length > 0);
            if (palabras.length > 15) {
                this.value = palabras.slice(0, 15).join(' ');
            }

            const contenedor = this.closest('.grupo-motivo');
            const grupoCalendario = contenedor.querySelector('.grupo-calendario');

            if (this.value.trim().length > 0) {
                grupoCalendario.classList.remove('oculto');
            } else {
                grupoCalendario.classList.add('oculto');
            }
        });
    });

    document.querySelectorAll('.input-reajuste').forEach(input => {
        input.addEventListener('change', function() {
            if (this.value) {
                fechaBaseDemanda = this.value;
                actualizarContadores();
                actualizarCalendario();
            }
        });
    });
}