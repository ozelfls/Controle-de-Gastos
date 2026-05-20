# Controle de Gastos

Assistente financeiro pessoal desktop-first, offline-first e privado.

## Stack

- React + Vite + TypeScript
- TailwindCSS
- shadcn/ui como padrao de componentes
- Zustand para estado local
- Zod para validacao futura
- Recharts para graficos
- Tauri para distribuicao desktop
- SQLite local via Tauri para persistencia desktop

## Scripts

```bash
npm install
npm run dev
npm run build
npm run test
```

O modo Tauri requer Rust instalado no ambiente:

```bash
npm run tauri dev
```

## Estado atual

Primeira base do MVP:

- layout desktop com sidebar;
- dashboard inicial;
- CRUD de lancamentos com criar, editar, remover, filtros e status pago/pendente;
- tela de contas com marcacao de pagamento;
- planejamento mensal com alocacao sugerida da sobra;
- metas com progresso e aportes;
- estrategias com packs JSON ativaveis e agressividade;
- relatorios com grafico por categoria e exportacao CSV;
- indicadores financeiros calculados localmente;
- recomendacoes por engine de regras;
- packs JSON externos;
- tema escuro;
- PIN local, bloqueio automatico e ocultacao de valores sensiveis;
- backup/importacao JSON local;
- persistencia SQLite no desktop via comandos Tauri;
- fallback em armazenamento local para preview web.
