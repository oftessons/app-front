import { Tema } from "./tema";
import { Subtema } from "./subtema";

export const temasESubtemas: Record<Tema, Subtema[]> = {
    [Tema.CORNEA_CONJUNTIVA_E_ESCLERA]: [
        Subtema.BASES_DE_CORNEA,
        Subtema.OUTRAS_DOENCAS_DA_CONJUNTIVA,
        Subtema.OUTRAS_CERATITES,
        Subtema.ECTASIAS_CORNEANAS,
        Subtema.DEGENERACOES_CORNEANAS,
        Subtema.SINDROMES_FOLICULARES,
        Subtema.ESCLERITES_E_EPISCLERITES,
        Subtema.BANCO_DE_OLHOS_E_TRANSPLANTES_DE_CORNEA,
        Subtema.CERATITE_HERPETICA_E_HZO,
        Subtema.ALERGIA_OCULAR,
        Subtema.DISTROFIAS_DO_ESTROMA_CORNEANO,
        Subtema.TRANSPLANTES_LAMELARES,
        Subtema.CERATITES_BACTERIANAS,
        Subtema.CERATITES_FUNGICAS_E_ACANTHAMOEBA,
        Subtema.DISTROFIAS_DO_EPITELIO_CORNEANO,
        Subtema.BASES_DE_CONJUNTIVA_LIMBO_E_TENON,
        Subtema.BASES_DE_ESCLERA,
        Subtema.PUK_E_MOOREN,
        Subtema.DISTROFIAS_DO_ENDOTELIO_CORNEANO,
        Subtema.OUTRAS_DOENCAS_DA_CORNEA,
        Subtema.TRAUMA_DE_CORNEA,
    ],

    [Tema.CIRURGIA_REFRATIVA]: [
        Subtema.CIRURGIA_REFRATIVA
    ],

    [Tema.EMBRIOLOGIA]: [
        Subtema.EMBRIOLOGIA
    ],

    [Tema.RETINA]: [
        Subtema.BASES_RETINA,
        Subtema.EXAMES_DE_IMAGEM,
        Subtema.RETINOPATIA_DIABETICA,
        Subtema.DESCOLAMENTO_DE_RETINA,
        Subtema.DMRI,
        Subtema.OCLUSOES_VASCULARES,
        Subtema.OUTRAS_DOENCAS_VASCULARES,
        Subtema.DOENCAS_DA_INTERFACE_VITREORRETINIANA,
        Subtema.ESTUDOS_ELETROFISIOLOGICOS,
        Subtema.VVPP_IE_E_PNEUMATICA,
        Subtema.DISTROFIAS_DIFUSAS_DA_RETINA_E_DA_COROIDE,
        Subtema.BASES_VITREO,
        Subtema.CORIORRETINOPATIA_SEROSA_CENTRAL,
        Subtema.RETINOPATIA_FALCIFORME,
        Subtema.MIOPIA_PATOLOGICA_E_ESTRIAS_ANGIOIDES,
        Subtema.DISTROFIAS_MACULARES,
        Subtema.RETINOPATIA_HIPERTENSIVA,
        Subtema.RETINOPATIA_DA_PREMATURIDADE,
        Subtema.TRAUMA_DE_RETINA_E_COROIDE,
        Subtema.ENDOFTALMITE,
        Subtema.OPACIDADES_VITREAS,
        Subtema.ANOMALIAS_CONGENITAS,
        Subtema.OUTRAS_PATOLOGIAS_DE_RETINA,
        Subtema.MELANOMA_DE_COROIDE
    ],

    [Tema.GENETICA_OCULAR]: [
        Subtema.GENETICA_OCULAR
    ],

    [Tema.GLAUCOMA]: [
        Subtema.OUTROS_GLAUCOMAS_SECUNDARIOS,
        Subtema.GLAUCOMA_BASES,
        Subtema.TRABECULECTOMIA,
        Subtema.CAMPO_VISUAL,
        Subtema.GPAA_HO_E_GPN,
        Subtema.TERAPIA_MEDICAMENTOSA,
        Subtema.GL_PIGMENTAR_E_GL_PSEUDOEXFOLIATIVO,
        Subtema.GLAUCOMA_DE_ANGULO_FECHADO,
        Subtema.GLAUCOMA_CONGENITO_PRIMARIO,
        Subtema.NEUROCRISTOPATIAS,
        Subtema.TERAPIA_LASER_DO_GLAUCOMA,
        Subtema.GLAUCOMA_NEOVASCULAR,
        Subtema.ICE_SYNDROME,
        Subtema.GLAUCOMA_POS_TRABECULAR,
        Subtema.IMPLANTE_DE_TUBO,
        Subtema.GDX_HRT_E_OCT
    ],

    [Tema.CATARATA]: [
        Subtema.COMPLICACOES_PERIOPERATORIAS_E_POS_OPERATORIAS,
        Subtema.PRE_OPERATORIO_VISCOELASTICOS_E_ANESTESIA,
        Subtema.ALTERACOES_CONGENITAS_DO_CRISTALINO,
        Subtema.BASES_DO_CRISTALINO,
        Subtema.FATORES_DE_RISCO_E_CATARATAS_ESPECIAIS,
        Subtema.FLUIDICA_E_APARELHO_DE_FACOEMULSIFICACAO,
        Subtema.LENTES_INTRAOCULARES,
        Subtema.TECNICA_CIRURGICA
    ],

    [Tema.PLASTICA_OCULAR_E_SISTEMA_LACRIMAL]: [
        Subtema.AFECCOES_DAS_VIAS_DE_DRENAGEM,
        Subtema.BASES_DE_SISTEMA_LACRIMAL,
        Subtema.BASES_DE_PLASTICA_OCULAR,
        Subtema.PTOSE_DA_PALPEBRA_E_DO_SUPERCILIO,
        Subtema.DOENCAS_DOS_CILIOS_E_INFLAMATORIAS_DAS_PALPEBRAS,
        Subtema.TUMORES_PALPEBRAIS,
        Subtema.PROPEDEUTICA_DAS_VIAS_DE_DRENAGEM,
        Subtema.ANOMALIAS_CONGENITAS_PALPEBRAIS,
        Subtema.ENTROPIO,
        Subtema.ECTROPIO,
        Subtema.TRAUMA_E_RECONSTRUCAO_PALPEBRAL,
        Subtema.SINDROME_DE_SJOGREN,
        Subtema.BLEFAROPLASTIA,
        Subtema.SINDROME_DAS_PALPEBRAS_FROUXAS
    ],

    [Tema.UVEITE]: [
        Subtema.UVEITE_POR_TOXOPLASMOSE_SIFILIS_E_TUBERCULOSE,
        Subtema.UVEITES_VIRAIS,
        Subtema.COROIDITES_NAO_INFECCIOSAS,
        Subtema.OUTRAS_UVEITES_ANTERIORES,
        Subtema.BASES_DE_COROIDE,
        Subtema.UVEITES_NAS_ESPONDILOARTROPATIAS,
        Subtema.VOGT_KOYANAGI_HARADA_E_OFTALMIA_SIMPATICA,
        Subtema.BEHCET_E_SARCOIDOSE,
        Subtema.BASES_DE_IRIS,
        Subtema.BASES_DE_CORPO_CILIAR,
        Subtema.UVEITE_INTERMEDIARIA,
        Subtema.TOXOCARIASE_OCULAR_E_DUSN,
        Subtema.UVEITE_NA_ARTRITE_IDIOPATICA_JUVENIL
    ],

    [Tema.OPTICA]: [
        Subtema.ANATOMIA_DAS_VIAS_OPTICAS,
        Subtema.III_IV_E_VI_PARES_CRANIANOS,
        Subtema.SINDROMES_PUPILARES,
        Subtema.NEURITES_OPTICAS,
        Subtema.PAPILEDEMA_E_PSEUDOTUMOR_CEREBRAL,
        Subtema.MIOPATIAS_OCULARES,
        Subtema.NEUROPATIAS_OPTICAS_ISQUEMICAS,
        Subtema.NEUROPATIAS_TOXICAS_E_CARENCIAIS,
        Subtema.NISTAGMOS,
        Subtema.NEUROPATIAS_OPTICAS_HEREDITARIAS,
        Subtema.PROPRIEDADES_DA_LUZ,
        Subtema.LENTES_E_ESPELHOS,
        Subtema.INTERACAO_DA_LUZ_COM_A_SUPERFICIE_DOS_MATERIAIS,
        Subtema.INTERACAO_DA_LUZ_COM_ARESTAS_E_ORIFICIOS,
        Subtema.VERGENCIA_OBJETO_E_IMAGEM,
        Subtema.ABERRACOES_OPTICAS,
        Subtema.OPTICA, 
    ],

    [Tema.ESTRABISMO]: [
        Subtema.BASES_DE_ESTRABISMO,
        Subtema.AMBLIOPIA,
        Subtema.NOCOES_CIRURGICAS,
        Subtema.DESVIOS_VERTICAIS_E_ALFABETICOS,
        Subtema.SINDROMES_ESPECIAIS,
        Subtema.ESOTROPIAS,
        Subtema.EXOTROPIAS,
        Subtema.PROPEDEUTICA_SENSORIAL,
        Subtema.PROPEDEUTICA_MOTORA,
        Subtema.ADAPTACOES_MOTORAS_E_SENSORIAIS
    ],

    [Tema.REFRACAO]: [
        Subtema.ASTIGMATISMO,
        Subtema.ACOMODACAO,
        Subtema.REFRACAO,
        Subtema.ACUIDADE_VISUAL,
        Subtema.PONTO_PROXIMO_E_PONTO_REMOTO,
        Subtema.RETINOSCOPIA,
        Subtema.EQUIVALENTE_ESFERICO,
        Subtema.MATERIAL_DAS_LENTES,
        Subtema.MIOPIA,
        Subtema.OCULOS_BIFOCAIS_E_MULTIFOCAIS,
        Subtema.HIPERMETROPIA,
        Subtema.ANISOMETROPIA,
        Subtema.CAUSAS_DE_INSATISFACAO_COM_OS_OCULOS,
        Subtema.TRANSPOSICAO_DE_LENTES,
        Subtema.TRATAMENTO_DAS_LENTES,
        Subtema.LENTES_E_ESPELHOS,
        Subtema.INTERACAO_DA_LUZ_COM_A_SUPERFICIE_DOS_MATERIAIS,
        Subtema.PROPRIEDADES_DA_LUZ,
        Subtema.INTERACAO_DA_LUZ_COM_ARESTAS_E_ORIFICIOS,
        Subtema.VERGENCIA_OBJETO_E_IMAGEM,
        Subtema.ABERRACOES_OPTICAS,
        Subtema.AUXILIOS_OPTICOS,
        Subtema.PSF, 
        Subtema.PRISMAS, 
    ],

    [Tema.FARMACOLOGIA]: [
        Subtema.ANTIBIOTICOS_ANTIFUNGICOS_E_ANTIVIRAIS,
        Subtema.HIPOTENSORES_OCULARES,
        Subtema.CICLOPLEGICOS_E_MIDRIATICOS,
        Subtema.PILOCARPINA_E_CARBACOL,
        Subtema.CONCEITOS_GERAIS,
        Subtema.ANESTESICOS,
        Subtema.CORTICOIDES_E_AINES,
        Subtema.CLOROQUINA,
        Subtema.CORANTES_VITAIS,
        Subtema.CONSERVANTES,
        Subtema.ANTI_VEGF,
        Subtema.COSMIATRIA,
        Subtema.AINES,
        Subtema.MITOMICINA_C_E_5_FLUORACIL
    ],

    [Tema.PATOLOGIA_OCULAR]: [
        Subtema.TUMORES_EPIBULBARES_MALIGNOS,
        Subtema.LESOES_PIGMENTADAS_DA_SUPERFICIE_OCULAR,
        Subtema.FACOMATOSES,
        Subtema.TUMORES_EPIBULBARES_BENIGNOS,
        Subtema.OUTROS_TUMORES_INTRAOCULARES,
        Subtema.CIRURGIA_REFRATIVA,
        Subtema.LENTES_DE_CONTATO,
        Subtema.VISAO_SUBNORMAL,
        Subtema.GENETICA_OCULAR,
        Subtema.EMBRIOLOGIA,
        Subtema.PATOLOGIA_OCULAR,
        Subtema.ETICA_MEDICA,
        Subtema.ESTUDOS_CIENTIFICOS,
        Subtema.SENSIBILIDADE_E_ESPECIFICIDADE,
        Subtema.SAUDE_PUBLICA,
        Subtema.ADMINISTRACAO_HOSPITALAR,
        Subtema.NAO_CLASSIFICADA,
        Subtema.OUTROS 
    ],

    [Tema.LENTES_DE_CONTATO]: [
        Subtema.LENTES_DE_CONTATO
    ],

    [Tema.NAO_CLASSIFICADA]: [
        Subtema.NAO_CLASSIFICADA
    ],

    [Tema.NEUROFTALMOLOGIA]: [
    ],

    [Tema.OUTROS]: [
        Subtema.OUTROS,
        Subtema.MISCELANEA, 
    ],

    [Tema.TUMORES_INTRAOCULARES]: [
        Subtema.RETINOBLASTOMA, 
        Subtema.MELANOMA_DE_COROIDE, 
        Subtema.OUTROS_TUMORES_INTRAOCULARES, 
    ],

    [Tema.VISAO_SUBNORMAL]: [
        Subtema.VISAO_SUBNORMAL
    ],

    [Tema.CRISTALINO]: [], 
    [Tema.ORBITA]: [
        Subtema.ORBITOPATIA_DISTIREOIDIANA,
        Subtema.CELULITES_ORBITARIAS,
        Subtema.TRAUMA_ORBITARIO,
        Subtema.TUMORES_ORBITARIOS_ADULTO,
        Subtema.TUMORES_ORBITARIOS_BENIGNOS,
        Subtema.TUMORES_ORBITARIOS_MALIGNOS,
    ],
};