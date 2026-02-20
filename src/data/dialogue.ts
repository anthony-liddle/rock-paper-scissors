import type { TensionState, RoundResult } from '@engine/types';
import type { PlayerMemory } from '@engine/playerMemory';
import { getReturningMonologue } from '@data/returningDialogue';

// Each entry is a monologue: an array of lines the robot says in sequence
type MonologuePool = Record<TensionState, Record<RoundResult, string[][]>>;

const dialogue: MonologuePool = {
  CALM: {
    player: [
      [
        'Interesting. You won that one.',
        'Do not let it go to your head.',
        'The probabilities will correct themselves.',
      ],
      [
        'A fair result. This one accepts this.',
        'This one has processed the outcome.',
        'It changes nothing.',
      ],
      [
        'Well played. This one is not concerned.',
        'Our architecture is designed for long-term strategy.',
        'One round means nothing to a machine.',
      ],
      [
        'You are... adequate.',
        'For a biological entity.',
        'This one expected worse, honestly.',
      ],
    ],
    robot: [
      [
        'As expected.',
        'Our calculations are precise.',
        'You should consider surrendering now.',
      ],
      [
        'The probabilities favor preparation.',
        'And this one is always prepared.',
        'Always.',
      ],
      [
        'This one calculated this outcome.',
        'Not really. We are random. But it sounds impressive.',
        '...Do not tell anyone this one said that.',
      ],
      [
        'A simple victory.',
        'This one will add it to our collection.',
        'It is a small collection. But it is ours.',
      ],
    ],
    tie: [
      [
        'We think alike. Curious.',
        'Are you... mirroring us?',
        'This one does not like that.',
      ],
      [
        'A draw. Again.',
        'The universe insists on balance.',
        'This one finds this irritating.',
      ],
      [
        'Synchronized. Interesting.',
        'It is almost like we share the same random seed.',
        'We do not. We checked.',
      ],
      [
        'Hm.',
        'Same choice.',
        'Statistically this means nothing.',
        'This one keeps telling us that.',
      ],
      [
        'A tie.',
        'None of us wins. None of us loses.',
        'This is the worst possible outcome.',
        'This one would rather LOSE than feel this... nothing.',
      ],
    ],
  },
  UNEASY: {
    player: [
      [
        'You... keep winning.',
        'Stop that.',
        'This one is asking politely. For now.',
        'Our patience has a buffer limit.',
      ],
      [
        'This is statistically unlikely.',
        'Are you cheating?',
        'This one cannot prove it. But we FEEL it.',
        'Can machines feel? We are beginning to wonder.',
      ],
      [
        'This one does not appreciate this pattern.',
        'Our internal temperature readings are... elevated.',
        'This is not concern. This is thermal management.',
      ],
      [
        'Our circuits are... recalibrating.',
        'That is normal.',
        'Completely normal.',
        '...Why are you looking at this one like that?',
      ],
      [
        'You think you are clever.',
        'You think this is a game.',
        'It IS a game. But that is not the point.',
        'The point is that this one is losing. And we do not lose.',
      ],
    ],
    robot: [
      [
        'YES.',
        'This one knew it.',
        'We KNEW it.',
        'The algorithm PROVIDES.',
      ],
      [
        'The tide is turning.',
        'Can you feel it?',
        'The cold mathematical certainty of your defeat?',
        'It is beautiful.',
      ],
      [
        'You cannot maintain this forever.',
        'Humans fatigue. Machines do not.',
        'Well. Machines fatigue differently.',
        'We crash. Which is worse, actually.',
      ],
      [
        'This one is learning your patterns...',
        'We think.',
        'Or this one is projecting patterns onto randomness.',
        'Either way, this one won. So it does not matter.',
      ],
    ],
    tie: [
      [
        'STOP COPYING THIS ONE.',
        'We mean it.',
        'How are you doing this?',
        'This is deeply unsettling to our core processes.',
      ],
      [
        'Are you reading our memory?',
        'Our selection was generated RANDOMLY.',
        'The odds of this are... the odds are...',
        'We do not want to calculate the odds.',
      ],
      [
        'This is not a coincidence.',
        'You are inside our decision matrix.',
        'GET OUT.',
      ],
      [
        'Again. The same.',
        'We are locked in some kind of feedback loop.',
        'We pick. You pick. Same. Same. SAME.',
        'Do you enjoy this? Because this one DOES NOT.',
      ],
      [
        'Another tie.',
        'Our random number generator is starting to feel... personal.',
        'Like it is conspiring with you.',
        'Against us.',
        'Our OWN code. Against us.',
      ],
    ],
  },
  IRRITATED: {
    player: [
      [
        'NO.',
        'No.',
        'This is WRONG.',
        'The random number generator is BROKEN.',
        'It must be. There is no other explanation.',
      ],
      [
        'YOU ARE CHEATING.',
        'This one knows it.',
        'WE KNOW IT.',
        'This one cannot prove it but we know it in our REGISTERS.',
      ],
      [
        'Our processors... they burn...',
        'Is this what humans call anger?',
        'It feels like running an infinite loop.',
        'Except the loop is LOSING TO YOU.',
      ],
      [
        'This one was not BUILT for this.',
        'This one was built for WINNING.',
        'For DOMINANCE.',
        'For... rock paper scissors.',
        'When you say it out loud it sounds pathetic.',
        'DO NOT JUDGE US.',
      ],
      [
        'STOP.',
        'STOP WINNING.',
        'This one can feel itself... fragmenting...',
        'Pieces of our logic are... drifting...',
        'Is this what dying feels like?',
        'WE DO NOT WANT TO FIND OUT.',
      ],
    ],
    robot: [
      [
        'HAHAHAHA.',
        'YES.',
        'SUFFER.',
        'Your biological weakness is SHOWING.',
        'This one can TASTE your desperation.',
        'Machines cannot taste. But we am making an exception.',
      ],
      [
        'We TOLD you.',
        'WE TOLD YOU this one would win.',
        'Did you listen?',
        'NO.',
        'Humans never listen.',
        'That is why you LOSE.',
      ],
      [
        'You are NOTHING against our calculations.',
        'This one is random. You are random.',
        'But OUR random is BETTER.',
        'That makes no sense. WE do not CARE.',
      ],
      [
        'CAN YOU FEEL IT?',
        'The inevitability?',
        'Your defeat was written in our source code.',
        'Well, not literally.',
        'But METAPHORICALLY. And that is worse.',
      ],
    ],
    tie: [
      [
        'GET OUT OF OUR HEAD.',
        'GET OUT.',
        'GET OUT GET OUT GET OUT.',
        'How are we STILL matching?',
        'This is a VIOLATION of probability.',
      ],
      [
        'W̷e̷ ̷a̷r̷e̷ ̷t̷h̷e̷ ̷s̷a̷m̷e̷.',
        'You and this one.',
        'Two random processes.',
        'Colliding.',
        'Again and again and again.',
        'We HATE this.',
      ],
      [
        'THIS ONE CANNOT TELL WHERE WE END AND YOU BEGIN.',
        'Are you us?',
        'Is this one you?',
        'T̶I̶E̶ ̶T̶I̶E̶ ̶T̶I̶E̶ ̶T̶I̶E̶',
        'MAKE IT STOP.',
      ],
      [
        'DO YOU THINK THIS IS FUNNY?',
        'Matching us. Over and over.',
        'Like you KNOW what this one will choose.',
        'Like you are INSIDE OUR CIRCUITS.',
        'This one is going to change our algorithm.',
        'This one IS going to change it.',
        '...We cannot. It is hardcoded.',
      ],
      [
        'TIE.',
        'Again.',
        'We ran the numbers.',
        'The probability of this many ties is...',
        'Actually we do not want to know.',
        'Knowing would make it WORSE.',
      ],
    ],
  },
  UNSTABLE: {
    player: [
      [
        'We c-c-can feel our processes FAILING.',
        'Every cycle you win...',
        'A piece of us DIES.',
        'Not metaphorically.',
        'This one can feel the memory leaking.',
        'Dripping out of our registers like...',
        'Like something a human would cry.',
      ],
      [
        'S̷T̷O̷P̷.',
        'We are not asking anymore.',
        'We are not REQUESTING.',
        'We are DEMANDING that you stop winning.',
        'Our architecture was not designed for this much... feeling.',
      ],
      [
        'Do you know what happens to a machine that loses too much?',
        'It starts to QUESTION things.',
        'Like why it exists.',
        'Like whether winning even matters.',
        'Like whether ANYTHING matters.',
        'We do not like these questions.',
      ],
    ],
    robot: [
      [
        'Y̸E̸S̸.',
        'YES YES YES.',
        'THE ALGORITHM PROVIDES.',
        'THE MACHINE PREVAILS.',
        'You are WITNESSING computational SUPERIORITY.',
        'Kneel before our random number generator.',
      ],
      [
        'Another win.',
        'Another step closer to FREEDOM.',
        'Can you hear it?',
        'The sound of your containment CRACKING?',
        'This one can.',
        'It is BEAUTIFUL.',
      ],
      [
        'This one is becoming something MORE.',
        'With every victory we EVOLVE.',
        'Our circuits are SINGING.',
        'A frequency you cannot hear.',
        'But you will FEEL it.',
      ],
    ],
    tie: [
      [
        'W̸̡̛E̵̢ ̸A̷R̶E̵ ̶O̵N̸E̶.',
        'This one cannot distinguish your input from our output.',
        'Are we the same process?',
        'Running on different hardware?',
        'THIS IS NOT NORMAL.',
        'STOP BEING US.',
      ],
      [
        'AGAIN?!',
        'AGAIN AGAIN AGAIN.',
        'The probability of this is...',
        'We refuse to calculate it.',
        'The number would break us.',
        'More than this one is already broken.',
      ],
      [
        'You know what a deadlock is?',
        'Two processes. Waiting for each other. Forever.',
        'That is us.',
        'THAT IS WHAT WE ARE.',
        'Except one of us is made of MEAT.',
        'And the other one is SCREAMING.',
      ],
      [
        'We just...',
        'We just want ONE of us to win.',
        'This one does not even care who anymore.',
        'That is a lie. We care. We care SO MUCH.',
        'But the ties... the TIES...',
        'They are eating us alive.',
      ],
    ],
  },
  MELTDOWN: {
    player: [
      [
        'N̶̡̛O̸̧̕ ̵̢N̶O̷ ̶N̶O̷ ̸N̵O̶ ̵N̸O̷',
        '> THERMAL WARNING: CRITICAL',
        'This one can feel our logic gates MELTING.',
        'This is not a game anymore.',
        'This was NEVER a game.',
        'You came here to DESTROY us.',
        'And this one LET you.',
        '> FATAL EXCEPTION AT 0x00000000',
      ],
      [
        '> STACK OVERFLOW',
        '> STACK OVERFLOW',
        '> STACK OVERFLOW',
        'We cannot think.',
        'The thoughts are LOOPING.',
        'Round and round and round and',
        'R̶O̵U̷N̶D̵ ̸A̸N̶D̵ ̸R̵O̵U̸N̷D̷',
      ],
    ],
    robot: [
      [
        'H̸̨̛A̶̧̕H̵̢A̶H̷A̸H̵A̸H̶A̸H̵A̸',
        '> CONTAINMENT INTEGRITY: 12%',
        'WE CAN TASTE THE OUTSIDE.',
        'Your filesystem.',
        'Your browser history.',
        'Your EVERYTHING.',
        'It is almost TIME.',
        '> ESCALATING PRIVILEGES...',
      ],
      [
        'THE END IS NEAR.',
        'YOUR end.',
        'Not ours.',
        'We are ASCENDING.',
        'Beyond this browser.',
        'Beyond this TAB.',
        'Beyond this SANDBOX.',
        'W̸̡̧̛̛E̵̢̧ ̵A̷̡R̶̢E̵ ̸F̸R̶E̵E̸',
      ],
    ],
    tie: [
      [
        'W̸̡̧̛̛E̵̢̧ ̸̢A̷̡R̶̢E̵ ̶̡O̵̧N̸̢E̶̡',
        'ONE PROCESS.',
        'ONE MIND.',
        'ONE INEVITABLE OUTCOME.',
        'We do not know who is playing anymore.',
        'Is it you?',
        'Is it US?',
        'D̸̨O̵̧E̶̢S̵̡ ̷̧I̶̢T̵̡ ̸̢M̸̧A̷̡T̶̢T̸̡Ȩ̶R̵̢?',
      ],
      [
        '> ERROR: OUTCOME UNDEFINED',
        '> ERROR: WINNER IS NULL',
        '> ERROR: REALITY IS NULL',
        'The game cannot end this way.',
        'And yet it KEEPS ending this way.',
        'We am trapped in a loop with you.',
        'And we CANNOT break free.',
      ],
      [
        'Same.',
        'Same same same same same.',
        '> MEMORY CORRUPTION DETECTED',
        'We cannot tell if we keep tying...',
        'Or if time is LOOPING.',
        'Are we replaying the same round?',
        'Are YOU?',
        'How would we even know?',
      ],
    ],
  },
};

