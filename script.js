/**
 * PORTAL DE ELETRÔNICA BÁSICA - SCRIPT PRINCIPAL
 * Prof. Ábner Lucas · IFPA Campus Breves
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Menu Mobile Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const aberto = navMenu.classList.toggle('active');
            menuToggle.classList.toggle('open', aberto);
            menuToggle.setAttribute('aria-expanded', String(aberto));
        });

        // Fechar menu mobile ao clicar em um link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 2. Filtro Interativo de Atividades
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 200);
                }
            });
        });
    });

    // 3. Destaque do link da navbar conforme a rolagem da página
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
                });
            }
        });
    }, { passive: true });

    // ---------------------------------------------------------
    // Utilitários: leitura e formatação de valores elétricos
    // ---------------------------------------------------------
    const PREFIXOS = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };

    // Aceita "0,02", "20m", "4,7k", "2k2", "1.5M"
    function lerValor(texto) {
        let t = String(texto).trim().replace(/\s/g, '').replace(',', '.');
        if (t === '') return null;
        t = t.replace(/(V|A|Ω|ohm)$/i, '');
        // notação 2k2 → 2.2k
        const embutido = t.match(/^(\d+)([pnuµmkKMG])(\d+)$/);
        if (embutido) t = `${embutido[1]}.${embutido[3]}${embutido[2]}`;
        const m = t.match(/^(-?\d*\.?\d+(?:e-?\d+)?)([pnuµmkKMG])?$/);
        if (!m) return NaN;
        return parseFloat(m[1]) * (m[2] ? PREFIXOS[m[2]] : 1);
    }

    // Formata com prefixo de engenharia: 0.0212 → "21,2 m"
    function formatar(valor, unidade) {
        if (!isFinite(valor)) return '—';
        if (valor === 0) return `0 ${unidade}`;
        const escalas = [
            [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''],
            [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']
        ];
        const abs = Math.abs(valor);
        const [fator, prefixo] = escalas.find(([f]) => abs >= f) || escalas[escalas.length - 1];
        const numero = (valor / fator).toLocaleString('pt-BR', { maximumSignificantDigits: 4 });
        return `${numero} ${prefixo}${unidade}`;
    }

    // 4. Circuito interativo do topo (bateria + resistor + LED)
    const circuito = document.getElementById('hero-circuit');
    const chave = document.getElementById('circuit-switch');
    const leitura = document.getElementById('readout-current');

    if (circuito && chave && leitura) {
        const TENSAO = 9, RESISTOR = 330, QUEDA_LED = 2; // LED vermelho ≈ 2 V
        const correnteLigado = (TENSAO - QUEDA_LED) / RESISTOR;

        const atualizarCircuito = (ligado) => {
            circuito.dataset.on = String(ligado);
            chave.setAttribute('aria-checked', String(ligado));
            leitura.textContent = ligado ? formatar(correnteLigado, 'A') : '0 A';
        };

        const alternar = () => atualizarCircuito(circuito.dataset.on !== 'true');

        chave.addEventListener('click', alternar);
        chave.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                alternar();
            }
        });

        atualizarCircuito(true);
    }

    // 5. Calculadora da Lei de Ohm
    const ohmForm = document.getElementById('ohm-form');
    const ohmResult = document.getElementById('ohm-result');

    if (ohmForm && ohmResult) {
        const campos = {
            v: document.getElementById('ohm-v'),
            i: document.getElementById('ohm-i'),
            r: document.getElementById('ohm-r')
        };

        const mostrar = (html, erro = false) => {
            ohmResult.innerHTML = html;
            ohmResult.classList.toggle('is-error', erro);
        };

        const limparDestaques = () => {
            Object.values(campos).forEach(c => c.parentElement.classList.remove('is-computed'));
        };

        let ultimoCalculado = null;

        // Se o aluno digitar no campo calculado, ele passa a ser um valor informado
        Object.entries(campos).forEach(([chave, campo]) => {
            campo.addEventListener('input', () => {
                if (chave === ultimoCalculado) {
                    ultimoCalculado = null;
                    campo.parentElement.classList.remove('is-computed');
                }
            });
        });

        ohmForm.addEventListener('submit', (e) => {
            e.preventDefault();
            limparDestaques();

            // O campo calculado na vez anterior é recalculado (não conta como preenchido)
            const ler = (chave) => (chave === ultimoCalculado ? null : lerValor(campos[chave].value));
            const v = ler('v');
            const i = ler('i');
            const r = ler('r');
            const valores = { v, i, r };

            if (Object.values(valores).some(x => Number.isNaN(x))) {
                mostrar('Valor inválido. Use números como 9, 0,02, 20m ou 4,7k.', true);
                return;
            }

            const preenchidos = Object.values(valores).filter(x => x !== null).length;
            if (preenchidos !== 2) {
                mostrar('Preencha exatamente dois campos e deixe vazio o que deseja calcular.', true);
                return;
            }

            let V = v, I = i, R = r, calculado;
            if (V === null) { V = R * I; calculado = 'v'; }
            else if (I === null) {
                if (R === 0) { mostrar('A resistência não pode ser zero para calcular a corrente.', true); return; }
                I = V / R; calculado = 'i';
            } else {
                if (I === 0) { mostrar('A corrente não pode ser zero para calcular a resistência.', true); return; }
                R = V / I; calculado = 'r';
            }

            const rotulos = { v: ['Tensão', V, 'V'], i: ['Corrente', I, 'A'], r: ['Resistência', R, 'Ω'] };
            const [nome, valor, unidade] = rotulos[calculado];

            campos[calculado].value = String(Number(valor.toPrecision(6))).replace('.', ',');
            campos[calculado].parentElement.classList.add('is-computed');
            ultimoCalculado = calculado;

            mostrar(
                `<span class="result-muted">${nome} =</span>` +
                `<span class="result-value">${formatar(valor, unidade)}</span>` +
                `<span class="result-muted">· Potência P = ${formatar(V * I, 'W')}</span>`
            );
        });

        ohmForm.addEventListener('reset', () => {
            limparDestaques();
            ultimoCalculado = null;
            mostrar('<span class="result-muted">O resultado aparece aqui.</span>');
        });
    }

    // 6. Código de cores de resistores (4 faixas)
    const CORES = [
        { nome: 'Preto',    hex: '#111827', digito: 0, mult: 1 },
        { nome: 'Marrom',   hex: '#92400e', digito: 1, mult: 10,   tol: 1 },
        { nome: 'Vermelho', hex: '#dc2626', digito: 2, mult: 1e2,  tol: 2 },
        { nome: 'Laranja',  hex: '#f97316', digito: 3, mult: 1e3 },
        { nome: 'Amarelo',  hex: '#facc15', digito: 4, mult: 1e4 },
        { nome: 'Verde',    hex: '#16a34a', digito: 5, mult: 1e5,  tol: 0.5 },
        { nome: 'Azul',     hex: '#2563eb', digito: 6, mult: 1e6,  tol: 0.25 },
        { nome: 'Violeta',  hex: '#7c3aed', digito: 7, mult: 1e7,  tol: 0.1 },
        { nome: 'Cinza',    hex: '#6b7280', digito: 8, mult: 1e8,  tol: 0.05 },
        { nome: 'Branco',   hex: '#f8fafc', digito: 9, mult: 1e9 },
        { nome: 'Dourado',  hex: '#d4a017',             mult: 0.1,  tol: 5 },
        { nome: 'Prateado', hex: '#c0c0c0',             mult: 0.01, tol: 10 }
    ];

    const selects = [1, 2, 3, 4].map(n => document.getElementById(`sel-${n}`));
    const faixas = [1, 2, 3, 4].map(n => document.getElementById(`band-${n}`));
    const colorResult = document.getElementById('color-result');

    if (selects.every(Boolean) && faixas.every(Boolean) && colorResult) {
        const opcoes = [
            CORES.filter(c => c.digito !== undefined),           // 1ª faixa
            CORES.filter(c => c.digito !== undefined),           // 2ª faixa
            CORES.filter(c => c.mult !== undefined),             // multiplicador
            CORES.filter(c => c.tol !== undefined)               // tolerância
        ];
        const padrao = ['Laranja', 'Laranja', 'Marrom', 'Dourado']; // 330 Ω ± 5%

        selects.forEach((sel, idx) => {
            opcoes[idx].forEach(cor => {
                const opt = document.createElement('option');
                opt.value = cor.nome;
                let detalhe = '';
                if (idx < 2) detalhe = ` (${cor.digito})`;
                else if (idx === 2) {
                    const rotulo = cor.mult >= 1
                        ? formatar(cor.mult, '').replace(' ', '')
                        : String(cor.mult).replace('.', ',');
                    detalhe = ` (×${rotulo})`;
                }
                else detalhe = ` (±${String(cor.tol).replace('.', ',')}%)`;
                opt.textContent = cor.nome + detalhe;
                sel.appendChild(opt);
            });
            sel.value = padrao[idx];
            sel.addEventListener('change', atualizarResistor);
        });

        function atualizarResistor() {
            const [c1, c2, c3, c4] = selects.map(s => CORES.find(c => c.nome === s.value));
            faixas.forEach((f, idx) => f.setAttribute('fill', [c1, c2, c3, c4][idx].hex));

            const valor = (c1.digito * 10 + c2.digito) * c3.mult;
            const tol = String(c4.tol).replace('.', ',');
            colorResult.innerHTML =
                `<span class="result-value">${formatar(Number(valor.toPrecision(3)), 'Ω')}</span>` +
                `<span class="result-muted">± ${tol}% · ${c1.nome}, ${c2.nome}, ${c3.nome}, ${c4.nome}</span>`;
        }

        atualizarResistor();
    }
});
