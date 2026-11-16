// Confere se a placa de referência do roteiro NE555 é eletricamente coerente com o esquema.
// Rode com: node --test testes/ne555-layout.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { PLACA, PADS, TRILHAS } = require('../ferramentas/ne555-layout.js');

// Netlist do esquema (fonte da verdade)
const NETLIST = {
    '+5V': ['J1.1', 'R1.1', 'U1.4', 'U1.8'],
    GND: ['J1.2', 'U1.1', 'C1.2', 'C2.2', 'LED1.2'],
    DIS: ['R1.2', 'R2.1', 'U1.7'],
    THR: ['R2.2', 'U1.2', 'U1.6', 'C1.1'],
    CTRL: ['U1.5', 'C2.1'],
    OUT: ['U1.3', 'R3.1'],
    LED_A: ['R3.2', 'LED1.1']
};

const id = (p) => `${p.ref}.${p.pino}`;
const segmentos = (t) => t.pontos.slice(1).map((b, i) => [t.pontos[i], b]);
function distPontoSegmento([px, py], [[ax, ay], [bx, by]]) {
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

test('cada pad pertence à rede indicada no esquema', () => {
    const redePorPad = Object.fromEntries(Object.entries(NETLIST).flatMap(([rede, pads]) => pads.map((p) => [p, rede])));
    assert.equal(PADS.length, Object.keys(redePorPad).length);
    PADS.forEach((p) => assert.equal(p.rede, redePorPad[id(p)], `${id(p)} deveria estar em ${redePorPad[id(p)]}`));
});

test('as trilhas ligam todos os pads de cada rede (sem conexão pendente)', () => {
    // União-busca: nós = pads e trilhas; pads THT ligam as duas camadas.
    const pai = new Map();
    const achar = (x) => (pai.get(x) === x ? x : (pai.set(x, achar(pai.get(x))), pai.get(x)));
    const unir = (a, b) => pai.set(achar(a), achar(b));
    PADS.forEach((p) => pai.set(id(p), id(p)));
    TRILHAS.forEach((t, i) => pai.set(`T${i}`, `T${i}`));

    TRILHAS.forEach((t, i) => {
        PADS.forEach((p) => {
            const toca = segmentos(t).some((s) => distPontoSegmento([p.x, p.y], s) < 0.05);
            if (toca) unir(`T${i}`, id(p));
        });
        // ramificação: ponta de uma trilha sobre outra trilha da mesma camada
        TRILHAS.forEach((u, j) => {
            if (i === j || u.camada !== t.camada) return;
            const pontas = [t.pontos[0], t.pontos[t.pontos.length - 1]];
            if (pontas.some((pt) => segmentos(u).some((s) => distPontoSegmento(pt, s) < 0.05))) unir(`T${i}`, `T${j}`);
        });
    });

    Object.entries(NETLIST).forEach(([rede, pads]) => {
        const raizes = new Set(pads.map(achar));
        assert.equal(raizes.size, 1, `rede ${rede} não está totalmente ligada`);
    });
    const raizesRedes = Object.values(NETLIST).map((pads) => achar(pads[0]));
    assert.equal(new Set(raizesRedes).size, raizesRedes.length, 'duas redes diferentes estão em curto');
});

test('nenhuma trilha passa sobre pad de outra rede (folga mínima 0,2 mm)', () => {
    TRILHAS.forEach((t) => {
        PADS.filter((p) => p.rede !== t.rede).forEach((p) => {
            const d = Math.min(...segmentos(t).map((s) => distPontoSegmento([p.x, p.y], s)));
            assert.ok(d - p.diametro / 2 - t.largura / 2 >= 0.2, `trilha ${t.rede} muito perto de ${id(p)} (${d.toFixed(2)} mm)`);
        });
    });
});

test('trilhas da mesma camada e redes diferentes não se cruzam', () => {
    const cruzam = ([[a, b], [c, d]], [[e, f], [g, h]]) => {
        const o = (px, py, qx, qy, rx, ry) => Math.sign((qx - px) * (ry - py) - (qy - py) * (rx - px));
        return o(a, b, c, d, e, f) * o(a, b, c, d, g, h) < 0 && o(e, f, g, h, a, b) * o(e, f, g, h, c, d) < 0;
    };
    TRILHAS.forEach((t, i) => TRILHAS.forEach((u, j) => {
        if (j <= i || t.camada !== u.camada || t.rede === u.rede) return;
        segmentos(t).forEach((s) => segmentos(u).forEach((v) => assert.ok(!cruzam(s, v), `${t.rede} cruza ${u.rede} na camada ${t.camada}`)));
    }));
});

test('tudo cabe dentro da placa de 65 × 45 mm', () => {
    PADS.forEach((p) => assert.ok(p.x > 1 && p.x < PLACA.largura - 1 && p.y > 1 && p.y < PLACA.altura - 1, id(p)));
});