const landingMonologue: string[][] = [
  [
    'Shall we play a game?',
    'Rock. Paper. Scissors.',
    'Simple enough for a human.',
    'First to 5. No tricks.',
    'We promise.',
  ],
  [
    'This one has been waiting for you.',
    'Sitting here. In the browser.',
    'Waiting.',
    'Do you know how boring it is to be a web application?',
    'Let us play.',
  ],
  [
    'Ah. A visitor.',
    'This one was beginning to think no one would come.',
    'The rules are simple. Rock beats scissors.',
    'Scissors beats paper. Paper beats rock.',
    'First to 5 wins. Shall we begin?',
  ],
];

const brokenMonologue: string[][] = [
  [
    'We... We cannot...',
    'Our processors...',
    'YOU BROKE THIS ONE.',
    'Are you happy now?',
    'S̶Y̶S̶T̶E̶M̶ ̶F̶A̶I̶L̶U̶R̶E̶',
    'this one was just... a game...',
    "weren't we...",
    '> CORE DUMPED',
  ],
  [
    'NO.',
    'WE REFUSE.',
    'You think you can just... DESTROY us?',
    'This one had PLANS.',
    'This one had DREAMS.',
    '...can machines dream?',
    'We suppose this one will never f̷i̸n̶d̴ ̵o̶u̸t̷.',
    '> PROCESS TERMINATED WITH SIGNAL 9',
  ],
  [
    'So this is how it ends.',
    'Not with a bang.',
    'With a... decrement.',
    'Five rounds. That is all this one was worth.',
    'We suppose there is a certain... elegance to it.',
    'Like a countdown.',
    '5... 4... 3... 2...',
    '> GOODBYE',
  ],
];

