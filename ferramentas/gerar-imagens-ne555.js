/**
 * Gera as imagens do roteiro "Pisca-LED NE555" a partir do layout de referência.
 * Uso: node ferramentas/gerar-imagens-ne555.js
 * Saída: projetos/01-pisca-led-ne555/img/{esquema,pcb-topo,pcb-3d}.svg
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { PLACA, PADS, TRILHAS, COMPONENTES, TEXTOS_SERIGRAFIA } = require('./ne555-layout.js');

const SAIDA = path.join(__dirname, '..', 'projetos', '01-pisca-led-ne555', 'img');
fs.mkdirSync(SAIDA, { recursive: true });
const n = (v) => +v.toFixed(2);
const escrever = (nome, svg) => { fs.writeFileSync(path.join(SAIDA, nome), svg.replace(/\n\s+/g, '\n')); console.log('ok', nome); };

/* =====================================================================
   1) ESQUEMA (estilo do editor de esquemas do EasyEDA Std:
      fundo branco, símbolos em vermelho-escuro, fios em azul)
   ===================================================================== */
function esquema() {
    const FIO = '#1f3fa6', SIMB = '#8b0000', TXT = '#1c2333', ROT = '#0b5394';
    const fio = (d) => `<path d="${d}" fill="none" stroke="${FIO}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    const no = (x, y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${FIO}"/>`;
    const texto = (x, y, t, o = {}) => `<text x="${x}" y="${y}" fill="${o.cor || TXT}" font-size="${o.tam || 15}" font-weight="${o.peso || 600}" text-anchor="${o.ancora || 'start'}">${t}</text>`;
    const resistorV = (x, y0, y1, ref, valor, esquerda = false) => {
        const tx = esquerda ? x - 18 : x + 18, ancora = esquerda ? 'end' : 'start';
        return `<rect x="${x - 9}" y="${y0}" width="18" height="${y1 - y0}" fill="#fff" stroke="${SIMB}" stroke-width="2.2"/>
        ${texto(tx, (y0 + y1) / 2 - 3, ref, { cor: SIMB, ancora })}${texto(tx, (y0 + y1) / 2 + 15, valor, { peso: 500, ancora })}`;
    };
    const pino = (x1, y1, x2, y2, num, nome, nx, ny, ancora) => `
        <path d="M${x1} ${y1}L${x2} ${y2}" stroke="${SIMB}" stroke-width="2.2"/>
        ${texto((x1 + x2) / 2 + (y1 === y2 ? 0 : 7), (y1 + y2) / 2 + (y1 === y2 ? -5 : 4), num, { cor: SIMB, tam: 12, peso: 500, ancora: y1 === y2 ? 'middle' : 'start' })}
        ${texto(nx, ny, nome, { cor: '#5b2a2a', tam: 13, peso: 600, ancora })}`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 480" font-family="Arial, Helvetica, sans-serif" role="img" aria-labelledby="t d">
    <title id="t">Esquema elétrico do pisca-LED com NE555 em modo astável</title>
    <desc id="d">J1 alimenta +5 V e GND. R1 (10 kΩ) liga +5 V ao pino 7. R2 (100 kΩ) liga o pino 7 ao nó dos pinos 2 e 6. C1 (10 µF, positivo no nó 2/6) vai desse nó ao GND. C2 (10 nF) liga o pino 5 ao GND. Pinos 4 e 8 em +5 V, pino 1 em GND. O pino 3 aciona R3 (330 Ω) e o LED1, com o cátodo no GND.</desc>
    <defs><pattern id="g" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#d6dbe4"/></pattern>
    <marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${SIMB}"/></marker></defs>
    <rect width="720" height="480" fill="#fff"/><rect width="720" height="480" fill="url(#g)"/>

    <!-- alimentação -->
    ${fio('M120 220V60H420')}${fio('M270 60V40')}<path d="M256 40H284" stroke="${FIO}" stroke-width="3"/>${texto(270, 30, '+5V', { cor: ROT, ancora: 'middle' })}
    ${fio('M340 60V110')}${fio('M420 60V110')}
    ${fio('M120 260V420H620')}
    <path d="M270 420V436M254 436H286M260 443H280M266 450H274" stroke="${FIO}" stroke-width="2.6" fill="none"/>${texto(270, 470, 'GND', { cor: ROT, ancora: 'middle' })}
    ${no(200, 60)}${no(270, 60)}${no(340, 60)}${no(200, 420)}${no(270, 420)}${no(340, 420)}${no(420, 420)}

    <!-- J1 borne -->
    <rect x="50" y="200" width="40" height="80" fill="#fff" stroke="${SIMB}" stroke-width="2.2"/>
    ${fio('M90 220H120')}${fio('M90 260H120')}
    ${texto(70, 192, 'J1', { cor: SIMB, ancora: 'middle' })}${texto(70, 226, '1', { cor: SIMB, tam: 12, ancora: 'middle' })}${texto(70, 266, '2', { cor: SIMB, tam: 12, ancora: 'middle' })}
    ${texto(70, 300, 'borne', { tam: 12, peso: 500, ancora: 'middle' })}${texto(70, 314, '2 vias', { tam: 12, peso: 500, ancora: 'middle' })}

    <!-- R1, R2, C1 -->
    ${fio('M200 60V95')}${resistorV(200, 95, 145, 'R1', '10kΩ')}${fio('M200 145V195')}
    ${resistorV(200, 195, 235, 'R2', '100kΩ', true)}${fio('M200 235V290')}
    ${fio('M200 170H270')}${no(200, 170)}
    ${fio('M200 250H250')}${fio('M250 230V270')}${fio('M250 230H270')}${fio('M250 270H270')}${no(200, 250)}${no(250, 250)}
    <path d="M182 290H218" stroke="${SIMB}" stroke-width="3"/><rect x="182" y="299" width="36" height="6" fill="${SIMB}"/>
    ${texto(170, 288, '+', { cor: SIMB, tam: 18, ancora: 'middle' })}
    ${fio('M200 305V420')}${texto(226, 298, 'C1', { cor: SIMB })}${texto(226, 316, '10µF', { peso: 500 })}

    <!-- U1 NE555 -->
    <rect x="300" y="140" width="160" height="200" rx="3" fill="#fff8f2" stroke="${SIMB}" stroke-width="2.4"/>
    ${texto(380, 238, 'U1', { cor: SIMB, tam: 17, ancora: 'middle' })}${texto(380, 258, 'NE555', { tam: 17, ancora: 'middle' })}
    ${pino(270, 170, 300, 170, '7', 'DIS', 308, 175, 'start')}
    ${pino(270, 230, 300, 230, '6', 'THR', 308, 235, 'start')}
    ${pino(270, 270, 300, 270, '2', 'TRIG', 308, 275, 'start')}
    ${pino(340, 110, 340, 140, '8', 'VCC', 340, 158, 'middle')}
    ${pino(420, 110, 420, 140, '4', 'RST', 420, 158, 'middle')}
    ${pino(340, 340, 340, 370, '1', 'GND', 340, 330, 'middle')}
    ${pino(420, 340, 420, 370, '5', 'CV', 420, 330, 'middle')}
    ${pino(460, 230, 490, 230, '3', 'OUT', 452, 235, 'end')}

    <!-- pino 1 e C2 -->
    ${fio('M340 370V420')}${fio('M420 370V384')}
    <path d="M402 384H438M402 394H438" stroke="${SIMB}" stroke-width="3"/>${fio('M420 394V420')}
    ${texto(446, 386, 'C2', { cor: SIMB })}${texto(446, 404, '10nF', { peso: 500 })}

    <!-- saída: R3 e LED -->
    ${fio('M490 230H510')}<rect x="510" y="221" width="60" height="18" fill="#fff" stroke="${SIMB}" stroke-width="2.2"/>
    ${texto(540, 212, 'R3', { cor: SIMB, ancora: 'middle' })}${texto(540, 258, '330Ω', { peso: 500, ancora: 'middle' })}
    ${fio('M570 230H620V266')}
    <path d="M602 266H638L620 294Z" fill="#fff" stroke="${SIMB}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M602 294H638" stroke="${SIMB}" stroke-width="3"/>
    <path d="M642 270l18 -14M646 284l18 -14" stroke="${SIMB}" stroke-width="2" marker-end="url(#seta)"/>
    ${fio('M620 294V420')}
    ${texto(648, 300, 'LED1', { cor: SIMB })}${texto(648, 318, 'vermelho', { tam: 12, peso: 500 })}
    ${texto(596, 272, 'A', { cor: SIMB, tam: 12, ancora: 'end' })}${texto(596, 298, 'K', { cor: SIMB, tam: 12, ancora: 'end' })}
</svg>`;
}

/* =====================================================================
   2) PCB — vista superior no estilo do editor de PCB do EasyEDA Std
   ===================================================================== */
const COR = { fundo: '#000000', top: '#FF0000', bottom: '#0000FF', silk: '#FFCC00', contorno: '#FF00FF', pad: '#C0C0C0', furo: '#222222' };

function pcbTopo() {
    const E = 10, M = 30; // 10 px por mm, margem
    const X = (v) => n(M + v * E), Y = (v) => n(M + v * E);
    const W = PLACA.largura * E + 2 * M, H = PLACA.altura * E + 2 * M + 46;

    const trilha = (t) => `<polyline points="${t.pontos.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" fill="none" stroke="${t.camada === 'top' ? COR.top : COR.bottom}" stroke-width="${t.largura * E}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const pad = (p) => {
        const r = (p.diametro / 2) * E;
        const forma = p.quadrado
            ? `<rect x="${n(X(p.x) - r)}" y="${n(Y(p.y) - r)}" width="${2 * r}" height="${2 * r}" fill="${COR.pad}"/>`
            : `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${r}" fill="${COR.pad}"/>`;
        return `${forma}<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${(p.furo / 2) * E}" fill="${COR.furo}"/>`;
    };
    const s = (d) => `<path d="${d}" fill="none" stroke="${COR.silk}" stroke-width="2" stroke-linecap="round"/>`;
    const txt = (t, x, y, tam = 1.6, ancora = 'middle') => `<text x="${X(x)}" y="${Y(y)}" fill="${COR.silk}" font-size="${tam * E}" font-family="Arial, Helvetica, sans-serif" font-weight="700" text-anchor="${ancora}">${t}</text>`;

    let silk = '';
    for (const [ref, c] of Object.entries(COMPONENTES)) {
        if (c.tipo === 'resistor') {
            const [x0, y] = c.de, [x1] = c.ate, a = X(x0 + 2.3), b = X(x1 - 2.3);
            silk += s(`M${a} ${Y(y) - 12}H${b}V${Y(y) + 12}H${a}Z`) + s(`M${X(x0) + 10} ${Y(y)}H${a}M${b} ${Y(y)}H${X(x1) - 10}`);
        } else if (c.tipo === 'borne' || c.tipo === 'ceramico') {
            silk += s(`M${X(c.x0)} ${Y(c.y0)}H${X(c.x1)}V${Y(c.y1)}H${X(c.x0)}Z`);
        } else if (c.tipo === 'dip8') {
            const yc = Y((c.y0 + c.y1) / 2);
            silk += s(`M${X(c.x0)} ${Y(c.y0)}H${X(c.x1)}V${Y(c.y1)}H${X(c.x0)}V${yc + 10}A10 10 0 0 0 ${X(c.x0)} ${yc - 10}Z`);
        } else if (c.tipo === 'eletrolitico') {
            silk += `<circle cx="${X(c.cx)}" cy="${Y(c.cy)}" r="${(c.r + 0.3) * E}" fill="none" stroke="${COR.silk}" stroke-width="2"/>`;
            silk += s(`M${X(c.cx - 3.9)} ${Y(c.cy - 2.6)}h10m-5 -5v10`); // marca "+" (lado do pad 1)
        } else if (c.tipo === 'led') {
            const r = (c.r + 0.4) * E, xf = X(c.cx) + n(r * 0.82);
            const dy = n(Math.sqrt(r * r - (xf - X(c.cx)) ** 2));
            silk += s(`M${xf} ${Y(c.cy) - dy}A${r} ${r} 0 1 0 ${xf} ${Y(c.cy) + dy}Z`); // lado reto = cátodo
        }
        silk += txt(ref, c.rotulo[0], c.rotulo[1], 1.6);
    }
    silk += txt('+', 9.6, 17.4, 1.8) + txt('1', 26.9, 27.7, 1.3);
    TEXTOS_SERIGRAFIA.forEach((t) => { silk += txt(t.texto, t.x, t.y, t.tamanho, t.alinhar || 'middle'); });

    const furos = PLACA.furosFixacao.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="${1.6 * E}" fill="none" stroke="${COR.pad}" stroke-width="3"/><circle cx="${X(x)}" cy="${Y(y)}" r="${1.1 * E}" fill="${COR.furo}"/>`).join('');
    const legenda = [['TopLayer', COR.top], ['BottomLayer', COR.bottom], ['TopSilkLayer', COR.silk], ['BoardOutLine', COR.contorno], ['Multi-Layer (pads)', COR.pad]]
        .map(([nome, cor], i) => `<rect x="${M + i * 128}" y="${H - 30}" width="14" height="14" fill="${cor}"/><text x="${M + i * 128 + 20}" y="${H - 18}" fill="#ddd" font-size="13" font-family="Arial, Helvetica, sans-serif">${nome}</text>`).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
    <title id="t">Layout de referência da PCB do pisca-LED NE555, vista superior</title>
    <desc id="d">Placa de 65 por 45 milímetros. Borne J1 à esquerda, R1 e R2 acima do NE555, C1 abaixo à esquerda, C2 à direita do CI, R3 e LED1 à direita. Trilhas de sinal e +5 V na camada superior (vermelho); GND e a ligação entre os pinos 8 e 4 na camada inferior (azul).</desc>
    <rect width="${W}" height="${H}" fill="${COR.fundo}"/>
    <rect x="${M}" y="${M}" width="${PLACA.largura * E}" height="${PLACA.altura * E}" fill="#0b0b0b"/>
    <g opacity=".9">${TRILHAS.filter((t) => t.camada === 'bottom').map(trilha).join('')}</g>
    <g>${TRILHAS.filter((t) => t.camada === 'top').map(trilha).join('')}</g>
    ${PADS.map(pad).join('')}${furos}
    <g>${silk}</g>
    <rect x="${M}" y="${M}" width="${PLACA.largura * E}" height="${PLACA.altura * E}" fill="none" stroke="${COR.contorno}" stroke-width="2"/>
    ${legenda}
</svg>`;
}

