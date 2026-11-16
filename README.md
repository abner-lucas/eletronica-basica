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
├── style.css         # Estilização moderna e responsiva do Portal
├── script.js         # Filtro de atividades, circuito interativo e calculadoras
├── README.md         # Documentação geral do repositório
│
├── docs/             # Roteiros, slides, listas e apostilas em PDF
│
└── projetos/         # Páginas próprias de atividades (uma pasta por atividade)
```

---

## 🧭 Seções do Portal

| Seção | Conteúdo |
|---|---|
| **Avisos** | Mural de comunicados da turma (datas, aulas práticas, entregas). |
| **Atividades** | Práticas de laboratório, listas de exercícios e avaliações, com filtro por categoria. |
| **Materiais & PDFs** | Arquivos para download (plano da disciplina, slides, roteiros). |
| **Laboratório Virtual** | Calculadora da Lei de Ohm (com potência) e código de cores de resistores de 4 faixas. |
| **Trilha** | Etapas de conteúdo da disciplina. |

---

## ✍️ Como publicar novos conteúdos

O `index.html` traz comentários `COMO ADICIONAR...` em cada seção. Em resumo:

1. **Aviso** → copie um bloco `<article class="notice">` para o topo da lista e altere data, tipo (`notice-info`, `notice-warn`, `notice-ok`) e texto.
2. **Material (PDF)** → coloque o arquivo em `docs/` e copie um bloco `<div class="material-card">`, apontando o `href` para `./docs/NomeDoArquivo.pdf` (com o atributo `download`).
3. **Atividade** → crie `projetos/NN-nome-da-atividade/index.html` (ou use um PDF em `docs/`), copie um `<article class="project-card">` e defina `data-category` como `pratica`, `exercicio` ou `avaliacao`. Ao liberar uma atividade “Em breve”, troque o botão desabilitado por um link `btn btn-card-primary`.
4. Faça commit e push na branch `main` — o GitHub Pages atualiza o site em cerca de 1 minuto.

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
