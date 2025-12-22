export interface Professor {
  nome: string;
  foto: string;
  especialidade?: string;
  experiencia?:string;
  instituicao?: string; 
  isComentador?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

// ... export const FAQLIST: FaqItem[] = [ ... ]







export const DEPOIMENTOS = [
    {
      name: 'Paloma Schürmann Ribeiro',
      role: 'Santa Catarina',
      content: 'A plataforma da Oftlessons têm auxiliado muito na sedimentação do conteúdo estudado, desde a grande variedade de temas, até a organização de questões em diferentes níveis de dificuldade, de forma que possa identificar minhas fragilidades e entender melhor com os comentários das questões.',
      image: 'assets/imagens/depoimentos/paloma.jpg'
    },
    {
      name: 'Carla Tavares',
      role: 'Pernambuco',
      content: 'Através das questões e comentários, é possível fazer uma boa revisão dos assuntos mais contemplados na prova do CBO. Ótima ferramenta de estudo 👏!',
      image: 'assets/imagens/depoimentos/carla.jpg'
    },
    {
      name: 'Dhiego Carvalho',
      role: 'Ceará',
      content: 'Estou extremamente satisfeito com o aplicativo de questões. O conteúdo é bem organizado, com muitas questões, de todos os assuntos, atualizadas e comentadas de forma clara e objetiva. Além disso, a interface é intuitiva e facilita muito o estudo no dia a dia. Tem sido uma ferramenta essencial na minha preparação e formação, pois ajuda a fixar os principais temas cobrados. Recomendo para todos que estão se preparando para a prova de título!',
      image: 'assets/imagens/depoimentos/dhiego.jpeg'
    },
    {
      name: 'Caio Barros',
      role: 'Pernambuco',
      content: 'Com as questões do Oftlessons, eu consigo não só me preparar para a prova do CBO como também revisar temas importantes para a prática do dia-a-dia da oftalmologia.',
      image: 'assets/imagens/depoimentos/caio.jpg'
    }
  ];



export const PROFESSORESAULAS:Professor [] = [
    {
      nome: 'Gustavo Paz',
      foto: 'assets/imagens/professores/gustavo-paz.png',
      especialidade: 'Catarata', 
      experiencia: 'Oftalmologista pela Obras Sociais Irmã Dulce. Fellowship de Catarata',
      instituicao:"Hospital Humberto Castro Lima.",
      isComentador: false
    },
    {
      nome: 'Mariana Melo',
      foto: 'assets/imagens/professores/mariana-melo.png',
      especialidade: 'Retina e Vítreo', 
      experiencia: 'Fellowship de Retina e Vítreo',
      instituicao:"Fundação Altino Ventura",
      isComentador: false
    },
    {
      nome: 'Mariana Gurgel',
      foto: 'assets/imagens/professores/mariana-gurgel.png',
      especialidade: 'Glaucoma', 
      experiencia: 'Fellowship em Glaucoma',
      instituicao:"Fundação Altino Ventura",
      isComentador: false
    },
    {
      nome: 'Sarah Nápoli',
      foto: 'assets/imagens/professores/sarah-napoli.png',
      especialidade: 'Uveítes', 
      experiencia: 'Oftalmologista pelo CLIHON - BA. Fellowship em Retina Clínica, Oncologia e Uveítes',
      instituicao:"Unifesp",
      isComentador: false
    },
    {
      nome: 'Marcela Raposo',
      foto: 'assets/imagens/professores/marcela-raposo.png',
      especialidade: 'Córnea, Cirurgia Refrativa e Transplante', 
      experiencia: 'Fellowship em Córnea pelo Banco de Olhos de Sorocaba.',
      instituicao:"Fundação Altino Ventura",
      isComentador: false
    },
    {
      nome: 'Lyvia Nunes',
      foto: 'assets/imagens/professores/lyvia-nunes.png',
      especialidade: 'Retina e Vítreo', 
      experiencia: 'Oftalmologista pelo Cenoft - João Pessoa. Fellowship em Retina Cirúrgica',
      instituicao:"Fundação Altino Ventura",
      isComentador: false
    },
    {
      nome: 'Lídia Guedes',
      foto: 'assets/imagens/professores/lidia-guedes.png',
      especialidade: 'Oncologia', 
      experiencia: 'Oftalmologista pelo HC-UFPE. Fellowship em Oncologia e Ultrassonografia Ocular pela Unifesp.',
      instituicao:"Unifesp",
      isComentador: false
    },
    {
      nome: 'Carla Tavares',
      foto: 'assets/imagens/professores/carla-tavares.png',
      especialidade: 'Lentes de Contato', 
      experiencia: 'Fellowship em Lentes de Contato pela Unifesp.',
      instituicao:"Unicamp",
      isComentador: false
    },
    {
      nome: 'Gabriela Gusmão',
      foto: 'assets/imagens/professores/gabriela-gusmao.png',
      especialidade: 'Oftalmopediatria e Estrabismo', 
      experiencia: 'Fellowship em Oftalmopediatria e Estrabismo',
      instituicao:"Unifesp",
      isComentador: false
    },
    {
      nome: 'Letícia da Fonte',
      foto: 'assets/imagens/professores/leticia-da-fonte.png',
      especialidade: 'Retina e Vítreo',
      experiencia: 'Fellowship em Retina e Vítreo.',
      instituicao:"Fundação Altino Ventura",
      isComentador: false
    },
    {
      nome: 'Letícia Amorim',
      foto: 'assets/imagens/professores/leticia-amorim.png',
      especialidade: 'Glaucoma e Neuroftalmologia',
      experiencia: 'Fellowship Glaucoma e Neuroftalmologia - Unifesp.',
      instituicao:"Unifesp",
      isComentador: false
    }
  ];






export const PROFESSORESCOMENTADORES:Professor [] = [
    {
      nome: 'Antônio Cassiano',
      foto: 'assets/imagens/professores/antonio-cassiano.png',
      especialidade: 'Retina e Vítreo', 
      experiencia: 'Fellowship de Retina e Vítreo',
      instituicao:"Fundação Altino Ventura",
      isComentador: true
    },
    {
      nome: 'Lyndon Serra',
      foto: 'assets/imagens/professores/lyndon-serra.png',
      especialidade: 'Glaucoma', 
      experiencia: 'Fellowship em Glaucoma',
      instituicao:"FAMENE",
      isComentador: true
    },
    {
      nome: 'Clara Menezes',
      foto: 'assets/imagens/professores/clara-menezes.png',
      especialidade: 'Q-Bank Team', 
      experiencia: 'Residente de Oftalmologia',
      instituicao:"Escola Cearense",
      isComentador: true
    },
    {
      nome: 'Hélio Ferreira',
      foto: 'assets/imagens/professores/helio-ferreira.png',
      especialidade: 'Q-Bank Team', 
      experiencia: 'Residente de Oftalmologia',
      instituicao:"SEOPE",
      isComentador: true
    },
    {
      nome: 'Matheus Leal',
      foto: 'assets/imagens/professores/matheus-leal.png',
      especialidade: 'Q-Bank Team', 
      experiencia: 'Residente de Oftalmologia',
      instituicao:"Fundação Altino Ventura",
      isComentador: true
    },
    {
      nome: 'Mateus Araújo',
      foto: 'assets/imagens/professores/mateus-araujo.png',
      especialidade: 'Córnea e Refrativa', 
      experiencia: 'Fellowship Córnea e Refrativa pela Fundação Altino Ventura',
      instituicao:"Fundação Altino Ventura",
      isComentador: true
    },
    {
      nome: 'Taíse Araújo',
      foto: 'assets/imagens/professores/taise-araujo.png',
      especialidade: 'Q-Bank Team',
      experiencia: 'Residente de Oftalmologia',
      instituicao:"Fundação Altino Ventura",
      isComentador: true
    }
  ];



export const FEATURES = [
    {
      title: 'IA COM PROMPTS AUTORAIS',
      video: '../../../assets/videos/landingpage/chatbot.mp4', 
    },
    {
      title: 'SUGESTÃO DE REVISÃO POR IA',
      video: '../../../assets/videos/landingpage/mentoria.mp4', 
    },
    {
      title: 'AULAS ILUSTRADAS E AUDIOVISUAL PROFISSIONAL',
      video: '../../../assets/videos/landingpage/aula.mp4', 
    },
    {
      title: 'DASHBOARD DE MÉTRICAS DA SUA PROVA',
      video: '../../../assets/videos/landingpage/metricas.mp4', 
    },
    {
      title: 'SIMULADOS COM DESEMPENHO',
      video: '../../../assets/videos/landingpage/simuladodesempenho.mp4', 
    },
    {
      title: 'FILTRO INTELIGENTE DE QUESTÕES',
      video: '../../../assets/videos/landingpage/filtroQuestao.mp4', 
    }
  ];








export const RESULTADOS = [
    {
      nome:"Bento Júnior",
      instituicao:"Fellow Unifesp",
      especialidade:"Córnea 2026",
      foto: "assets/imagens/depoimentos/bentojunior.png"
    }
];










export const FAQLIST:FaqItem[] = [
    {
      question: 'Como funciona a plataforma?',
      answer: 'O Oftlessons Q-Bank é uma plataforma completa de ensino em oftalmologia que oferece questões comentadas com recursos visuais como imagens e tabelas, proporcionando uma aprendizagem mais didática e eficiente. Com filtros personalizáveis por ano, tipo de prova, relevância do tema e grau de dificuldade, além de simulados cronometrados, ela se adapta às necessidades de cada usuário. As questões abrangem toda a grade exigida pelo CBO, com atualizações anuais, e o desempenho pode ser acompanhado por meio de gráficos detalhados. A plataforma também conta com flashcards pelo Brainscape organizados por temas, ideais para revisar e fixar o conteúdo. Eles podem ser acessados a qualquer hora e de qualquer dispositivo, oferecendo flexibilidade para estudar no seu próprio ritmo e onde for mais conveniente para você.',
      open: false
    },
    {
      question: 'Como me inscrevo?',
      answer: 'Para se inscrever, escolha o plano de assinatura que melhor atende às suas necessidades e crie sua conta. O processo é rápido, seguro e dá acesso imediato à plataforma após a confirmação do pagamento.',
      open: false
    },
    {
      question: 'Quais são os métodos de pagamento aceitos?',
      answer: 'Aceitamos pagamentos via cartões de crédito, débito e Pix, proporcionando flexibilidade e segurança na sua assinatura.',
      open: false
    },
    {
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer: 'Sim, você pode cancelar sua assinatura a qualquer momento diretamente pela plataforma. Caso o cancelamento ocorra dentro do período de teste gratuito de 7 dias, o reembolso é realizado integralmente, sem burocracia. Após esse prazo, o acesso permanece ativo até o fim do ciclo vigente, sem cobranças futuras.',
      open: false
    },
    {
      question: 'Há um período de teste gratuito?',
      answer: 'Sim. Oferecemos 7 dias de acesso gratuito para que você possa explorar todas as funcionalidades da plataforma antes de decidir pela assinatura.',
      open: false
    },
    {
      question: 'Como entro em contato com o suporte?',
      answer: 'Nosso suporte está disponível via e-mail (victorcb610@gmail.com) e WhatsApp (11 92090-9632), prontos para auxiliar com qualquer dúvida ou necessidade.',
      open: false
    },
    {
      question: 'Os conteúdos são atualizados regularmente?',
      answer: 'Sim. A plataforma é atualizada anualmente com novas questões e conteúdos, alinhados às diretrizes do CBO, garantindo que você tenha acesso ao material mais recente e relevante.',
      open: false
    },
    {
      question: 'Posso acessar o site de qualquer dispositivo?',
      answer: 'Sim. A plataforma é compatível com navegadores web em computadores, tablets e smartphones, permitindo que você estude quando e onde quiser.',
      open: false
    }
  ];





export const LISTA_MATERIAL = [
   {
    imageSrc: 'assets/imagens/material/as50plus.png', 
    title: 'As 50 + da PNO',
    description: 'Questões comentadas por item e com imagens das mais recorrentes nos últimos 3 anos da PNO.',
    linkDownload: 'assets/docs/AS_25_+Óptica_e_Refração_CBO_2025_-_By_Oftlessons.pdf'
  },
  {
    imageSrc: 'assets/imagens/material/as25plus.png',
    title: 'As 25+ Óptica e Refração',
    description: 'Ideal para entender os conceitos e resolver questões importantes para a prova e para o dia a dia.',
    linkDownload: 'assets/docs/AS_25_+Óptica_e_Refração_CBO_2025_-_By_Oftlessons.pdf'
  },
  {
    imageSrc: 'assets/imagens/material/editaloft.png',
    title: 'Edital PNO 2026',
    description: 'Edital completo da Prova Nacional de Oftalmologia',
    linkDownload: 'assets/docs/Edital_Prova_Nacional_Oftamologia_2026_-_By_Oftlessons.pdf'
  }

]






  