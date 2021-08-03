
import QrScanner from './qr-scanner/qr-scanner.min.js';

const videoElem = document.getElementById('scanner');

QrScanner.WORKER_PATH = 'qr-scanner/qr-scanner-worker.min.js';

const qrScanner = new QrScanner(videoElem, procesar);

console.log(qrScanner);

const castigo = 30;

const resultado = document.getElementById('resultado');
const scanear = document.getElementById('scanear');
const cancelar = document.getElementById('cancelar');

const div_scanner = document.getElementById('div_scanner');

scanear.addEventListener('click', start);
cancelar.addEventListener('click', stop);

const eleccion = document.getElementById('eleccion');
const imagen = document.getElementById('organo-imagen');
const btn_recoger = document.getElementById('recoger');
const btn_ignorar = document.getElementById('ignorar');

btn_recoger.addEventListener('click', recoger);
btn_ignorar.addEventListener('click', ignorar);


const sistemas = {
    'respiratorio': {
        'nariz': 'res-nariz.jpg',
        'faringe': 'res-faringe.jpg',
        'laringe': 'res-laringe.jpg',
        'traquea': 'res-traquea.jpg',
        'pulmones': 'res-pulmones.jpg',
        'alveolos': 'res-alveolos.jpg',
        'bronquios': 'res-bronquios.jpg',
        'diafragma': 'res-diafragma.jpg',
    },
    'digestivo': {
        'boca': 'dig-boca.jpg',
        'esofago': 'dig-esofago.jpg',
        'estomago': 'dig-estomago.jpg',
        'higado': 'dig-higado.jpg',
        'vesicula': 'dig-vesicula.jpg',
        'pancreas': 'dig-pancreas.jpg',
        'grandulas': 'res-grandulas.jpg',
    }
}

let sistema;
let inventario;
let organo;

function setup() {
    console.log("Setup");
    resultado.innerHTML = 'Seleccioná el sistema que vas a buscar';

    sistema = undefined;
    inventario = {};
    organo = undefined;

    scanear.hidden = false;
    cancelar.hidden = true;
    eleccion.hidden = true;
    div_scanner.hidden = true;

    document.getElementById("div_clock").hidden = true;

    ocultar_inventario();
}

setup();

function start() {
    qrScanner.start();
    div_scanner.hidden = false;
    scanear.hidden = true;
    cancelar.hidden = false;
}

function stop() {
    qrScanner.stop();
    div_scanner.hidden = true;
    scanear.hidden = false;
    cancelar.hidden = true;
}

function mensaje(msj) {
    resultado.innerText = msj;
}

function verificarOrgano(organo) {
    let isOrgano = false;
    for (const s of Object.keys(sistemas)) {
        isOrgano = isOrgano || (organo in sistemas[s]);
    }
    return isOrgano;
}

let elegir;
function mostrar_eleccion(organo) {
    elegir = organo;
    imagen.src = "./img/" + organo + ".jpg";
    eleccion.hidden = false;
    scanear.hidden = true;
};

function recoger() {
    console.log("Recoger", elegir);

    eleccion.hidden = true;

    // Meter en le inventario o bloquear
    if (elegir in sistema) {
        console.log("Guarda en el inventario");

        if (!(elegir in inventario)) {
            inventario[elegir] = { nombre: elegir, colocado: false, puntos: 0 };
        }

        mostrar_inventario();
        scanear.hidden = false;
    } else {
        console.log("Ese organo no es de tu sistema, bloquear");
        mensaje("Ese órgano no es de tu sistema, tu scaneo está bloqueado temporalmente.");
        
        // TODO: Poner cuenta regresiva
        document.getElementById("clock").innerText = castigo;
        document.getElementById("div_clock").hidden = false;
       
        let tiempo = castigo;
        const i = setInterval(() => {
            
            tiempo--;
            
            if(tiempo <= 0){
                // Habilita la app
                scanear.hidden = false;
                mensaje("Buscando el sistema"); // TODO: Guardar el nombre del sistema
                document.getElementById("div_clock").hidden = true;
                clearInterval(i);
            } else {
                // Actualiza el reloj
                document.getElementById("clock").innerText = tiempo;
            }
            
        }, 1000);
    }

    elegir = undefined;
}

function ignorar() {
    console.log("Ignorar", elegir);
    eleccion.hidden = true;
    elegir = undefined;
    scanear.hidden = false;

    // Nada más
}

function colocar(item) {
    scanear.hidden = true;
    organo = item;
    start();
}

function ocultar_inventario() {
    const div_inv = document.getElementById('div_inventario');
    div_inv.hidden = true;
}

function mostrar_inventario() {
    const inv = document.getElementById('inventario');

    let tab = "";
    let puntos = 0;
    for (const item of Object.keys(inventario)) {
        tab += `<tr><td>${item.charAt(0).toUpperCase() + item.slice(1)}</td><td>`;
        if (inventario[item].colocado) {
            tab += inventario[item].puntos;
            puntos += inventario[item].puntos;
        } else {
            tab += `<button id='btn_colocar_${item}' type="button" class="btn btn-dark btn-lg">Colocar</button>`;
        }
        tab += `<td></tr>`;
    }
    
    // Total de puntos.

    tab += `<tr><td><b>PUNTOS</b></td><td><b>${puntos}</b><td></tr>`;
    
    inv.innerHTML = tab;

    for (const item of Object.keys(inventario)) {
        if (!inventario[item].colocado) {
            const btn = document.getElementById(`btn_colocar_${item}`);
            btn.addEventListener('click', () => colocar(item));
        }
    }

    const div_inv = document.getElementById('div_inventario');
    div_inv.hidden = false;
}

function procesar(result) {
    if (!sistema) {
        console.log('Definiendo sistema', result);

        if (result in sistemas) {
            stop();
            sistema = sistemas[result];
            mensaje("Buscando el sistema " + result);

            mostrar_inventario();
        } else {
            mensaje("No escaneaste un sistema válido, seguí probando.");
        }

        return;
    }

    console.log('Analizando organo', result);

    if (result[0] == '@') {
        // Si tacho, agregar a inventario
        result = result.slice(1);

        // Verifica si es un órgano válido
        if (!verificarOrgano(result)) return;

        console.log('Organo encontrado', result);
        stop();

        mostrar_eleccion(result);

    } else {
        // Si poster, poner
        if (!verificarOrgano(result)) return;

        console.log('Colocando organo elegido');

        if (!organo) {
            stop();
            mensaje("Aquí se coloca un organo, primero seleccionalo de tu inventario");
            return;
        }

        if (result == organo) {
            stop();
            mensaje("¡Excelente, ese organo iba allí!");
            inventario[organo].colocado = true;
            inventario[organo].puntos += 100;
            mostrar_inventario();            
        } else {
            stop();
            mensaje("¡Ups! ¡No iba allí!");
            inventario[organo].puntos -= 10;
        }
    }
}
