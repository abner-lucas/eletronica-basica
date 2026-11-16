/**
 * ROTEIRO PISCA-LED NE555 - interações da página
 * (o tema, o menu e as animações vêm de ../../script.js; os cálculos de ../../logica.js)
 */
(function () {
    'use strict';
    const E = window.Eletronica;
    const $ = (s) => document.querySelector(s);
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)');

    // Imprimir / salvar PDF
    document.querySelectorAll('[data-imprimir]').forEach((b) => b.addEventListener('click', () => window.print()));

    /* ------------------------------------------------------
       1. Oscilador astável interativo
       ------------------------------------------------------ */
    const osc = $('#oscilador');
    if (osc && E) {
        const OPCOES = {
            r1: [1e3, 4.7e3, 10e3, 22e3, 47e3],
            r2: [10e3, 22e3, 47e3, 100e3, 220e3],
            c: [1e-6, 4.7e-6, 10e-6, 22e-6, 47e-6]
        };
        const PADRAO = { r1: 10e3, r2: 100e3, c: 10e-6 };
        const sel = { r1: $('#osc-r1'), r2: $('#osc-r2'), c: $('#osc-c') };
        const unidade = { r1: 'Ω', r2: 'Ω', c: 'F' };

        Object.entries(sel).forEach(([k, s]) => {
            OPCOES[k].forEach((v) => {
                const o = document.createElement('option');
                o.value = v;
                o.textContent = E.formatar(v, unidade[k]);
                s.appendChild(o);
            });
            s.value = PADRAO[k];
            s.addEventListener('change', atualizar);
        });

        // Hz e segundos sem prefixo entre 0,01 e 1000 (0,69 Hz é mais claro que 687 mHz)
        const simples = (v, u) => (v >= 0.01 && v < 1000
            ? `${v.toLocaleString('pt-BR', { maximumSignificantDigits: 3 })} ${u}`
            : E.formatar(v, u));

        const led = $('#osc-led'), cursor = $('#osc-cursor');
        const LARG = 364, CICLOS = 3; // o restante da largura (até 420) fica para os rótulos ⅔/⅓ Vcc
        // faixas verticais do gráfico (em px do viewBox)
        const C1_ALTO = 34, C1_BAIXO = 72, OUT_ALTO = 116, OUT_BAIXO = 160;
        let t = null, inicio = performance.now(), raf = 0, visivel = true;

        function curvas(tm) {
            // tensão em C1 (normalizada 0..1 entre ⅓ e ⅔ de Vcc) e saída do pino 3, ao longo de CICLOS períodos
            const passos = 240, total = tm.periodo * CICLOS;
            const tauCarga = tm.tAlto / Math.LN2, tauDesc = tm.tBaixo / Math.LN2; // (R1+R2)C e R2·C
            let dC1 = '', dOut = '';
            for (let i = 0; i <= passos; i++) {
                const tt = (i / passos) * total, fase = tt % tm.periodo;
                let v; // em frações de Vcc
                if (fase < tm.tAlto) v = 1 - (2 / 3) * Math.exp(-fase / tauCarga);           // carrega de ⅓ rumo a Vcc
                else v = (2 / 3) * Math.exp(-(fase - tm.tAlto) / tauDesc);                   // descarrega de ⅔ rumo a 0
                const y = C1_BAIXO - ((v - 1 / 3) / (1 / 3)) * (C1_BAIXO - C1_ALTO);
                const x = (i / passos) * LARG;
                dC1 += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
            }
            for (let k = 0; k < CICLOS; k++) {
                const x0 = (k / CICLOS) * LARG, xa = x0 + (tm.tAlto / total) * LARG, x1 = ((k + 1) / CICLOS) * LARG;
                dOut += `${k ? 'L' : 'M'}${x0.toFixed(1)} ${OUT_ALTO}L${xa.toFixed(1)} ${OUT_ALTO}L${xa.toFixed(1)} ${OUT_BAIXO}L${x1.toFixed(1)} ${OUT_BAIXO}`;
                if (k < CICLOS - 1) dOut += `L${x1.toFixed(1)} ${OUT_ALTO}`;
            }
            $('#osc-c1').setAttribute('d', dC1);
            $('#osc-saida').setAttribute('d', dOut);
        }

        function atualizar() {
            const valores = { r1: +sel.r1.value, r2: +sel.r2.value, c: +sel.c.value };
            t = E.ne555Astavel(valores);
            $('#osc-f').textContent = simples(t.frequencia, 'Hz');
            $('#osc-extra').textContent = `aceso ${simples(t.tAlto, 's')} · apagado ${simples(t.tBaixo, 's')}`;
            curvas(t);
            inicio = performance.now();
            const desafio = $('#osc-desafio');
            if (valores.r2 === 47e3 && valores.r1 === 10e3 && valores.c === 10e-6) {
                desafio.textContent = `Desafio A: com R2 = 47 kΩ, f ≈ ${simples(t.frequencia, 'Hz')}. Agora explique por quê no seu relatório.`;
            } else {
                desafio.textContent = 'Desafio A: troque R2 para 47 kΩ. O LED pisca mais rápido ou mais devagar?';
            }
            if (reduzir.matches) { led.classList.add('aceso'); cursor.setAttribute('x1', 0); cursor.setAttribute('x2', 0); }
        }

        // Laço único: o mesmo relógio move o cursor do gráfico e acende o LED
        function quadro(agora) {
            const total = t.periodo * CICLOS;
            const tt = ((agora - inicio) / 1000) % total;
            const fase = tt % t.periodo;
            led.classList.toggle('aceso', fase < t.tAlto);
            const x = ((tt / total) * LARG).toFixed(1);
            cursor.setAttribute('x1', x); cursor.setAttribute('x2', x);
            raf = requestAnimationFrame(quadro);
        }
        const iniciar = () => { cancelAnimationFrame(raf); if (visivel && !reduzir.matches && !document.hidden) raf = requestAnimationFrame(quadro); };

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([e]) => { visivel = e.isIntersecting; iniciar(); }).observe(osc);
        }
        document.addEventListener('visibilitychange', iniciar);
        reduzir.addEventListener?.('change', () => { atualizar(); iniciar(); });
        atualizar();
        iniciar();
    }

    /* ------------------------------------------------------
       2. Checklist da entrega (salvo no navegador)
       ------------------------------------------------------ */
    const lista = $('#checklist');
    if (lista) {
        const ITENS = [
            'Esquema elétrico concluído e salvo',
            'Pinos e polaridades conferidos (C1, LED, pinos 2/6, 4 e 5)',
            'Footprints associados e revisados',
            'Contorno de 65 × 45 mm e componentes posicionados',
            'Todas as trilhas roteadas, sem ratlines sobrando',
            'Design Manager e DRC conferidos, erros corrigidos',
            'Imagens do esquema, da PCB e do 3D prontas para entrega'
        ];
        const CHAVE = 'ifpa_ne555_checklist_v1'; // mesma chave da versão anterior: mantém o progresso dos alunos
        let marcados = [];
        try { marcados = JSON.parse(localStorage.getItem(CHAVE) || '[]'); } catch (e) { marcados = []; }

        const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(marcados)); } catch (e) { /* sem armazenamento */ } };
        const atualizarStatus = () => {
            const feitos = ITENS.filter((_, i) => marcados[i]).length;
            $('#check-status').textContent = `${feitos} de ${ITENS.length} itens concluídos`;
            $('#check-barra').style.width = `${(feitos / ITENS.length) * 100}%`;
        };

        ITENS.forEach((texto, i) => {
            const li = document.createElement('li');
            const rotulo = document.createElement('label');
            const caixa = document.createElement('input');
            caixa.type = 'checkbox';
            caixa.checked = Boolean(marcados[i]);
            caixa.addEventListener('change', () => { marcados[i] = caixa.checked; salvar(); atualizarStatus(); });
            const span = document.createElement('span');
            span.textContent = texto;
            rotulo.append(caixa, span);
            li.appendChild(rotulo);
            lista.appendChild(li);
        });

        $('#check-limpar').addEventListener('click', () => {
            marcados = [];
            lista.querySelectorAll('input').forEach((c) => { c.checked = false; });
            try { localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ }
            atualizarStatus();
        });
        atualizarStatus();
    }
})();
