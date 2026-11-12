import { Bell, CalendarClock, Check, Download, Handshake, MessageCircle, RotateCcw, Smartphone, Wallet } from 'lucide-react';
import { useState } from 'react';
import { fleetPrice } from '../lib/finance';
import { brl } from '../lib/format';
import { useStore } from '../lib/store';

const ROADMAP = [
  { icon: Wallet, title: 'Cobrança automática', text: 'Boleto e Pix com lembrete por e-mail e WhatsApp (integração Asaas).' },
  { icon: MessageCircle, title: 'KM pelo WhatsApp', text: 'O locatário responde a quilometragem e a revisão é agendada sozinha.' },
  { icon: CalendarClock, title: 'Agenda com a oficina', text: 'Marque a revisão direto com o mecânico parceiro.' },
  { icon: Bell, title: 'Alertas de vencimento', text: 'Notificação antes de cada parcela, IPVA e seguro.' },
  { icon: Smartphone, title: 'App Android e iOS', text: 'A mesma experiência, instalada no celular.' },
];

export function Plans() {
  const { state, dispatch } = useStore();
  const [cars, setCars] = useState(Math.max(1, state.vehicles.filter((v) => v.ws === 'frota').length));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'luckyzortsfinance-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1>Planos</h1>
          <p className="muted small">Controle financeiro de verdade, com preço que cabe no bolso.</p>
        </div>
      </div>

      <section className="plan">
        <div className="plan-head">
          <span className="plan-name">Pessoal</span>
          <div className="plan-price">{brl(50)}<small>/mês</small></div>
        </div>
        <ul>
          <li><Check size={15} /> Orçamento da casa e do carro no mesmo lugar</li>
          <li><Check size={15} /> Parcelas e contas fixas projetadas nos próximos meses</li>
          <li><Check size={15} /> Termômetro de comprometimento da renda</li>
        </ul>
      </section>

      <section className="plan featured">
        <span className="plan-badge">Mais vendido</span>
        <div className="plan-head">
          <span className="plan-name">Frota</span>
          <div className="plan-price">{brl(fleetPrice(cars))}<small>/mês</small></div>
        </div>
        <p className="small">{brl(100)} com 1 veículo incluso + {brl(50)} por veículo adicional.</p>
        <div className="calc">
          <div className="row-between small"><span>Veículos</span><strong>{cars}</strong></div>
          <input type="range" min={1} max={50} value={cars} onChange={(e) => setCars(Number(e.target.value))} aria-label="Quantidade de veículos" />
        </div>
        <ul>
          <li><Check size={15} /> Locadoras e empresas com carros de serviço</li>
          <li><Check size={15} /> Resultado por veículo e por locatário</li>
          <li><Check size={15} /> Controle de KM e revisões</li>
          <li><Check size={15} /> Cobrança e pedido de KM pelo WhatsApp</li>
        </ul>
      </section>

      <section className="plan">
        <div className="plan-head">
          <span className="plan-name"><Handshake size={16} /> Gestão + Assessoria</span>
          <div className="plan-price small-price">Sob consulta</div>
        </div>
        <p className="small muted">A gente opera a plataforma junto com você: cadastro, cobranças e relatórios mensais.</p>
      </section>

      <h3 className="section-title">Em breve</h3>
      <div className="roadmap">
        {ROADMAP.map(({ icon: Icon, title, text }) => (
          <div key={title} className="road-item">
            <span className="road-icon"><Icon size={18} /></span>
            <div><strong>{title}</strong><p className="small muted">{text}</p></div>
          </div>
        ))}
      </div>

      <h3 className="section-title">Seus dados</h3>
      <div className="card soft">
        <p className="small muted">Neste MVP tudo fica salvo só neste navegador.</p>
        <div className="btn-grid">
          <button className="btn btn-ghost" onClick={exportJson}><Download size={16} /> Exportar backup</button>
          <button className="btn btn-ghost" onClick={() => { if (confirm('Restaurar os dados de exemplo? Suas alterações serão perdidas.')) dispatch({ type: 'reset' }); }}>
            <RotateCcw size={16} /> Dados de exemplo
          </button>
        </div>
      </div>
      <p className="footer-note">luckyzortsfinance · MVP v0.1</p>
    </div>
  );
}
