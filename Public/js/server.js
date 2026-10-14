const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'mi_secreto',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

/* =====================================================================
   CONSTANTES Y UTILIDADES
   ===================================================================== */

// Tabla donde se guarda cada etapa
const TABLAS = {
    etapa0: 'etapa0_datos_matrimonio',
    etapa1Demanda: 'etapa1_demanda',
    etapa1Medidas: 'etapa1_medidas',
    etapa1Admision: 'etapa1_admision',
    etapa1Emplazamiento: 'etapa1_emplazamiento',
    etapa1Contestacion: 'etapa1_contestacion',
    etapa2Junta: 'etapa2_junta_anticipada',
    etapa2Audiencia: 'etapa2_audiencia_autoridad',
    etapa3AlegatosApertura: 'etapa3_alegatos_apertura',
    etapa3Desahogo: 'etapa3_desahogo_pruebas',
    etapa3AlegatosCierre: 'etapa3_alegatos_cierre',
    etapa3Sentencia: 'etapa3_sentencia',
    etapa4Inscripcion: 'etapa4_inscripcion'
};

// Columnas que guardan JSON (o texto con JSON) y se devuelven ya como arreglo/objeto
const COLUMNAS_JSON = [
    'bienes_seleccionados', 'requisitos_seleccionados', 'edades_hijos', 'convenio',
    'prestaciones_seleccionadas', 'pruebas_seleccionadas', 'tipo_prevencion',
    'prestaciones_reconvencion', 'prestaciones_admitidas', 'prestaciones_contestacion',
    'requisitos_convenio'
];

/*
 etapa_actual = PASO que el usuario debe llenar a continuación:
   0 Datos del matrimonio      7  Etapa 2: Audiencia ante autoridad
   1 Demanda                   8  Etapa 3: Alegatos de apertura
   2 Medidas provisionales     9  Etapa 3: Desahogo de pruebas
   3 Admisión                  10 Etapa 3: Alegatos de cierre
   4 Emplazamiento             11 Etapa 3: Sentencia
   5 Contestación              12 Etapa 4: Inscripción
   6 Etapa 2: Junta anticipada 13 Completado
*/
const ETAPAS_TEXTO = [
    'Etapa 0: Datos del matrimonio',
    'Etapa 1: Demanda',
    'Etapa 1: Medidas provisionales',
    'Etapa 1: Admisión de la demanda',
    'Etapa 1: Emplazamiento',
    'Etapa 1: Contestación',
    'Etapa 2: Junta anticipada',
    'Etapa 2: Audiencia ante autoridad',
    'Etapa 3: Alegatos de apertura',
    'Etapa 3: Desahogo de pruebas',
    'Etapa 3: Alegatos de cierre',
    'Etapa 3: Sentencia',
    'Etapa 4: Inscripción en Registro Civil',
    'Completado'
];

