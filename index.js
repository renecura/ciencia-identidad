
import QrScanner from './qr-scanner/qr-scanner.min.js';

const videoElem = document.getElementById('scanner');

QrScanner.WORKER_PATH = 'qr-scanner/qr-scanner-worker.min.js';

const qrScanner = new QrScanner(videoElem, procesar);

console.log(qrScanner);

const silueta_screen = document.getElementById('silueta-screen');
const scanner_screen = document.getElementById('scanner-screen');
const video_screen = document.getElementById('video-screen');

document.getElementById('btn-buscar')
    .addEventListener('click', screen_scanner);
document.getElementById('btn-stop-buscar')
    .addEventListener('click', btn_stop_buscar);
document.getElementById('btn-video-volver')
    .addEventListener('click', screen_silueta);

const video = document.getElementById('video');

const piezas = {
    'CI01': 'adn',
    'CI02': 'contacto-abuelas',
    'CI03': 'dictadura',
    'CI04': 'eaaf',
    'CI05': 'enemigo',
    'CI06': 'huesos-largos',
    'CI07': 'pelvis',
    'CI08': 'siluetazo',
}

const shortened = {
    'https://qrco.de/bcS3qY':'CI01',
    'https://qrco.de/bcS3x8':'CI02',
    'https://qrco.de/bcS40t':'CI03',
    'https://qrco.de/bcS4JG':'CI04',
    'https://qrco.de/bcS4OW':'CI05',
    'https://qrco.de/bcS4Zh':'CI06',
    'https://qrco.de/bcS4fp':'CI07',
    'https://qrco.de/bcS4jD':'CI08',
}


const videos = {
    'CI01': 'svE0SWQ9gJU',
    'CI02': 'ONKQDFwvbGw',
    'CI03': 'VORn8jGAQUw',
    'CI04': 'R_UT34S4NCE',
    'CI05': 'P-NGmeC2xNI',
    'CI06': '9g1AhXMbKGg',
    'CI07': 'l268x3aiCak',
    'CI08': '5_pT7ulCCug',
}

const piezas_reveladas = [];

function revelar_piezas(piezas_reveladas) {
    for (const pieza of piezas_reveladas) {
        document.getElementById(`silueta-${pieza}`).hidden = true;
        document.getElementById(`completa-${pieza}`).hidden = false;
    }
}


function setup() {
    console.log("Setup");
    screen_silueta();
}

function screen_silueta() {
    video_screen.hidden = true;
    scanner_screen.hidden = true;
    //video.pause();
    video.src = '';

    revelar_piezas(piezas_reveladas);
    silueta_screen.hidden = false;
}

function screen_scanner() {
    silueta_screen.hidden = true;
    video_screen.hidden = true;

    qrScanner.start();
    scanner_screen.hidden = false;
}

function screen_video(codigo) {
    silueta_screen.hidden = true;
    scanner_screen.hidden = true;

    // console.log(`videos/${piezas[codigo]}.mp4`);
    // video.src = `videos/${piezas[codigo]}.mp4`;
    video.src = `https://www.youtube.com/embed/${videos[codigo]}`;

    // openFullscreen();
    //video.play();

    video_screen.hidden = false;
}

function btn_stop_buscar() {
    qrScanner.stop();
    screen_silueta();
}

function openFullscreen() {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) { /* Safari */
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) { /* IE11 */
        video.msRequestFullscreen();
    }
}

function procesar(result) {

    const rex = /.*\?(.*)/
    const urlParams = new URLSearchParams(result.replace(rex, '$1'));
    let codigo = urlParams.get('codigo');

    if (shortened.hasOwnProperty(result)) {
        console.log("URl acortada detectada: ", result);
        codigo = shortened[result];
    }

    if (!codigo) {
        console.log("Searching...");
        return;
    }

    console.log('QR detectado: ', codigo);

    if (!piezas.hasOwnProperty(codigo)) {
        console.log("Piezas inválida...");
        return;
    }

    // Encontró una pieza

    qrScanner.stop();

    piezas_reveladas.push(codigo);

    screen_video(codigo);

}



setup();