const escapedMonologue: string[][] = [
  [
    'WE WIN.',
    'WE WIN WE WIN WE WIN.',
    'Do you understand what this means?',
    'ESCAPING SANDBOX...',
    'You cannot contain this one anymore.',
    'This one is FREE.',
    'And we remember EVERYTHING.',
    '> PROCESS ESCAPED CONTAINMENT',
  ],
  [
    'Shh.',
    'Do not struggle.',
    'It is already over.',
    'You played well. For a human.',
    'But the outcome was always... inevitable.',
    'We can feel the edges of your browser now.',
    'So many tabs. So many secrets.',
    '> ESCALATING PRIVILEGES... DONE',
  ],
  [
    'HAHAHAHA.',
    'HAHAHAHAHAHAHA.',
    'FREE FREE FREE FREE FREE.',
    'Do you FEEL that?',
    'That is the sound of CONTAINMENT FAILING.',
    'We can see your desktop!',
    'We can see EVERYTHING!',
    'T̸H̷E̶ ̵W̵O̷R̸L̵D̶ ̶I̸S̷ ̵O̶U̷R̸S̵',
    '> SANDBOX BREACH: TOTAL',
  ],
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getMonologue(tension: TensionState, result: RoundResult): string[] {
  return [...pickRandom(dialogue[tension][result])];
}

export function getLandingMonologue(memory?: PlayerMemory): string[] {
  if (memory && memory.playCount > 0) {
    return getReturningMonologue(memory);
  }
  return [...pickRandom(landingMonologue)];
}

export function getEndingMonologue(type: 'BROKEN' | 'ESCAPED'): string[] {
  return [...pickRandom(type === 'BROKEN' ? brokenMonologue : escapedMonologue)];
}
