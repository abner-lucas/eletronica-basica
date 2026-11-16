// Rode com: node --test testes/logica.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../logica.js');

test('lerValor entende vírgula, prefixos e notação 2k2', () => {
    assert.equal(E.lerValor(''), null);
    assert.equal(E.lerValor('0,02'), 0.02);
    assert.equal(E.lerValor('20m'), 0.02);
    assert.equal(E.lerValor('4,7k'), 4700);
    assert.equal(E.lerValor('2k2'), 2200);
    assert.equal(E.lerValor('9V'), 9);
    assert.ok(Number.isNaN(E.lerValor('abc')));
});

test('formatar usa prefixos de engenharia em pt-BR', () => {
    assert.equal(E.formatar(0.02121, 'A'), '21,21 mA');
    assert.equal(E.formatar(4700, 'Ω'), '4,7 kΩ');
    assert.equal(E.formatar(0, 'A'), '0 A');
});

test('leiDeOhm calcula o campo vazio e a potência', () => {
    const r = E.leiDeOhm({ v: 9, i: null, r: 330 });
    assert.equal(r.calculado, 'i');
    assert.ok(Math.abs(r.i - 0.027273) < 1e-6);
    assert.ok(Math.abs(r.p - 0.24545) < 1e-4);
    assert.ok(Math.abs(E.leiDeOhm({ v: null, i: 0.02, r: 330 }).v - 6.6) < 1e-9);
    assert.throws(() => E.leiDeOhm({ v: 9, i: 1, r: 9 }), /exatamente dois/);
    assert.throws(() => E.leiDeOhm({ v: 9, i: null, r: 0 }), /zero/);
});

test('código de cores: ida e volta', () => {
    assert.equal(E.valorPorCores('Laranja', 'Laranja', 'Marrom'), 330);
    assert.equal(E.valorPorCores('Marrom', 'Preto', 'Vermelho'), 1000);
    assert.equal(E.valorPorCores('Amarelo', 'Violeta', 'Dourado'), 4.7);
    assert.deepEqual(E.coresPorValor(330), ['Laranja', 'Laranja', 'Marrom']);
    assert.deepEqual(E.coresPorValor(1000), ['Marrom', 'Preto', 'Vermelho']);
    assert.deepEqual(E.coresPorValor(4.7), ['Amarelo', 'Violeta', 'Dourado']);
});

test('LED: com valores padrão (9 V, 330 Ω) acende de forma segura', () => {
    const c = E.circuitoLed(9, 330);
    assert.equal(c.estado, 'excesso'); // 21,2 mA: levemente acima de 20 mA
    assert.ok(c.corrente < E.LED.correnteMaxima);
    assert.equal(E.circuitoLed(9, 470).estado, 'ideal');
});

test('LED: sem resistor adequado queima; abaixo de 2 V não acende', () => {
    assert.equal(E.circuitoLed(12, 100).estado, 'queimado');
    assert.equal(E.circuitoLed(1.5, 330).estado, 'apagado');
    assert.equal(E.circuitoLed(1.5, 330).corrente, 0);
    assert.equal(E.circuitoLed(9, 350).resistorIdeal, 350);
});
