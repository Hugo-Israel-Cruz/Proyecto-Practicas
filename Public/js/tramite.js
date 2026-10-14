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
    cargarDatosTramite();

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

async function siguientePaso(paso) {
    if (paso === 0) {
        const tipoDivorcio = document.getElementById('tipoDivorcio').value;
        const tipoMatrimonio = document.getElementById('tipoMatrimonio').value;
        const regimenBienes = document.getElementById('regimenBienes').value;
        const codigoPostal = document.getElementById('codigoPostal').value;

        const tieneHijosCheck = document.querySelector('input[name="tieneHijos"]:checked');
        const tieneHijos = tieneHijosCheck ? tieneHijosCheck.value : null;
        const cantidadHijos = document.getElementById('cantidadHijos') ? document.getElementById('cantidadHijos').value : null;

        const edadesHijos = [];
        if (cantidadHijos && parseInt(cantidadHijos) > 0) {
            for (let i = 1; i <= parseInt(cantidadHijos); i++) {
                const select = document.querySelector('select[name="edadHijo' + i + '"]');
                if (select && select.value) {
                    edadesHijos.push(select.value);
                }
            }
        }

        const tieneBienesCheck = document.querySelector('input[name="tieneBienes"]:checked');
        const tieneBienes = tieneBienesCheck ? tieneBienesCheck.value : null;

        const bienesSeleccionados = Array.from(document.querySelectorAll('input[name="tipoBienes"]:checked')).map(cb => cb.value);
        const bienesOtrosValor = document.getElementById('bienesOtros') ? document.getElementById('bienesOtros').value : null;

        const requisitosSeleccionados = [];
        document.querySelectorAll('input[name^="reqInc"]:checked').forEach(cb => {
            requisitosSeleccionados.push(cb.value);
        });

        const datos = {
            tipoDivorcio: tipoDivorcio,
            tipoMatrimonio: tipoMatrimonio,
            regimenBienes: regimenBienes,
            codigoPostal: codigoPostal,
            tieneHijos: tieneHijos,
            cantidadHijos: cantidadHijos,
            edadesHijos: edadesHijos,
            tieneBienes: tieneBienes,
            bienesSeleccionados: bienesSeleccionados,
            bienesOtros: bienesOtrosValor,
            requisitosSeleccionados: requisitosSeleccionados
        };

        try {
            const respuesta = await fetch('/guardar-etapa0', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                console.error('Error al guardar Etapa 0:', resultado.error);
                return;
            }
            if (resultado.tramiteId) {
                window.TRAMITE_ID = resultado.tramiteId;
            }

        } catch (err) {
            console.error('Error de red:', err);
            return;
        }
    }

    if (paso === 1) {
        const prestaciones = Array.from(document.querySelectorAll('input[name="prestaciones"]:checked')).map(cb => cb.value);
        const pruebas = Array.from(document.querySelectorAll('input[name="pruebas"]:checked')).map(cb => cb.value);

        const datos = {
            autoridadCompetente: document.querySelector('input[name="autoridadCompetente"]')?.checked || false,
            datosActor: document.querySelector('input[name="datosActor"]')?.checked || false,
            representacion: document.querySelector('input[name="representacion"]')?.checked || false,
            datosDemandado: document.querySelector('input[name="datosDemandado"]')?.checked || false,
            prestaciones: prestaciones,
            prestacionesOtros: document.getElementById('prestacionesOtros')?.value || null,
            hechos: document.querySelector('input[name="hechos"]')?.checked || false,
            fundamentos: document.querySelector('input[name="fundamentos"]')?.checked || false,
            valorDemandado: document.querySelector('input[name="valorDemandado"]')?.checked || false,
            pruebas: pruebas,
            pruebasOtros: document.getElementById('pruebasOtros')?.value || null,
            firmaFecha: document.querySelector('input[name="firmaFecha"]')?.checked || false,
            fechaPresentacionDemanda: document.getElementById('fechaPresentacionDemanda')?.value || null,
            vistaMP: document.querySelector('input[name="vistaMP"]')?.checked || false
        };

        try {
            const respuesta = await fetch('/guardar-etapa1-demanda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                console.error('Error al guardar Demanda:', resultado.error);
                return;
            }
        } catch (err) {
            console.error('Error de red:', err);
            return;
        }
    }

    if (paso === 2) {
        const medidas = Array.from(document.querySelectorAll('input[name="medidas"]:checked')).map(cb => cb.value);

        try {
            const respuesta = await fetch('/guardar-etapa1-medidas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medidas: medidas })
            });

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                console.error('Error al guardar Medidas:', resultado.error);
                return;
            }
        } catch (err) {
            console.error('Error de red:', err);
            return;
        }
    }

    if (paso === 3) {
        const tipoPrevencion = Array.from(document.querySelectorAll('input[name="tipoPrevencion"]:checked')).map(cb => cb.value);

        const datos = {
            resolucionAdmision: document.querySelector('input[name="resolucionAdmision"]:checked')?.value || null,
            medidasAdmitidas: document.querySelector('input[name="medidasAdmitidas"]')?.checked || false,
            tipoPrevencion: tipoPrevencion,
            correccionPrevencion: document.getElementById('correccionPrevencion')?.value || null
        };

        try {
            const respuesta = await fetch('/guardar-etapa1-admision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                console.error('Error al guardar Admisión:', resultado.error);
                return;
            }
        } catch (err) {
            console.error('Error de red:', err);
            return;
        }
    }

    if (paso === 4) {
        const datos = {
            tipoEmplazamiento: document.querySelector('input[name="tipoEmplazamiento"]:checked')?.value || null,
            domicilioDemandado: document.querySelector('input[name="domicilioDemandado"]')?.checked || false,
            copiasEntregadas: document.querySelector('input[name="copiasEntregadas"]')?.checked || false
        };

        try {
            const respuesta = await fetch('/guardar-etapa1-emplazamiento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                console.error('Error al guardar Emplazamiento:', resultado.error);
                return;
            }
        } catch (err) {
            console.error('Error de red:', err);
            return;
        }
    }

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