const ETIQ = {
    tipoDivorcio: { administrativo: 'Administrativo', notarial: 'Notarial', voluntario: 'Voluntario', incausado: 'Incausado' },
    tipoMatrimonio: { civil: 'Matrimonio civil', union_hecho: 'Unión libre / Concubinato' },
    regimen: { sociedad_conyugal: 'Sociedad conyugal', separacion_bienes: 'Separación de bienes' },
    bienes: { casa: 'Casa', carro: 'Carro', alhajas: 'Alhajas', otros: 'Otros' },
    prestaciones: {
        compensacion_economica: 'Compensación económica',
        custodia_hijos: 'Custodia de los hijos',
        pension_alimenticia_provisional: 'Pensión alimenticia provisional',
        pension_alimenticia_definitiva: 'Pensión alimenticia definitiva',
        otros: 'Otros'
    },
    pruebas: {
        documental_privada: 'Prueba documental privada',
        documental_publica: 'Prueba documental pública',
        pericial: 'Prueba pericial',
        testigos: 'Declaración de testigos',
        parte_propia: 'Declaración de parte propia',
        otros: 'Otros'
    },
    medidas: {
        separacion: 'Separación de cónyuges',
        alimentos: 'Monto de alimentos',
        custodia: 'Guarda y custodia (preferentemente a la mujer)',
        embarazo: 'Medidas para mujer embarazada',
        resguardo_personal: 'Resguardo personal',
        resguardo_bienes: 'Resguardo de bienes'
    },
    resolucion: { admitida: 'Admitió la demanda', prevencion: 'Previno para corregir' },
    prevencion: { forma: 'Forma', fondo: 'Fondo' },
    emplazamiento: {
        persona: 'En persona al demandado',
        tercero: 'A la persona que atiende, anotando quién es',
        citatorio: 'Citatorio para el día siguiente',
        adhesion: 'Por adhesión (letrero en la puerta)'
    },
    convenio: {
        domicilio: 'Domicilio(s)',
        alimentos: 'Monto de alimentos y garantía',
        custodia: 'División de guarda y custodia',
        convivencia: 'Régimen de convivencia',
        bienes: 'Administración y división de bienes'
    },
    sentencia: { favor: 'A favor', contra: 'En contra' },
    inscripcion: { realizada: 'Inscripción realizada', pendiente: 'Inscripción pendiente' },
    requisitos: {
        reqAdmin1: 'Común acuerdo', reqAdmin2: 'Liquidada la sociedad conyugal',
        reqAdmin3: 'Sin hijos tutelados', reqAdmin4: 'Ante el Oficial del Registro Civil',
        reqNot1: 'Ambas partes', reqNot2: 'Ante notario', reqNot3: 'Sin hijos tutelados',
        reqVol1: 'Solicitan ambas partes', reqVol2: 'Ante juez civil', reqVol3: 'Convenio',
        reqInc1: 'Solicita una parte (Demanda)', reqInc2: 'Ante juez civil'
    },
    plazo: {
        '3': 'Admisión de la demanda', '5': 'Contestación',
        'etapa2': 'Audiencia preliminar', 'etapa3': 'Audiencia de juicio'
    }
};

function etiqueta(mapa, valor) {
    return (ETIQ[mapa] && ETIQ[mapa][valor]) || valor;
}

function listaDe(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v) {
        try {
            const p = JSON.parse(v);
            return Array.isArray(p) ? p : [p];
        } catch (e) {
            return [v];
        }
    }
    return [];
}

function siNo(v) {
    if (v === 1 || v === true) return 'Sí';
    if (v === 0 || v === false) return 'No';
    return '—';
}

function fmtFecha(v) {
    if (!v) return '—';
    const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[3] + '/' + m[2] + '/' + m[1] : String(v);
}

// Convierte valores para guardar en MySQL
const bool = v => (v ? 1 : 0);
const triBool = v => (v === 'si' ? 1 : (v === 'no' ? 0 : null));
const txt = v => (v === undefined || v === null || v === '' ? null : v);
const json = v => (Array.isArray(v) && v.length > 0 ? JSON.stringify(v) : null);
const uno = v => (Array.isArray(v) ? (v[0] || null) : txt(v));

function pad(n) {
    return String(n).padStart(2, '0');
}

// Fechas -> 'YYYY-MM-DD' (evita desfases de zona horaria) y JSON en texto -> objeto
function normalizarFila(fila) {
    if (!fila) return null;
    const out = {};
    for (const [k, v] of Object.entries(fila)) {
        if (v instanceof Date) {
            out[k] = v.getFullYear() + '-' + pad(v.getMonth() + 1) + '-' + pad(v.getDate());
        } else if (COLUMNAS_JSON.includes(k) && typeof v === 'string') {
            try { out[k] = JSON.parse(v); } catch (e) { out[k] = v; }
        } else {
            out[k] = v;
        }
    }
    return out;
}

// Trae el trámite y TODAS sus etapas (solo si pertenece al usuario)
async function cargarTramiteCompleto(tramiteId, usuarioId) {
    const [tr] = await pool.query(
        'SELECT * FROM tramites WHERE id = ? AND usuario_id = ?',
        [tramiteId, usuarioId]
    );
    if (tr.length === 0) return null;

    const datos = { tramite: normalizarFila(tr[0]) };

    for (const [clave, tabla] of Object.entries(TABLAS)) {
        const [rows] = await pool.query(
            'SELECT * FROM ' + tabla + ' WHERE tramite_id = ? ORDER BY id DESC LIMIT 1',
            [tramiteId]
        );
        datos[clave] = normalizarFila(rows[0]);
    }

    const [rj] = await pool.query(
        'SELECT * FROM reajustes WHERE tramite_id = ? ORDER BY id',
        [tramiteId]
    );
    datos.reajustes = rj.map(normalizarFila);

    return datos;
}

