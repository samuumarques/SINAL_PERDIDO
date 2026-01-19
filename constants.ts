
import { DialogueNode } from './types';

export const PASSWORDS = {
  IMAGE: 'elara',
  COMMENTS: 'astrocom',
  LOGS: '22102015',
  AUDIO_LOG: 'pardo',
  BACKUP: 'hacksaw'
};

export const BINARY_CODES = {
    HA: "01001000 01000001", // HA
    CK: "01000011 01001011", // CK
    SA: "01010011 01000001", // SA
    W:  "01010111" // W
};

export const DIALOGUE_TREE: Record<string, DialogueNode> = {
  // --- DAY 1: The Delusion ---
  'start': {
    npc: "Ei... você está aí? Consegui! O sinal é péssimo, mas... consegui!",
    choices: [
      { text: "Sarah! Sou eu! Que saudade!", nextNode: 'd1_happy' },
      { text: "Estou aqui! Onde você está?", nextNode: 'd1_where' }
    ]
  },
  'd1_happy': {
    npc: "Eu também! Tanta! Você não vai acreditar como é aqui em Marte. É... mágico.",
    choices: [
      { text: "É como a gente sonhava?", nextNode: 'd1_dream' }
    ]
  },
  'd1_where': {
    npc: "Estou em Marte! Nós conseguimos! É tudo tão... vermelho e silencioso. Lindo.",
    choices: [
      { text: "É exatamente como a gente sonhava?", nextNode: 'd1_dream' }
    ]
  },
  'd1_dream': {
    npcSequence: [
      { text: "É sim. O céu é rosa, e a Terra é só uma estrelinha azul... Às vezes sinto " },
      { action: 'glitch_text', code: "MEDO", text: "01001101 01000101 01000100 01001111", delay: 800 },
      { text: "... Opa, desculpa, o transmissor falhou. Sinto saudade. Lembra da gente deitado na grama naquele parque, planejando tudo isso?" }
    ],
    choices: [
      { text: "Lembro perfeitamente.", nextNode: 'd1_photo' },
      { text: "Como eu poderia esquecer? Foi o nosso pacto.", nextNode: 'd1_photo' }
    ]
  },
  'd1_photo': {
    npc: "A nossa promessa... Eu até trouxe a caixinha de música... aquela que toca 'Sinais Estelares'.",
    choices: [
      { text: "A nossa música! Você ainda a escuta?", nextNode: 'd1_music' }
    ]
  },
  'd1_music': {
     npcSequence: [
        { text: "Sempre. Me faz sentir mais perto de você. Me ajuda a... "},
        { action: 'glitch_text', code: "AJUDA", text: ".- .--- ..- -.. .-", delay: 1000 },
        { text: "... Desculpa, a estática aqui é horrível. Enfim, me ajuda a não esquecer... A conexão... está ficando instável. Droga." }
    ],
    choices: [
        { text: "Não! Sarah, espera!", nextNode: 'd1_ending' },
        { text: "Cuidado aí!", nextNode: 'd1_ending' }
    ]
  },
  'd1_ending': {
      npc: "Preciso... ir... O sinal... está se perdendo... Não me esquece...",
      choices: [], // Auto-triggers END_DAY_1 in Messenger.tsx
  },

  // --- DAY 2: The Glitch ---
  'd2_start': {
      npc: "Consegui... atravessar. O sinal está tão fraco. ...Você me ouve?",
      choices: [
          { text: "Sarah? É você?", nextNode: 'd2_resp_1' },
          { text: "Onde você está?", nextNode: 'd2_resp_2' },
          { text: "Isso não é possível.", nextNode: 'd2_resp_denial' }
      ]
  },
  'd2_resp_1': {
      npc: "Eu acho... que sim. É difícil lembrar. Está tudo tão... vermelho. Tão longe. É Marte. ...Você se lembra da promessa, não é?",
      choices: [
          { text: "Promessa? Qual promessa?", nextNode: 'd2_mars' },
          { text: "Lembro. Marte. Mas... como?", nextNode: 'd2_mars' }
      ]
  },
  'd2_resp_2': {
      npc: "Estou... longe. Onde você me mandou. O céu é vermelho. Tão silencioso. ...Você se lembra da promessa?",
      choices: [
          { text: "Eu não te mandei para lugar nenhum.", nextNode: 'd2_mars' },
          { text: "Sim. A promessa de Marte.", nextNode: 'd2_mars' }
      ]
  },
  'd2_resp_denial': {
      npc: "É... eu sei. Mas é a única conexão que resta. A sua. ...Por favor, não desligue.",
      choices: [
          { text: "Não vou. Me conte... como é aí?", nextNode: 'd2_mars' }
      ]
  },
  'd2_mars': {
      npc: "É... silencioso. E vermelho. Não como nos folhetos da SolarNet. A conexão é... um fragmento. Consegui ver uma coisa... um artigo antigo sobre eles. Sobre as mentiras.",
      choices: [
          { text: "Que artigo?", nextNode: 'd2_browser_hint' },
          { text: "Mentiras?", nextNode: 'd2_browser_hint' }
      ]
  },
  'd2_browser_hint': {
      npc: "Estava... no seu terminal. Falava sobre a colônia. E nos comentários... alguém... um técnico... ele se lembrava. Ele mencionou o nome da minha mãe. O nome que você... esqueceu.",
      choices: [
          { text: "Encontrei o artigo. O comentário dele... 'Nunca esquecer'.", nextNode: 'd2_found_comment', requiredPuzzle: 'commentsUnlocked' }
      ]
  },
  'd2_found_comment': {
      npc: "Esquecer... É fácil, não é? Eles escondem a falha no sistema. Você esconde... o e-mail dela. Minha mãe. Você ainda lembra o nome dela?",
      choices: [
          { text: "Elara. O nome dela era Elara. Eu li o e-mail.", nextNode: 'd2_found_name', requiredPuzzle: 'emailRead' }
      ]
  },
  'd2_found_name': {
      npc: "'A viagem'. Ela achava que era real. Ela não sabia... ninguém sabia o que você fez. O que você trancou. Você... ainda tem aquela foto?",
      choices: [
          { text: "A foto no parque. Eu a desbloqueei.", nextNode: 'd2_found_image', requiredPuzzle: 'imageDecrypted' }
      ]
  },
  'd2_found_image': {
      npc: "Aquele dia... Antes de tudo. Antes do porão. ...Você leu as notícias daquele ano, não leu? Sobre a garota que... sumiu. No vale.",
      choices: [
          { text: "Eu encontrei o artigo. 'S.V.' ... Sarah.", nextNode: 'd2_found_desaparecida', requiredPuzzle: 'desaparecidaFound' }
      ]
  },
  'd2_found_desaparecida': {
      npc: "Eles procuraram no lugar errado. Eles não sabiam para onde olhar. Eles não ouviram a música. Mas você ouviu. O som da caixinha... vindo do escuro.",
      choices: [
          { text: "Que música? Não estou entendendo.", nextNode: 'd2_lie_about_audio', isWrong: true },
          { text: "A sequência... eu toquei a sequência do log de áudio.", nextNode: 'd2_found_audio', requiredPuzzle: 'audioSequenceSolved' }
      ]
  },
  'd2_lie_about_audio': {
      npc: "O som que você tentou apagar. Você sabe qual é. Procure. A senha é o nome do vale onde eles *não* me encontraram.",
      choices: [
          { text: "Vou procurar.", nextNode: 'd2_found_desaparecida' }
      ]
  },
  'd2_found_audio': {
      npc: "Sim... 'Sinais Estelares'. A nossa música. Você costumava tocá-la... até aquele dia. O dia em que o sinal se perdeu. Você se lembra do ano?",
      choices: [
          { text: "Foi em 2015.", nextNode: 'd2_date_correct' },
          { text: "Foi em 2013.", nextNode: 'd2_date_wrong', isWrong: true },
          { text: "Foi em 2017.", nextNode: 'd2_date_wrong', isWrong: true }
      ]
  },
  'd2_date_wrong': {
      npc: "Não... Não! PENSE. Você não pode esquecer disso também!",
      choices: [
           { text: "Foi em 2015.", nextNode: 'd2_date_correct' }
      ]
  },
  'd2_date_correct': {
      npc: "2015... O ano em que eu 'fui para Marte'. O ano em que você me trancou. A data... 22 de Outubro... você não consegue esquecer, não é? É a chave. A chave do seu 'arquivo seguro'.",
      choices: [
          { text: "O que... o que eu fiz, Sarah?", nextNode: 'd2_puzzle_logs', requiredPuzzle: 'logsDecrypted' }
      ]
  },
  'd2_puzzle_logs': {
      npc: "Você trancou o arquivo assim como me trancou. Mas a verdade não fica enterrada. Abra. LEIA. Lembre-se do que você fez.",
      choices: [
          { text: "Eu... eu li os registros. O porão...", nextNode: 'd2_confrontation' }
      ]
  },
  'd2_confrontation': {
      npc: "..."
        + "\n ...'É para o seu bem.' 'Eu já decidi.'"
        + "\n ...Eu pedi para você me deixar sair. Estava escuro."
        + "\n E você me mandou... 'ficar quieta'."
        + "\n ...E então... silêncio."
        + "\n Você me deixou lá.",
      choices: [
          { text: "Foi um acidente... Eu não queria...", nextNode: 'd2_accident' },
          { text: "Não... isso não é real. É um pesadelo.", nextNode: 'd2_denial' },
          { text: "Sarah... Me perdoe. Eu sinto muito.", nextNode: 'd2_denial' }
      ]
  },
  'd2_accident': {
      npc: "Um acidente? Você me ouviu bater. Você me ouviu pedir. E você... foi embora. Você me deixou no escuro. E agora você está aí, sozinho na sua própria escuridão. E eu... eu não estou em Marte.",
      choices: [] // Trigger BSOD
  },
  'd2_denial': {
      npc: "É mais real do que 'Marte'. É a única coisa real. Este... 'Sinal Perdido'... não sou eu. É você. É a sua memória, batendo na porta do porão, para sempre.",
      choices: [] // Trigger BSOD
  },

  // --- DAY 3: The Awakening ---
  'd3_start': {
      npc: "Você acordou. O telefone está esperando. Está pronto para acabar com isso?",
      choices: [
          { text: "Sarah... por favor. Podemos conversar?", nextNode: 'd3_bargain' },
          { text: "Você não vai me forçar a nada.", nextNode: 'd3_aggression' }
      ]
  },
  'd3_bargain': {
      npc: "Conversar? Nós conversamos por dez anos, aqui dentro. Na sua cabeça. Você já disse tudo. Eu já ouvi tudo.",
      choices: [
          { text: "Eu posso mudar! Eu juro!", nextNode: 'd3_bargain_2' },
          { text: "Isso é um pesadelo. Você não é real.", nextNode: 'd3_denial' }
      ]
  },
  'd3_bargain_2': {
      npc: "Mudar? Você não quer mudar. Você só quer que o barulho pare. O barulho da porta do porão batendo na sua mente. Mas ele não vai parar. Nunca.",
      choices: [
          { text: "CALA A BOCA!", nextNode: 'd3_aggression_2' }
      ]
  },
  'd3_denial': {
      npc: "Eu sou tão real quanto o escuro em que você me deixou. Sou o seu pecado. E pecados não desaparecem.",
      choices: [
          { text: "Você não sabe de nada! Você era fraca!", nextNode: 'd3_aggression_2' }
      ]
  },
  'd3_aggression': {
      npc: "Forçar? Eu não preciso te forçar. Você quer isso. Uma parte de você anseia pelo fim. Pela punição.",
      choices: [
          { text: "Eu não me arrependo de nada, sua vadia!", nextNode: 'd3_aggression_2' }
      ]
  },
  'd3_aggression_2': {
      npc: "Finalmente... a verdade. O monstro sem a máscara.",
      choices: [
          { text: "Eu gostei. Gostei de ver o medo nos seus olhos.", nextNode: 'd3_revelation' }
      ]
  },
  'd3_revelation': {
      npc: "...Eu sei. Eu estava lá. E agora... o mundo inteiro também vai saber. Pegue o telefone.",
      choices: [] // Trigger Final Call
  }
};
