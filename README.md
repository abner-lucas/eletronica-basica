# ⚡ Portal de Eletrônica Básica

Repositório central de atividades, materiais de apoio e práticas da disciplina de **Eletrônica Básica** (Prof. Ábner Lucas · IFPA Campus Breves).

🌐 **Acesse o portal:** https://abner-lucas.github.io/eletronica-basica/

---

## 📌 Visão Geral

Este repositório serve como **material didático de consulta** e como **portal publicado via GitHub Pages**. Ao acessar a raiz do projeto, estudantes encontram os avisos da turma, as atividades, os materiais para download e um laboratório virtual com calculadoras.

---

## 📂 Estrutura do Repositório

```text
eletronica-basica/
├── index.html        # 🌟 Portal Principal da Disciplina (Raiz GitHub Pages)
├── style.css         # Visual: papel de esquema elétrico + placa de circuito, claro/escuro
├── logica.js         # Cálculos puros (Lei de Ohm, código de cores, circuito com LED)
├── script.js         # Interface: tema, menu, animações, filtro, simulador e calculadoras
├── testes/           # Testes: node --test testes/logica.test.js testes/ne555-layout.test.js
├── ferramentas/      # Layout da placa NE555 e gerador das imagens (esquema, PCB, 3D)
├── README.md         # Documentação geral do repositório
│
├── docs/             # Roteiros, slides, listas e apostilas em PDF
│
└── projetos/         # Páginas próprias de atividades (uma pasta por atividade)
    └── 01-pisca-led-ne555/   # AT-02 · roteiro no EasyEDA Std (index.html, roteiro.css, roteiro.js, img/)
```

---

## 🧭 Seções do Portal

| Seção | Conteúdo |
|---|---|
| **Abertura** | Simulador de circuito (fonte + resistor + LED): ajuste a tensão e o resistor e veja corrente, brilho e se o LED queimaria. |
| **Avisos** | Mural de comunicados da turma (datas, aulas práticas, entregas). |
| **Atividades** | Práticas de laboratório, listas de exercícios e avaliações, com filtro por categoria. |
| **Materiais & PDFs** | Arquivos para download (plano da disciplina, slides, roteiros). |
| **Laboratório Virtual** | Calculadora da Lei de Ohm (com potência) e código de cores de resistores de 4 faixas. |
| **Trilha** | Etapas de conteúdo da disciplina. |

---

## ✍️ Como publicar novos conteúdos

O `index.html` traz comentários `COMO ADICIONAR...` em cada seção. Em resumo:

1. **Aviso** → copie um `<li class="registro">` para o topo da lista e altere a data, o tipo (`data-tipo="info"`, `"prazo"` ou `"ok"`) e o texto.
2. **Material (PDF)** → coloque o arquivo em `docs/` e copie uma linha `<tr>` da tabela de materiais, com `<a class="link-baixar" href="./docs/Arquivo.pdf" download>baixar</a>`.
3. **Atividade** → crie `projetos/NN-nome/index.html` (ou use um PDF em `docs/`), copie um `<article class="chip-ci">` e defina `data-categoria` como `pratica`, `exercicio` ou `avaliacao`. Para liberar uma atividade “em breve”, remova a classe `em-breve` e o carimbo e troque o texto bloqueado por um link `botao botao-cobre`.
4. Se alterar `style.css`, `script.js` ou `logica.js`, troque o número `?v=...` nos links do `index.html` (ex.: `?v=2026.11.20`). Assim o navegador dos alunos baixa a versão nova em vez de usar a antiga guardada em cache.
5. Faça commit e push na branch `main` — o GitHub Pages atualiza o site em cerca de 1 minuto.

---

## 🔌 Roteiro AT-02 · Pisca-LED com NE555

Página: `projetos/01-pisca-led-ne555/`. As três imagens (`img/esquema.svg`, `img/pcb-topo.svg`, `img/pcb-3d.svg`) são **geradas por código** a partir de `ferramentas/ne555-layout.js`, que guarda a posição de cada pad e trilha em milímetros.

- Para mudar a placa, edite `ferramentas/ne555-layout.js` e rode `node ferramentas/gerar-imagens-ne555.js`.
- Depois rode `node --test testes/ne555-layout.test.js`: o teste confere se todas as ligações do esquema existem nas trilhas, se não há curto entre redes e se nenhuma trilha passa sobre o pad de outra rede.
- Troque o `?v=...` das imagens no HTML para os alunos não verem a versão antiga em cache.

---

## 🛠️ Conteúdos Trabalhados

- **Grandezas elétricas**: tensão, corrente, resistência e potência; unidades e prefixos.
- **Lei de Ohm e potência elétrica**.
- **Resistores**: código de cores, associações série, paralela e mista.
- **Instrumentos**: multímetro, protoboard e fontes.
- **Componentes**: capacitores, diodos, LEDs e transistores.
- **Circuitos práticos**.

---

## 🌐 Publicação no GitHub Pages

1. No repositório no GitHub, acesse **Settings** > **Pages**.
2. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
3. Clique em **Save**. A página raiz `index.html` será disponibilizada publicamente.

---

> *Material desenvolvido para fins acadêmicos e pedagógicos.*