async function generarFolio() {
    const año = new Date().getFullYear();
    const [rows] = await pool.query(
        "SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(folio, '-', -1) AS UNSIGNED)), 0) AS maximo FROM tramites WHERE folio LIKE ?",
        [año + '-%']
    );
    return año + '-' + String(rows[0].maximo + 1).padStart(4, '0');
}

// INSERT o UPDATE según exista ya el registro de ese trámite
async function guardarConPatron(tabla, datos, tramiteId) {
    const campos = Object.keys(datos);
    const valores = Object.values(datos);

    const [existe] = await pool.query(
        'SELECT id FROM ' + tabla + ' WHERE tramite_id = ?',
        [tramiteId]
    );

    if (existe.length > 0) {
        const sets = campos.map(c => c + ' = ?').join(', ');
        await pool.query(
            'UPDATE ' + tabla + ' SET ' + sets + ' WHERE tramite_id = ?',
            [...valores, tramiteId]
        );
    } else {
        const columnas = campos.join(', ') + ', tramite_id';
        const placeholders = campos.map(() => '?').join(', ') + ', ?';
        await pool.query(
            'INSERT INTO ' + tabla + ' (' + columnas + ') VALUES (' + placeholders + ')',
            [...valores, tramiteId]
        );
    }
}

// Solo avanza (nunca retrocede) el paso del trámite
async function avanzar(tramiteId, paso) {
    await pool.query(
        'UPDATE tramites SET etapa_actual = GREATEST(etapa_actual, ?), fecha_ultima_actualizacion = NOW() WHERE id = ?',
        [paso, tramiteId]
    );
}

// Guarda sin marcar el paso como completado (solo actualiza la fecha de modificación)
async function tocar(tramiteId) {
    await pool.query(
        'UPDATE tramites SET fecha_ultima_actualizacion = NOW() WHERE id = ?',
        [tramiteId]
    );
}

function requiereLogin(req, res, next) {
    if (!req.session.usuario) return res.redirect('/login');
    next();
}

function requiereTramite(req, res, next) {
    if (!req.session.usuario) return res.status(401).json({ error: 'No autenticado' });
    if (!req.session.tramiteActivo) return res.status(400).json({ error: 'No hay trámite activo' });
    next();
}

/* =====================================================================
   PÁGINAS, LOGIN Y REGISTRO
   ===================================================================== */

app.get('/', (req, res) => {
    res.render('inicio');
});

app.get('/login', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/inicio');
    }
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

        if (usuarios.length === 0) {
            return res.render('login', { error: 'Correo o contraseña incorrectos' });
        }

        const usuario = usuarios[0];
        const coincide = await bcrypt.compare(contraseña, usuario.contrasena);

        if (!coincide) {
            return res.render('login', { error: 'Correo o contraseña incorrectos' });
        }

        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo
        };

        req.session.tramiteActivo = usuario.tramite_divorcio_activo_id || null;

        res.redirect('/inicio');
    } catch (err) {
        console.error('Error en login:', err);
        res.render('login', { error: 'Error al iniciar sesión' });
    }
});

app.get('/registro', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/inicio');
    }
    res.render('registro');
});

app.post('/registro', async (req, res) => {
    const { nombre, apellido_p, apellido_m, correo, contraseña, confirmar } = req.body;

    if (contraseña !== confirmar) {
        return res.render('registro', { error: 'Las contraseñas no coinciden' });
    }

    try {
        const [existe] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);

        if (existe.length > 0) {
            return res.render('registro', { error: 'El correo ya está registrado' });
        }

        const hash = await bcrypt.hash(contraseña, 10);

        await pool.query(
            'INSERT INTO usuarios (nombre, apellido_p, apellido_m, correo, contrasena) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido_p, apellido_m, correo, hash]
        );

        res.redirect('/login');
    } catch (err) {
        console.error('Error en registro:', err);
        res.render('registro', { error: 'Error al registrar usuario' });
    }
});

app.get('/inicio', (req, res) => {
    res.render('inicio');
});

app.get('/cerrar-sesion', (req, res) => {
    req.session.destroy(() => res.redirect('/inicio'));
});

/* =====================================================================
   TRÁMITES: formulario, seguimiento, nuevo, continuar y reporte
   ===================================================================== */

