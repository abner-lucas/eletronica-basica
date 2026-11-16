/**
 * Layout de referência da placa "Pisca-LED NE555" (unidades em mm, origem no canto superior esquerdo).
 * É a fonte única das imagens de PCB (vista superior e 3D) e é conferido pelo teste testes/ne555-layout.test.js:
 * todas as ligações do esquema existem nas trilhas e nenhuma trilha encosta em pad de outra rede.
 *
 * Camadas como no EasyEDA Std: TopLayer (vermelho), BottomLayer (azul), TopSilkLayer (amarelo),
 * BoardOutline (magenta) e pads THT "Multi-Layer" (cinza).
 */
'use strict';

const PLACA = { largura: 65, altura: 45, furosFixacao: [[3.5, 3.5], [61.5, 3.5], [3.5, 41.5], [61.5, 41.5]] };

// DIP-8 deitado, chanfro à esquerda: pinos 1–4 embaixo (esq→dir), 5–8 em cima (dir→esq). Passo 2,54 mm; fileiras a 7,62 mm.
const U1 = { cx: 32, cy: 22 };
const xs = [-3.81, -1.27, 1.27, 3.81].map((d) => +(U1.cx + d).toFixed(2));
const yBaixo = +(U1.cy + 3.81).toFixed(2), yCima = +(U1.cy - 3.81).toFixed(2);

const PADS = [
    // ref, pino, x, y, rede, quadrado?
    ['J1', 1, 6, 18.19, '+5V', true], ['J1', 2, 6, 23.27, 'GND'],
    ['R1', 1, 18, 12, '+5V'], ['R1', 2, 28.16, 12, 'DIS'],
    ['R2', 1, 30.73, 8, 'DIS'], ['R2', 2, 40.89, 8, 'THR'],
    ['U1', 1, xs[0], yBaixo, 'GND', true], ['U1', 2, xs[1], yBaixo, 'THR'], ['U1', 3, xs[2], yBaixo, 'OUT'], ['U1', 4, xs[3], yBaixo, '+5V'],
    ['U1', 5, xs[3], yCima, 'CTRL'], ['U1', 6, xs[2], yCima, 'THR'], ['U1', 7, xs[1], yCima, 'DIS'], ['U1', 8, xs[0], yCima, '+5V'],
    ['C1', 1, 24, 31, 'THR', true], ['C1', 2, 24, 33.5, 'GND'],          // pino 1 = positivo
    ['C2', 1, 44, 18.19, 'CTRL'], ['C2', 2, 44, 23.27, 'GND'],
    ['R3', 1, 37, 31, 'OUT'], ['R3', 2, 47.16, 31, 'LED_A'],
    ['LED1', 1, 52.5, 31, 'LED_A'], ['LED1', 2, 55.04, 31, 'GND', true]   // 1 = ânodo, 2 = cátodo (pad quadrado)
].map(([ref, pino, x, y, rede, quadrado = false]) => ({ ref, pino, x, y, rede, quadrado, diametro: 1.8, furo: 0.9 }));

// Trilhas: camada, largura (mm), rede e pontos da polilinha.
const TRILHAS = [
    { camada: 'top', largura: 0.8, rede: '+5V', pontos: [[6, 18.19], [28.19, 18.19]] },
    { camada: 'top', largura: 0.8, rede: '+5V', pontos: [[18, 18.19], [18, 12]] },
    { camada: 'bottom', largura: 0.8, rede: '+5V', pontos: [[28.19, 18.19], [35.81, 25.81]] },

    { camada: 'top', largura: 0.5, rede: 'DIS', pontos: [[30.73, 8], [30.73, 18.19]] },
    { camada: 'top', largura: 0.5, rede: 'DIS', pontos: [[28.16, 12], [30.73, 12]] },

    { camada: 'top', largura: 0.5, rede: 'THR', pontos: [[40.89, 8], [40.89, 11], [33.27, 11], [33.27, 18.19]] },
    { camada: 'top', largura: 0.5, rede: 'THR', pontos: [[33.27, 18.19], [33.27, 20.5], [30.73, 23.04], [30.73, 25.81]] },
    { camada: 'top', largura: 0.5, rede: 'THR', pontos: [[30.73, 25.81], [30.73, 27.5], [27.23, 31], [24, 31]] },

    { camada: 'top', largura: 0.5, rede: 'CTRL', pontos: [[35.81, 18.19], [44, 18.19]] },
    { camada: 'top', largura: 0.5, rede: 'OUT', pontos: [[33.27, 25.81], [33.27, 28.5], [35.77, 31], [37, 31]] },
    { camada: 'top', largura: 0.5, rede: 'LED_A', pontos: [[47.16, 31], [52.5, 31]] },

    { camada: 'bottom', largura: 0.8, rede: 'GND', pontos: [[6, 23.27], [10, 27.27], [10, 38], [55.04, 38]] },
    { camada: 'bottom', largura: 0.8, rede: 'GND', pontos: [[24, 33.5], [24, 38]] },
    { camada: 'bottom', largura: 0.8, rede: 'GND', pontos: [[28.19, 25.81], [28.19, 38]] },
    { camada: 'bottom', largura: 0.8, rede: 'GND', pontos: [[44, 23.27], [44, 38]] },
    { camada: 'bottom', largura: 0.8, rede: 'GND', pontos: [[55.04, 31], [55.04, 38]] }
];

// Contornos de serigrafia (para a vista superior) e corpos (para a vista 3D).
const COMPONENTES = {
    J1: { tipo: 'borne', x0: 2.4, x1: 9.8, y0: 15.4, y1: 26.1, altura: 10, rotulo: [6, 13.6] },
    R1: { tipo: 'resistor', de: [18, 12], ate: [28.16, 12], cores: ['#7a3b12', '#1a1a1a', '#ef7a1a'], rotulo: [23.1, 9.6] },
    R2: { tipo: 'resistor', de: [30.73, 8], ate: [40.89, 8], cores: ['#7a3b12', '#1a1a1a', '#f2c418'], rotulo: [35.8, 5.6] },
    R3: { tipo: 'resistor', de: [37, 31], ate: [47.16, 31], cores: ['#ef7a1a', '#ef7a1a', '#7a3b12'], rotulo: [42.1, 35.2] },
    U1: { tipo: 'dip8', x0: 26.6, x1: 37.4, y0: 19.6, y1: 24.4, rotulo: [32, 16.2] },
    C1: { tipo: 'eletrolitico', cx: 24, cy: 32.25, r: 2.5, altura: 11, rotulo: [19, 33.4] },
    C2: { tipo: 'ceramico', x0: 43.3, x1: 44.7, y0: 17.4, y1: 24.1, altura: 6, rotulo: [47.4, 21.4] },
    LED1: { tipo: 'led', cx: 53.77, cy: 31, r: 2.5, altura: 8.6, rotulo: [53.8, 26.4] }
};

const TEXTOS_SERIGRAFIA = [
    { texto: 'PISCA-LED NE555', x: 54, y: 9.2, tamanho: 1.6 },
    { texto: 'IFPA BREVES', x: 54, y: 11.8, tamanho: 1.3 },
    { texto: '+5V', x: 1.2, y: 29.2, tamanho: 1.4, alinhar: 'start' },
    { texto: 'GND', x: 1.2, y: 31.4, tamanho: 1.4, alinhar: 'start' }
];

module.exports = { PLACA, PADS, TRILHAS, COMPONENTES, TEXTOS_SERIGRAFIA };
