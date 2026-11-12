import { ArrowRight, CarFront, Check, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '../components/ui';
import { demoState, emptyState, useStore } from '../lib/store';
import type { Workspace } from '../lib/types';

const CHOICES: { ws: Workspace; icon: typeof Wallet; title: string; text: string }[] = [
  { ws: 'pessoal', icon: Wallet, title: 'Uso pessoal', text: 'Contas da casa, cartão e os gastos do seu carro.' },
  { ws: 'frota', icon: CarFront, title: 'Tenho uma frota', text: 'Locadora ou empresa: aluguéis, parcelas e revisões por carro.' },
];

export function Onboarding() {
  const { dispatch } = useStore();
  const [ws, setWs] = useState<Workspace>('frota');

  return (
    <div className="onboarding">
      <div className="onb-hero">
        <Logo size={72} />
        <h1>Bem-vindo ao lucky<b>zorts</b></h1>
        <p>Seu dinheiro e seus carros no mesmo lugar. Como você vai usar?</p>
      </div>

      <div className="onb-choices" role="radiogroup" aria-label="Como você vai usar">
        {CHOICES.map(({ ws: id, icon: Icon, title, text }) => (
          <button key={id} role="radio" aria-checked={ws === id} className={`onb-choice ${ws === id ? 'active' : ''}`} onClick={() => setWs(id)}>
            <span className="onb-icon"><Icon size={22} /></span>
            <span className="grow">
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
            <span className="onb-check">{ws === id && <Check size={14} strokeWidth={3} />}</span>
          </button>
        ))}
      </div>

      <div className="onb-actions">
        <button className="btn btn-primary" onClick={() => dispatch({ type: 'reset', state: emptyState(ws) })}>
          Começar do zero <ArrowRight size={18} />
        </button>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'reset', state: demoState(ws) })}>
          Explorar com dados de exemplo
        </button>
        <small className="muted">Você pode trocar entre Pessoal e Frota a qualquer momento.</small>
      </div>
    </div>
  );
}