app.get('/tramite', requiereLogin, async (req, res) => {
    let datos = { tramite: null };

    try {
        if (req.session.tramiteActivo) {
            const completo = await cargarTramiteCompleto(req.session.tramiteActivo, req.session.usuario.id);

            if (completo) {
                // Un trámite completado también se abre para poder editarlo
                datos = completo;
            } else {
                req.session.tramiteActivo = null;
            }
        }
    } catch (err) {
        console.error('Error al cargar trámite:', err);
    }

    // Se escapa "<" para que ningún texto capturado pueda cerrar el <script>
    const datosJSON = JSON.stringify(datos).replace(/</g, '\\u003c');
    res.render('tramite', { datosJSON: datosJSON });
});

// Empieza un trámite NUEVO (antes no había forma y siempre se reabría el mismo)
app.get('/nuevo-tramite', requiereLogin, async (req, res) => {
    try {
        req.session.tramiteActivo = null;
        await pool.query(
            'UPDATE usuarios SET tramite_divorcio_activo_id = NULL WHERE id = ?',
            [req.session.usuario.id]
        );
    } catch (err) {
        console.error('Error al crear nuevo trámite:', err);
    }
    res.redirect('/tramite');
});

app.get('/seguimiento', requiereLogin, async (req, res) => {
    try {
        const [tramites] = await pool.query(
            'SELECT * FROM tramites WHERE usuario_id = ? ORDER BY fecha_inicio DESC',
            [req.session.usuario.id]
        );

        const lista = tramites.map(t => Object.assign({}, t, {
            etapa_texto: ETAPAS_TEXTO[t.etapa_actual] || ('Paso ' + t.etapa_actual),
            tipo_texto: etiqueta('tipoDivorcio', t.tipo_divorcio)
        }));

        res.render('seguimiento', { tramites: lista });
    } catch (err) {
        console.error('Error al cargar trámites:', err);
        res.render('seguimiento', { tramites: [] });
    }
});

app.get('/continuar-tramite/:id', requiereLogin, async (req, res) => {
    const tramiteId = parseInt(req.params.id);

    try {
        const [tramites] = await pool.query(
            'SELECT id FROM tramites WHERE id = ? AND usuario_id = ?',
            [tramiteId, req.session.usuario.id]
        );

        if (tramites.length === 0) {
            return res.redirect('/seguimiento');
        }

        req.session.tramiteActivo = tramiteId;

        await pool.query(
            'UPDATE usuarios SET tramite_divorcio_activo_id = ? WHERE id = ?',
            [tramiteId, req.session.usuario.id]
        );

        res.redirect('/tramite');
    } catch (err) {
        console.error('Error al continuar trámite:', err);
        res.redirect('/seguimiento');
    }
});

app.get('/reporte/:id', requiereLogin, async (req, res) => {
    const tramiteId = parseInt(req.params.id);

    try {
        const d = await cargarTramiteCompleto(tramiteId, req.session.usuario.id);

        if (!d) {
            return res.redirect('/seguimiento');
        }

        res.render('reporte', {
            d: d,
            tramite: d.tramite,
            et: etiqueta,
            lista: listaDe,
            sn: siNo,
            fecha: fmtFecha,
            etapaTexto: ETAPAS_TEXTO[d.tramite.etapa_actual] || ''
        });
    } catch (err) {
        console.error('Error al generar reporte:', err);
        res.redirect('/seguimiento');
    }
});

/* =====================================================================
   GUARDADO DE ETAPAS
   ===================================================================== */

