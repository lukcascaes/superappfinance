import { addMonths, occurrences, summarize } from '../lib/finance';
import { brl, compact, shortMonth } from '../lib/format';
import { useStore } from '../lib/store';

/** 6-month cash flow: 2 months back, current, 3 projected. */
export function FlowChart() {
  const { state, dispatch } = useStore();
  const months = [-2, -1, 0, 1, 2, 3].map((n) => addMonths(state.month, n));
  const data = months.map((m) => ({ m, ...summarize(occurrences(state, m)) }));
  const max = Math.max(1, ...data.flatMap((d) => [d.inc, d.out]));

  return (
    <div className="flow">
      <div className="flow-legend">
        <span><i className="dot in" /> Entradas</span>
        <span><i className="dot out" /> Saídas</span>
      </div>
      <div className="flow-bars">
        {data.map((d, i) => (
          <button key={d.m} className={`flow-col ${d.m === state.month ? 'current' : ''} ${i > 2 ? 'proj' : ''}`}
            onClick={() => dispatch({ type: 'setMonth', month: d.m })}
            title={`${shortMonth(d.m)} — entradas ${brl(d.inc)}, saídas ${brl(d.out)}`}>
            <span className={`flow-result ${d.result >= 0 ? 'pos' : 'neg'}`}>{d.result >= 0 ? '+' : '−'}{compact(Math.abs(d.result))}</span>
            <span className="flow-pair">
              <span className="bar in" style={{ height: `${(d.inc / max) * 100}%` }} />
              <span className="bar out" style={{ height: `${(d.out / max) * 100}%` }} />
            </span>
            <span className="flow-label">{shortMonth(d.m)}</span>
          </button>
        ))}
      </div>
      <p className="flow-note">Meses à direita são projeção com base nos fixos e parcelas.</p>
    </div>
  );
}
