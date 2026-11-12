# luckyzortsfinance

MVP do "super app das finanças": gestão de frota (locadoras e empresas com carros) e finanças pessoais no mesmo app. Web mobile-first hoje, app nativo depois.

## Rodar

```bash
npm install
npm run dev
```

## O que tem

- **Dois modos**: Pessoal e Frota, com a mesma base de lançamentos.
- **Lançamentos** únicos, mensais ou parcelados (ex.: 7x), com projeção para os próximos meses, igual à planilha copiada mês a mês.
- **Início**: sobra/falta prevista, realizado até agora, fluxo de 6 meses, contas a pagar/receber, comprometimento da renda (pessoal) e resultado por veículo (frota).
- **Frota**: placa Mercosul, locatário, KM e revisão a cada X km, cobrança e pedido de KM pelo WhatsApp.
- **Planos**: Pessoal R$ 50/mês; Frota R$ 100 com 1 veículo + R$ 50 por veículo adicional.

Os dados ficam no `localStorage` do navegador. Os dados de exemplo podem ser restaurados em Planos → Dados de exemplo.

## Stack

React 19 + TypeScript + Vite, CSS puro, ícones `lucide-react`. Deploy no GitHub Pages pelo workflow em `.github/workflows/deploy.yml`.

## Próximos passos

Backend e login, cobrança automática (Asaas), lembretes de KM via WhatsApp, agenda com oficina, empacotar como app (Capacitor).