app.post('/guardar-etapa0', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    const b = req.body;

    if (!b.tipoDivorcio) {
        return res.status(400).json({ error: 'Selecciona el tipo de divorcio' });
    }

    try {
        let tramiteId = req.session.tramiteActivo;

        if (tramiteId) {
            const [verificar] = await pool.query(
                'SELECT id FROM tramites WHERE id = ? AND usuario_id = ?',
                [tramiteId, req.session.usuario.id]
            );

            if (verificar.length === 0) {
                tramiteId = null;
                req.session.tramiteActivo = null;
            }
        }

        if (!tramiteId) {
            const folio = await generarFolio();

            const [result] = await pool.query(
                'INSERT INTO tramites (folio, usuario_id, tipo_divorcio, estado, etapa_actual, fecha_inicio) VALUES (?, ?, ?, ?, ?, NOW())',
                [folio, req.session.usuario.id, b.tipoDivorcio, 'en_proceso', 0]
            );

            tramiteId = result.insertId;
            req.session.tramiteActivo = tramiteId;

            await pool.query(
                'UPDATE usuarios SET tramite_divorcio_activo_id = ? WHERE id = ?',
                [tramiteId, req.session.usuario.id]
            );
        } else {
            await pool.query(
                'UPDATE tramites SET tipo_divorcio = ?, fecha_ultima_actualizacion = NOW() WHERE id = ?',
                [b.tipoDivorcio, tramiteId]
            );
        }

        await guardarConPatron('etapa0_datos_matrimonio', {
            tipo_matrimonio: txt(b.tipoMatrimonio),
            regimen_bienes: txt(b.regimenBienes),
            codigo_postal: txt(b.codigoPostal),
            tiene_hijos: triBool(b.tieneHijos),
            cantidad_hijos: b.cantidadHijos ? parseInt(b.cantidadHijos) : null,
            edades_hijos: json(b.edadesHijos),
            tiene_bienes: triBool(b.tieneBienes),
            bienes_seleccionados: json(b.bienesSeleccionados),
            bienes_otros: txt(b.bienesOtros),
            requisitos_seleccionados: json(b.requisitosSeleccionados),
            convenio: b.convenio ? JSON.stringify(b.convenio) : null
        }, tramiteId);

        if (b._sinAvance) await tocar(tramiteId); else await avanzar(tramiteId, 1);

        res.json({ ok: true, tramiteId: tramiteId });
    } catch (err) {
        console.error('Error al guardar Etapa 0:', err);
        res.status(500).json({ error: err.message });
    }
});

// Crea una ruta de guardado: mapear(body) -> { columna: valor }
function rutaGuardar(ruta, tabla, paso, mapear, despues) {
    app.post(ruta, requiereTramite, async (req, res) => {
        const tramiteId = req.session.tramiteActivo;
        try {
            // _sinAvance = el usuario solo guardó/volvió atrás: no se marca el paso como completado
            const conAvance = !req.body._sinAvance;
            await guardarConPatron(tabla, mapear(req.body), tramiteId);
            if (conAvance) await avanzar(tramiteId, paso); else await tocar(tramiteId);
            if (despues) await despues(req.body, tramiteId, conAvance);
            res.json({ ok: true, tramiteId: tramiteId });
        } catch (err) {
            console.error('Error al guardar en ' + tabla + ':', err);
            res.status(500).json({ error: err.message });
        }
    });
}

rutaGuardar('/guardar-etapa1-demanda', 'etapa1_demanda', 2,
    b => ({
        autoridad_competente: bool(b.autoridadCompetente),
        datos_actor: bool(b.datosActor),
        representacion: bool(b.representacion),
        datos_demandado: bool(b.datosDemandado),
        prestaciones_seleccionadas: json(b.prestaciones),
        prestaciones_otros: txt(b.prestacionesOtros),
        hechos: bool(b.hechos),
        fundamentos: bool(b.fundamentos),
        valor_demandado: bool(b.valorDemandado),
        pruebas_seleccionadas: json(b.pruebas),
        pruebas_otros: txt(b.pruebasOtros),
        firma_fecha: bool(b.firmaFecha),
        fecha_presentacion_demanda: txt(b.fechaPresentacionDemanda),
        vista_mp: bool(b.vistaMP)
    }),
    async (b, tramiteId) => {
        await pool.query(
            'UPDATE tramites SET fecha_presentacion = ? WHERE id = ?',
            [txt(b.fechaPresentacionDemanda), tramiteId]
        );
    }
);

rutaGuardar('/guardar-etapa1-medidas', 'etapa1_medidas', 3,
    b => {
        const m = b.medidas || [];
        return {
            separacion: bool(m.includes('separacion')),
            alimentos: bool(m.includes('alimentos')),
            custodia: bool(m.includes('custodia')),
            embarazo: bool(m.includes('embarazo')),
            resguardo_personal: bool(m.includes('resguardo_personal')),
            resguardo_bienes: bool(m.includes('resguardo_bienes'))
        };
    }
);

rutaGuardar('/guardar-etapa1-admision', 'etapa1_admision', 4,
    b => ({
        resolucion: txt(b.resolucionAdmision),
        medidas_admitidas: bool(b.medidasAdmitidas),
        tipo_prevencion: json(b.tipoPrevencion),
        correccion_prevencion: txt(b.correccionPrevencion)
    })
);

