import { Categoria } from "./categoria";

export const CategoriaDescricoes: Record<Categoria, string> = {
  [Categoria.CATARATA]: 'Catarata',
  [Categoria.CIRURGIA_REFRATIVA]: 'Cirurgia Refrativa',
  [Categoria.CORNEA_CONJUNTIVA_E_ESCLERA]: 'Córnea, Conjuntiva e Esclera',
  [Categoria.ESTRABISMO_E_OFTALMOPEATRIA]: 'Estrabismo e Oftalmopediatria',
  [Categoria.FARMACOLOGIA]: 'Farmacologia',
  [Categoria.GLAUCOMA]: 'Glaucoma',
  [Categoria.LENTES_DE_CONTATO]: 'Lentes de Contato',
  [Categoria.OPTICA_REFRAOMETRIA_E_VISAO_SUBNORMAL]: 'Óptica, Refraometria e Visão Subnormal',
  [Categoria.PLASTICA_E_ORBITA]: 'Plástica e Órbita',
  [Categoria.RETINA]: 'Retina',
  [Categoria.UVEITE_E_ONCOLOGIA_OCULAR]: 'Uveíte e Oncologia Ocular',
};