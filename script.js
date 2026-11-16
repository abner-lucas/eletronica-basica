/**
 * PORTAL DE ELETRÔNICA BÁSICA - INTERFACE
 * Prof. Ábner Lucas · IFPA Campus Breves
 * Os cálculos ficam em logica.js (window.Eletronica); aqui só a interface.
 */
(function () {
    'use strict';

    const E = window.Eletronica;
    const $ = (sel, raiz = document) => raiz.querySelector(sel);
    const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
    const raiz = document.documentElement;

    /* ------------------------------------------------------
       1. Tema claro/escuro (persistido; transição circular)
       ------------------------------------------------------ */
    const botaoTema = $('#botao-tema');
    const sincronizarBotaoTema = () => {
        botaoTema.setAttribute('aria-pressed', String(raiz.dataset.tema === 'escuro'));
    };
    sincronizarBotaoTema();

    botaoTema.addEventListener('click', (ev) => {
        const proximo = raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro';
        const aplicar = () => {
            raiz.dataset.tema = proximo;
            sincronizarBotaoTema();
            try { localStorage.setItem('eb:tema', proximo); } catch (e) { /* navegação privada */ }
        };
        if (!document.startViewTransition || reduzir.matches) { aplicar(); return; }
        const x = ev.clientX || innerWidth - 40, y = ev.clientY || 30;
        const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        document.startViewTransition(aplicar).ready.then(() => {
            raiz.animate(
                { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
                { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' }
            );
        });
    });

    /* ------------------------------------------------------
       2. Menu móvel (abre em círculo, fecha com Esc)
       ------------------------------------------------------ */
    const botaoMenu = $('#botao-menu');
    const menu = $('#menu');
    const definirMenu = (aberto) => {
        menu.classList.toggle('aberto', aberto);
        botaoMenu.setAttribute('aria-expanded', String(aberto));
        botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        document.body.style.overflow = aberto ? 'hidden' : '';
    };
    botaoMenu.addEventListener('click', () => definirMenu(!menu.classList.contains('aberto')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => definirMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('aberto')) { definirMenu(false); botaoMenu.focus(); }
    });

    /* ------------------------------------------------------
       3. Rolagem: progresso, cabeçalho que some, seção ativa,
          transição das seções e corrente na trilha
       ------------------------------------------------------ */
    const topo = $('#topo');
    const barra = $('#progresso-barra');
    const cenas = $$('[data-cena]');
    const linksMenu = $$('a', menu);
    const secoes = linksMenu.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const trilha = $('#trilha-lista');
    const corrente = $('#trilha-corrente');
    const etapas = $$('.etapa');
    let ultimoY = scrollY, agendado = false;

    const limitar = (v) => Math.min(1, Math.max(0, v));

    function aoRolar() {
        agendado = false;
        const y = scrollY, vh = innerHeight;
        const total = document.documentElement.scrollHeight - vh;
        barra.style.transform = `scaleX(${total > 0 ? y / total : 0})`;

        // cabeçalho some ao descer e volta ao subir
        if (!menu.classList.contains('aberto')) {
            topo.classList.toggle('oculto', y > 240 && y > ultimoY + 4);
            if (y < ultimoY - 4) topo.classList.remove('oculto');
        }
        ultimoY = y;

        // seção ativa no menu
        let ativa = null;
        secoes.forEach((s) => { if (s.getBoundingClientRect().top < vh * 0.4) ativa = s; });
        linksMenu.forEach((a) => {
            const on = ativa && a.getAttribute('href') === `#${ativa.id}`;
            a.classList.toggle('ativo', !!on);
            if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });

        if (!reduzir.matches) {
            // cada seção "se abre" e termina quando o topo chega a 65% da tela
            cenas.forEach((cena) => {
                const alvo = cena.dataset.cena === 'palco' ? cena.firstElementChild : cena.firstElementChild;
                const topoCena = cena.getBoundingClientRect().top;
                const p = limitar((vh - topoCena) / (vh * 0.35));
                const palco = cena.dataset.cena === 'palco';
                const lado = palco ? 5 * (1 - p) : 2 * (1 - p);
                const raio = palco ? 32 + 24 * (1 - p) : 40 * (1 - p);
                alvo.style.clipPath = p >= 1 ? '' : `inset(${(palco ? 4 : 3) * (1 - p)}% ${lado}% 0% ${lado}% round ${raio}px)`;
                alvo.style.transform = p >= 1 ? '' : `translateY(${44 * (1 - p)}px)`;
                alvo.style.opacity = p >= 1 ? '' : String(0.65 + 0.35 * limitar(p / 0.5));
            });
        }

        // corrente percorrendo a trilha conforme a leitura
        if (trilha) {
            const r = trilha.getBoundingClientRect();
            const carga = limitar((vh * 0.6 - r.top) / r.height);
            corrente.style.setProperty('--carga', carga.toFixed(3));
            etapas.forEach((et) => {
                const meio = et.getBoundingClientRect().top + 14;
                et.classList.toggle('energizada', meio < vh * 0.6);
            });
        }
    }
    const pedirQuadro = () => { if (!agendado) { agendado = true; requestAnimationFrame(aoRolar); } };
    addEventListener('scroll', pedirQuadro, { passive: true });
    addEventListener('resize', pedirQuadro);
    aoRolar();

    /* ------------------------------------------------------
       4. Revelações: títulos palavra a palavra, etiquetas, cascatas
       ------------------------------------------------------ */
    $$('[data-palavras]').forEach((el) => {
        // preserva <em> e entidades: divide nós de texto e elementos inline
        const pedacos = [];
        el.childNodes.forEach((no) => {
            if (no.nodeType === 3) no.textContent.split(/\s+/).filter(Boolean).forEach((t) => pedacos.push(document.createTextNode(t)));
            else pedacos.push(no.cloneNode(true));
        });
        el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
        el.textContent = '';
        pedacos.forEach((p, i) => {
            const caixa = document.createElement('span');
            caixa.className = 'palavra';
            caixa.setAttribute('aria-hidden', 'true');
            const dentro = document.createElement('span');
            dentro.style.setProperty('--i', i);
            dentro.appendChild(p);
            caixa.appendChild(dentro);
            el.appendChild(caixa);
            if (i < pedacos.length - 1) el.appendChild(document.createTextNode(' '));
        });
    });
    $('.abertura-titulo')?.style.setProperty('--base', '120ms');

    $$('.diario, .chips-atividades, .bom tbody, .instrumentos, .trilha').forEach((lista) => {
        lista.classList.add('cascata');
        Array.from(lista.children).forEach((filho, i) => filho.style.setProperty('--i', i));
    });

    const revelaveis = $$('[data-palavras], .etiqueta, .cascata');
    if ('IntersectionObserver' in window && !reduzir.matches) {
        const io = new IntersectionObserver((entradas) => {
            entradas.forEach((en) => {
                if (en.isIntersecting) { en.target.classList.add('visivel'); io.unobserve(en.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        revelaveis.forEach((el) => io.observe(el));
    } else {
        revelaveis.forEach((el) => el.classList.add('visivel'));
    }

    /* ------------------------------------------------------
       5. Filtro de atividades (cursor deslizante)
       ------------------------------------------------------ */
    const seletor = $('.seletor');
    const cursor = $('.seletor-cursor');
    const opcoes = $$('.seletor-op');
    const chips = $$('.chip-ci');
    const vazio = $('#atividades-vazio');

    const moverCursor = (botao) => {
        cursor.style.width = `${botao.offsetWidth}px`;
        cursor.style.transform = `translateX(${botao.offsetLeft}px)`;
    };

    opcoes.forEach((botao, idx) => {
        botao.addEventListener('click', () => {
            opcoes.forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
            moverCursor(botao);
            const filtro = botao.dataset.filtro;
            let visiveis = 0;
            chips.forEach((c) => {
                const mostra = filtro === 'todas' || c.dataset.categoria === filtro;
                c.classList.toggle('escondido', !mostra);
                if (mostra) visiveis++;
            });
            vazio.hidden = visiveis > 0;
        });
        // setas do teclado entre as opções
        botao.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            e.preventDefault();
            const prox = opcoes[(idx + (e.key === 'ArrowRight' ? 1 : -1) + opcoes.length) % opcoes.length];
            prox.focus(); prox.click();
        });
    });
    const posicionarCursor = () => moverCursor(opcoes.find((b) => b.getAttribute('aria-pressed') === 'true'));
    posicionarCursor();
    addEventListener('resize', posicionarCursor);
    document.fonts?.ready.then(posicionarCursor);
    if (seletor) seletor.classList.add('pronto');

    /* ------------------------------------------------------
       6. Simulador: fonte + resistor + LED
       ------------------------------------------------------ */
    const sim = $('.simulador');
    if (sim && E) {
        const RESISTORES = [100, 220, 330, 470, 1000];
        const entradaV = $('#sim-v');
        const grupoR = $('#sim-r');
        let resistencia = 330;

        RESISTORES.forEach((r) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('role', 'radio');
            b.dataset.valor = r;
            b.textContent = E.formatar(r, 'Ω').replace(' ', ' ');
            grupoR.appendChild(b);
        });
        const botoesR = $$('button', grupoR);

        const MENSAGENS = {
            apagado: 'A tensão não vence a queda de ~2 V do LED: ele fica apagado.',
            fraco: 'O LED acende, mas fraco. Diminua o resistor ou aumente a tensão.',
            ideal: 'Corrente dentro do recomendado (até ~20 mA). Brilho bom e seguro.',
            excesso: 'Um pouco acima dos 20 mA recomendados para o LED.',
            queimado: 'Corrente acima de 30 mA: na bancada, este LED queimaria.'
        };

        function atualizarSim() {
            const v = parseFloat(entradaV.value);
            const c = E.circuitoLed(v, resistencia);
            sim.dataset.estado = c.estado;

            $('#sim-v-saida').textContent = `${String(v).replace('.', ',')} V`;
            entradaV.style.setProperty('--p', `${(v / 12) * 100}%`);
            entradaV.setAttribute('aria-valuetext', `${String(v).replace('.', ',')} volts`);
            $('#sim-rotulo-v').textContent = `${String(v).replace('.', ',')} V`;
            $('#sim-rotulo-r').textContent = E.formatar(resistencia, 'Ω');

            const cores = E.coresPorValor(resistencia);
            cores.forEach((nome, i) => $(`#sim-faixa-${i + 1}`).setAttribute('fill', E.corPorNome(nome).hex));

            botoesR.forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.valor) === resistencia)));
            botoesR.forEach((b) => b.tabIndex = Number(b.dataset.valor) === resistencia ? 0 : -1);

            const brilho = c.estado === 'queimado' ? 0 : c.brilho;
            $('#sim-brilho').style.opacity = (0.15 + 0.85 * brilho) * (c.corrente > 0 ? 1 : 0);
            $('#sim-brilho').style.transform = `scale(${0.6 + 0.5 * brilho})`;
            $('.led-luz', sim).style.opacity = brilho > 0 ? 0.4 + 0.6 * brilho : 0;
            $('.led-corpo', sim).style.fill = c.corrente > 0 && c.estado !== 'queimado'
                ? `color-mix(in srgb, #ff3b2f ${40 + 60 * brilho}%, #4a1c18)` : '';

            const eletrons = $('#sim-eletrons');
            eletrons.style.opacity = c.corrente > 0 && c.estado !== 'queimado' ? 1 : 0;
            // mais corrente = elétrons mais rápidos
            eletrons.style.setProperty('--vel', `${Math.max(0.35, Math.min(3, 0.025 / Math.max(c.corrente, 0.001)))}s`);

            $('#sim-i').textContent = E.formatar(c.estado === 'queimado' ? c.corrente : c.corrente, 'A');
            $('#sim-vr').textContent = E.formatar(c.tensaoResistor, 'V');
            $('#sim-pr').textContent = E.formatar(c.potenciaResistor, 'W');
            let msg = MENSAGENS[c.estado];
            if ((c.estado === 'excesso' || c.estado === 'queimado' || c.estado === 'fraco') && c.resistorIdeal) {
                msg += ` Para 20 mA, use cerca de ${E.formatar(c.resistorIdeal, 'Ω')}.`;
            }
            $('#sim-msg').textContent = msg;
        }

        entradaV.addEventListener('input', atualizarSim);
        botoesR.forEach((b, idx) => {
            b.addEventListener('click', () => { resistencia = Number(b.dataset.valor); atualizarSim(); });
            b.addEventListener('keydown', (e) => {
                const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
                if (!passo) return;
                e.preventDefault();
                const prox = botoesR[(idx + passo + botoesR.length) % botoesR.length];
                prox.focus(); prox.click();
            });
        });
        atualizarSim();
    }

    /* ------------------------------------------------------
       7. Lei de Ohm (multímetro)
       ------------------------------------------------------ */
    const form = $('#ohm-form');
    if (form && E) {
        const campos = { v: $('#ohm-v'), i: $('#ohm-i'), r: $('#ohm-r') };
        const lcd = $('#ohm-lcd');
        let ultimoCalculado = null;

        const mostrar = (rotulo, valor, extra, erro = false) => {
            $('#ohm-lcd-rotulo').textContent = rotulo;
            $('#ohm-lcd-valor').textContent = valor;
            $('#ohm-lcd-extra').textContent = extra;
            lcd.classList.toggle('erro', erro);
        };
        const limparDestaque = () => Object.values(campos).forEach((c) => c.parentElement.classList.remove('calculado'));

        Object.entries(campos).forEach(([chave, campo]) => {
            campo.addEventListener('input', () => {
                if (chave === ultimoCalculado) { ultimoCalculado = null; campo.parentElement.classList.remove('calculado'); }
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            limparDestaque();
            // o campo calculado antes é recalculado (não conta como preenchido)
            const ler = (k) => (k === ultimoCalculado ? null : E.lerValor(campos[k].value));
            try {
                const res = E.leiDeOhm({ v: ler('v'), i: ler('i'), r: ler('r') });
                const info = { v: ['tensão', res.v, 'V'], i: ['corrente', res.i, 'A'], r: ['resistência', res.r, 'Ω'] }[res.calculado];
                campos[res.calculado].value = String(Number(info[1].toPrecision(6))).replace('.', ',');
                campos[res.calculado].parentElement.classList.add('calculado');
                ultimoCalculado = res.calculado;
                mostrar(info[0], E.formatar(info[1], info[2]), `P = ${E.formatar(res.p, 'W')}`);
            } catch (erro) {
                mostrar('erro', erro.message, '', true);
            }
        });

        form.addEventListener('reset', () => {
            limparDestaque();
            ultimoCalculado = null;
            mostrar('pronto', '— — —', 'V = R × I');
        });
    }

    /* ------------------------------------------------------
       8. Código de cores (4 faixas)
       ------------------------------------------------------ */
    const selects = [1, 2, 3, 4].map((n) => $(`#sel-${n}`));
    if (selects.every(Boolean) && E) {
        const listas = [
            E.CORES.filter((c) => c.digito !== undefined),
            E.CORES.filter((c) => c.digito !== undefined),
            E.CORES,
            E.CORES.filter((c) => c.tol !== undefined)
        ];
        const padrao = ['Laranja', 'Laranja', 'Marrom', 'Dourado'];
        const rotuloMult = (m) => (m >= 1 ? E.formatar(m, '').replace(' ', '') : String(m).replace('.', ','));

        selects.forEach((sel, idx) => {
            listas[idx].forEach((cor) => {
                const op = document.createElement('option');
                op.value = cor.nome;
                const detalhe = idx < 2 ? cor.digito : idx === 2 ? `×${rotuloMult(cor.mult)}` : `±${String(cor.tol).replace('.', ',')}%`;
                op.textContent = `${cor.nome} (${detalhe})`;
                sel.appendChild(op);
            });
            sel.value = padrao[idx];
            sel.addEventListener('change', atualizarCores);
        });

        function atualizarCores() {
            const nomes = selects.map((s) => s.value);
            nomes.forEach((n, i) => $(`#faixa-${i + 1}`).setAttribute('fill', E.corPorNome(n).hex));
            const valor = E.valorPorCores(nomes[0], nomes[1], nomes[2]);
            $('#cor-valor').textContent = E.formatar(valor, 'Ω');
            $('#cor-extra').textContent = `± ${String(E.corPorNome(nomes[3]).tol).replace('.', ',')}%`;
        }
        atualizarCores();
    }
})();
