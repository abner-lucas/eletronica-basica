/**
 * LÓGICA PURA DO PORTAL (sem DOM)
 * Funções de cálculo usadas pelo simulador e pelas calculadoras.
 * Ficam separadas da interface para poderem ser testadas com `node --test`.
 */
(function (raiz, fabrica) {
    const api = fabrica();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else raiz.Eletronica = api;
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const PREFIXOS = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };

    /**
     * Lê um valor digitado pelo aluno.
     * Aceita vírgula decimal, prefixos (20m, 4,7k, 1M) e a notação de resistores 2k2.
     * Retorna null para campo vazio e NaN para texto inválido.
     */
    function lerValor(texto) {
        let t = String(texto ?? '').trim().replace(/\s/g, '').replace(',', '.');
        if (t === '') return null;
        t = t.replace(/(V|A|Ω|ohm|ohms)$/i, '');
        const embutido = t.match(/^(\d+)([pnuµmkKMG])(\d+)$/);
        if (embutido) t = `${embutido[1]}.${embutido[3]}${embutido[2]}`;
        const m = t.match(/^(-?\d*\.?\d+(?:e-?\d+)?)([pnuµmkKMG])?$/);
        if (!m) return NaN;
        return parseFloat(m[1]) * (m[2] ? PREFIXOS[m[2]] : 1);
    }

    /** Formata com prefixo de engenharia: 0.0212 → "21,2 mA" */
    function formatar(valor, unidade = '') {
        if (!Number.isFinite(valor)) return '—';
        if (valor === 0) return `0 ${unidade}`.trim();
        const escalas = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
        const abs = Math.abs(valor);
        const [fator, prefixo] = escalas.find(([f]) => abs >= f * 0.99995) || escalas[escalas.length - 1];
        const numero = (valor / fator).toLocaleString('pt-BR', { maximumSignificantDigits: 4 });
        return `${numero} ${prefixo}${unidade}`.trim();
    }

    /**
     * Lei de Ohm: recebe {v, i, r} com exatamente um valor null e devolve o resultado.
     * Lança Error com mensagem amigável quando os dados não permitem o cálculo.
     */
    function leiDeOhm({ v = null, i = null, r = null }) {
        const valores = { v, i, r };
        if (Object.values(valores).some((x) => Number.isNaN(x))) {
            throw new Error('Valor inválido. Use números como 9, 0,02, 20m ou 4,7k.');
        }
        const vazios = Object.keys(valores).filter((k) => valores[k] === null);
        if (vazios.length !== 1) {
            throw new Error('Preencha exatamente dois campos e deixe vazio o que deseja calcular.');
        }
        let V = v, I = i, R = r;
        const calculado = vazios[0];
        if (calculado === 'v') V = R * I;
        else if (calculado === 'i') {
            if (R === 0) throw new Error('A resistência não pode ser zero para calcular a corrente.');
            I = V / R;
        } else {
            if (I === 0) throw new Error('A corrente não pode ser zero para calcular a resistência.');
            R = V / I;
        }
        return { v: V, i: I, r: R, p: V * I, calculado };
    }

    /* ---------------- Código de cores ---------------- */
    const CORES = [
        { nome: 'Preto',    hex: '#1a1a1a', digito: 0, mult: 1 },
        { nome: 'Marrom',   hex: '#7a3b12', digito: 1, mult: 10,   tol: 1 },
        { nome: 'Vermelho', hex: '#d02a22', digito: 2, mult: 1e2,  tol: 2 },
        { nome: 'Laranja',  hex: '#ef7a1a', digito: 3, mult: 1e3 },
        { nome: 'Amarelo',  hex: '#f2c418', digito: 4, mult: 1e4 },
        { nome: 'Verde',    hex: '#1f9a4b', digito: 5, mult: 1e5,  tol: 0.5 },
        { nome: 'Azul',     hex: '#2459d6', digito: 6, mult: 1e6,  tol: 0.25 },
        { nome: 'Violeta',  hex: '#7a3fd1', digito: 7, mult: 1e7,  tol: 0.1 },
        { nome: 'Cinza',    hex: '#7b7f86', digito: 8, mult: 1e8,  tol: 0.05 },
        { nome: 'Branco',   hex: '#f6f6f2', digito: 9, mult: 1e9 },
        { nome: 'Dourado',  hex: '#c9a03a',             mult: 0.1,  tol: 5 },
        { nome: 'Prateado', hex: '#b9bcc2',             mult: 0.01, tol: 10 }
    ];

    const corPorNome = (nome) => CORES.find((c) => c.nome === nome);

    /** Valor (Ω) de um resistor de 4 faixas a partir dos nomes das cores. */
    function valorPorCores(n1, n2, n3) {
        const [c1, c2, c3] = [n1, n2, n3].map(corPorNome);
        if (!c1 || !c2 || !c3 || c1.digito === undefined || c2.digito === undefined) return NaN;
        return Number(((c1.digito * 10 + c2.digito) * c3.mult).toPrecision(3));
    }

    /** Cores das três primeiras faixas para um valor com dois dígitos significativos. */
    function coresPorValor(ohms) {
        if (!(ohms > 0)) return null;
        let expoente = Math.floor(Math.log10(ohms)) - 1;
        let digitos = Math.round(ohms / 10 ** expoente);
        if (digitos === 100) { digitos = 10; expoente += 1; }
        const mult = CORES.find((c) => Math.abs(Math.log10(c.mult) - expoente) < 1e-9);
        if (!mult) return null;
        const d1 = CORES.find((c) => c.digito === Math.floor(digitos / 10));
        const d2 = CORES.find((c) => c.digito === digitos % 10);
        return [d1.nome, d2.nome, mult.nome];
    }

    /* ---------------- Circuito com LED ---------------- */
    const LED = { quedaTensao: 2, correnteNominal: 0.02, correnteMaxima: 0.03 };

    /**
     * Circuito série: fonte V, resistor R e LED vermelho (queda ≈ 2 V).
     * estado: 'apagado' | 'fraco' | 'ideal' | 'excesso' | 'queimado'
     */
    function circuitoLed(tensao, resistencia, led = LED) {
        if (!(resistencia > 0)) throw new Error('Resistência deve ser positiva.');
        const sobra = tensao - led.quedaTensao;
        const corrente = sobra > 0 ? sobra / resistencia : 0;
        const brilho = Math.min(1, corrente / led.correnteNominal);
        let estado;
        if (corrente === 0) estado = 'apagado';
        else if (corrente > led.correnteMaxima) estado = 'queimado';
        else if (corrente > led.correnteNominal * 1.05) estado = 'excesso';
        else if (corrente < led.correnteNominal * 0.25) estado = 'fraco';
        else estado = 'ideal';
        return {
            corrente,
            brilho,
            estado,
            tensaoResistor: Math.max(0, sobra),
            potenciaResistor: corrente * corrente * resistencia,
            resistorIdeal: sobra > 0 ? sobra / led.correnteNominal : null
        };
    }

    /* ---------------- NE555 em modo astável ---------------- */
    /**
     * Tempos do oscilador astável clássico (R1 entre VCC e pino 7, R2 entre 7 e 2/6, C entre 2/6 e GND).
     * tAlto = 0,693·(R1+R2)·C (LED aceso) · tBaixo = 0,693·R2·C (LED apagado) · f ≈ 1,44 / ((R1 + 2R2)·C)
     */
    function ne555Astavel({ r1, r2, c }) {
        if (!(r1 > 0) || !(r2 > 0) || !(c > 0)) throw new Error('R1, R2 e C precisam ser positivos.');
        const tAlto = Math.LN2 * (r1 + r2) * c;
        const tBaixo = Math.LN2 * r2 * c;
        const periodo = tAlto + tBaixo;
        return { tAlto, tBaixo, periodo, frequencia: 1 / periodo, cicloAtivo: tAlto / periodo };
    }

    return { lerValor, formatar, leiDeOhm, CORES, corPorNome, valorPorCores, coresPorValor, LED, circuitoLed, ne555Astavel };
});