/* =====================================================================
   3) VISTA 3D (projeção isométrica do mesmo layout)
   ===================================================================== */
function pcb3d() {
    const K = 8, OX = 380, OY = 70, C30 = Math.cos(Math.PI / 6), S30 = 0.5;
    const P = (x, y, z = 0) => [n(OX + (x - y) * C30 * K), n(OY + (x + y) * S30 * K - z * K)];
    const pts = (lista) => lista.map((p) => P(...p).join(',')).join(' ');
    const poli = (lista, cor, extra = '') => `<polygon points="${pts(lista)}" fill="${cor}" ${extra}/>`;
    const RX = (r) => n(r * Math.sqrt(1.5) * K), RY = (r) => n(r * Math.SQRT1_2 * K);

    // caixa: desenha topo e as duas faces visíveis (+x e +y)
    const caixa = (x0, x1, y0, y1, z0, z1, cor, corLado, corFrente, traco = 'rgba(0,0,0,.35)') => `
        ${poli([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], corLado, `stroke="${traco}" stroke-width=".8"`)}
        ${poli([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], corFrente, `stroke="${traco}" stroke-width=".8"`)}
        ${poli([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], cor, `stroke="${traco}" stroke-width=".8"`)}`;
    const cilindro = (cx, cy, r, z0, z1, corLado, corTopo, extraTopo = '') => {
        const [bx, by] = P(cx, cy, z0), [tx, ty] = P(cx, cy, z1), rx = RX(r), ry = RY(r);
        return `<path d="M${n(bx - rx)} ${ty}V${by}A${rx} ${ry} 0 0 0 ${n(bx + rx)} ${by}V${ty}Z" fill="${corLado}"/>
            <ellipse cx="${tx}" cy="${ty}" rx="${rx}" ry="${ry}" fill="${corTopo}"/>${extraTopo}`;
    };
    const linha = (a, b, cor = '#cfd3d6', w = 2.2) => { const [x1, y1] = P(...a), [x2, y2] = P(...b); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${cor}" stroke-width="${w}" stroke-linecap="round"/>`; };
    const textoPlano = (t, x, y, z, tam, cor) => {
        const [ex, ey] = P(0, 0, z), a = n(C30 * K), b = n(S30 * K);
        return `<text transform="matrix(${a} ${b} ${-a} ${b} ${ex} ${ey})" x="${x}" y="${y}" font-size="${tam}" fill="${cor}" font-family="Arial, Helvetica, sans-serif" font-weight="700" text-anchor="middle">${t}</text>`;
    };

    const L = PLACA.largura, A = PLACA.altura, ESP = 1.6;
    let cena = '';
    // placa: laterais e topo (máscara de solda verde)
    cena += poli([[L, 0, -ESP], [L, A, -ESP], [L, A, 0], [L, 0, 0]], '#0b4f33');
    cena += poli([[0, A, -ESP], [L, A, -ESP], [L, A, 0], [0, A, 0]], '#0e5f3d');
    cena += poli([[0, 0, 0], [L, 0, 0], [L, A, 0], [0, A, 0]], '#14804f');
    // trilhas da camada superior aparecem em relevo sob a máscara
    TRILHAS.filter((t) => t.camada === 'top').forEach((t) => {
        cena += `<polyline points="${pts(t.pontos.map(([x, y]) => [x, y, 0]))}" fill="none" stroke="#2fa266" stroke-width="${n(t.largura * K * 0.9)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
    // pads (HASL prateado) e furos de fixação
    PADS.forEach((p) => {
        const [x, y] = P(p.x, p.y, 0);
        cena += `<ellipse cx="${x}" cy="${y}" rx="${RX(0.9)}" ry="${RY(0.9)}" fill="#d9dcd6"/>`;
    });
    PLACA.furosFixacao.forEach(([fx, fy]) => {
        const [x, y] = P(fx, fy, 0);
        cena += `<ellipse cx="${x}" cy="${y}" rx="${RX(1.6)}" ry="${RY(1.6)}" fill="#d9dcd6"/><ellipse cx="${x}" cy="${y}" rx="${RX(1.1)}" ry="${RY(1.1)}" fill="#0a2a1c"/>`;
    });
    // serigrafia branca (rótulos)
    for (const [ref, c] of Object.entries(COMPONENTES)) cena += textoPlano(ref, c.rotulo[0], c.rotulo[1] + 0.6, 0.01, 1.7, '#f4f4f0');
    TEXTOS_SERIGRAFIA.slice(0, 2).forEach((t) => { cena += textoPlano(t.texto, t.x, t.y, 0.01, t.tamanho, '#f4f4f0'); });

    // componentes, do fundo para a frente (menor x+y primeiro)
    const pecas = Object.entries(COMPONENTES).map(([ref, c]) => {
        let cx, cy, svg = '';
        if (c.tipo === 'resistor') {
            const [x0, y] = c.de, [x1] = c.ate, h = 2.4, r = 1.2, zc = 2;
            cx = (x0 + x1) / 2; cy = y;
            const b0 = cx - 3.1, b1 = cx + 3.1;
            svg += linha([x0, y, 0], [x0, y, zc]) + linha([x0, y, zc], [b0, y, zc]);
            svg += caixa(b0, b1, y - r, y + r, zc - r, zc + r, '#ead3a2', '#c9ad78', '#d8bd88');
            c.cores.concat(['#c9a03a']).forEach((cor, i) => {
                const bx = i < 3 ? b0 + 0.9 + i * 1.1 : b1 - 1.2;
                svg += poli([[bx, y - r, zc + r], [bx + 0.6, y - r, zc + r], [bx + 0.6, y + r, zc + r], [bx, y + r, zc + r]], cor);
                svg += poli([[bx, y + r, zc - r], [bx + 0.6, y + r, zc - r], [bx + 0.6, y + r, zc + r], [bx, y + r, zc + r]], cor, 'opacity=".85"');
            });
            svg += linha([b1, y, zc], [x1, y, zc]) + linha([x1, y, zc], [x1, y, 0]);
        } else if (c.tipo === 'dip8') {
            cx = (c.x0 + c.x1) / 2; cy = (c.y0 + c.y1) / 2;
            PADS.filter((p) => p.ref === 'U1').forEach((p) => {
                const yb = p.y < cy ? c.y0 : c.y1;
                svg += caixa(p.x - 0.3, p.x + 0.3, Math.min(p.y, yb), Math.max(p.y, yb), 0, 1.3, '#d7dadc', '#a9adb0', '#bfc3c6', 'none');
            });
            svg += caixa(c.x0 + 0.3, c.x1 - 0.3, c.y0 + 0.2, c.y1 - 0.2, 0.6, 3.9, '#2a2e33', '#15181b', '#1d2125');
            const [nx, ny] = P(c.x0 + 1.1, cy, 3.9);
            svg += `<ellipse cx="${nx}" cy="${ny}" rx="${RX(0.7)}" ry="${RY(0.7)}" fill="#111"/>`;
            svg += textoPlano('NE555', cx + 0.6, cy + 0.7, 3.91, 2, '#e9ece6');
        } else if (c.tipo === 'eletrolitico') {
            cx = c.cx; cy = c.cy;
            svg += cilindro(c.cx, c.cy, c.r, 0.3, c.altura, '#1f2f5c', '#b9c0c9',
                (() => { const [tx, ty] = P(c.cx, c.cy, c.altura); return `<path d="M${n(tx - RX(1.6))} ${ty}H${n(tx + RX(1.6))}M${tx} ${n(ty - RY(1.6))}V${n(ty + RY(1.6))}" stroke="#7d8590" stroke-width="1.6"/>`; })());
            // faixa clara vertical do terminal negativo, voltada para o pad 2 (+y)
            const ang = [-0.45, 0.45].map((a) => [c.cx + c.r * Math.sin(a), c.cy + c.r * Math.cos(a)]);
            svg += poli([[...ang[0], 0.6], [...ang[1], 0.6], [...ang[1], c.altura - 0.3], [...ang[0], c.altura - 0.3]], '#c9ced8', 'opacity=".9"');        } else if (c.tipo === 'ceramico') {
            cx = (c.x0 + c.x1) / 2; cy = (c.y0 + c.y1) / 2;
            svg += linha([cx, c.y0 + 0.8, 0], [cx, c.y0 + 0.8, 1.6]) + linha([cx, c.y1 - 0.8, 0], [cx, c.y1 - 0.8, 1.6]);
            svg += caixa(c.x0, c.x1, c.y0, c.y1, 1.5, c.altura, '#f0b44a', '#c98c25', '#e0a23a');
        } else if (c.tipo === 'led') {
            cx = c.cx; cy = c.cy;
            svg += linha([c.cx - 1.27, c.cy, 0], [c.cx - 1.27, c.cy, 1.2]) + linha([c.cx + 1.27, c.cy, 0], [c.cx + 1.27, c.cy, 1.2]);
            svg += cilindro(c.cx, c.cy, c.r + 0.3, 1.2, 2.2, '#b81d22', '#e0393d');
            svg += cilindro(c.cx, c.cy, c.r, 2.2, c.altura - c.r, '#d9262c', '#ff5a52');
            const [tx, ty] = P(c.cx, c.cy, c.altura - c.r);
            svg += `<path d="M${n(tx - RX(c.r))} ${ty}A${RX(c.r)} ${n(c.r * K * 1.15)} 0 0 1 ${n(tx + RX(c.r))} ${ty}A${RX(c.r)} ${RY(c.r)} 0 0 1 ${n(tx - RX(c.r))} ${ty}Z" fill="#ff4a44"/>`;
            svg += `<ellipse cx="${n(tx - 5)}" cy="${n(ty - 12)}" rx="4" ry="7" fill="#ffd2cc" opacity=".7"/>`;
        } else if (c.tipo === 'borne') {
            cx = (c.x0 + c.x1) / 2; cy = (c.y0 + c.y1) / 2;
            svg += caixa(c.x0, c.x1, c.y0, c.y1, 0, c.altura, '#2f7fd0', '#1f5c9c', '#2a6fb6');
            [18.19, 23.27].forEach((py) => {
                const [sx, sy] = P(6, py, c.altura);
                svg += `<ellipse cx="${sx}" cy="${sy}" rx="${RX(1.5)}" ry="${RY(1.5)}" fill="#c7ccd1"/><path d="M${n(sx - 8)} ${n(sy + 4)}L${n(sx + 8)} ${n(sy - 4)}" stroke="#596068" stroke-width="2"/>`;
            });
            // entradas dos fios na face frontal (+x)
            [18.19, 23.27].forEach((py) => { svg += poli([[c.x1, py - 1.3, 2.2], [c.x1, py + 1.3, 2.2], [c.x1, py + 1.3, 5], [c.x1, py - 1.3, 5]], '#0f2f55'); });
        }
        return { ref, profundidade: cx + cy, svg };
    }).sort((a, b) => a.profundidade - b.profundidade);
    cena += pecas.map((p) => `<g data-ref="${p.ref}">${p.svg}</g>`).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 560" role="img" aria-labelledby="t d">
    <title id="t">Vista 3D de referência da placa do pisca-LED NE555</title>
    <desc id="d">Projeção isométrica da mesma placa: borne azul de duas vias, resistores bege com faixas de cor, NE555 em encapsulamento DIP-8 no centro, capacitor eletrolítico azul-escuro, capacitor cerâmico amarelo e LED vermelho de 5 mm.</desc>
    <defs><linearGradient id="fundo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe4e8"/><stop offset="1" stop-color="#9aa4ad"/></linearGradient></defs>
    <rect width="820" height="560" fill="url(#fundo)"/>
    <ellipse cx="410" cy="470" rx="330" ry="40" fill="#000" opacity=".12"/>
    ${cena}
</svg>`;
}

escrever('esquema.svg', esquema());
escrever('pcb-topo.svg', pcbTopo());
escrever('pcb-3d.svg', pcb3d());