async function iniciarEtapa2() {
    const prestacionesReconvencion = Array.from(document.querySelectorAll('input[name="prestacionesReconvencion"]:checked')).map(cb => cb.value);

    const datos = {
        contesto: document.querySelector('input[name="contesto"]:checked')?.value || null,
        reconvencion: document.querySelector('input[name="reconvencion"]:checked')?.value || null,
        prestacionesReconvencion: prestacionesReconvencion,
        prestacionesReconvencionOtros: document.getElementById('prestacionesReconvencionOtros')?.value || null
    };

    try {
        const respuesta = await fetch('/guardar-etapa1-contestacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();
        if (!respuesta.ok) {
            console.error('Error al guardar Contestación:', resultado.error);
            return;
        }
    } catch (err) {
        console.error('Error de red:', err);
        return;
    }

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

async function siguientePasoEtapa2(paso) {
    if (paso === 0) {
        const datos = {
            intercambioPruebas: document.querySelector('textarea[name="intercambioPruebas"]')?.value || null,
            propuestaConvenio: document.querySelector('textarea[name="propuestaConvenio"]')?.value || null,
            acuerdosHechos: document.querySelector('textarea[name="acuerdosHechos"]')?.value || null,
            acuerdosPruebas: document.querySelector('textarea[name="acuerdosPruebas"]')?.value || null
        };

        try {
            const respuesta = await fetch('/guardar-etapa2-junta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                console.error('Error al guardar Junta:', resultado.error);
                return;
            }
        } catch (err) {
            console.error('Error de red:', err);
            return;
        }
    }

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

async function finalizarEtapa2() {
    const prestacionesAdmitidas = Array.from(document.querySelectorAll('input[name="prestacionesDemandaEtapa2"]:checked')).map(cb => cb.value);
    const reqConv = Array.from(document.querySelectorAll('input[name^="reqConv"]:checked')).map(cb => cb.value);

    const datos = {
        prestacionesAdmitidas: prestacionesAdmitidas,
        definicionProcedimiento: document.querySelector('textarea[name="definicionProcedimiento"]')?.value || null,
        huboConciliacion: document.querySelector('input[name="huboConciliacion"]:checked')?.value || null,
        reqConv: reqConv,
        revisionAcuerdos: document.querySelector('textarea[name="revisionAcuerdos"]')?.value || null,
        fechaAudienciaJuicio: document.querySelector('input[name="fechaAudienciaJuicio"]')?.value || null
    };

    try {
        const respuesta = await fetch('/guardar-etapa2-audiencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();
        if (!respuesta.ok) {
            console.error('Error al guardar Audiencia:', resultado.error);
            return;
        }
    } catch (err) {
        console.error('Error de red:', err);
        return;
    }

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

async function siguientePasoEtapa3(paso) {
    if (paso === 0) {
        const datos = {
            alegatosApertura: document.querySelector('textarea[name="alegatosApertura"]')?.value || null
        };

        try {
            const respuesta = await fetch('/guardar-etapa3-apertura', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                console.error('Error al guardar Alegatos de Apertura:', resultado.error);
                return;
            }
        } catch (err) {
            console.error('Error de red:', err);
            return;
        }
    }

    if (paso === 1) {
        const datos = {
            desahogoPruebas: document.querySelector('textarea[name="desahogoPruebas"]')?.value || null
        };

        try {
            const respuesta = await fetch('/guardar-etapa3-desahogo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                console.error('Error al guardar Desahogo:', resultado.error);
                return;
            }
        } catch (err) {
            console.error('Error de red:', err);
            return;
        }
    }

    if (paso === 2) {
        const datos = {
            alegatosCierre: document.querySelector('textarea[name="alegatosCierre"]')?.value || null
        };

        try {
            const respuesta = await fetch('/guardar-etapa3-cierre', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                console.error('Error al guardar Alegatos de Cierre:', resultado.error);
                return;
            }
        } catch (err) {
            console.error('Error de red:', err);
            return;
        }
    }

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

async function finalizarEtapa3() {
    const sentencia = Array.from(document.querySelectorAll('input[name="sentencia"]:checked')).map(cb => cb.value);

    const datos = {
        sentencia: sentencia,
        huboApelacion: document.querySelector('input[name="huboApelacion"]:checked')?.value || null,
        detalleApelacion: document.querySelector('textarea[name="detalleApelacion"]')?.value || null
    };

    try {
        const respuesta = await fetch('/guardar-etapa3-sentencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();
        if (!respuesta.ok) {
            console.error('Error al guardar Sentencia:', resultado.error);
            return;
        }
    } catch (err) {
        console.error('Error de red:', err);
        return;
    }

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

async function finalizarEtapa4() {
    const inscripcion = Array.from(document.querySelectorAll('input[name="inscripcion"]:checked')).map(cb => cb.value);

    try {
        const respuesta = await fetch('/guardar-etapa4-inscripcion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inscripcion: inscripcion })
        });

        const resultado = await respuesta.json();
        if (!respuesta.ok) {
            console.error('Error al guardar Inscripción:', resultado.error);
            return;
        }
    } catch (err) {
        console.error('Error de red:', err);
        return;
    }

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

function formatearFecha(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return año + '-' + mes + '-' + dia;
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
            const eventos = calendar.getEvents().filter(ev => ev.startStr === info.dateStr);

            let html = '<strong>' + info.dateStr + '</strong><br>';

            if (eventos.length > 0) {
                eventos.forEach(ev => {
                    html += '<div style="margin-top:6px; padding:6px 10px; background:' + ev.backgroundColor + '; color:white; border-radius:4px; font-size:0.85rem;">' + ev.title + '</div>';
                });
            } else {
                html += 'Sin eventos este día';
            }

            detalle.innerHTML = html;
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
        const diffDias = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
        let color = '#27ae60';

        if (diffDias <= 0) {
            color = '#c0392b';
        } else if (diffDias <= 3) {
            color = '#927009';
        }

        events.push({
            title: p.titulo,
            date: formatearFecha(fechaLimite),
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

function cargarDatosTramite() {
    const datos = window.DATOS_TRAMITE;
    if (!datos || !datos.tramite) return;

    const etapa = datos.tramite.etapa_actual;

    // ==================== ETAPA 0 ====================
    if (datos.etapa0) {
        const e0 = datos.etapa0;

        if (e0.tipo_matrimonio) {
            const el = document.getElementById('tipoMatrimonio');
            if (el) el.value = e0.tipo_matrimonio;
        }

        if (e0.regimen_bienes) {
            const el = document.getElementById('regimenBienes');
            if (el) el.value = e0.regimen_bienes;
        }

        if (e0.codigo_postal) {
            const el = document.getElementById('codigoPostal');
            if (el) el.value = e0.codigo_postal;
        }

        if (e0.tiene_hijos) {
            const radio = document.querySelector('input[name="tieneHijos"][value="si"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }

            if (e0.cantidad_hijos) {
                const sel = document.getElementById('cantidadHijos');
                if (sel) {
                    sel.value = e0.cantidad_hijos;
                    sel.dispatchEvent(new Event('change'));
                }

                if (e0.edades_hijos) {
                    let edades = e0.edades_hijos;
                    if (typeof edades === 'string') {
                        try { edades = JSON.parse(edades); } catch (e) { edades = []; }
                    }
                    edades.forEach((edad, i) => {
                        const select = document.querySelector('select[name="edadHijo' + (i + 1) + '"]');
                        if (select) select.value = edad;
                    });
                }
            }
        } else {
            const radio = document.querySelector('input[name="tieneHijos"][value="no"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        }

        if (e0.tiene_bienes) {
            const radio = document.querySelector('input[name="tieneBienes"][value="si"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }

            if (e0.bienes_seleccionados) {
                let bienes = e0.bienes_seleccionados;
                if (typeof bienes === 'string') {
                    try { bienes = JSON.parse(bienes); } catch (e) { bienes = []; }
                }
                bienes.forEach(bien => {
                    const cb = document.querySelector('input[name="tipoBienes"][value="' + bien + '"]');
                    if (cb) {
                        cb.checked = true;
                        cb.dispatchEvent(new Event('change'));
                    }
                });
            }

            if (e0.bienes_otros) {
                const el = document.getElementById('bienesOtros');
                if (el) el.value = e0.bienes_otros;
            }
        } else {
            const radio = document.querySelector('input[name="tieneBienes"][value="no"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        }

        if (e0.requisitos_seleccionados) {
            let reqs = e0.requisitos_seleccionados;
            if (typeof reqs === 'string') {
                try { reqs = JSON.parse(reqs); } catch (e) { reqs = []; }
            }
            reqs.forEach(req => {
                const cb = document.querySelector('input[name^="reqInc"][value="' + req + '"]');
                if (cb) cb.checked = true;
            });
        }
    }

    if (datos.tramite.tipo_divorcio) {
        const sel = document.getElementById('tipoDivorcio');
        if (sel) {
            sel.value = datos.tramite.tipo_divorcio;
            sel.dispatchEvent(new Event('change'));
        }
    }

    // ==================== ETAPA 1: DEMANDA ====================
    if (datos.etapa1Demanda) {
        const d = datos.etapa1Demanda;

        if (d.autoridad_competente) {
            const cb = document.querySelector('input[name="autoridadCompetente"]');
            if (cb) cb.checked = true;
        }
        if (d.datos_actor) {
            const cb = document.querySelector('input[name="datosActor"]');
            if (cb) cb.checked = true;
        }
        if (d.representacion) {
            const cb = document.querySelector('input[name="representacion"]');
            if (cb) cb.checked = true;
        }
        if (d.datos_demandado) {
            const cb = document.querySelector('input[name="datosDemandado"]');
            if (cb) cb.checked = true;
        }
        if (d.hechos) {
            const cb = document.querySelector('input[name="hechos"]');
            if (cb) cb.checked = true;
        }
        if (d.fundamentos) {
            const cb = document.querySelector('input[name="fundamentos"]');
            if (cb) cb.checked = true;
        }
        if (d.valor_demandado) {
            const cb = document.querySelector('input[name="valorDemandado"]');
            if (cb) cb.checked = true;
        }
        if (d.firma_fecha) {
            const cb = document.querySelector('input[name="firmaFecha"]');
            if (cb) cb.checked = true;
        }
        if (d.vista_mp) {
            const cb = document.querySelector('input[name="vistaMP"]');
            if (cb) cb.checked = true;
        }
        if (d.fecha_presentacion_demanda) {
            const fecha = d.fecha_presentacion_demanda.split('T')[0];
            const el = document.getElementById('fechaPresentacionDemanda');
            if (el) {
                el.value = fecha;
                el.dispatchEvent(new Event('change'));
            }
        }

        if (d.prestaciones_seleccionadas) {
            let pre = d.prestaciones_seleccionadas;
            if (typeof pre === 'string') {
                try { pre = JSON.parse(pre); } catch (e) { pre = []; }
            }
            pre.forEach(p => {
                const cb = document.querySelector('input[name="prestaciones"][value="' + p + '"]');
                if (cb) {
                    cb.checked = true;
                    cb.dispatchEvent(new Event('change'));
                }
            });
        }

        if (d.prestaciones_otros) {
            const el = document.getElementById('prestacionesOtros');
            if (el) el.value = d.prestaciones_otros;
        }

        if (d.pruebas_seleccionadas) {
            let pr = d.pruebas_seleccionadas;
            if (typeof pr === 'string') {
                try { pr = JSON.parse(pr); } catch (e) { pr = []; }
            }
            pr.forEach(p => {
                const cb = document.querySelector('input[name="pruebas"][value="' + p + '"]');
                if (cb) {
                    cb.checked = true;
                    cb.dispatchEvent(new Event('change'));
                }
            });
        }

        if (d.pruebas_otros) {
            const el = document.getElementById('pruebasOtros');
            if (el) el.value = d.pruebas_otros;
        }
    }

    // ==================== ETAPA 1: MEDIDAS ====================
    if (datos.etapa1Medidas) {
        const m = datos.etapa1Medidas;
        const medidas = ['separacion', 'alimentos', 'custodia', 'embarazo', 'resguardo_personal', 'resguardo_bienes'];
        medidas.forEach(medida => {
            if (m[medida]) {
                const cb = document.querySelector('input[name="medidas"][value="' + medida + '"]');
                if (cb) cb.checked = true;
            }
        });
    }

    // ==================== ETAPA 1: ADMISIÓN ====================
    if (datos.etapa1Admision) {
        const a = datos.etapa1Admision;

        if (a.resolucion) {
            const radio = document.querySelector('input[name="resolucionAdmision"][value="' + a.resolucion + '"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        }

        if (a.medidas_admitidas) {
            const cb = document.querySelector('input[name="medidasAdmitidas"]');
            if (cb) cb.checked = true;
        }

        if (a.tipo_prevencion) {
            let tp = a.tipo_prevencion;
            if (typeof tp === 'string') {
                try { tp = JSON.parse(tp); } catch (e) { tp = [tp]; }
            }
            if (Array.isArray(tp)) {
                tp.forEach(t => {
                    const cb = document.querySelector('input[name="tipoPrevencion"][value="' + t + '"]');
                    if (cb) cb.checked = true;
                });
            }
        }

        if (a.correccion_prevencion) {
            const el = document.getElementById('correccionPrevencion');
            if (el) el.value = a.correccion_prevencion;
        }
    }

    // ==================== ETAPA 1: EMPLAZAMIENTO ====================
    if (datos.etapa1Emplazamiento) {
        const e = datos.etapa1Emplazamiento;

        if (e.tipo_emplazamiento) {
            const radio = document.querySelector('input[name="tipoEmplazamiento"][value="' + e.tipo_emplazamiento + '"]');
            if (radio) radio.checked = true;
        }

        if (e.domicilio_demandado) {
            const cb = document.querySelector('input[name="domicilioDemandado"]');
            if (cb) cb.checked = true;
        }

        if (e.copias_entregadas) {
            const cb = document.querySelector('input[name="copiasEntregadas"]');
            if (cb) cb.checked = true;
        }
    }

    // ==================== ETAPA 1: CONTESTACIÓN ====================
    if (datos.etapa1Contestacion) {
        const c = datos.etapa1Contestacion;

        if (c.contesto !== null && c.contesto !== undefined) {
            const val = (c.contesto === 1 || c.contesto === true) ? 'si' : 'no';
            const radio = document.querySelector('input[name="contesto"][value="' + val + '"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        }

        if (c.reconvencion !== null && c.reconvencion !== undefined) {
            const val = (c.reconvencion === 1 || c.reconvencion === true) ? 'si' : 'no';
            const radio = document.querySelector('input[name="reconvencion"][value="' + val + '"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        }

        if (c.prestaciones_reconvencion) {
            let pr = c.prestaciones_reconvencion;
            if (typeof pr === 'string') {
                try { pr = JSON.parse(pr); } catch (e) { pr = []; }
            }
            pr.forEach(p => {
                const cb = document.querySelector('input[name="prestacionesReconvencion"][value="' + p + '"]');
                if (cb) {
                    cb.checked = true;
                    cb.dispatchEvent(new Event('change'));
                }
            });
        }

        if (c.prestaciones_reconvencion_otros) {
            const el = document.getElementById('prestacionesReconvencionOtros');
            if (el) el.value = c.prestaciones_reconvencion_otros;
        }
    }

    // ==================== ETAPA 2: JUNTA ANTICIPADA ====================
    if (datos.etapa2Junta) {
        const j = datos.etapa2Junta;

        if (j.intercambio_pruebas) {
            const el = document.querySelector('textarea[name="intercambioPruebas"]');
            if (el) el.value = j.intercambio_pruebas;
        }
        if (j.propuesta_convenio) {
            const el = document.querySelector('textarea[name="propuestaConvenio"]');
            if (el) el.value = j.propuesta_convenio;
        }
        if (j.acuerdos_hechos) {
            const el = document.querySelector('textarea[name="acuerdosHechos"]');
            if (el) el.value = j.acuerdos_hechos;
        }
        if (j.acuerdos_pruebas) {
            const el = document.querySelector('textarea[name="acuerdosPruebas"]');
            if (el) el.value = j.acuerdos_pruebas;
        }
    }

    // ==================== ETAPA 2: AUDIENCIA ====================
    if (datos.etapa2Audiencia) {
        const a = datos.etapa2Audiencia;

        if (a.prestaciones_admitidas) {
            let pr = a.prestaciones_admitidas;
            if (typeof pr === 'string') {
                try { pr = JSON.parse(pr); } catch (e) { pr = []; }
            }
            pr.forEach(p => {
                const cb = document.querySelector('input[name="prestacionesDemandaEtapa2"][value="' + p + '"]');
                if (cb) cb.checked = true;
            });
        }

        if (a.prestaciones_contestacion) {
            let pr = a.prestaciones_contestacion;
            if (typeof pr === 'string') {
                try { pr = JSON.parse(pr); } catch (e) { pr = []; }
            }
            pr.forEach(p => {
                const cb = document.querySelector('input[name="prestacionesContestacionEtapa2"][value="' + p + '"]');
                if (cb) cb.checked = true;
            });
        }

        if (a.definicion_procedimiento) {
            const el = document.querySelector('textarea[name="definicionProcedimiento"]');
            if (el) el.value = a.definicion_procedimiento;
        }

        if (a.hubo_conciliacion !== null && a.hubo_conciliacion !== undefined) {
            const val = (a.hubo_conciliacion === 1 || a.hubo_conciliacion === true) ? 'si' : 'no';
            const radio = document.querySelector('input[name="huboConciliacion"][value="' + val + '"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        }

        if (a.requisitos_convenio) {
            let reqs = a.requisitos_convenio;
            if (typeof reqs === 'string') {
                try { reqs = JSON.parse(reqs); } catch (e) { reqs = []; }
            }
            reqs.forEach(r => {
                const cb = document.querySelector('input[name^="reqConv"][value="' + r + '"]');
                if (cb) cb.checked = true;
            });
        }

        if (a.revision_acuerdos) {
            const el = document.querySelector('textarea[name="revisionAcuerdos"]');
            if (el) el.value = a.revision_acuerdos;
        }

        if (a.fecha_audiencia_juicio) {
            const fecha = a.fecha_audiencia_juicio.split('T')[0];
            const el = document.querySelector('input[name="fechaAudienciaJuicio"]');
            if (el) el.value = fecha;
        }
    }

    // ==================== ETAPA 3: ALEGATOS DE APERTURA ====================
    if (datos.etapa3AlegatosApertura) {
        if (datos.etapa3AlegatosApertura.descripcion) {
            const el = document.querySelector('textarea[name="alegatosApertura"]');
            if (el) el.value = datos.etapa3AlegatosApertura.descripcion;
        }
    }

    // ==================== ETAPA 3: DESAHOGO ====================
    if (datos.etapa3Desahogo) {
        if (datos.etapa3Desahogo.descripcion) {
            const el = document.querySelector('textarea[name="desahogoPruebas"]');
            if (el) el.value = datos.etapa3Desahogo.descripcion;
        }
    }

    // ==================== ETAPA 3: ALEGATOS DE CIERRE ====================
    if (datos.etapa3AlegatosCierre) {
        if (datos.etapa3AlegatosCierre.descripcion) {
            const el = document.querySelector('textarea[name="alegatosCierre"]');
            if (el) el.value = datos.etapa3AlegatosCierre.descripcion;
        }
    }

    // ==================== ETAPA 3: SENTENCIA ====================
    if (datos.etapa3Sentencia) {
        const s = datos.etapa3Sentencia;

        if (s.sentencia) {
            const radio = document.querySelector('input[name="sentencia"][value="' + s.sentencia + '"]');
            if (radio) radio.checked = true;
        }

        if (s.hubo_apelacion !== null && s.hubo_apelacion !== undefined) {
            const val = (s.hubo_apelacion === 1 || s.hubo_apelacion === true) ? 'si' : 'no';
            const radio = document.querySelector('input[name="huboApelacion"][value="' + val + '"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        }

        if (s.detalle_apelacion) {
            const el = document.getElementById('detalleApelacion');
            if (el) el.value = s.detalle_apelacion;
        }
    }

    // ==================== ETAPA 4: INSCRIPCIÓN ====================
    if (datos.etapa4Inscripcion) {
        const i = datos.etapa4Inscripcion;
        if (i.inscripcion) {
            const radio = document.querySelector('input[name="inscripcion"][value="' + i.inscripcion + '"]');
            if (radio) radio.checked = true;
        }
    }

    // Marcar etapas completadas
    marcarEtapasPrevias(etapa);

    // Mostrar la etapa actual
    if (etapa === 0) {
        actualizarUI();
    } else if (etapa > 0 && etapa < 6) {
        pasoActual = etapa;
        actualizarUI();
    } else if (etapa >= 6 && etapa < 8) {
        mostrarEtapa2();
        cargarDatosEtapa2(datos);
    } else if (etapa >= 8 && etapa < 12) {
        mostrarEtapa3();
        cargarDatosEtapa3(datos);
    } else if (etapa >= 12) {
        mostrarEtapa4();
    }
}

function mostrarEtapa2() {
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
}

function mostrarEtapa3() {
    document.getElementById('formularioDivorcio').classList.add('oculto');
    document.getElementById('subEtapaPostulatoria').classList.add('oculto');
    document.getElementById('etapaPreliminar').classList.add('oculto');
    document.getElementById('etapaJuicio').classList.remove('oculto');

    document.getElementById('macro-2').classList.remove('activo');
    document.getElementById('macro-2').classList.add('completado');
    document.getElementById('macro-2').querySelector('.numero').innerHTML = '✓';

    document.getElementById('macro-3').classList.remove('pendiente');
    document.getElementById('macro-3').classList.add('activo');

    pasoActualEtapa3 = 0;
    actualizarUIEtapa3();
}

function mostrarEtapa4() {
    document.getElementById('formularioDivorcio').classList.add('oculto');
    document.getElementById('subEtapaPostulatoria').classList.add('oculto');
    document.getElementById('etapaPreliminar').classList.add('oculto');
    document.getElementById('etapaJuicio').classList.add('oculto');
    document.getElementById('etapaRegistroCivil').classList.remove('oculto');

    document.getElementById('macro-3').classList.remove('activo');
    document.getElementById('macro-3').classList.add('completado');
    document.getElementById('macro-3').querySelector('.numero').innerHTML = '✓';

    document.getElementById('macro-4').classList.remove('pendiente');
    document.getElementById('macro-4').classList.add('activo');

    pasoActualEtapa4 = 0;
    actualizarUIEtapa4();
}

function marcarEtapasPrevias(etapaActual) {
    const macro0 = document.getElementById('macro-0');
    const macro1 = document.getElementById('macro-1');
    const macro2 = document.getElementById('macro-2');
    const macro3 = document.getElementById('macro-3');
    const macro4 = document.getElementById('macro-4');

    function marcarCompletada(el) {
        el.classList.remove('activo', 'pendiente');
        el.classList.add('completado');
        el.querySelector('.numero').innerHTML = '✓';
    }

    function marcarActiva(el) {
        el.classList.remove('completado', 'pendiente');
        el.classList.add('activo');
    }

    function marcarPendiente(el) {
        el.classList.remove('completado', 'activo');
        el.classList.add('pendiente');
    }

    // Etapa 0
    if (etapaActual >= 1) marcarCompletada(macro0);
    else marcarActiva(macro0);

    // Etapa 1
    if (etapaActual >= 6) marcarCompletada(macro1);
    else if (etapaActual >= 1) marcarActiva(macro1);
    else marcarPendiente(macro1);

    // Etapa 2
    if (etapaActual >= 8) marcarCompletada(macro2);
    else if (etapaActual >= 6) marcarActiva(macro2);
    else marcarPendiente(macro2);

    // Etapa 3
    if (etapaActual >= 12) marcarCompletada(macro3);
    else if (etapaActual >= 8) marcarActiva(macro3);
    else marcarPendiente(macro3);

    // Etapa 4
    if (etapaActual >= 13) marcarCompletada(macro4);
    else if (etapaActual >= 12) marcarActiva(macro4);
    else marcarPendiente(macro4);
}

function cargarDatosEtapa2(datos) {
    if (datos.etapa2Junta) {
        const j = datos.etapa2Junta;
        if (j.intercambio_pruebas) {
            const el = document.querySelector('textarea[name="intercambioPruebas"]');
            if (el) el.value = j.intercambio_pruebas;
        }
        if (j.propuesta_convenio) {
            const el = document.querySelector('textarea[name="propuestaConvenio"]');
            if (el) el.value = j.propuesta_convenio;
        }
        if (j.acuerdos_hechos) {
            const el = document.querySelector('textarea[name="acuerdosHechos"]');
            if (el) el.value = j.acuerdos_hechos;
        }
        if (j.acuerdos_pruebas) {
            const el = document.querySelector('textarea[name="acuerdosPruebas"]');
            if (el) el.value = j.acuerdos_pruebas;
        }
    }

    if (datos.etapa2Audiencia) {
        const a = datos.etapa2Audiencia;

        if (a.prestaciones_admitidas) {
            let pr = a.prestaciones_admitidas;
            if (typeof pr === 'string') {
                try { pr = JSON.parse(pr); } catch (e) { pr = []; }
            }
            pr.forEach(p => {
                const cb = document.querySelector('input[name="prestacionesDemandaEtapa2"][value="' + p + '"]');
                if (cb) cb.checked = true;
            });
        }

        if (a.prestaciones_contestacion) {
            let pr = a.prestaciones_contestacion;
            if (typeof pr === 'string') {
                try { pr = JSON.parse(pr); } catch (e) { pr = []; }
            }
            pr.forEach(p => {
                const cb = document.querySelector('input[name="prestacionesContestacionEtapa2"][value="' + p + '"]');
                if (cb) cb.checked = true;
            });
        }

        if (a.definicion_procedimiento) {
            const el = document.querySelector('textarea[name="definicionProcedimiento"]');
            if (el) el.value = a.definicion_procedimiento;
        }

        if (a.hubo_conciliacion !== null && a.hubo_conciliacion !== undefined) {
            const val = (a.hubo_conciliacion === 1 || a.hubo_conciliacion === true) ? 'si' : 'no';
            const radio = document.querySelector('input[name="huboConciliacion"][value="' + val + '"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        }

        if (a.requisitos_convenio) {
            let reqs = a.requisitos_convenio;
            if (typeof reqs === 'string') {
                try { reqs = JSON.parse(reqs); } catch (e) { reqs = []; }
            }
            reqs.forEach(r => {
                const cb = document.querySelector('input[name^="reqConv"][value="' + r + '"]');
                if (cb) cb.checked = true;
            });
        }

        if (a.revision_acuerdos) {
            const el = document.querySelector('textarea[name="revisionAcuerdos"]');
            if (el) el.value = a.revision_acuerdos;
        }

        if (a.fecha_audiencia_juicio) {
            const fecha = a.fecha_audiencia_juicio.split('T')[0];
            const el = document.querySelector('input[name="fechaAudienciaJuicio"]');
            if (el) el.value = fecha;
        }
    }
}

function cargarDatosEtapa3(datos) {
    if (datos.etapa3AlegatosApertura && datos.etapa3AlegatosApertura.descripcion) {
        const el = document.querySelector('textarea[name="alegatosApertura"]');
        if (el) el.value = datos.etapa3AlegatosApertura.descripcion;
    }

    if (datos.etapa3Desahogo && datos.etapa3Desahogo.descripcion) {
        const el = document.querySelector('textarea[name="desahogoPruebas"]');
        if (el) el.value = datos.etapa3Desahogo.descripcion;
    }

    if (datos.etapa3AlegatosCierre && datos.etapa3AlegatosCierre.descripcion) {
        const el = document.querySelector('textarea[name="alegatosCierre"]');
        if (el) el.value = datos.etapa3AlegatosCierre.descripcion;
    }

    if (datos.etapa3Sentencia) {
        const s = datos.etapa3Sentencia;

        if (s.sentencia) {
            const radio = document.querySelector('input[name="sentencia"][value="' + s.sentencia + '"]');
            if (radio) radio.checked = true;
        }

        if (s.hubo_apelacion !== null && s.hubo_apelacion !== undefined) {
            const val = (s.hubo_apelacion === 1 || s.hubo_apelacion === true) ? 'si' : 'no';
            const radio = document.querySelector('input[name="huboApelacion"][value="' + val + '"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        }

        if (s.detalle_apelacion) {
            const el = document.getElementById('detalleApelacion');
            if (el) el.value = s.detalle_apelacion;
        }
    }
}

function verReporte() {
    if (window.TRAMITE_ID) {
        window.location.href = '/reporte/' + window.TRAMITE_ID;
    } else if (window.DATOS_TRAMITE && window.DATOS_TRAMITE.tramite && window.DATOS_TRAMITE.tramite.id) {
        window.location.href = '/reporte/' + window.DATOS_TRAMITE.tramite.id;
    } else {
        window.location.href = '/seguimiento';
    }
}