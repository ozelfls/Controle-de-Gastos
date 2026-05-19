import antiDivida from "../packs/anti-divida.json";
import conservador from "../packs/conservador.json";
import crescimento from "../packs/crescimento.json";
import criptoModerada from "../packs/cripto-moderada.json";
import reserva from "../packs/reserva.json";
import sobrevivenciaFinanceira from "../packs/sobrevivencia-financeira.json";
import type { StrategyPack } from "../types/strategy";

export const strategyPacks = [
  conservador,
  antiDivida,
  reserva,
  criptoModerada,
  crescimento,
  sobrevivenciaFinanceira,
] satisfies StrategyPack[];