rutaGuardar('/guardar-etapa1-emplazamiento', 'etapa1_emplazamiento', 5,
    b => ({
        tipo_emplazamiento: txt(b.tipoEmplazamiento),
        domicilio_demandado: bool(b.domicilioDemandado),
        copias_entregadas: bool(b.copiasEntregadas)
    })
);

rutaGuardar('/guardar-etapa1-contestacion', 'etapa1_contestacion', 6,
    b => ({
        contesto: triBool(b.contesto),
        reconvencion: triBool(b.reconvencion),
        prestaciones_reconvencion: json(b.prestacionesReconvencion),
        prestaciones_reconvencion_otros: txt(b.prestacionesReconvencionOtros)
    })
);

rutaGuardar('/guardar-etapa2-junta', 'etapa2_junta_anticipada', 7,
    b => ({
        intercambio_pruebas: txt(b.intercambioPruebas),
        propuesta_convenio: txt(b.propuestaConvenio),
        acuerdos_hechos: txt(b.acuerdosHechos),
        acuerdos_pruebas: txt(b.acuerdosPruebas)
    })
);

rutaGuardar('/guardar-etapa2-audiencia', 'etapa2_audiencia_autoridad', 8,
    b => ({
        prestaciones_admitidas: json(b.prestacionesAdmitidas),
        prestaciones_contestacion: json(b.prestacionesContestacion),
        definicion_procedimiento: txt(b.definicionProcedimiento),
        hubo_conciliacion: triBool(b.huboConciliacion),
        requisitos_convenio: json(b.reqConv),
        revision_acuerdos: txt(b.revisionAcuerdos),
        fecha_audiencia_juicio: txt(b.fechaAudienciaJuicio)
    })
);

rutaGuardar('/guardar-etapa3-apertura', 'etapa3_alegatos_apertura', 9,
    b => ({ descripcion: txt(b.alegatosApertura) })
);

rutaGuardar('/guardar-etapa3-desahogo', 'etapa3_desahogo_pruebas', 10,
    b => ({ descripcion: txt(b.desahogoPruebas) })
);

rutaGuardar('/guardar-etapa3-cierre', 'etapa3_alegatos_cierre', 11,
    b => ({ descripcion: txt(b.alegatosCierre) })
);

rutaGuardar('/guardar-etapa3-sentencia', 'etapa3_sentencia', 12,
    b => ({
        sentencia: uno(b.sentencia),
        hubo_apelacion: triBool(b.huboApelacion),
        detalle_apelacion: txt(b.detalleApelacion)
    })
);

rutaGuardar('/guardar-etapa4-inscripcion', 'etapa4_inscripcion', 13,
    b => ({ inscripcion: uno(b.inscripcion) }),
    async (b, tramiteId, conAvance) => {
        if (!conAvance) return; // solo se completa al pulsar "Finalizar trámite"
        await pool.query(
            "UPDATE tramites SET estado = 'completado' WHERE id = ?",
            [tramiteId]
        );
    }
);

// Reajustes de plazos (antes nunca se guardaban)
const PLAZOS = {
    '3': { etapa: 1, paso: 3 },
    '5': { etapa: 1, paso: 5 },
    'etapa2': { etapa: 2, paso: 0 },
    'etapa3': { etapa: 3, paso: 0 }
};

app.post('/guardar-reajuste', requiereTramite, async (req, res) => {
    const tramiteId = req.session.tramiteActivo;
    const { tipoPlazo, motivo, fechaNueva, fechaAnterior } = req.body;
    const plazo = PLAZOS[tipoPlazo];

    if (!plazo || !motivo || !fechaNueva) {
        return res.status(400).json({ error: 'Datos de reajuste incompletos' });
    }

    try {
        await pool.query(
            'DELETE FROM reajustes WHERE tramite_id = ? AND tipo_plazo = ?',
            [tramiteId, tipoPlazo]
        );
        await pool.query(
            'INSERT INTO reajustes (tramite_id, etapa, paso, tipo_plazo, fecha_anterior, fecha_nueva, motivo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [tramiteId, plazo.etapa, plazo.paso, tipoPlazo, txt(fechaAnterior), fechaNueva, String(motivo).substring(0, 200)]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error('Error al guardar reajuste:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});
