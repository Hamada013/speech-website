// Editable application, preserving the exercises and content from the original build.
import { u, Qt, Ro, Js, Vi, Uo, zy, Fy, Gy, zo, qo, Ks, Lp, Pp, hy, Bi, Fp, Ho, Lo, Zo, ef, Ky, Ny, Xo, _o, Go, ty, Qo, Bo, Jp, Gp, rf, Wp, Ip, sy, yy, Ey, qy, vy, ng, py, $p, Of, Yy, Py, ry, xy, Ay, _y, Hp, ag, Yp, Sy, qp, Vy, By, tg, jy, wy, sf, ay, Qy, Uy, ny, Iy, ly, nf, af, eg, Ty, lf, ey, dy, iy, Iu, Jy, Ly, Zp, uf, Ry, Wy, Gn, al, Hy, cy, Yo, oy, ky, by, va, Xy, Cy, Zy, Xp, fy, $y, My, Bf, my, ig, Oy, tf, of, Kp, uy, Qp, Dy, gy, fr, Yj, Bj, Uf, R6, Jj, T6, MS, Vf, pS, tS, k6, lS, C6, N6, oj, Hi, YS, wT, vj, bt, Xi, xa, pd, Kx, Xa, Y, $s, nS, q6, Ps, Ui, Fs, Vo, Oo, dj, ij, tj, gT, sT, cf, Mj, yb } from "./vendor.js";

import { categoriesByScreen, singleItemCategories, practiceItems, practiceTokens, splitPhrases, parentScreen, readLanguage } from './practice.js';
import { useRecording } from './recording.js';
import { Dialog } from './dialog.js';
import { PwaPanel } from './pwa.js';

const translations = {
    en: {
      title: "Fluency Flow",
      welcome: "Welcome Back",
      subtitle: "Choose a strategy to practice today.",
      fluencyShaping: "Fluency Shaping",
      fluencyDesc: "Techniques to increase smooth speech through physical control.",
      stutteringMod: "Stuttering Modification",
      stutteringDesc: "Strategies to reduce tension and manage stuttering moments.",
      breathingTech: "Breathing Techniques",
      breathingDesc: "Manage tension and anxiety through diaphragmatic breathing.",
      slowerRate: "Slower Rate",
      easyOnsets: "Easy Onsets",
      easyOnsetDesc: "Gentle breathy starts before speaking to reduce tension.",
      easyOnsetIntro: "Start with a gentle breath (H sound) before each word to ease into speech.",
      cancellationIntro: "After a stuttered word, pause and repeat it with a gentle technique.",
      pullOutIntro: "During a stutter, slow down and transition smoothly into the next sound.",
      prepSetIntro: "Prepare for difficult words by starting them with a gentle technique.",
      lightContacts: "Light Contacts",
      cancellations: "Cancellations",
      pullOuts: "Pull-outs",
      prepSets: "Preparatory Sets",
      fluencyQuote: '"Smooth speech is a journey, not a destination. Take your time with each breath."',
      stutteringQuote: '"Modification is about control and confidence during moments of tension."',
      breathingInfo: {
        title: "Breathing Techniques",
        purpose: "Reduce physical tension and manage speaking anxiety by shifting to deep, controlled breaths.",
        techniques: [{
          name: "Diaphragmatic Breathing (Belly Breathing)",
          steps: ["Place one hand on your chest and the other on your stomach.", "Inhale slowly through your nose, ensuring your stomach rises while your chest stays still.", "Exhale slowly, feeling your stomach fall."]
        }, {
          name: "Regulated Breathing",
          steps: ["Upon feeling a stutter, pause and engage in relaxed diaphragmatic breathing.", "Focus on relaxing the throat and chest muscles.", "Begin speaking on a small, gentle exhale."]
        }, {
          name: "Controlled Exhalation",
          steps: ["Inhale for 3 seconds, pause, and exhale for 3 seconds.", 'Focus on exhaling while producing sound (e.g., "h" or vowel sounds).']
        }],
        tips: ["Practice when calm to make it natural during stress.", "Ensure shoulders and upper chest remain relaxed.", "Avoid over-breathing; aim for a comfortable, moderate breath.", "Sit in a relaxed, upright position."]
      },
      home: "Home",
      profile: "Profile",
      back: "Back",
      fluencyIntro: "Focus on the physical mechanics of speech to create a continuous flow.",
      stutteringIntro: "Learn to stutter more easily and reduce the physical struggle.",
      breathingIntro: "Focus on deep, controlled breaths to relax your speech muscles.",
      inhale: "Inhale",
      exhale: "Exhale",
      hold: "Hold",
      duration: "Duration",
      seconds: "s",
      speed: "Speed",
      normal: "Normal",
      slow: "Slow",
      level: "Level",
      numbers: "Numbers",
      letters: "Letters",
      colors: "Colors",
      animals: "Animals",
      food: "Fruits & Veggies",
      words: "Words",
      sentences: "Sentences",
      stories: "Stories",
      play: "Play",
      pause: "Pause",
      reset: "Reset",
      practice: "Practice",
      next: "Next",
      prev: "Previous",
      info: "Information",
      record: "Record",
      stop: "Stop",
      playRecording: "Play Recording",
      recording: "Recording...",
      clear: "Clear",
      infoDesc: "Learn more about the app and how to use it effectively to improve your fluency.",
      appInfo: {
        title: "About Fluency Flow",
        purpose: "Fluency Flow is a comprehensive speech therapy tool designed to help individuals who stutter practice evidence-based fluency strategies in a structured and engaging way.",
        howToUse: [{
          title: "1. Choose a Strategy",
          content: "Start by selecting one of the three main categories: Fluency Shaping, Stuttering Modification, or Breathing Techniques."
        }, {
          title: "2. Select a Practice Level",
          content: "Each strategy offers different levels, from single sounds and words to full stories. Start simple and progress as you feel more confident."
        }, {
          title: "3. Use the Guided Practice",
          content: "Press the Play button to start the visual guide. Follow the highlighted text or animations to time your speech with the selected technique."
        }, {
          title: "4. Adjust the Settings",
          content: "Use the speed sliders or duration bars to match the practice to your current ability. Slower is often better when learning a new technique."
        }],
        tips: ["Consistency is key: 10 minutes of daily practice is better than one long session per week.", "Record yourself: Listening to your own speech can help you identify areas for improvement.", "Stay relaxed: Physical relaxation is the foundation of smooth speech."]
      },
      plosives: "Plosives",
      lightContactInfo: {
        title: "Light Contact Strategy",
        purpose: "The primary goal is to minimize, prevent, or reduce the tension associated with stuttering moments.",
        howItWorks: "Instead of pressing lips or tongue together hard (hard contacts), the speaker barely touches the articulators together.",
        targetSounds: "It is most effective for plosive sounds where airflow is obstructed, such as /p/, /b/, /t/, /d/, /k/, and /g/.",
        application: "It is used to start words or phrases with less effort, making speech more comfortable.",
        practiceTips: ["Relaxation: Start with a relaxed breath to reduce overall tension.", "Gentle Movement: Focus on light, controlled, and slow movement of the articulators.", 'Examples: Practice saying words like "ball" or "table" with barely touching lips or tongue.'],
        plosiveDetails: {
          p: "Barely touch your lips together. Imagine you are blowing a tiny bubble that shouldn't pop.",
          b: "Keep your lips very soft and relaxed. Use a tiny amount of voice as you gently release.",
          t: "The tip of your tongue should barely tap the ridge behind your upper teeth.",
          d: "A very light tap with the tongue tip. Keep the contact as brief and soft as possible.",
          k: "The back of your tongue should gently brush the roof of your mouth without pressure.",
          g: "Similar to /k/, but with a soft voice. Focus on the feeling of air flowing through."
        }
      },
      easyOnsetInfo: {
        title: "Easy Onset Strategy",
        purpose: "To start voicing gently and gradually to prevent the vocal folds from slamming together.",
        howItWorks: 'Begin with a soft, breathy "H" sound before transitioning into the vowel or word.',
        practiceTips: ["Exhale slightly before you start speaking.", "Imagine the sound starting as a whisper and growing into a clear voice.", "Keep your throat relaxed and open."]
      },
      cancellationInfo: {
        title: "Cancellation Strategy",
        purpose: "To learn to pause after a stuttered word and repeat it with less tension.",
        howItWorks: "When you stutter, complete the word, pause for a moment, and then say the word again using a fluency technique.",
        practiceTips: ["Complete the stuttered word first.", "Take a full pause to relax your articulators.", "Repeat the word using Easy Onset or Light Contact."]
      },
      pullOutInfo: {
        title: "Pull-out Strategy",
        purpose: "To gain control during a moment of stuttering.",
        howItWorks: "When you feel a block or repetition, don't stop. Instead, slow down the movement and transition smoothly into the next sound.",
        practiceTips: ["Stay in the moment of stuttering without tension.", "Slowly release the tension while continuing to speak.", "Transition smoothly into the next sound or word."]
      },
      prepSetInfo: {
        title: "Preparatory Set Strategy",
        purpose: "To prepare for a word you anticipate will be difficult.",
        howItWorks: "Before you start the word, relax your articulators and use a technique (like easy onset) to start the word smoothly.",
        practiceTips: ["Identify a word you think you might stutter on.", "Pause briefly before the word.", "Start the word with a very gentle, relaxed onset."]
      },
      slowerRateInfo: {
        title: "Slower Rate Strategy",
        purpose: "To give the brain and articulators more time to coordinate speech movements.",
        howItWorks: "Stretching out the vowels and pausing slightly between words or phrases.",
        practiceTips: ["Focus on the vowels in each word.", 'Use "turtle speech" - slow and steady.', "Take natural pauses at commas and periods."]
      },
      practiceData: {
        numbers: [{
          text: "1",
          icon: null
        }, {
          text: "2",
          icon: null
        }, {
          text: "3",
          icon: null
        }, {
          text: "4",
          icon: null
        }, {
          text: "5",
          icon: null
        }, {
          text: "6",
          icon: null
        }, {
          text: "7",
          icon: null
        }, {
          text: "8",
          icon: null
        }, {
          text: "9",
          icon: null
        }, {
          text: "10",
          icon: null
        }],
        letterWords: {
          A: ['apple', 'ant', 'arm', 'art', 'ask'], B: ['ball', 'book', 'boat', 'bird', 'bed'],
          C: ['cat', 'cup', 'car', 'cake', 'coat'], D: ['dog', 'door', 'day', 'duck', 'desk'],
          E: ['egg', 'ear', 'eat', 'east', 'easy'], F: ['fish', 'fan', 'food', 'foot', 'farm'],
          G: ['go', 'game', 'gate', 'gift', 'garden'], H: ['hat', 'hand', 'home', 'hill', 'happy'],
          I: ['ice', 'ink', 'in', 'island', 'idea'], J: ['jam', 'jar', 'jump', 'jet', 'juice'],
          K: ['key', 'kite', 'king', 'keep', 'kind'], L: ['lamp', 'leaf', 'leg', 'lake', 'light'],
          M: ['moon', 'milk', 'map', 'mouse', 'morning'], N: ['nose', 'nest', 'net', 'night', 'name'],
          O: ['open', 'ocean', 'oak', 'oval', 'over'], P: ['pen', 'pig', 'park', 'pear', 'paper'],
          Q: ['queen', 'quiet', 'quick', 'quilt', 'question'], R: ['rain', 'red', 'road', 'rose', 'rabbit'],
          S: ['sun', 'sock', 'sea', 'soap', 'sing'], T: ['tree', 'ten', 'table', 'toy', 'tiger'],
          U: ['up', 'under', 'umbrella', 'uncle', 'us'], V: ['van', 'vase', 'vest', 'voice', 'visit'],
          W: ['water', 'wind', 'window', 'walk', 'warm'], X: ['xylophone', 'x-ray'],
          Y: ['yes', 'yellow', 'yard', 'yarn', 'young'], Z: ['zoo', 'zebra', 'zero', 'zip', 'zoom']
        },
        letters: [{
          text: "A",
          icon: null
        }, {
          text: "B",
          icon: null
        }, {
          text: "C",
          icon: null
        }, {
          text: "D",
          icon: null
        }, {
          text: "E",
          icon: null
        }, {
          text: "F",
          icon: null
        }, {
          text: "G",
          icon: null
        }, {
          text: "H",
          icon: null
        }, {
          text: "I",
          icon: null
        }, {
          text: "J",
          icon: null
        }, {
          text: "K",
          icon: null
        }, {
          text: "L",
          icon: null
        }, {
          text: "M",
          icon: null
        }, {
          text: "N",
          icon: null
        }, {
          text: "O",
          icon: null
        }, {
          text: "P",
          icon: null
        }, {
          text: "Q",
          icon: null
        }, {
          text: "R",
          icon: null
        }, {
          text: "S",
          icon: null
        }, {
          text: "T",
          icon: null
        }, {
          text: "U",
          icon: null
        }, {
          text: "V",
          icon: null
        }, {
          text: "W",
          icon: null
        }, {
          text: "X",
          icon: null
        }, {
          text: "Y",
          icon: null
        }, {
          text: "Z",
          icon: null
        }],
        colors: [{
          text: "Red",
          icon: u.jsx(Qt, {
            fill: "#ef4444",
            stroke: "#ef4444"
          })
        }, {
          text: "Blue",
          icon: u.jsx(Qt, {
            fill: "#3b82f6",
            stroke: "#3b82f6"
          })
        }, {
          text: "Green",
          icon: u.jsx(Qt, {
            fill: "#22c55e",
            stroke: "#22c55e"
          })
        }, {
          text: "Yellow",
          icon: u.jsx(Qt, {
            fill: "#eab308",
            stroke: "#eab308"
          })
        }, {
          text: "Orange",
          icon: u.jsx(Qt, {
            fill: "#f97316",
            stroke: "#f97316"
          })
        }, {
          text: "Purple",
          icon: u.jsx(Qt, {
            fill: "#a855f7",
            stroke: "#a855f7"
          })
        }, {
          text: "Pink",
          icon: u.jsx(Qt, {
            fill: "#ec4899",
            stroke: "#ec4899"
          })
        }, {
          text: "Black",
          icon: u.jsx(Qt, {
            fill: "#000000",
            stroke: "#000000"
          })
        }, {
          text: "White",
          icon: u.jsx(Qt, {
            fill: "#ffffff",
            stroke: "#e2e8f0"
          })
        }, {
          text: "Brown",
          icon: u.jsx(Qt, {
            fill: "#78350f",
            stroke: "#78350f"
          })
        }],
        animals: [{
          text: "Cat",
          icon: u.jsx(Ro, {})
        }, {
          text: "Dog",
          icon: u.jsx(Js, {})
        }, {
          text: "Bird",
          icon: u.jsx(Vi, {})
        }, {
          text: "Fish",
          icon: u.jsx(Uo, {})
        }, {
          text: "Rabbit",
          icon: u.jsx(zy, {})
        }, {
          text: "Turtle",
          icon: u.jsx(Fy, {})
        }, {
          text: "Snail",
          icon: u.jsx(Gy, {})
        }, {
          text: "Bug",
          icon: u.jsx(zo, {})
        }, {
          text: "Beetle",
          icon: u.jsx(zo, {})
        }, {
          text: "Mouse",
          icon: u.jsx(qo, {})
        }],
        food: [{
          text: "Apple",
          icon: u.jsx(Ks, {})
        }, {
          text: "Banana",
          icon: u.jsx(Lp, {})
        }, {
          text: "Cherry",
          icon: u.jsx(Pp, {})
        }, {
          text: "Grape",
          icon: u.jsx(hy, {})
        }, {
          text: "Orange",
          icon: u.jsx(Bi, {})
        }, {
          text: "Lemon",
          icon: u.jsx(Bi, {})
        }, {
          text: "Carrot",
          icon: u.jsx(Fp, {})
        }, {
          text: "Pear",
          icon: u.jsx(Bi, {})
        }, {
          text: "Leaf",
          icon: u.jsx(Ho, {})
        }, {
          text: "Flower",
          icon: u.jsx(Lo, {})
        }],
        words: [{
          text: "Apple",
          icon: u.jsx(Ks, {})
        }, {
          text: "Sun",
          icon: u.jsx(Zo, {})
        }, {
          text: "Cloud",
          icon: u.jsx(ef, {})
        }, {
          text: "Cat",
          icon: u.jsx(Ro, {})
        }, {
          text: "Dog",
          icon: u.jsx(Js, {})
        }, {
          text: "Tree",
          icon: u.jsx(Ky, {})
        }, {
          text: "Moon",
          icon: u.jsx(Ny, {})
        }, {
          text: "Star",
          icon: u.jsx(Xo, {})
        }, {
          text: "Book",
          icon: u.jsx(_o, {})
        }, {
          text: "Pen",
          icon: u.jsx(Go, {})
        }, {
          text: "Coffee",
          icon: u.jsx(ty, {})
        }, {
          text: "Table",
          icon: u.jsx(Qo, {})
        }, {
          text: "Door",
          icon: u.jsx(Bo, {})
        }, {
          text: "Car",
          icon: u.jsx(Jp, {})
        }, {
          text: "Bike",
          icon: u.jsx(Gp, {})
        }, {
          text: "Plane",
          icon: u.jsx(rf, {})
        }, {
          text: "Fish",
          icon: u.jsx(Uo, {})
        }, {
          text: "Bird",
          icon: u.jsx(Vi, {})
        }, {
          text: "Flower",
          icon: u.jsx(Lo, {})
        }, {
          text: "Leaf",
          icon: u.jsx(Ho, {})
        }, {
          text: "Rain",
          icon: u.jsx(Wp, {})
        }, {
          text: "Snow",
          icon: u.jsx(Ip, {})
        }, {
          text: "Fire",
          icon: u.jsx(sy, {})
        }, {
          text: "Heart",
          icon: u.jsx(yy, {})
        }, {
          text: "Music",
          icon: u.jsx(Ey, {})
        }, {
          text: "Phone",
          icon: u.jsx(qy, {})
        }, {
          text: "Laptop",
          icon: u.jsx(vy, {})
        }, {
          text: "Watch",
          icon: u.jsx(ng, {})
        }, {
          text: "Headphones",
          icon: u.jsx(py, {})
        }, {
          text: "Camera",
          icon: u.jsx($p, {})
        }, {
          text: "Mic",
          icon: u.jsx(Of, {})
        }, {
          text: "Speaker",
          icon: u.jsx(Yy, {})
        }, {
          text: "TV",
          icon: u.jsx(Py, {})
        }, {
          text: "Game",
          icon: u.jsx(ry, {})
        }, {
          text: "Mouse",
          icon: u.jsx(qo, {})
        }, {
          text: "Keys",
          icon: u.jsx(xy, {})
        }, {
          text: "Screen",
          icon: u.jsx(Ay, {})
        }, {
          text: "Print",
          icon: u.jsx(_y, {})
        }, {
          text: "Battery",
          icon: u.jsx(Hp, {})
        }, {
          text: "Wifi",
          icon: u.jsx(ag, {})
        }, {
          text: "Blue",
          icon: u.jsx(Yp, {})
        }, {
          text: "Mail",
          icon: u.jsx(Sy, {})
        }, {
          text: "Bell",
          icon: u.jsx(qp, {})
        }, {
          text: "Search",
          icon: u.jsx(Vy, {})
        }, {
          text: "Settings",
          icon: u.jsx(By, {})
        }, {
          text: "User",
          icon: u.jsx(tg, {})
        }, {
          text: "Lock",
          icon: u.jsx(jy, {})
        }, {
          text: "Unlock",
          icon: u.jsx(wy, {})
        }, {
          text: "Key",
          icon: u.jsx(sf, {})
        }, {
          text: "Eye",
          icon: u.jsx(ay, {})
        }, {
          text: "Trash",
          icon: u.jsx(Qy, {})
        }, {
          text: "Share",
          icon: u.jsx(Uy, {})
        }, {
          text: "Down",
          icon: u.jsx(ny, {})
        }, {
          text: "Up",
          icon: u.jsx(Iy, {})
        }, {
          text: "Folder",
          icon: u.jsx(ly, {})
        }, {
          text: "File",
          icon: u.jsx(nf, {})
        }, {
          text: "Image",
          icon: u.jsx(af, {})
        }, {
          text: "Video",
          icon: u.jsx(eg, {})
        }, {
          text: "Map",
          icon: u.jsx(Ty, {})
        }, {
          text: "Nav",
          icon: u.jsx(lf, {})
        }, {
          text: "Compass",
          icon: u.jsx(ey, {})
        }, {
          text: "Globe",
          icon: u.jsx(dy, {})
        }, {
          text: "Flag",
          icon: u.jsx(iy, {})
        }, {
          text: "Anchor",
          icon: u.jsx(Iu, {})
        }, {
          text: "Truck",
          icon: u.jsx(Jy, {})
        }, {
          text: "Ship",
          icon: u.jsx(Ly, {})
        }, {
          text: "Bus",
          icon: u.jsx(Zp, {})
        }, {
          text: "Train",
          icon: u.jsx(uf, {})
        }, {
          text: "Rocket",
          icon: u.jsx(Ry, {})
        }, {
          text: "Umbrella",
          icon: u.jsx(Wy, {})
        }, {
          text: "Wind",
          icon: u.jsx(Gn, {})
        }, {
          text: "Zap",
          icon: u.jsx(al, {})
        }, {
          text: "Skull",
          icon: u.jsx(Hy, {})
        }, {
          text: "Ghost",
          icon: u.jsx(cy, {})
        }, {
          text: "Smile",
          icon: u.jsx(Yo, {})
        }, {
          text: "Frown",
          icon: u.jsx(oy, {})
        }, {
          text: "Meh",
          icon: u.jsx(ky, {})
        }, {
          text: "Laugh",
          icon: u.jsx(by, {})
        }, {
          text: "Smile",
          icon: u.jsx(Yo, {})
        }, {
          text: "Pulse",
          icon: u.jsx(va, {})
        }, {
          text: "Doctor",
          icon: u.jsx(Xy, {})
        }, {
          text: "Pill",
          icon: u.jsx(Cy, {})
        }, {
          text: "Syringe",
          icon: u.jsx(Zy, {})
        }, {
          text: "Work",
          icon: u.jsx(Xp, {})
        }, {
          text: "Grad",
          icon: u.jsx(fy, {})
        }, {
          text: "Trophy",
          icon: u.jsx($y, {})
        }, {
          text: "Medal",
          icon: u.jsx(My, {})
        }, {
          text: "Target",
          icon: u.jsx(Bf, {})
        }, {
          text: "Hammer",
          icon: u.jsx(my, {})
        }, {
          text: "Wrench",
          icon: u.jsx(ig, {})
        }, {
          text: "Cut",
          icon: u.jsx(Oy, {})
        }, {
          text: "Brush",
          icon: u.jsx(tf, {})
        }, {
          text: "Art",
          icon: u.jsx(of, {})
        }, {
          text: "Math",
          icon: u.jsx(Kp, {})
        }, {
          text: "Gift",
          icon: u.jsx(uy, {})
        }, {
          text: "Cake",
          icon: u.jsx(Qp, {})
        }, {
          text: "Pizza",
          icon: u.jsx(Dy, {})
        }, {
          text: "Ice",
          icon: u.jsx(gy, {})
        }, {
          text: "Star",
          icon: u.jsx(Xo, {})
        }, {
          text: "Sun",
          icon: u.jsx(Zo, {})
        }],
        plosives: [{
          text: "P - Pen",
          icon: u.jsx(Go, {})
        }, {
          text: "B - Ball",
          icon: u.jsx(Qt, {})
        }, {
          text: "T - Table",
          icon: u.jsx(Qo, {})
        }, {
          text: "D - Dog",
          icon: u.jsx(Js, {})
        }, {
          text: "K - Key",
          icon: u.jsx(sf, {})
        }, {
          text: "G - Go",
          icon: u.jsx(fr, {})
        }, {
          text: "P - Paper",
          icon: u.jsx(nf, {})
        }, {
          text: "B - Book",
          icon: u.jsx(_o, {})
        }, {
          text: "T - Ten",
          icon: u.jsx(Yj, {})
        }, {
          text: "D - Door",
          icon: u.jsx(Bo, {})
        }],
        sentences: ["The cat is sleeping.", "I like to eat apples.", "The sun is very hot.", "I have a blue car.", "The birds are singing.", "It is raining outside.", "I read a book today.", "The flowers are beautiful.", "I drink water every day.", "The sky is very clear.", "I go to school now.", "My dog is very friendly.", "I love my family.", "The tree is very tall.", "I see a big plane.", "The fish is swimming.", "I sit on the chair.", "The door is open.", "I write with a pen.", "The moon is bright.", "I play with my friends.", "The snow is white.", "I eat a tasty meal.", "The star is far away.", "I am happy today.", "The grass is green.", "I wear a warm coat.", "The wind is blowing.", "I like to swim.", "The cake is sweet.", "I see a red bird.", "The mountain is high.", "I walk in the park.", "The river is wide.", "I have a new toy.", "The clock is ticking.", "I listen to music.", "The soup is hot.", "I jump very high.", "The ball is round.", "I draw a picture.", "The baby is crying.", "I help my mother.", "The father is working.", "I sleep in my bed.", "The window is clean.", "I open the box.", "The light is on.", "I close the book.", "The road is long.", "I run in the field.", "The horse is fast.", "I see a small bug.", "The elephant is big.", "I like the zoo.", "The lion is loud.", "I eat some bread.", "The milk is cold.", "I have ten fingers.", "The shoes are black.", "I wear a hat.", "The shirt is clean.", "I wash my hands.", "The soap is bubbly.", "I brush my teeth.", "The mirror is shiny.", "I look at myself.", "The house is big.", "I live in a city.", "The farm has cows.", "I see a tractor.", "The corn is yellow.", "I pick a flower.", "The bee is buzzing.", "I like the honey.", "The ant is small.", "I watch the rain.", "The umbrella is wet.", "I walk in puddles.", "The mud is sticky.", "I build a tower.", "The blocks are colorful.", "I share my toys.", "The teacher is kind.", "I learn new things.", "The school is fun.", "I have a backpack.", "The pencil is sharp.", "I write my name.", "The paper is white.", "I fold the paper.", "The plane is flying.", "I see the clouds.", "The sky is blue.", "The stars are bright.", "I wish on a star.", "The night is quiet.", "I dream of magic.", "The world is big.", "I am a good kid."],
        stories: ["Once upon a time, a small blue bird lived in a giant oak tree. Every morning, it would wake up early to sing a beautiful song to the sun. The other animals in the forest would stop and listen to the sweet melody. It made everyone feel happy and ready for the new day ahead.", "A curious cat named Luna found a shiny red ball in the garden. She chased it through the tall grass and under the wooden bench. The ball bounced high into the air, and Luna jumped with all her might to catch it. After hours of playing, she curled up in a sunny spot for a long nap.", "The golden sun began to set behind the distant purple mountains. As the sky turned shades of orange and pink, the first bright star appeared. The silver moon rose slowly, casting a soft glow over the quiet meadow. It was a peaceful night, and the world was finally going to sleep.", "Last Saturday, my family and I went to the local park for a picnic. We found a perfect spot under a shady willow tree near the pond. I saw a big, friendly dog playing fetch with its owner in the distance. We ate delicious sandwiches and enjoyed the fresh air all afternoon.", "A gentle rain started to fall from the heavy grey clouds above. The thirsty flowers lifted their heads to drink the cool water. Soon, the dry brown grass began to turn a vibrant shade of green. A beautiful rainbow appeared in the sky, stretching from one side of the valley to the other.", "The brave explorer climbed the highest mountain in the world. He carried a heavy backpack filled with tools and supplies. The wind was cold and strong, but he did not give up. When he finally reached the top, he saw the most amazing view he had ever seen.", "In a small village, there was a baker who made the best bread. Every morning, the smell of fresh bread would fill the streets. People would line up outside his shop to buy a warm loaf. He always had a kind smile and a friendly word for every customer.", "The little robot wanted to learn how to paint like a human. It gathered many colors and a large white canvas. At first, it only made messy lines and spots. But with a lot of practice, it created a beautiful picture of a garden filled with flowers.", "A giant whale swam through the deep blue ocean. It traveled thousands of miles to find a warmer place for the winter. Along the way, it met many interesting sea creatures like dolphins and turtles. The ocean was full of wonder and mystery for the giant whale.", "The old library was filled with thousands of ancient books. The air smelled like old paper and dust. A young student spent every afternoon reading about history and science. She loved to get lost in the stories and learn about the world from the past.", "A small village nestled in the valley was known for its magical clock tower. Every hour, the clock would chime a melody that could be heard for miles. Legend says that the clock was built by a wizard who wanted to bring peace to the land. Whenever the music played, people would stop their work and smile at their neighbors.", "The old forest was home to a tree that grew silver leaves. These leaves would glow softly in the moonlight, illuminating the path for lost travelers. Many people tried to find the tree, but it only appeared to those who were truly kind of heart. One young girl found it while searching for her lost kitten.", "A group of children discovered a hidden cave behind a waterfall during their summer vacation. Inside, the walls were covered in ancient paintings of stars and planets. They felt like they had stepped into another world entirely. They promised to keep the cave a secret and returned every day to explore its mysteries.", "The master gardener spent years creating a maze made of fragrant rose bushes. People traveled from far away to walk through the winding paths and smell the sweet perfume. In the center of the maze was a beautiful marble fountain that sparkled in the sun. It was a place where anyone could find quiet and beauty.", "A lonely lighthouse stood on a rocky cliff, guiding ships safely through the stormy seas. The lighthouse keeper was an old man who loved the sound of the crashing waves. He spent his nights polishing the giant lens and watching the distant lights of passing boats. He knew every rock and current in the dangerous waters.", "The secret garden was hidden behind a tall stone wall covered in ivy. Inside, flowers of every color bloomed all year round, even in the middle of winter. A small wooden bridge crossed a sparkling stream where golden fish swam lazily. It was a magical place where time seemed to stand still and worries disappeared.", "A young musician found an old violin in the attic of his grandfather's house. When he played it, the music was so beautiful that birds would gather on the windowsill to listen. He practiced every day, and soon he was invited to play in the grand concert hall. His music brought joy to everyone who heard it.", "The clever fox lived in a cozy den under the roots of a great oak tree. He was known for his ability to solve any problem and help his forest friends. One day, he helped a lost owl find its way home by following the patterns of the stars. The fox was a true friend to all the creatures in the woods.", "A giant castle made of ice stood at the very top of the world. It was ruled by a queen who could control the wind and the snow with a wave of her hand. The castle sparkled like a diamond in the bright northern lights. Many brave knights tried to reach the castle, but only the bravest could withstand the cold.", "The friendly dragon lived in a large cave filled with books instead of gold. He loved to read stories about far-off lands and exciting adventures. Sometimes, he would invite the village children to the cave and read to them by the warmth of his gentle fire. Everyone in the village loved the book-loving dragon.", "A small wooden boat sailed across the calm lake at dawn. The morning mist rose from the water, creating a mysterious and beautiful scene. A fisherman sat quietly in the boat, waiting for the first catch of the day. The only sound was the gentle lapping of the water against the side of the boat.", "The busy city was filled with tall buildings that reached for the sky. People hurried along the sidewalks, going about their daily lives with purpose. At night, the city transformed into a sea of twinkling lights and colorful signs. It was a place of endless energy and excitement, where something new was always happening.", "A group of hikers followed a narrow trail through the dense pine forest. The air was cool and smelled of pine needles and damp earth. They climbed higher and higher until they reached a rocky outcrop with a stunning view of the valley below. It was a challenging hike, but the reward was worth it.", "The old clockmaker spent his days repairing delicate watches and grand grandfather clocks. His shop was filled with the sound of hundreds of ticking clocks, creating a rhythmic and soothing atmosphere. He had a steady hand and a keen eye for detail, and he took great pride in his craftsmanship.", "A beautiful butterfly with bright blue wings emerged from its cocoon in the spring. It fluttered from flower to flower, drinking sweet nectar and enjoying the warm sunshine. It was a symbol of new beginnings and the beauty of nature. The butterfly's journey was just beginning as it explored the vibrant garden.", "The mysterious island was surrounded by a thick fog that never lifted. Sailors told stories of hidden treasures and strange creatures that lived on the island. A brave captain decided to sail through the fog and discover the island's secrets. What he found was a tropical paradise filled with exotic fruits and colorful birds.", "A young scientist spent years studying the stars through a giant telescope. He discovered a new planet that was covered in oceans of liquid silver. His discovery changed the way people thought about the universe and inspired a new generation of explorers. He was honored with a prestigious award for his groundbreaking work.", "The cozy cottage was nestled in a field of wildflowers at the edge of the woods. A warm fire crackled in the fireplace, and the smell of baking cookies filled the air. It was a place of comfort and peace, where friends and family gathered to share stories and laughter. The cottage was a true home.", "A brave knight rode his white horse through the dark and dangerous forest. He was on a quest to find a magical sword that could defeat the evil sorcerer. He faced many challenges along the way, but his courage and determination never wavered. He knew that the fate of the kingdom rested on his shoulders.", "The ancient temple was hidden deep in the jungle, covered in vines and moss. It was built thousands of years ago by a civilization that had long since disappeared. A team of archaeologists carefully cleared away the jungle to reveal the temple's stunning carvings and hidden chambers. It was a discovery of a lifetime.", "A small stream flowed gently through the meadow, providing water for the thirsty animals. The water was clear and cool, and small pebbles sparkled on the bottom. In the spring, the banks of the stream were lined with bright yellow primroses. It was a peaceful and beautiful place to sit and enjoy the sounds of nature.", "The grand theater was filled with people dressed in their finest clothes. They had come to see a performance of a famous play that had been written hundreds of years ago. The actors performed with passion and skill, and the audience was captivated by the story. It was a night of magic and wonder that they would never forget.", "A young artist sat in the park with her sketchbook and pencils. She drew the people walking by, the trees swaying in the wind, and the birds flying overhead. She had a talent for capturing the beauty in everyday moments. Her sketches were filled with life and emotion, and she hoped to one day become a famous painter.", "The old windmill stood on a hill, its giant sails turning slowly in the breeze. It had been used for generations to grind grain into flour for the village. The miller was a hardworking man who took great care of the windmill. He loved the sound of the sails turning and the smell of fresh flour.", "A group of scientists lived in a research station at the South Pole. They studied the ice and the weather to learn more about the Earth's climate. It was a cold and harsh environment, but they were dedicated to their work. They spent their days collecting data and their nights watching the amazing aurora australis.", "The secret path led through a tunnel of tall hedges to a hidden pond. The water was still and reflected the surrounding trees like a mirror. A family of ducks lived on the pond, and they would swim gracefully across the water. It was a quiet and secluded spot where anyone could go to escape the busy world.", "A young boy found a message in a bottle while walking along the beach. The message was written in a language he didn't understand, but it was accompanied by a map of a distant island. He spent weeks trying to translate the message and study the map. He dreamed of one day going on an adventure to find the island.", "The busy market was filled with the sounds of people bargaining and the smells of exotic spices. Stalls were piled high with colorful fruits, handmade crafts, and beautiful fabrics. It was a vibrant and exciting place where people from all over the world came to trade and share their cultures.", "A wise old owl lived in a hollow tree in the middle of the forest. The other animals would come to him for advice and guidance. He had seen many things in his long life and had a deep understanding of the world. He was a respected and loved member of the forest community.", "The beautiful garden was filled with flowers that bloomed in every season. In the spring, there were tulips and daffodils; in the summer, roses and lilies; in the autumn, chrysanthemums; and in the winter, snowdrops. It was a place of constant beauty and change, where nature's wonders were always on display.", "A young girl learned how to bake bread from her grandmother. They would spend the afternoon in the kitchen, mixing the flour and water and kneading the dough. The smell of fresh bread baking in the oven was the best smell in the world. She loved learning the old traditions and sharing the warm bread with her family.", "The old train chugged slowly through the mountains, its whistle echoing through the valleys. The passengers looked out the windows at the stunning scenery of snow-capped peaks and sparkling lakes. It was a slow and peaceful journey that allowed them to appreciate the beauty of the world.", "A group of volunteers spent their weekend planting trees in the local park. They wanted to create a better environment for the future and provide a home for the birds and animals. It was hard work, but they felt a sense of pride and accomplishment. They knew that their efforts would make a difference for generations to come.", "The mysterious book was bound in dark leather and had a silver lock. It was found in a hidden compartment of an old desk. No one knew who had written the book or what secrets it contained. A young historian spent years trying to open the lock and discover the book's mysteries.", "A beautiful swan swam gracefully across the lake, its white feathers reflecting in the water. It was a symbol of elegance and beauty. The swan lived on the lake with its family, and they would spend their days swimming and searching for food. It was a peaceful and serene life.", "The old bridge was made of stone and had stood for hundreds of years. It crossed a wide river that flowed through the center of the town. People walked across the bridge every day, going about their business. It was a landmark that connected the two sides of the town and held many memories for the local people.", "A young boy built a treehouse in the giant maple tree in his backyard. He spent his summer afternoons in the treehouse, reading books and playing games with his friends. It was his own secret place where he could imagine he was an explorer or a pirate. The treehouse was a place of endless fun and adventure.", "The busy harbor was filled with ships of all sizes, from small fishing boats to giant cargo ships. The sound of foghorns and the smell of salt air filled the atmosphere. It was a place of constant activity and trade, where goods from all over the world were brought to the city.", "A beautiful sunset painted the sky in shades of orange, pink, and purple. The sun slowly disappeared below the horizon, leaving behind a soft glow. It was a moment of peace and beauty that marked the end of another day. The world was quiet as the first stars began to appear in the darkening sky.", "The old clock in the town square had been ticking for over a hundred years. It was a symbol of the town's history and a constant reminder of the passing of time. People would gather in the square to hear the clock chime the hour. It was a beloved landmark that held a special place in the hearts of the townspeople."],
        practice: []
      }
    },
    ar: {
      title: "كلام وطلاقة",
      welcome: "مرحباً بك مجدداً",
      subtitle: "اختر استراتيجية للتدريب عليها اليوم.",
      fluencyShaping: "تشكيل الطلاقة",
      fluencyDesc: "تقنيات لزيادة طلاقة الكلام من خلال التحكم الجسدي.",
      stutteringMod: "تعديل التأتأة",
      stutteringDesc: "استراتيجيات لتقليل التوتر وإدارة لحظات التأتأة.",
      breathingTech: "تقنيات التنفس",
      breathingDesc: "إدارة التوتر والقلق من خلال التنفس الحجابي.",
      slowerRate: "معدل أبطأ",
      easyOnsets: "بدايات سهلة",
      easyOnsetDesc: "بدايات لطيفة مع التنفس قبل التحدث لتقليل التوتر.",
      easyOnsetIntro: "ابدأ بتنفس لطيف (صوت هـ) قبل كل كلمة لتسهيل الكلام.",
      cancellationIntro: "بعد الكلمة التي حدثت فيها تأتأة، توقف وأعدها بتقنية لطيفة.",
      pullOutIntro: "أثناء التأتأة، أبطئ الحركة وانتقل بسلاسة إلى الصوت التالي.",
      prepSetIntro: "استعد للكلمات الصعبة من خلال بدئها بتقنية لطيفة.",
      lightContacts: "لمسات خفيفة",
      cancellations: "الإلغاء",
      pullOuts: "الانسحاب",
      prepSets: "المجموعات التحضيرية",
      fluencyQuote: '"الكلام السلس رحلة وليس وجهة. خذ وقتك مع كل نفس."',
      stutteringQuote: '"التعديل يدور حول السيطرة والثقة خلال لحظات التوتر."',
      breathingInfo: {
        title: "تقنيات التنفس",
        purpose: "تقليل التوتر الجسدي وإدارة قلق التحدث من خلال الانتقال إلى أنفاس عميقة ومنضبطة.",
        techniques: [{
          name: "التنفس الحجابي (تنفس البطن)",
          steps: ["ضع إحدى يديك على صدرك والأخرى على بطنك.", "استنشق ببطء من خلال أنفك، وتأكد من ارتفاع بطنك بينما يظل صدرك ساكناً نسبياً.", "ازفر ببطء، وشعور ببطنك ينخفض."]
        }, {
          name: "التنفس المنظم",
          steps: ["عند الشعور بالتأتأة، توقف عن الكلام ومارس التنفس الحجابي المسترخي.", "ركز على إرخاء عضلات الحلق والصدر.", "ابدأ التحدث بزفير صغير ولطيف."]
        }, {
          name: "الزفير المنضبط",
          steps: ["تدرب على الشهيق لمدة ثلاث ثوانٍ، والتوقف، والزفير لمدة ثلاث ثوانٍ مع الحفاظ على استرخاء الكتفين.", 'ركز على الزفير أثناء إصدار الصوت (مثل صوت "هـ" أو حروف العلة).']
        }],
        tips: ["تدرب عندما تكون هادئاً لتجعلها طبيعية أثناء مواقف التحدث المجهدة.", "تأكد من بقاء الكتفين وأعلى الصدر مسترخيين لتجنب التوتر.", "تجنب التنفس المفرط؛ اهدف إلى نفس مريح ومعتدل.", "اجلس في وضع مريح ومستقيم مع دعم الظهر."]
      },
      home: "الرئيسية",
      profile: "الملف الشخصي",
      back: "رجوع",
      fluencyIntro: "ركز على الميكانيكا الجسدية للكلام لخلق تدفق مستمر.",
      stutteringIntro: "تعلم كيف تتأتأ بسهولة أكبر وتقليل المعاناة الجسدية.",
      breathingIntro: "ركز على أنفاس عميقة ومنضبطة لإرخاء عضلات الكلام.",
      inhale: "شهيق",
      exhale: "زفير",
      hold: "توقف",
      duration: "المدة",
      seconds: "ث",
      speed: "السرعة",
      normal: "طبيعي",
      slow: "بطيء",
      level: "المستوى",
      numbers: "الأرقام",
      letters: "الحروف",
      colors: "الألوان",
      animals: "الحيوانات",
      food: "خضار وفواكه",
      words: "كلمات",
      sentences: "جمل",
      stories: "قصص",
      play: "تشغيل",
      pause: "إيقاف",
      reset: "إعادة",
      practice: "التدريب",
      next: "التالي",
      prev: "السابق",
      info: "معلومات",
      record: "تسجيل",
      stop: "إيقاف",
      playRecording: "تشغيل التسجيل",
      recording: "جاري التسجيل...",
      clear: "مسح",
      infoDesc: "تعرف على المزيد حول التطبيق وكيفية استخدامه بفعالية لتحسين طلاقتك.",
      appInfo: {
        title: "عن تطبيق كلام وطلاقة",
        purpose: "تطبيق كلام وطلاقة هو أداة شاملة لعلاج النطق مصممة لمساعدة الأشخاص الذين يعانون من التأتأة على ممارسة استراتيجيات الطلاقة القائمة على الأدلة بطريقة منظمة وجذابة.",
        howToUse: [{
          title: "١. اختر استراتيجية",
          content: "ابدأ باختيار واحدة من الفئات الثلاث الرئيسية: تشكيل الطلاقة، أو تعديل التأتأة، أو تقنيات التنفس."
        }, {
          title: "٢. اختر مستوى التدريب",
          content: "تقدم كل استراتيجية مستويات مختلفة، من الأصوات والكلمات المفردة إلى القصص الكاملة. ابدأ بالبسيط وتقدم كلما شعرت بمزيد من الثقة."
        }, {
          title: "٣. استخدم التدريب الموجه",
          content: "اضغط على زر التشغيل لبدء الدليل المرئي. اتبع النص المميز أو الرسوم المتحركة لضبط توقيت كلامك مع التقنية المختارة."
        }, {
          title: "٤. اضبط الإعدادات",
          content: "استخدم أشرطة تمرير السرعة أو أشرطة المدة لمطابقة التدريب مع قدرتك الحالية. البطء غالباً ما يكون أفضل عند تعلم تقنية جديدة."
        }],
        tips: ["الاستمرارية هي المفتاح: ١٠ دقائق من التدريب اليومي أفضل من جلسة واحدة طويلة في الأسبوع.", "سجل نفسك: الاستماع إلى كلامك الخاص يمكن أن يساعدك في تحديد مجالات التحسين.", "ابق مسترخياً: الاسترخاء الجسدي هو أساس الكلام السلس."]
      },
      plosives: "الحروف الانفجارية",
      lightContactInfo: {
        title: "استراتيجية اللمس الخفيف",
        purpose: "الهدف الأساسي هو تقليل أو منع التوتر المرتبط بلحظات التأتأة.",
        howItWorks: "بدلاً من الضغط بقوة على الشفتين أو اللسان، يلمس المتحدث أعضاء النطق ببعضها البعض بخفة شديدة.",
        targetSounds: "تكون أكثر فعالية مع الأصوات الانفجارية حيث يتم إعاقة تدفق الهواء، مثل /ب/، /ت/، /د/، /ك/، /ق/، /ج/.",
        application: "تُستخدم لبدء الكلمات أو الجمل بجهد أقل، مما يجعل الكلام أكثر راحة.",
        practiceTips: ["الاسترخاء: ابدأ بتنفس مريح لتقليل التوتر العام.", "حركة لطيفة: ركز على حركة خفيفة ومنضبطة وبطيئة لأعضاء النطق.", 'أمثلة: تدرب على قول كلمات مثل "باب" أو "طاولة" مع لمس الشفتين أو اللسان بخفة شديدة.'],
        plosiveDetails: {
          ب: "المس شفتيك معاً بالكاد. تخيل أنك تنفخ فقاعة صغيرة جداً لا يجب أن تنفجر.",
          ت: "يجب أن يلمس طرف لسانك بالكاد المنطقة خلف أسنانك العلوية.",
          د: "نقرة خفيفة جداً بطرف اللسان. اجعل اللمس قصيراً وناعماً قدر الإمكان.",
          ط: "لمسة خفيفة جداً بطرف اللسان مع سقف الحلق الصلب.",
          ك: "يجب أن يلمس الجزء الخلفي من لسانك سقف فمك بلطف دون أي ضغط.",
          ق: "لمسة خفيفة جداً للجزء الخلفي من اللسان مع الحنك الرخو."
        }
      },
      easyOnsetInfo: {
        title: "استراتيجية البداية السهلة",
        purpose: "بدء الصوت بلطف وتدريج لمنع انغلاق الحبال الصوتية بقوة.",
        howItWorks: 'ابدأ بصوت "هـ" ناعم قبل الانتقال إلى الكلمة.',
        practiceTips: ["ازفر قليلاً قبل البدء في الكلام.", "تخيل أن الصوت يبدأ كهمس ثم يتحول إلى صوت واضح.", "حافظ على حلقك مسترخياً ومفتوحاً."]
      },
      cancellationInfo: {
        title: "استراتيجية الإلغاء",
        purpose: "تعلم التوقف بعد الكلمة التي حدثت فيها تأتأة وإعادتها بتوتر أقل.",
        howItWorks: "عندما تتأتأ، أكمل الكلمة، توقف للحظة، ثم قل الكلمة مرة أخرى باستخدام تقنية الطلاقة.",
        practiceTips: ["أكمل الكلمة المتأتأ بها أولاً.", "خذ وقفة كاملة لإرخاء أعضاء النطق.", "أعد الكلمة باستخدام البداية السهلة أو اللمس الخفيف."]
      },
      pullOutInfo: {
        title: "استراتيجية الانسحاب",
        purpose: "السيطرة خلال لحظة التأتأة.",
        howItWorks: "عندما تشعر بانغلاق أو تكرار، لا تتوقف. بدلاً من ذلك، أبطئ الحركة وانتقل بسلاسة إلى الصوت التالي.",
        practiceTips: ["ابق في لحظة التأتأة دون توتر.", "قلل التوتر ببطء أثناء الاستمرار في الكلام.", "انتقل بسلاسة إلى الصوت أو الكلمة التالية."]
      },
      prepSetInfo: {
        title: "استراتيجية المجموعات التحضيرية",
        purpose: "الاستعداد لكلمة تتوقع أنها ستكون صعبة.",
        howItWorks: "قبل أن تبدأ الكلمة، أرخِ أعضاء النطق واستخدم تقنية (مثل البداية السهلة) لبدء الكلمة بسلاسة.",
        practiceTips: ["حدد الكلمة التي تعتقد أنك قد تتأتأ فيها.", "توقف لفترة وجيزة قبل الكلمة.", "ابدأ الكلمة ببدء لطيف ومسترخٍ للغاية."]
      },
      slowerRateInfo: {
        title: "استراتيجية المعدل البطيء",
        purpose: "إعطاء الدماغ وأعضاء النطق مزيداً من الوقت لتنسيق حركات الكلام.",
        howItWorks: "إطالة الحركات الصوتية والتوقف قليلاً بين الكلمات.",
        practiceTips: ["ركز على إطالة الحروف المتحركة في كل كلمة.", 'استخدم "كلام السلحفاة" - بطيء وثابت.', "خذ فترات توقف طبيعية عند الفواصل والنقاط."]
      },
      practiceData: {
        numbers: [{
          text: "١",
          icon: null
        }, {
          text: "٢",
          icon: null
        }, {
          text: "٣",
          icon: null
        }, {
          text: "٤",
          icon: null
        }, {
          text: "٥",
          icon: null
        }, {
          text: "٦",
          icon: null
        }, {
          text: "٧",
          icon: null
        }, {
          text: "٨",
          icon: null
        }, {
          text: "٩",
          icon: null
        }, {
          text: "١٠",
          icon: null
        }],
        letterWords: {
          أ: ["أرنب", "أسد", "أمل", "أنا", "أمي", "أب", "أكل", "أحب", "أبيض", "أخضر"],
          ب: ["باب", "بطة", "بيت", "بحر", "بنت", "بصل", "برتقال", "بنطلون", "برق", "بسمة"],
          ت: ["تفاح", "تمر", "تين", "تمساح", "تاج", "تراب", "تلفاز", "توت", "تحت", "ترك"],
          ث: ["ثلج", "ثوب", "ثعبان", "ثمار", "ثوم", "ثور", "ثقيل", "ثعلب", "ثلاثة", "ثمن"],
          ج: ["جمل", "جرس", "جبل", "جدار", "جدي", "جزرة", "جسر", "جندي", "جوال", "جائع"],
          ح: ["حلم", "حليب", "حصان", "حوت", "حمام", "حديقة", "حلوى", "حر", "حقل", "حبل"],
          خ: ["خبز", "خروف", "خريطة", "خيار", "خاتم", "خشب", "خوخ", "خيمة", "خروج", "خل"],
          د: ["ديك", "دلو", "دب", "درج", "دراجة", "دواء", "دفتر", "دمية", "دجاجة", "دار"],
          ذ: ["ذيل", "ذبابة", "ذرة", "ذهب", "ذئب", "ذكي", "ذراع", "ذوق", "ذكر", "ذهن"],
          ر: ["رمان", "رجل", "رسالة", "رأس", "رمل", "ربيع", "ريشة", "رعد", "ربح", "رياح"],
          ز: ["زرافة", "زيت", "زهرة", "زورق", "زنبق", "زبادي", "زلزال", "زوج", "زر", "زيتون"],
          س: ["سيارة", "سحابة", "ساعة", "سمكة", "سكين", "سكر", "سباحة", "سرير", "سلام", "سفينة"],
          ش: ["شمس", "شجرة", "شتاء", "شارع", "شمعة", "شاي", "شعر", "شنطة", "شيكولاتة", "شلال"],
          ص: ["صقر", "صندوق", "صباح", "صابون", "صوص", "صياد", "صيف", "صوت", "صورة", "صديق"],
          ض: ["ضفدع", "ضوء", "ضرس", "ضيف", "ضمادة", "ضباب", "ضرب", "ضحك", "ضلع", "ضمن"],
          ط: ["طائرة", "طاولة", "طير", "طفل", "طريق", "طبيب", "طعام", "طباشير", "طلب", "طبل"],
          ظ: ["ظرف", "ظهر", "ظل", "ظفر", "ظلام", "ظبي", "ظن", "ظهر", "ظريف", "ظلم"],
          ع: ["عين", "عصفور", "علم", "عنب", "عسل", "عقل", "عريس", "عشاء", "عطلة", "عجلة"],
          غ: ["غابة", "غزال", "غيمة", "غراب", "غداء", "غسالة", "غطاء", "غصن", "غبار", "غنى"],
          ف: ["فراشة", "فيل", "فواكه", "فستان", "فأس", "فصل", "فجر", "فم", "فكر", "فوز"],
          ق: ["قلم", "قمر", "قطة", "قفص", "قلب", "قطار", "قبعة", "قميص", "قدم", "قوي"],
          ك: ["كتاب", "كلب", "كرسي", "كوب", "كرة", "كعكة", "كهف", "كتف", "كنز", "كسل"],
          ل: ["ليمون", "لاعب", "ليل", "لسان", "لون", "لحم", "لؤلؤ", "لوحة", "لوز", "ليفة"],
          م: ["موز", "مفتاح", "ماء", "مدرسة", "مقص", "ملعقة", "معلم", "منزل", "مسجد", "مطر"],
          ن: ["نخلة", "نملة", "نحلة", "نجوم", "نار", "نمر", "نظارة", "نهر", "نوم", "نبض"],
          هـ: ["هلال", "هواء", "هدية", "هاتف", "هرم", "هروب", "هدوء", "هذه", "هو", "هي"],
          و: ["ولد", "ورد", "وجه", "ورقة", "وحيد", "وعاء", "وادي", "وطن", "وزة", "وقت"],
          ي: ["يد", "يمامة", "يسار", "ياسمين", "يوم", "يقطين", "ينبوع", "يقين", "يكبر", "يمشي"]
        },
        letters: [{
          text: "أ",
          icon: null
        }, {
          text: "ب",
          icon: null
        }, {
          text: "ت",
          icon: null
        }, {
          text: "ث",
          icon: null
        }, {
          text: "ج",
          icon: null
        }, {
          text: "ح",
          icon: null
        }, {
          text: "خ",
          icon: null
        }, {
          text: "د",
          icon: null
        }, {
          text: "ذ",
          icon: null
        }, {
          text: "ر",
          icon: null
        }, {
          text: "ز",
          icon: null
        }, {
          text: "س",
          icon: null
        }, {
          text: "ش",
          icon: null
        }, {
          text: "ص",
          icon: null
        }, {
          text: "ض",
          icon: null
        }, {
          text: "ط",
          icon: null
        }, {
          text: "ظ",
          icon: null
        }, {
          text: "ع",
          icon: null
        }, {
          text: "غ",
          icon: null
        }, {
          text: "ف",
          icon: null
        }, {
          text: "ق",
          icon: null
        }, {
          text: "ك",
          icon: null
        }, {
          text: "ل",
          icon: null
        }, {
          text: "م",
          icon: null
        }, {
          text: "ن",
          icon: null
        }, {
          text: "هـ",
          icon: null
        }, {
          text: "و",
          icon: null
        }, {
          text: "ي",
          icon: null
        }],
        colors: [{
          text: "أحمر",
          icon: u.jsx(Qt, {
            fill: "#ef4444",
            stroke: "#ef4444"
          })
        }, {
          text: "أزرق",
          icon: u.jsx(Qt, {
            fill: "#3b82f6",
            stroke: "#3b82f6"
          })
        }, {
          text: "أخضر",
          icon: u.jsx(Qt, {
            fill: "#22c55e",
            stroke: "#22c55e"
          })
        }, {
          text: "أصفر",
          icon: u.jsx(Qt, {
            fill: "#eab308",
            stroke: "#eab308"
          })
        }, {
          text: "برتقالي",
          icon: u.jsx(Qt, {
            fill: "#f97316",
            stroke: "#f97316"
          })
        }, {
          text: "بنفسجي",
          icon: u.jsx(Qt, {
            fill: "#a855f7",
            stroke: "#a855f7"
          })
        }, {
          text: "وردي",
          icon: u.jsx(Qt, {
            fill: "#ec4899",
            stroke: "#ec4899"
          })
        }, {
          text: "أسود",
          icon: u.jsx(Qt, {
            fill: "#000000",
            stroke: "#000000"
          })
        }, {
          text: "أبيض",
          icon: u.jsx(Qt, {
            fill: "#ffffff",
            stroke: "#e2e8f0"
          })
        }, {
          text: "بني",
          icon: u.jsx(Qt, {
            fill: "#78350f",
            stroke: "#78350f"
          })
        }],
        animals: [{
          text: "قطة",
          icon: u.jsx(Ro, {})
        }, {
          text: "كلب",
          icon: u.jsx(Js, {})
        }, {
          text: "عصفور",
          icon: u.jsx(Vi, {})
        }, {
          text: "سمكة",
          icon: u.jsx(Uo, {})
        }, {
          text: "أرنب",
          icon: u.jsx(zy, {})
        }, {
          text: "سلحفاة",
          icon: u.jsx(Fy, {})
        }, {
          text: "حلزون",
          icon: u.jsx(Gy, {})
        }, {
          text: "حشرة",
          icon: u.jsx(zo, {})
        }, {
          text: "خنفساء",
          icon: u.jsx(zo, {})
        }, {
          text: "فأر",
          icon: u.jsx(qo, {})
        }],
        food: [{
          text: "تفاحة",
          icon: u.jsx(Ks, {})
        }, {
          text: "موز",
          icon: u.jsx(Lp, {})
        }, {
          text: "كرز",
          icon: u.jsx(Pp, {})
        }, {
          text: "عنب",
          icon: u.jsx(hy, {})
        }, {
          text: "برتقال",
          icon: u.jsx(Bi, {})
        }, {
          text: "ليمون",
          icon: u.jsx(Bi, {})
        }, {
          text: "جزر",
          icon: u.jsx(Fp, {})
        }, {
          text: "كمثرى",
          icon: u.jsx(Bi, {})
        }, {
          text: "ورقة",
          icon: u.jsx(Ho, {})
        }, {
          text: "زهرة",
          icon: u.jsx(Lo, {})
        }],
        words: [{
          text: "تفاحة",
          icon: u.jsx(Ks, {})
        }, {
          text: "شمس",
          icon: u.jsx(Zo, {})
        }, {
          text: "سحابة",
          icon: u.jsx(ef, {})
        }, {
          text: "قطة",
          icon: u.jsx(Ro, {})
        }, {
          text: "كلب",
          icon: u.jsx(Js, {})
        }, {
          text: "شجرة",
          icon: u.jsx(Ky, {})
        }, {
          text: "قمر",
          icon: u.jsx(Ny, {})
        }, {
          text: "نجمة",
          icon: u.jsx(Xo, {})
        }, {
          text: "كتاب",
          icon: u.jsx(_o, {})
        }, {
          text: "قلم",
          icon: u.jsx(Go, {})
        }, {
          text: "قهوة",
          icon: u.jsx(ty, {})
        }, {
          text: "طاولة",
          icon: u.jsx(Qo, {})
        }, {
          text: "باب",
          icon: u.jsx(Bo, {})
        }, {
          text: "سيارة",
          icon: u.jsx(Jp, {})
        }, {
          text: "دراجة",
          icon: u.jsx(Gp, {})
        }, {
          text: "طائرة",
          icon: u.jsx(rf, {})
        }, {
          text: "سمكة",
          icon: u.jsx(Uo, {})
        }, {
          text: "عصفور",
          icon: u.jsx(Vi, {})
        }, {
          text: "زهرة",
          icon: u.jsx(Lo, {})
        }, {
          text: "ورقة",
          icon: u.jsx(Ho, {})
        }, {
          text: "مطر",
          icon: u.jsx(Wp, {})
        }, {
          text: "ثلج",
          icon: u.jsx(Ip, {})
        }, {
          text: "نار",
          icon: u.jsx(sy, {})
        }, {
          text: "قلب",
          icon: u.jsx(yy, {})
        }, {
          text: "موسيقى",
          icon: u.jsx(Ey, {})
        }, {
          text: "هاتف",
          icon: u.jsx(qy, {})
        }, {
          text: "حاسوب",
          icon: u.jsx(vy, {})
        }, {
          text: "ساعة",
          icon: u.jsx(ng, {})
        }, {
          text: "سماعة",
          icon: u.jsx(py, {})
        }, {
          text: "كاميرا",
          icon: u.jsx($p, {})
        }, {
          text: "ميكروفون",
          icon: u.jsx(Of, {})
        }, {
          text: "مكبر",
          icon: u.jsx(Yy, {})
        }, {
          text: "تلفاز",
          icon: u.jsx(Py, {})
        }, {
          text: "لعبة",
          icon: u.jsx(ry, {})
        }, {
          text: "فأرة",
          icon: u.jsx(qo, {})
        }, {
          text: "لوحة",
          icon: u.jsx(xy, {})
        }, {
          text: "شاشة",
          icon: u.jsx(Ay, {})
        }, {
          text: "طابعة",
          icon: u.jsx(_y, {})
        }, {
          text: "بطارية",
          icon: u.jsx(Hp, {})
        }, {
          text: "واي فاي",
          icon: u.jsx(ag, {})
        }, {
          text: "بلوتوث",
          icon: u.jsx(Yp, {})
        }, {
          text: "بريد",
          icon: u.jsx(Sy, {})
        }, {
          text: "جرس",
          icon: u.jsx(qp, {})
        }, {
          text: "بحث",
          icon: u.jsx(Vy, {})
        }, {
          text: "إعدادات",
          icon: u.jsx(By, {})
        }, {
          text: "مستخدم",
          icon: u.jsx(tg, {})
        }, {
          text: "قفل",
          icon: u.jsx(jy, {})
        }, {
          text: "فتح",
          icon: u.jsx(wy, {})
        }, {
          text: "مفتاح",
          icon: u.jsx(sf, {})
        }, {
          text: "عين",
          icon: u.jsx(ay, {})
        }, {
          text: "سلة",
          icon: u.jsx(Qy, {})
        }, {
          text: "مشاركة",
          icon: u.jsx(Uy, {})
        }, {
          text: "تحميل",
          icon: u.jsx(ny, {})
        }, {
          text: "رفع",
          icon: u.jsx(Iy, {})
        }, {
          text: "مجلد",
          icon: u.jsx(ly, {})
        }, {
          text: "ملف",
          icon: u.jsx(nf, {})
        }, {
          text: "صورة",
          icon: u.jsx(af, {})
        }, {
          text: "فيديو",
          icon: u.jsx(eg, {})
        }, {
          text: "خريطة",
          icon: u.jsx(Ty, {})
        }, {
          text: "ملاحة",
          icon: u.jsx(lf, {})
        }, {
          text: "بوصلة",
          icon: u.jsx(ey, {})
        }, {
          text: "عالم",
          icon: u.jsx(dy, {})
        }, {
          text: "علم",
          icon: u.jsx(iy, {})
        }, {
          text: "مرساة",
          icon: u.jsx(Iu, {})
        }, {
          text: "شاحنة",
          icon: u.jsx(Jy, {})
        }, {
          text: "سفينة",
          icon: u.jsx(Ly, {})
        }, {
          text: "حافلة",
          icon: u.jsx(Zp, {})
        }, {
          text: "قطار",
          icon: u.jsx(uf, {})
        }, {
          text: "صاروخ",
          icon: u.jsx(Ry, {})
        }, {
          text: "مظلة",
          icon: u.jsx(Wy, {})
        }, {
          text: "ريح",
          icon: u.jsx(Gn, {})
        }, {
          text: "صاعقة",
          icon: u.jsx(al, {})
        }, {
          text: "جمجمة",
          icon: u.jsx(Hy, {})
        }, {
          text: "شبح",
          icon: u.jsx(cy, {})
        }, {
          text: "ابتسامة",
          icon: u.jsx(Yo, {})
        }, {
          text: "حزن",
          icon: u.jsx(oy, {})
        }, {
          text: "عادي",
          icon: u.jsx(ky, {})
        }, {
          text: "ضحك",
          icon: u.jsx(by, {})
        }, {
          text: "ابتسامة",
          icon: u.jsx(Yo, {})
        }, {
          text: "نبض",
          icon: u.jsx(va, {})
        }, {
          text: "طبيب",
          icon: u.jsx(Xy, {})
        }, {
          text: "دواء",
          icon: u.jsx(Cy, {})
        }, {
          text: "حقنة",
          icon: u.jsx(Zy, {})
        }, {
          text: "عمل",
          icon: u.jsx(Xp, {})
        }, {
          text: "تخرج",
          icon: u.jsx(fy, {})
        }, {
          text: "كأس",
          icon: u.jsx($y, {})
        }, {
          text: "ميدالية",
          icon: u.jsx(My, {})
        }, {
          text: "هدف",
          icon: u.jsx(Bf, {})
        }, {
          text: "مطرقة",
          icon: u.jsx(my, {})
        }, {
          text: "مفتاح",
          icon: u.jsx(ig, {})
        }, {
          text: "مقص",
          icon: u.jsx(Oy, {})
        }, {
          text: "فرشاة",
          icon: u.jsx(tf, {})
        }, {
          text: "فن",
          icon: u.jsx(of, {})
        }, {
          text: "حساب",
          icon: u.jsx(Kp, {})
        }, {
          text: "هدية",
          icon: u.jsx(uy, {})
        }, {
          text: "كعكة",
          icon: u.jsx(Qp, {})
        }, {
          text: "بيتزا",
          icon: u.jsx(Dy, {})
        }, {
          text: "بوظة",
          icon: u.jsx(gy, {})
        }, {
          text: "نجمة",
          icon: u.jsx(Xo, {})
        }, {
          text: "شمس",
          icon: u.jsx(Zo, {})
        }, {
          text: "نظارات",
          icon: u.jsx(Bj, {})
        }, {
          text: "فرشاة",
          icon: u.jsx(tf, {})
        }, {
          text: "مشط",
          icon: u.jsx(Gn, {})
        }, {
          text: "صابون",
          icon: u.jsx(al, {})
        }, {
          text: "منشفة",
          icon: u.jsx(Uf, {})
        }, {
          text: "مرآة",
          icon: u.jsx(af, {})
        }, {
          text: "سرير",
          icon: u.jsx(R6, {})
        }, {
          text: "وسادة",
          icon: u.jsx(ef, {})
        }, {
          text: "غطاء",
          icon: u.jsx(Jj, {})
        }, {
          text: "خزانة",
          icon: u.jsx(T6, {})
        }, {
          text: "رف",
          icon: u.jsx(MS, {})
        }, {
          text: "لوحة",
          icon: u.jsx(of, {})
        }, {
          text: "نافذة",
          icon: u.jsx(Vf, {})
        }, {
          text: "ستارة",
          icon: u.jsx(pS, {})
        }, {
          text: "مصباح",
          icon: u.jsx(tS, {})
        }, {
          text: "مكتب",
          icon: u.jsx(Qo, {})
        }, {
          text: "كرسي",
          icon: u.jsx(k6, {})
        }, {
          text: "سجادة",
          icon: u.jsx(Vf, {})
        }, {
          text: "أرض",
          icon: u.jsx(lS, {})
        }, {
          text: "سقف",
          icon: u.jsx(C6, {})
        }, {
          text: "درج",
          icon: u.jsx(N6, {})
        }, {
          text: "مصعد",
          icon: u.jsx(oj, {})
        }, {
          text: "شارع",
          icon: u.jsx(lf, {})
        }, {
          text: "رصيف",
          icon: u.jsx(Hi, {})
        }, {
          text: "إشارة",
          icon: u.jsx(YS, {})
        }, {
          text: "جسر",
          icon: u.jsx(wT, {})
        }, {
          text: "نفق",
          icon: u.jsx(vj, {})
        }, {
          text: "مطار",
          icon: u.jsx(rf, {})
        }, {
          text: "محطة",
          icon: u.jsx(uf, {})
        }, {
          text: "ميناء",
          icon: u.jsx(Iu, {})
        }],
        plosives: [{
          text: "ب - باب",
          icon: u.jsx(Bo, {})
        }, {
          text: "ت - تفاح",
          icon: u.jsx(Ks, {})
        }, {
          text: "د - دجاجة",
          icon: u.jsx(Vi, {})
        }, {
          text: "ك - كتاب",
          icon: u.jsx(_o, {})
        }, {
          text: "ق - قلم",
          icon: u.jsx(Go, {})
        }, {
          text: "ج - جمل",
          icon: u.jsx(fr, {})
        }, {
          text: "ب - بطة",
          icon: u.jsx(Vi, {})
        }, {
          text: "ت - تمر",
          icon: u.jsx(Qt, {})
        }, {
          text: "د - دب",
          icon: u.jsx(va, {})
        }, {
          text: "ك - كرة",
          icon: u.jsx(Qt, {})
        }],
        sentences: ["القطة نائمة الآن.", "أحب أكل التفاح.", "الشمس حارة جداً.", "لدي سيارة زرقاء.", "العصافير تغرد بجمال.", "إنها تمطر في الخارج.", "قرأت كتاباً اليوم.", "الزهور جميلة جداً.", "أشرب الماء كل يوم.", "السماء صافية تماماً.", "أذهب إلى المدرسة الآن.", "كلبي ودود للغاية.", "أنا أحب عائلتي.", "الشجرة طويلة جداً.", "أرى طائرة كبيرة.", "السمكة تسبح في الماء.", "أجلس على الكرسي.", "الباب مفتوح الآن.", "أكتب بالقلم بوضوح.", "القمر ساطع في الليل.", "ألعب مع أصدقائي.", "الثلج أبيض وبارد.", "آكل وجبة لذيذة.", "النجمة بعيدة جداً.", "أنا سعيد اليوم.", "العشب أخضر جميل.", "أرتدي معطفاً دافئاً.", "الرياح تهب بقوة.", "أحب السباحة كثيراً.", "الكعكة حلوة المذاق.", "أرى عصفوراً أحمر.", "الجبل عالٍ جداً.", "أمشي في الحديقة.", "النهر واسع وعميق.", "لدي لعبة جديدة.", "الساعة تدق بانتظام.", "أستمع إلى الموسيقى.", "الحساء ساخن ولذيذ.", "أقفز عالياً جداً.", "الكرة مستديرة تماماً.", "أرسم لوحة جميلة.", "الطفل يبكي بصوت.", "أساعد أمي دائماً.", "أبي يعمل بجد.", "أنام في سريري.", "النافذة نظيفة جداً.", "أفتح الصندوق الكبير.", "الضوء مشتعل الآن.", "أغلق الكتاب بهدوء.", "الطريق طويل جداً.", "أركض في الحقل.", "الحصان سريع جداً.", "أرى حشرة صغيرة.", "الفيل ضخم للغاية.", "أحب حديقة الحيوان.", "الأسد صوته عالٍ.", "آكل بعض الخبز.", "الحليب بارد ومنعش.", "لدي عشر أصابع.", "الحذاء أسود اللون.", "أرتدي قبعة جميلة.", "القميص نظيف ومرتب.", "أغسل يدي بالماء.", "الصابون له فقاعات.", "أنظف أسناني جيداً.", "المرآة لامعة جداً.", "أنظر إلى نفسي.", "البيت كبير وواسع.", "أعيش في مدينة.", "المزرعة بها أبقار.", "أرى جراراً كبيراً.", "الذرة صفراء اللون.", "أقطف زهرة جميلة.", "النحلة تطن حولي.", "أحب العسل كثيراً.", "النملة صغيرة جداً.", "أراقب سقوط المطر.", "المظلة مبللة بالماء.", "أمشي في البرك.", "الطين لزج جداً.", "أبني برجاً عالياً.", "المكعبات ملونة جداً.", "أشارك ألعابي معهم.", "المعلمة طيبة القلب.", "أتعلم أشياء جديدة.", "المدرسة ممتعة جداً.", "لدي حقيبة ظهر.", "القلم مبري وحاد.", "أكتب اسمي بوضوح.", "الورقة بيضاء ونظيفة.", "أطوي الورقة بدقة.", "الطائرة تطير عالياً.", "أرى السحب البيضاء.", "السماء زرقاء صافية.", "النجوم لامعة جداً.", "أتمنى أمنية للنجمة.", "الليل هادئ وساكن.", "أحلم بالسحر والجمال.", "العالم كبير وواسع.", "أنا طفل مهذب."],
        stories: ["في قديم الزمان، عاش عصفور أزرق صغير في شجرة بلوط عملاقة. في كل صباح، كان يستيقظ باكراً ليغني أغنية جميلة للشمس الساطعة. كانت الحيوانات الأخرى في الغابة تتوقف لتستمع إلى اللحن العذب. كان ذلك يجعل الجميع يشعرون بالسعادة والاستعداد ليوم جديد مليء بالأمل.", "وجدت قطة فضولية تدعى لونا كرة حمراء لامعة في الحديقة الواسعة. طاردتها عبر العشب الطويل وتحت المقعد الخشبي القديم. قفزت الكرة عالياً في الهواء، وقفزت لونا بكل قوتها لتمسك بها. بعد ساعات من اللعب والمرح، استلقت في بقعة مشمسة لتأخذ قيلولة طويلة ومريحة.", "بدأت الشمس الذهبية تغيب خلف الجبال الأرجوانية البعيدة في الأفق. وبينما تحولت السماء إلى درجات البرتقالي والوردي، ظهرت أول نجمة لامعة. ارتفع القمر الفضي ببطء، ملقياً ضوءاً ناعماً على المرج الهادئ. كانت ليلة هادئة وساكنة، وبدأ العالم أخيراً في الاستسلام للنوم العميق.", "في يوم السبت الماضي، ذهبت مع عائلتي إلى المنتزه المحلي لقضاء نزهة ممتعة. وجدنا مكاناً مثالياً تحت شجرة صفصاف ظليلة بالقرب من البركة. رأيت كلباً كبيراً وودوداً يلعب مع صاحبه في الأفق البعيد. أكلنا شطائر لذيذة واستمتعنا بالهواء النقي طوال فترة بعد الظهر.", "بدأ مطر خفيف يسقط من السحب الرمادية الثقيلة في السماء العالية. رفعت الزهور العطشى رؤوسها لتشرب من الماء البارد المنعش. وسرعان ما بدأ العشب البني الجاف يتحول إلى اللون الأخضر النابض بالحياة. ظهر قوس قزح جميل في السماء، يمتد من جانب إلى آخر فوق الوادي الخصيب.", "تسلق المستكشف الشجاع أعلى جبل في العالم. كان يحمل حقيبة ظهر ثقيلة مليئة بالأدوات والمؤن. كانت الرياح باردة وقوية، لكنه لم يستسلم أبداً. عندما وصل أخيراً إلى القمة، رأى أروع منظر شاهده في حياته على الإطلاق.", "في قرية صغيرة، كان هناك خباز يصنع أفضل خبز. في كل صباح، كانت رائحة الخبز الطازج تملأ الشوارع. كان الناس يصطفون خارج محله لشراء رغيف دافئ. كان لديه دائماً ابتسامة طيبة وكلمة ودودة لكل زبون.", "أراد الروبوت الصغير أن يتعلم كيف يرسم مثل البشر. جمع الكثير من الألوان ولوحة قماشية بيضاء كبيرة. في البداية، صنع فقط خطوطاً وبقعاً فوضوية. ولكن مع الكثير من التدريب، رسم لوحة جميلة لحديقة مليئة بالزهور الملونة.", "سبح حوت عملاق عبر المحيط الأزرق العميق. سافر آلاف الأميال ليجد مكاناً أكثر دفئاً لفصل الشتاء. في طريقه، التقى بالعديد من المخلوقات البحرية المثيرة للاهتمام مثل الدلافين والسلاحف. كان المحيط مليئاً بالعجائب والغموض بالنسبة للحوت العملاق.", "كانت المكتبة القديمة مليئة بآلاف الكتب العتيقة. كانت رائحة الهواء تشبه الورق القديم والغبار. قضت طالبة شابة كل بعد ظهر في القراءة عن التاريخ والعلوم. كانت تحب أن تضيع في القصص وتتعلم عن العالم من الماضي البعيد.", "كانت هناك قرية صغيرة تقع في الوادي، مشهورة ببرج ساعتها السحري. في كل ساعة، كانت الساعة تدق لحناً يمكن سماعه على بعد أميال. تقول الأسطورة أن الساعة بناها ساحر أراد إحلال السلام في الأرض. كلما عزفت الموسيقى، كان الناس يتوقفون عن عملهم ويبتسمون لجيرانهم.", "كانت الغابة القديمة موطناً لشجرة تنبت أوراقاً فضية. كانت هذه الأوراق تتوهج بنعومة تحت ضوء القمر، لتنير الطريق للمسافرين التائهين. حاول الكثير من الناس العثور على الشجرة، لكنها لم تظهر إلا لأولئك الذين كانت قلوبهم طيبة حقاً. وجدتها فتاة صغيرة بينما كانت تبحث عن قطتها المفقودة.", "اكتشفت مجموعة من الأطفال كهفاً مخفياً خلف شلال خلال عطلتهم الصيفية. في الداخل، كانت الجدران مغطاة بلوحات قديمة للنجوم والكواكب. شعروا وكأنهم خطوا إلى عالم آخر تماماً. وعدوا بالحفاظ على سر الكهف وعادوا كل يوم لاستكشاف أسراره.", "قضى البستاني الماهر سنوات في إنشاء متاهة مصنوعة من شجيرات الورد العطرة. سافر الناس من أماكن بعيدة للمشي عبر المسارات المتعرجة وشم العطر الزكي. في وسط المتاهة كانت هناك نافورة رخامية جميلة تتلألأ في الشمس. كان مكاناً يمكن لأي شخص أن يجد فيه الهدوء والجمال.", "وقف منارة وحيدة على منحدر صخري، ترشد السفن بأمان عبر البحار العاصفة. كان حارس المنارة رجلاً عجوزاً يحب صوت الأمواج المتلاطمة. قضى لياليه في تلميع العدسة العملاقة ومراقبة الأضواء البعيدة للقوارب المارة. كان يعرف كل صخرة وتيار في المياه الخطرة.", "كانت الحديقة السرية مخبأة خلف جدار حجري طويل مغطى باللبلاب. في الداخل، كانت الزهور من كل لون تتفتح طوال العام، حتى في منتصف الشتاء. عبر جسر خشبي صغير جدولاً متلألئاً حيث كانت الأسماك الذهبية تسبح بكسل. كان مكاناً سحرياً حيث يبدو أن الوقت يتوقف وتختفي الهموم.", "وجد موسيقي شاب كماناً قديماً في علية منزل جده. عندما عزف عليه، كانت الموسيقى جميلة لدرجة أن الطيور كانت تتجمع على حافة النافذة للاستماع. تدرب كل يوم، وسرعان ما دعي للعزف في قاعة الحفلات الكبرى. جلبت موسيقاه الفرح لكل من سمعها.", "عاش الثعلب الذكي في وكر مريح تحت جذور شجرة بلوط كبيرة. كان معروفاً بقدرته على حل أي مشكلة ومساعدة أصدقائه في الغابة. في أحد الأيام، ساعد بومة تائهة في العثور على طريقها إلى المنزل من خلال اتباع أنماط النجوم. كان الثعلب صديقاً حقيقياً لجميع المخلوقات في الغابة.", "قلعة جليدية عملاقة وقفت في قمة العالم تماماً. كانت تحكمها ملكة يمكنها التحكم في الرياح والثلج بلمحة من يدها. تلألأت القلعة مثل الماس في أضواء الشمال الساطعة. حاول العديد من الفرسان الشجعان الوصول إلى القلعة، لكن الأشجع فقط من استطاع تحمل البرد.", "عاش التنين الودود في كهف كبير مليء بالكتب بدلاً من الذهب. كان يحب قراءة القصص عن الأراضي البعيدة والمغامرات المثيرة. أحياناً، كان يدعو أطفال القرية إلى الكهف ويقرأ لهم بجانب دفء ناره اللطيفة. أحب الجميع في القرية التنين المحب للكتب.", "أبحر قارب خشبي صغير عبر البحيرة الهادئة عند الفجر. ارتفع ضباب الصباح من الماء، مما خلق مشهداً غامضاً وجميلاً. جلس صياد بهدوء في القارب، ينتظر أول صيد في اليوم. كان الصوت الوحيد هو تلاطم الماء اللطيف ضد جانب القارب.", "كانت المدينة المزدحمة مليئة بالمباني العالية التي تصل إلى السماء. سارع الناس على طول الأرصفة، يمارسون حياتهم اليومية بهدف. في الليل، تحولت المدينة إلى بحر من الأضواء المتلألئة واللافتات الملونة. كانت مكاناً للطاقة والإثارة اللامتناهية، حيث يحدث شيء جديد دائماً.", "اتبعت مجموعة من المتنزهين مساراً ضيقاً عبر غابة الصنوبر الكثيفة. كان الهواء بارداً ورائحته تشبه إبر الصنوبر والأرض الرطبة. تسلقوا أعلى وأعلى حتى وصلوا إلى نتوء صخري بمنظر رائع للوادي أدناه. كانت رحلة صعبة، لكن المكافأة كانت تستحق العناء.", "قضى صانع الساعات العجوز أيامه في إصلاح الساعات الرقيقة وساعات الجد الكبيرة. كان محله مليئاً بصوت مئات الساعات التي تكتك، مما خلق جواً إيقاعياً ومهدئاً. كان لديه يد ثابتة وعين حريصة على التفاصيل، وكان يفخر كثيراً بحرفته.", "ظهرت فراشة جميلة بأجنحة زرقاء زاهية من شرنقتها في الربيع. رفت من زهرة إلى زهرة، تشرب الرحيق الحلو وتستمتع بأشعة الشمس الدافئة. كانت رمزاً للبدايات الجديدة وجمال الطبيعة. كانت رحلة الفراشة قد بدأت للتو وهي تستكشف الحديقة النابضة بالحياة.", "كانت الجزيرة الغامضة محاطة بضباب كثيف لا يرتفع أبداً. حكى البحارة قصصاً عن كنوز مخفية ومخلوقات غريبة تعيش في الجزيرة. قرر قبطان شجاع الإبحار عبر الضباب واكتشاف أسرار الجزيرة. ما وجده كان جنة استوائية مليئة بالفواكه الغريبة والطيور الملونة.", "قضى عالم شاب سنوات في دراسة النجوم من خلال تلسكوب عملاق. اكتشف كوكباً جديداً مغطى بمحيطات من الفضة السائلة. غير اكتشافه الطريقة التي يفكر بها الناس في الكون وألهم جيلاً جديداً من المستكشفين. تم تكريمه بجائزة مرموقة لعمله الرائد.", "كان الكوخ المريح يقع في حقل من الزهور البرية عند حافة الغابة. كانت نار دافئة تفرقع في المدفأة، ورائحة خبز الكعك تملأ الهواء. كان مكاناً للراحة والسلام، حيث يجتمع الأصدقاء والعائلة لمشاركة القصص والضحك. كان الكوخ بيتاً حقيقياً.", "ركب فارس شجاع حصانه الأبيض عبر الغابة المظلمة والخطيرة. كان في مهمة للعثور على سيف سحري يمكنه هزيمة الساحر الشرير. واجه العديد من التحديات على طول الطريق، لكن شجاعته وتصميمه لم يتزعزعا أبداً. كان يعلم أن مصير المملكة يقع على عاتقه.", "كان المعبد القديم مخبأً في أعماق الغابة، مغطى بالكروم والطحالب. تم بناؤه قبل آلاف السنين من قبل حضارة اختفت منذ زمن طويل. قام فريق من علماء الآثار بإزالة الغابة بعناية للكشف عن منحوتات المعبد المذهلة والغرف المخفية. كان اكتشاف العمر.", "تدفق جدول صغير بلطف عبر المرج، موفراً الماء للحيوانات العطشى. كان الماء صافياً وبارداً، وتلألأت الحصى الصغيرة في القاع. في الربيع، كانت ضفاف الجدول تصطف بأزهار الربيع الصفراء الزاهية. كان مكاناً هادئاً وجميلاً للجلوس والاستمتاع بأصوات الطبيعة.", "كان المسرح الكبير مليئاً بالناس الذين يرتدون أرقى ملابسهم. جاءوا لمشاهدة عرض لمسرحية شهيرة كتبت قبل مئات السنين. أدى الممثلون بشغف ومهارة، وانبهر الجمهور بالقصة. كانت ليلة من السحر والعجائب التي لن ينسوها أبداً.", "جلست فنانة شابة في الحديقة مع دفتر رسمها وأقلامها. رسمت الناس المارين، والأشجار التي تتمايل في الريح، والطيور التي تطير فوق الرأس. كان لديها موهبة في التقاط الجمال في اللحظات اليومية. كانت رسوماتها مليئة بالحياة والعاطفة، وتمنت أن تصبح يوماً ما رسامة مشهورة.", "وقفت طاحونة الهواء القديمة على تلة، وأشرعتها العملاقة تدور ببطء في النسيم. تم استخدامها لأجيال لطحن الحبوب وتحويلها إلى دقيق للقرية. كان الطحان رجلاً مجتهداً يعتني جيداً بطاحونة الهواء. كان يحب صوت دوران الأشرعة ورائحة الدقيق الطازج.", "عاشت مجموعة من العلماء في محطة أبحاث في القطب الجنوبي. درسوا الجليد والطقس لمعرفة المزيد عن مناخ الأرض. كانت بيئة باردة وقاسية، لكنهم كانوا مخلصين لعملهم. قضوا أيامهم في جمع البيانات ولياليهم في مشاهدة الأضواء الجنوبية المذهلة.", "أدى المسار السري عبر نفق من التحوطات العالية إلى بركة مخفية. كان الماء ساكناً ويعكس الأشجار المحيطة مثل المرآة. عاشت عائلة من البط في البركة، وكانوا يسبحون برشاقة عبر الماء. كان مكاناً هادئاً ومنعزلاً حيث يمكن لأي شخص الذهاب للهروب من العالم المزدحم.", "وجد صبي صغير رسالة في زجاجة أثناء مشيه على طول الشاطئ. كانت الرسالة مكتوبة بلغة لا يفهمها، لكنها كانت مصحوبة بخريطة لجزيرة بعيدة. قضى أسابيع في محاولة ترجمة الرسالة ودراسة الخريطة. حلم بالذهاب يوماً ما في مغامرة للعثور على الجزيرة.", "كان السوق المزدحم مليئاً بأصوات الناس الذين يساومون وروائح التوابل الغريبة. كانت الأكشاك مكدسة بالفواكه الملونة، والحرف اليدوية، والأقمشة الجميلة. كان مكاناً نابضاً بالحياة ومثيراً حيث يأتي الناس من جميع أنحاء العالم للتجارة ومشاركة ثقافاتهم.", "عاش بومة عجوز حكيم في شجرة مجوفة في وسط الغابة. كانت الحيوانات الأخرى تأتي إليه لطلب النصيحة والإرشاد. لقد رأى أشياء كثيرة في حياته الطويلة وكان لديه فهم عميق للعالم. كان عضواً محترماً ومحبوباً في مجتمع الغابة.", "كانت الحديقة الجميلة مليئة بالزهور التي تتفتح في كل موسم. في الربيع، كانت هناك زهور التوليب والنرجس؛ في الصيف، الورود والزنابق؛ في الخريف، الأقحوان؛ وفي الشتاء، أزهار الثلج. كان مكاناً للجمال والتغيير المستمر، حيث كانت عجائب الطبيعة معروضة دائماً.", "تعلمت فتاة صغيرة كيفية خبز الخبز من جدتها. كانوا يقضون فترة بعد الظهر في المطبخ، يخلطون الدقيق والماء ويعجنون العجين. كانت رائحة الخبز الطازج الذي يخبز في الفرن أفضل رائحة في العالم. أحبت تعلم التقاليد القديمة ومشاركة الخبز الدافئ مع عائلتها.", "سار القطار القديم ببطء عبر الجبال، وصدا صفارته يتردد في الوديان. نظر الركاب من النوافذ إلى المناظر الخلابة للقمم المغطاة بالثلوج والبحيرات المتلألئة. كانت رحلة بطيئة وهادئة سمحت لهم بتقدير جمال العالم.", "قضت مجموعة من المتطوعين عطلة نهاية الأسبوع في زراعة الأشجار في الحديقة المحلية. أرادوا خلق بيئة أفضل للمستقبل وتوفير منزل للطيور والحيوانات. كان عملاً شاقاً، لكنهم شعروا بالفخر والإنجاز. علموا أن جهودهم ستحدث فرقاً للأجيال القادمة.", "كان الكتاب الغامض مجلداً بجلد داكن وله قفل فضي. تم العثور عليه في حجرة مخفية في مكتب قديم. لم يعرف أحد من كتب الكتاب أو الأسرار التي يحتوي عليها. قضى مؤرخ شاب سنوات في محاولة فتح القفل واكتشاف أسرار الكتاب.", "سبحت بجعة جميلة برشاقة عبر البحيرة، وريشها الأبيض ينعكس في الماء. كانت رمزاً للأناقة والجمال. عاشت البجعة في البحيرة مع عائلتها، وكانوا يقضون أيامهم في السباحة والبحث عن الطعام. كانت حياة هادئة وهانئة.", "كان الجسر القديم مصنوعاً من الحجر وصمد لمئات السنين. عبر نهراً واسعاً يتدفق عبر وسط المدينة. مشى الناس عبر الجسر كل يوم، يمارسون أعمالهم. كان معلماً يربط جانبي المدينة ويحمل العديد من الذكريات لأهل المنطقة.", "بنى صبي صغير بيتاً على الشجرة في شجرة القيقب العملاقة في فناء منزله الخلفي. قضى فترات بعد الظهر الصيفية في بيت الشجرة، يقرأ الكتب ويلعب الألعاب مع أصدقائه. كان مكانه السري الخاص حيث يمكنه تخيل أنه مستكشف أو قرصان. كان بيت الشجرة مكاناً للمرح والمغامرة اللامتناهية.", "كان الميناء المزدحم مليئاً بالسفن من جميع الأحجام، من قوارب الصيد الصغيرة إلى سفن الشحن العملاقة. ملأ صوت صفارات الضباب ورائحة هواء البحر الجو. كان مكاناً للنشاط والتجارة المستمرة، حيث تجلب البضائع من جميع أنحاء العالم إلى المدينة.", "رسم غروب شمس جميل السماء بظلال البرتقالي والوردي والأرجواني. اختفت الشمس ببطء تحت الأفق، تاركة وراءها توهجاً ناعماً. كانت لحظة سلام وجمال ميزت نهاية يوم آخر. كان العالم هادئاً مع بدء ظهور النجوم الأولى في السماء المظلمة.", "كانت الساعة القديمة في ساحة المدينة تكتك لأكثر من مئة عام. كانت رمزاً لتاريخ المدينة وتذكيراً مستمراً بمرور الوقت. كان الناس يتجمعون في الساحة لسماع الساعة تدق الساعة. كانت معلماً محبوباً يحتل مكانة خاصة في قلوب سكان المدينة."],
        practice: []
      }
    }
  },
  StrategyCard = ({
    title: a,
    description: s,
    icon: o,
    onClick: r,
    color: f,
    lang: m
  }) => u.jsxs(bt.button, {
    whileHover: {
      scale: 1.02,
      y: -4
    },
    whileTap: {
      scale: .98
    },
    onClick: r,
    "aria-label": a,
    className: `w-full p-6 md:p-8 rounded-3xl border border-white/20 shadow-xl flex flex-col items-center text-center gap-4 md:gap-6 ${f} transition-all duration-300 group relative overflow-hidden transform-gpu`,
    children: [u.jsx("div", {
      className: "absolute top-0 right-0 p-3 md:p-4 opacity-10 group-hover:scale-150 transition-transform duration-500",
      children: o
    }), u.jsx("div", {
      className: "p-4 md:p-5 bg-white/20 rounded-2xl text-white shadow-inner backdrop-blur-sm shrink-0",
      children: Xi.cloneElement(o, {
        className: "w-8 h-8 md:w-10 md:h-10"
      })
    }), u.jsxs("div", {
      className: "relative z-10 w-full",
      children: [u.jsx("h3", {
        className: "text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 tracking-tight",
        children: a
      }), u.jsx("p", {
        className: "text-white/90 text-xs md:text-sm leading-relaxed max-w-[240px] mx-auto",
        children: s
      })]
    })]
  }),
  TechniqueButton = ({
    title: a,
    icon: s,
    color: o,
    onClick: r
  }) => u.jsxs(bt.button, {
    initial: {
      opacity: 0,
      scale: .8
    },
    animate: {
      opacity: 1,
      scale: 1
    },
    whileHover: {
      scale: 1.05
    },
    whileTap: {
      scale: .95
    },
    onClick: r,
    "aria-label": a,
    className: "flex flex-col items-center gap-3 md:gap-4 w-full group transform-gpu",
    children: [u.jsx("div", {
      className: `w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] ${o} text-white shadow-lg flex items-center justify-center transition-transform group-hover:rotate-6 shrink-0`,
      children: Xi.cloneElement(s, {
        className: "w-8 h-8 md:w-12 md:h-12"
      })
    }), u.jsx("span", {
      className: "text-[10px] md:text-sm font-bold text-slate-700 text-center px-1 md:px-2",
      children: a
    })]
  }),
  AboutDialog = ({
    isOpen: a,
    onClose: s,
    info: o,
    lang: r
  }) => a ? u.jsx(Dialog, {
    onClose: s, label: o.title,
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm",
    children: u.jsxs(bt.div, {
      initial: {
        scale: .95,
        opacity: 0
      },
      animate: {
        scale: 1,
        opacity: 1
      },
      className: "bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col transform-gpu",
      children: [u.jsxs("div", {
        className: "p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50",
        children: [u.jsxs("div", {
          className: "flex items-center gap-4",
          children: [u.jsx("div", {
            className: "p-3 bg-indigo-600 rounded-2xl text-white shadow-lg",
            children: u.jsx(xa, {
              className: "w-6 h-6"
            })
          }), u.jsx("h2", {
            className: "text-2xl font-black text-slate-900 tracking-tight",
            children: o.title
          })]
        }), u.jsx("button", {
          onClick: s,
          "aria-label": r === "ar" ? "إغلاق" : "Close",
          className: "p-2 hover:bg-white rounded-xl transition-colors shadow-sm",
          children: u.jsx(pd, {
            className: "w-6 h-6 text-slate-400"
          })
        })]
      }), u.jsxs("div", {
        className: "p-8 overflow-y-auto custom-scrollbar space-y-8",
        children: [u.jsx("div", {
          className: "space-y-4",
          children: u.jsx("p", {
            className: "text-slate-600 text-lg leading-relaxed font-medium",
            children: o.purpose
          })
        }), u.jsxs("div", {
          className: "space-y-6",
          children: [u.jsxs("h3", {
            className: "text-xl font-bold text-slate-900 flex items-center gap-2",
            children: [u.jsx("div", {
              className: "w-2 h-8 bg-indigo-600 rounded-full"
            }), r === "ar" ? "كيفية الاستخدام" : "How to Use"]
          }), u.jsx("div", {
            className: "grid grid-cols-1 gap-4",
            children: o.howToUse.map((f, m) => u.jsxs("div", {
              className: "p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-colors group",
              children: [u.jsx("h4", {
                className: "font-bold text-indigo-600 mb-2 text-lg group-hover:translate-x-1 transition-transform",
                children: f.title
              }), u.jsx("p", {
                className: "text-slate-600 leading-relaxed",
                children: f.content
              })]
            }, m))
          })]
        }), u.jsxs("div", {
          className: "p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-4",
          children: [u.jsxs("h3", {
            className: "text-lg font-bold text-amber-900 flex items-center gap-2",
            children: [u.jsx(Kx, {
              className: "w-5 h-5"
            }), r === "ar" ? "نصائح للنجاح" : "Tips for Success"]
          }), u.jsx("ul", {
            className: "space-y-3",
            children: o.tips.map((f, m) => u.jsxs("li", {
              className: "flex gap-3 text-amber-800",
              children: [u.jsx("div", {
                className: "w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"
              }), u.jsx("span", {
                className: "font-medium",
                children: f
              })]
            }, m))
          })]
        })]
      }), u.jsx("div", {
        className: "p-6 bg-slate-50 border-t border-slate-100 text-center",
        children: u.jsx("button", {
          onClick: s,
          "aria-label": r === "ar" ? "إغلاق" : "Close",
          className: "px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95",
          children: r === "ar" ? "فهمت" : "Got it"
        })
      })]
    })
  }) : null,
  StrategyDialog = ({
    isOpen: a,
    onClose: s,
    info: o,
    lang: r
  }) => {
    const [f, m] = Xi.useState(null);
    if (!a) return null;
    const d = r === "ar";
    return u.jsx(Dialog, {
    onClose: () => { s(); m(null); }, label: o.title,
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm",
      children: u.jsxs(bt.div, {
        initial: {
          scale: .95,
          opacity: 0
        },
        animate: {
          scale: 1,
          opacity: 1
        },
        className: "bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col transform-gpu",
        children: [u.jsx("button", {
          onClick: () => {
            s(), m(null);
          },
          "aria-label": r === "ar" ? "إغلاق" : "Close",
          className: `absolute top-6 ${d ? "left-6" : "right-6"} p-2 hover:bg-slate-100 rounded-full transition-colors z-10`,
          children: u.jsx(pd, {
            className: "w-6 h-6 text-slate-400"
          })
        }), u.jsxs("div", {
          className: "p-8 md:p-10 overflow-y-auto custom-scrollbar",
          children: [u.jsxs("div", {
            className: "flex items-center gap-4 mb-8",
            children: [u.jsx("div", {
              className: "p-3 bg-indigo-100 rounded-2xl text-indigo-600",
              children: u.jsx(xa, {
                className: "w-8 h-8"
              })
            }), u.jsx("h2", {
              className: "text-2xl font-black text-slate-900",
              children: o.title
            })]
          }), u.jsxs("div", {
            className: `space-y-6 ${d ? "text-right" : "text-left"}`,
            children: [o.plosiveDetails && u.jsxs("div", {
              className: "space-y-4",
              children: [u.jsx("h3", {
                className: "text-sm font-black text-indigo-600 uppercase tracking-widest",
                children: d ? "اختر صوتاً للتعلم" : "Select a sound to learn"
              }), u.jsx("div", {
                className: "flex flex-wrap gap-2",
                children: Object.keys(o.plosiveDetails).map(p => u.jsxs("button", {
                  onClick: () => m(p === f ? null : p),
                  className: `px-4 py-2 rounded-xl font-bold transition-all ${f === p ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
                  children: ["/", p, "/"]
                }, p))
              }), u.jsx(Xa, {
                mode: "wait",
                children: f && u.jsx(bt.div, {
                  initial: {
                    opacity: 0,
                    y: 10
                  },
                  animate: {
                    opacity: 1,
                    y: 0
                  },
                  exit: {
                    opacity: 0,
                    y: -10
                  },
                  className: "p-4 bg-indigo-50 rounded-2xl border border-indigo-100",
                  children: u.jsx("p", {
                    className: "text-indigo-900 font-medium leading-relaxed",
                    children: o.plosiveDetails[f]
                  })
                }, f)
              })]
            }), u.jsxs("section", {
              className: "space-y-2",
              children: [u.jsx("h3", {
                className: "text-sm font-black text-indigo-600 uppercase tracking-widest",
                children: d ? "الهدف" : "Purpose"
              }), u.jsx("p", {
                className: "text-slate-600 leading-relaxed text-sm md:text-base",
                children: o.purpose
              })]
            }), o.howItWorks && u.jsxs("section", {
              className: "space-y-2",
              children: [u.jsx("h3", {
                className: "text-sm font-black text-indigo-600 uppercase tracking-widest",
                children: d ? "كيفية العمل" : "How it Works"
              }), u.jsx("p", {
                className: "text-slate-600 leading-relaxed text-sm md:text-base",
                children: o.howItWorks
              })]
            }), o.techniques && u.jsx("div", {
              className: "space-y-6",
              children: o.techniques.map((p, x) => u.jsxs("section", {
                className: "space-y-2",
                children: [u.jsx("h3", {
                  className: "text-sm font-black text-amber-600 uppercase tracking-widest",
                  children: p.name
                }), u.jsx("ul", {
                  className: "space-y-2",
                  children: p.steps.map((y, v) => u.jsxs("li", {
                    className: "flex gap-3 text-slate-600 text-sm md:text-base",
                    children: [u.jsxs("span", {
                      className: "text-amber-400 font-black",
                      children: [v + 1, "."]
                    }), u.jsx("span", {
                      children: y
                    })]
                  }, v))
                })]
              }, x))
            }), o.practiceTips && u.jsxs("section", {
              className: "space-y-2",
              children: [u.jsx("h3", {
                className: "text-sm font-black text-indigo-600 uppercase tracking-widest",
                children: d ? "نصائح التدريب" : "Practice Tips"
              }), u.jsx("ul", {
                className: "space-y-2",
                children: o.practiceTips.map((p, x) => u.jsxs("li", {
                  className: "flex gap-3 text-slate-600 text-sm md:text-base",
                  children: [u.jsx("span", {
                    className: "text-indigo-400 font-black",
                    children: "•"
                  }), u.jsx("span", {
                    children: p
                  })]
                }, x))
              })]
            }), o.tips && u.jsxs("section", {
              className: "space-y-2",
              children: [u.jsx("h3", {
                className: "text-sm font-black text-indigo-600 uppercase tracking-widest",
                children: d ? "نصائح للنجاح" : "Tips for Success"
              }), u.jsx("ul", {
                className: "space-y-2",
                children: o.tips.map((p, x) => u.jsxs("li", {
                  className: "flex gap-3 text-slate-600 text-sm md:text-base",
                  children: [u.jsx("span", {
                    className: "text-indigo-400 font-black",
                    children: "•"
                  }), u.jsx("span", {
                    children: p
                  })]
                }, x))
              })]
            })]
          })]
        })]
      })
    });
  };
Object.assign(translations.en, {
  slowerRateIntro: 'Focus on slowing down your speech by stretching vowels and taking natural pauses.',
  autoAdvance: 'Auto advance', moreItems: 'More items', lessItems: 'Fewer items', faster: 'Faster',
  speak: 'Speak', close: 'Close', chooseLetter: 'Choose a letter to start', stutter: 'Stutter', repeat: 'Repeat',
  transition: 'Transition', prepare: 'Prepare', smooth: 'Smooth', light: 'Light',
  sessionStatus: 'Session status', paused: 'Paused. Press Play to resume.', ready: 'Ready. Press Play to follow the guide.',
  running: 'Practice in progress. Press Pause whenever you need a break.', finished: 'Practice complete. You can replay or go to the next item.',
  recordingPending: 'Waiting for microphone permission…', recordingReady: 'Recording ready to play.',
  recordingHint: 'Record your practice to listen back. Audio stays on this device for this session.'
});
Object.assign(translations.ar, {
  slowerRateIntro: 'تمهّل في الكلام من خلال إطالة أصوات المد وأخذ وقفات طبيعية.',
  autoAdvance: 'انتقال تلقائي', moreItems: 'زيادة العناصر', lessItems: 'تقليل العناصر', faster: 'أسرع',
  speak: 'تكلّم', close: 'إغلاق', chooseLetter: 'اختر حرفاً للبدء', stutter: 'تأتأة', repeat: 'إعادة',
  transition: 'انتقال', prepare: 'استعداد', smooth: 'بسلاسة', light: 'تلامس خفيف',
  sessionStatus: 'حالة التدريب', paused: 'متوقف مؤقتاً. اضغط تشغيل للمتابعة.', ready: 'جاهز. اضغط تشغيل لمتابعة الدليل.',
  running: 'التدريب جارٍ. يمكنك الإيقاف المؤقت متى احتجت إلى استراحة.', finished: 'اكتمل التدريب. يمكنك الإعادة أو الانتقال إلى العنصر التالي.',
  recordingPending: 'بانتظار السماح باستخدام الميكروفون…', recordingReady: 'التسجيل جاهز للاستماع.',
  recordingHint: 'سجّل تدريبك للاستماع إليه. يبقى الصوت على هذا الجهاز خلال هذه الجلسة.'
});


function App() {
  const [screen, updateScreen] = Y.useState('home');
  const [lang, setLang] = Y.useState(readLanguage);
  const [category, setCategory] = Y.useState('words');
  const [speed, setSpeed] = Y.useState(5);
  const [itemCount, updateItemCount] = Y.useState(1);
  const [playing, setPlaying] = Y.useState(false);
  const [completed, setCompleted] = Y.useState(false);
  const [activeIndex, setActiveIndex] = Y.useState(-1);
  const [pageIndex, setPageIndex] = Y.useState(0);
  const [onsetLevel, setOnsetLevel] = Y.useState(0);
  const [showInfo, setShowInfo] = Y.useState(false);
  const [showAbout, setShowAbout] = Y.useState(false);
  const [onsetPhase, setOnsetPhase] = Y.useState('idle');
  const [modPhase, setModPhase] = Y.useState('idle');
  const [breathPhase, setBreathPhase] = Y.useState('idle');
  const [breathProgress, setBreathProgress] = Y.useState(0);
  const [breathingPreset, setBreathingPreset] = Y.useState(0);
  const [inhale, setInhale] = Y.useState(3);
  const [hold, setHold] = Y.useState(3);
  const [exhale, setExhale] = Y.useState(4);
  const [onsetProgress, setOnsetProgress] = Y.useState(0);
  const [letter, setLetter] = Y.useState(null);
  const [showLetters, setShowLetters] = Y.useState(false);
  const [autoNext, setAutoNext] = Y.useState(false);
  const elapsedRef = Y.useRef(0);
  const t = translations[lang];
  const isArabic = lang === 'ar';
  const { recording, recordingPending, recordingUrl, recordingError, startRecording, stopRecording, playRecording, clearRecording, discardRecording } = useRecording(lang);
  const items = practiceItems(t.practiceData, category, letter);
  const pageStep = singleItemCategories.has(category) ? itemCount : 1;
  const pageCount = Math.ceil(items.length / pageStep);
  const pageNumber = Math.floor(pageIndex / pageStep) + 1;
  const reducedMotion = Y.useRef(matchMedia('(prefers-reduced-motion: reduce)').matches).current;
  const viewMotion = {
    initial: { opacity: reducedMotion ? 1 : 0 },
    animate: { opacity: 1 },
    exit: { opacity: reducedMotion ? 1 : 0 }
  };
  const screenTitle = {
    home: t.title, 'fluency-shaping': t.fluencyShaping,
    'stuttering-modification': t.stutteringMod, 'breathing-techniques': t.breathingTech,
    'slower-rate-practice': t.slowerRate, 'easy-onset-practice': t.easyOnsets,
    'light-contact-practice': t.lightContacts, 'cancellation-practice': t.cancellations,
    'pull-out-practice': t.pullOuts, 'prep-set-practice': t.prepSets,
    'breathing-practice': t.breathingInfo.techniques[breathingPreset]?.name || t.breathingTech
  }[screen] || t.title;
  function resetPractice() {
    elapsedRef.current = 0;
    setPlaying(false);
    setCompleted(false);
    setActiveIndex(-1);
    setOnsetPhase('idle');
    setOnsetProgress(0);
    setModPhase('idle');
    setBreathPhase('idle');
    setBreathProgress(0);
    stopRecording();
  }
  function setScreen(next) {
    resetPractice();
    discardRecording();
    setShowInfo(false);
    setPageIndex(0);
    const allowed = categoriesByScreen[next];
    if (allowed && !allowed.includes(category)) setCategory(allowed[0]);
    updateScreen(next);
  }
  function setItemCount(value) {
    resetPractice();
    updateItemCount(value);
    setPageIndex(0);
  }
  function toggleLanguage() {
    resetPractice();
    discardRecording();
    setLetter(null);
    setPageIndex(0);
    if (category === 'practice') setCategory('words');
    setLang(previous => previous === 'ar' ? 'en' : 'ar');
  }
  function togglePractice() {
    if (playing) { setPlaying(false); setCompleted(false); return; }
    if (completed) elapsedRef.current = 0;
    setCompleted(false);
    setPlaying(true);
  }
  function nextPage() {
    if (pageIndex + pageStep < items.length) { resetPractice(); setPageIndex(pageIndex + pageStep); }
  }
  function previousPage() {
    if (pageIndex > 0) { resetPractice(); setPageIndex(Math.max(0, pageIndex - pageStep)); }
  }
  Y.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    try { localStorage.setItem('fluency-flow-language', lang); } catch { /* Private browsing can block storage. */ }
  }, [lang, isArabic]);
  Y.useEffect(() => {
    document.title = `${screenTitle} · Fluency Flow`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('h1')?.focus({ preventScroll: true });
  }, [screen, lang]);
  Y.useEffect(() => {
    if (showInfo || showAbout || showLetters) { setPlaying(false); setCompleted(false); }
  }, [showInfo, showAbout, showLetters]);
  const backgroundStopRef = Y.useRef(stopRecording);
  backgroundStopRef.current = stopRecording;
  Y.useEffect(() => {
    function pauseForBackground() {
      if (document.hidden) { setPlaying(false); setCompleted(false); backgroundStopRef.current(); }
    }
    function leavePage() { setPlaying(false); setCompleted(false); backgroundStopRef.current(); }
    document.addEventListener('visibilitychange', pauseForBackground);
    window.addEventListener('pagehide', leavePage);
    return () => {
      document.removeEventListener('visibilitychange', pauseForBackground);
      window.removeEventListener('pagehide', leavePage);
    };
  }, []);
  // Auto-advance owns one cancellable timeout. Navigation, pause, dialogs and
  // changing a category all invalidate it before another exercise can start.
  Y.useEffect(() => {
    if (!completed || !autoNext || showInfo || showAbout || showLetters || document.hidden || pageIndex + pageStep >= items.length) return;
    const timeout = setTimeout(() => {
      elapsedRef.current = 0;
      setCompleted(false);
      setActiveIndex(-1);
      setPageIndex(index => index + pageStep);
      setPlaying(true);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [completed, autoNext, screen, category, lang, letter, pageIndex, pageStep, items.length, showInfo, showAbout, showLetters]);
  // Use elapsed time instead of interval counts, and retain it while paused.
  // Ten updates per second keep the cue responsive without rendering at 20 Hz.
  Y.useEffect(() => {
    if (!playing || showInfo || showAbout || showLetters) return;
    const tokens = practiceTokens(items, category, pageIndex, itemCount);
    const isBreathing = screen === 'breathing-practice';
    if (!isBreathing && !tokens.length) { setPlaying(false); return; }
    const phases = [];
    if (!isBreathing) tokens.forEach((token, index) => {
      const push = (phase, duration) => phases.push({ index, phase, duration });
      if (screen === 'easy-onset-practice') {
        if (index === 0 || (!singleItemCategories.has(category) && token.breath)) push('breath', 1000);
        push('vocalize', category === 'stories' ? 450 - onsetLevel * 50 : 800);
      } else if (screen === 'cancellation-practice') { push('stutter', 1500); push('pause', 1000); push('repeat', 1500); }
      else if (screen === 'pull-out-practice') { push('stutter', 1500); push('transition', 1500); }
      else if (screen === 'prep-set-practice') { push('prepare', 1000); push('smooth', 1500); }
      else push('word', (11 - speed) * 300);
    });
    let last = performance.now();
    function tick() {
      const now = performance.now();
      elapsedRef.current += now - last;
      last = now;
      let elapsed = elapsedRef.current;
      if (isBreathing) {
        const total = (inhale + hold + exhale) * 1000;
        elapsed %= total;
        setBreathProgress(elapsed / total * 100);
        setBreathPhase(elapsed < inhale * 1000 ? 'inhale' : elapsed < (inhale + hold) * 1000 ? 'hold' : 'exhale');
        return;
      }
      for (const cue of phases) {
        if (elapsed < cue.duration) {
          setActiveIndex(cue.index);
          if (screen === 'easy-onset-practice') { setOnsetPhase(cue.phase); setOnsetProgress(cue.phase === 'breath' ? elapsed / cue.duration * 100 : 0); }
          else setModPhase(cue.phase);
          return;
        }
        elapsed -= cue.duration;
      }
      elapsedRef.current = 0;
      setPlaying(false);
      setCompleted(true);
      setActiveIndex(-1);
      setOnsetPhase('idle');
      setModPhase('idle');
    }
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [playing, screen, category, lang, pageIndex, itemCount, letter, speed, onsetLevel, inhale, hold, exhale, showInfo, showAbout, showLetters]);
  const phaseLabel = screen === 'breathing-practice' ? t[breathPhase] || '' : screen === 'easy-onset-practice' ? (onsetPhase === 'breath' ? t.inhale : onsetPhase === 'vocalize' ? t.speak : '') : t[modPhase] || '';
  return u.jsxs("div", {
    className: "min-h-screen min-h-[100dvh] bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 flex flex-col",
    dir: isArabic ? "rtl" : "ltr",
    "data-screen": screen,
    "data-playing": playing,
    children: [u.jsxs("header", {
      className: "sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-3 md:px-6 py-2 md:py-5 flex items-center justify-between shadow-sm",
      children: [u.jsxs("div", {
        className: "flex items-center gap-2 md:gap-3",
        children: [screen !== "home" && u.jsx("button", {
          onClick: () => {
            setScreen(parentScreen(screen));
          },
          "aria-label": t.back,
          className: "p-1 md:p-2 hover:bg-slate-100 rounded-2xl transition-colors active:scale-90",
          children: u.jsx($s, {
            className: `w-4 h-4 md:w-6 md:h-6 text-slate-600 ${isArabic ? "rotate-180" : ""}`
          })
        }), u.jsx("h1", {
          className: "text-base md:text-xl font-black tracking-tight text-slate-900 truncate max-w-[120px] md:max-w-none",
          tabIndex: -1,
          children: screenTitle
        })]
      }), u.jsxs("button", {
        onClick: toggleLanguage,
        lang: isArabic ? "en" : "ar",
        "aria-label": isArabic ? "Switch to English" : "التبديل إلى العربية",
        className: "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-slate-100 hover:bg-slate-200 rounded-xl md:rounded-2xl transition-all active:scale-95 font-bold text-xs md:text-sm text-slate-700 border border-slate-200 shrink-0",
        children: [u.jsx(nS, {
          className: "w-3.5 h-3.5 md:w-4 md:h-4"
        }), u.jsx("span", {
          children: lang === "ar" ? "English" : "العربية"
        })]
      })]
    }), u.jsx("main", {
      id: "practice-main",
      className: "flex-1 w-full max-w-4xl mx-auto p-3 md:p-12",
      children: u.jsxs(Xa, {
        mode: "wait",
        children: [screen === "home" && u.jsxs(bt.div, {
          variants: viewMotion,
          initial: "initial",
          animate: "animate",
          exit: "exit",
          className: "space-y-10",
          children: [u.jsxs("div", {
            className: "space-y-3",
            children: [u.jsx(bt.h2, {
              initial: {
                y: 20,
                opacity: 0
              },
              animate: {
                y: 0,
                opacity: 1
              },
              className: "text-4xl md:text-5xl font-black text-slate-900 leading-tight",
              children: t.welcome
            }), u.jsx("p", {
              className: "text-slate-500 text-lg md:text-xl font-medium",
              children: t.subtitle
            })]
          }), u.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-2 gap-6",
            children: [u.jsx(StrategyCard, {
              title: t.fluencyShaping,
              description: t.fluencyDesc,
              icon: u.jsx(Uf, {
                className: "w-10 h-10"
              }),
              onClick: () => setScreen("fluency-shaping"),
              color: "bg-indigo-600",
              lang: lang
            }), u.jsx(StrategyCard, {
              title: t.stutteringMod,
              description: t.stutteringDesc,
              icon: u.jsx(q6, {
                className: "w-10 h-10"
              }),
              onClick: () => setScreen("stuttering-modification"),
              color: "bg-emerald-600",
              lang: lang
            }), u.jsx(StrategyCard, {
              title: t.breathingTech,
              description: t.breathingDesc,
              icon: u.jsx(Gn, {
                className: "w-10 h-10"
              }),
              onClick: () => setScreen("breathing-techniques"),
              color: "bg-amber-500",
              lang: lang
            }), u.jsx(StrategyCard, {
              title: t.info,
              description: t.infoDesc,
              icon: u.jsx(xa, {
                className: "w-10 h-10"
              }),
              onClick: event => { event.currentTarget.focus(); setShowAbout(true); },
              color: "bg-slate-800",
              lang: lang
            })]
          })]
        }, "home"), screen === "fluency-shaping" && u.jsxs(bt.div, {
          variants: viewMotion,
          initial: "initial",
          animate: "animate",
          exit: "exit",
          className: "space-y-4 md:space-y-12",
          children: [u.jsx("div", {
            className: "bg-indigo-50 p-4 md:p-6 rounded-3xl border border-indigo-100 text-center",
            children: u.jsx("p", {
              className: "text-indigo-900 font-medium text-sm md:text-lg",
              children: t.fluencyIntro
            })
          }), u.jsxs("div", {
            className: "grid grid-cols-3 gap-3 md:gap-12",
            children: [u.jsx(TechniqueButton, {
              title: t.slowerRate,
              icon: u.jsx(Gn, {}),
              color: "bg-indigo-500",
              onClick: () => setScreen("slower-rate-practice")
            }), u.jsx(TechniqueButton, {
              title: t.easyOnsets,
              icon: u.jsx(al, {}),
              color: "bg-indigo-500",
              onClick: () => {
                setScreen("easy-onset-practice"), setCategory("words"), setPageIndex(0), setItemCount(3);
              }
            }), u.jsx(TechniqueButton, {
              title: t.lightContacts,
              icon: u.jsx(va, {}),
              color: "bg-indigo-500",
              onClick: () => {
                setScreen("light-contact-practice"), setCategory("plosives"), setPageIndex(0), setItemCount(3);
              }
            })]
          }), u.jsxs("div", {
            className: "p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden transform-gpu",
            children: [u.jsx("div", {
              className: "absolute top-0 left-0 w-2 h-full bg-indigo-500"
            }), u.jsx("p", {
              className: "text-slate-700 text-lg italic leading-relaxed",
              children: t.fluencyQuote
            })]
          })]
        }, "fluency-shaping"), screen === "slower-rate-practice" && u.jsxs(bt.div, {
          variants: viewMotion,
          initial: "initial",
          animate: "animate",
          exit: "exit",
          className: "space-y-6 md:space-y-10",
          children: [u.jsx("div", {
            className: "bg-indigo-50 p-4 md:p-6 rounded-3xl border border-indigo-100 text-center",
            children: u.jsx("p", {
              className: "text-indigo-900 font-medium text-sm md:text-lg",
              children: t.slowerRateIntro
            })
          }), u.jsx("div", {
            className: "ff-categories flex flex-wrap gap-1 md:gap-2 p-1.5 bg-slate-100 rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-inner items-center justify-center sm:justify-start",
            children: ["numbers", "letters", "colors", "animals", "food", "words", "sentences", "stories"].map(O => u.jsx("button", {
              onClick: () => {
                setCategory(O), resetPractice(), setPageIndex(0);
              },
              className: `py-1.5 md:py-3.5 px-3 rounded-xl md:rounded-[1.8rem] font-black text-[9px] md:text-xs uppercase tracking-wider transition-all duration-300 ${category === O ? "bg-white shadow-md text-indigo-600 scale-[1.02]" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`,
              "aria-pressed": category === O,
              children: t[O]
            }, O))
          }), u.jsxs("div", {
            className: "ff-speed bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6",
            children: [u.jsxs("div", {
              className: "flex justify-between items-end",
              children: [u.jsxs("div", {
                className: "space-y-1",
                children: [u.jsx("span", {
                  className: "block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]",
                  children: t.speed
                }), u.jsxs("span", {
                  className: "block text-2xl font-black text-slate-800",
                  children: [speed, " ", u.jsx("span", {
                    className: "text-sm text-slate-400 font-bold",
                    children: "/ 10"
                  })]
                })]
              }), u.jsxs("div", {
                className: "flex gap-2",
                children: [u.jsx("button", {
                  onClick: () => setSpeed(Math.max(1, speed - 1)),
                  "aria-label": t.slow,
                  className: "p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors",
                  children: u.jsx(Hi, {
                    className: "w-4 h-4"
                  })
                }), u.jsx("button", {
                  onClick: () => setSpeed(Math.min(10, speed + 1)),
                  "aria-label": t.faster,
                  className: "p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors",
                  children: u.jsx(Ps, {
                    className: "w-4 h-4"
                  })
                })]
              })]
            }), u.jsxs("div", {
              className: "relative px-2",
              children: [u.jsx("input", {
                type: "range",
                min: "1",
                max: "10",
                value: speed,
                "aria-label": t.speed,
                onChange: O => setSpeed(parseInt(O.target.value)),
                className: "w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
              }), u.jsxs("div", {
                className: "flex justify-between mt-4 px-1",
                children: [u.jsx("span", {
                  className: "text-[9px] font-black text-slate-300 uppercase tracking-widest",
                  children: t.slow
                }), u.jsx("span", {
                  className: "text-[9px] font-black text-slate-300 uppercase tracking-widest",
                  children: t.normal
                })]
              })]
            })]
          }), u.jsxs("div", {
            className: "flex flex-col md:flex-row gap-4 md:gap-8 w-full",
            children: [u.jsxs("div", {
              className: "ff-toolbar flex flex-row md:flex-col gap-2 md:gap-4 w-full md:w-32 shrink-0",
              children: [u.jsx("div", {
                className: "flex-1 md:flex-none",
                children: u.jsxs("button", {
                  onClick: togglePractice,
                  className: `w-full md:aspect-square py-3 md:py-0 md:h-32 rounded-2xl md:rounded-[2rem] font-black flex flex-row md:flex-col items-center justify-center gap-2 shadow-lg md:shadow-xl transition-all active:scale-95 group ${playing ? "bg-slate-100 text-slate-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`,
                  title: playing ? t.pause : t.play,
                  children: [playing ? u.jsx(Ui, {
                    className: "w-5 h-5 md:w-10 md:h-10"
                  }) : u.jsx(Fs, {
                    className: "w-5 h-5 md:w-10 md:h-10 fill-current"
                  }), u.jsx("span", {
                    className: "text-[9px] md:text-[10px] uppercase tracking-widest",
                    children: playing ? t.pause : t.play
                  })]
                })
              }), u.jsxs("div", {
                className: "flex flex-row md:flex-col gap-2 md:gap-3 flex-1 md:flex-none p-1.5 md:p-2 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100",
                children: [u.jsx("button", {
                  onClick: event => { event.currentTarget.focus(); setShowInfo(true); },
                  className: "flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-50",
                  title: t.info,
                  children: u.jsx(xa, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                 }), u.jsx("button", {
                  onClick: resetPractice, title: t.reset,
                  className: 'ff-reset', children: u.jsx(cf, { className: 'w-5 h-5' })
                }), u.jsx("button", {
                  onClick: () => setAutoNext(!autoNext),
                  "aria-pressed": autoNext,
                  className: `flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all ${autoNext ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-slate-400 border-slate-200"}`,
                  title: t.autoAdvance,
                  children: u.jsx(Vo, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                }), ["numbers", "letters", "colors", "animals", "food", "words"].includes(category) && u.jsxs("div", {
                  className: "flex flex-row md:flex-col items-center gap-1",
                  children: [u.jsx("button", {
                    onClick: () => setItemCount(O => Math.min(3, O + 1)),
                    className: "flex-1 md:aspect-square py-2 md:py-0 w-8 md:w-full rounded-xl md:rounded-2xl bg-white text-indigo-400 border border-indigo-50 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-50 hover:text-indigo-600",
                    title: t.moreItems,
                    children: u.jsx(Ps, {
                      className: "w-5 h-5"
                    })
                  }), u.jsx("span", {
                    className: "text-[10px] font-black text-slate-400 min-w-[12px] text-center",
                    children: itemCount
                  }), u.jsx("button", {
                    onClick: () => setItemCount(O => Math.max(1, O - 1)),
                    className: "flex-1 md:aspect-square py-2 md:py-0 w-8 md:w-full rounded-xl md:rounded-2xl bg-white text-indigo-400 border border-indigo-50 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-50 hover:text-indigo-600",
                    title: t.lessItems,
                    children: u.jsx(Hi, {
                      className: "w-5 h-5"
                    })
                  })]
                })]
              })]
            }), u.jsxs("div", {
              className: "ff-practice-card flex-1 w-full min-w-0 min-h-[300px] md:min-h-[550px] flex flex-col items-center justify-center p-4 md:p-12 bg-white rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden transform-gpu",
              children: [u.jsxs("div", {
                className: "ff-pagination absolute top-4 left-4 right-4 flex justify-between items-center",
                children: [u.jsx("button", {
                  onClick: previousPage,
                  "aria-label": t.prev,
                  disabled: pageIndex === 0,
                  className: "p-2 rounded-full bg-slate-100 text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-200",
                  children: u.jsx($s, {
                    className: isArabic ? "rotate-180" : ""
                  })
                }), u.jsxs("span", {
                  className: "text-xs font-black text-slate-400 uppercase tracking-widest",
                  children: [pageNumber, " / ", pageCount]
                }), u.jsx("button", {
                  onClick: nextPage,
                  "aria-label": t.next,
                  disabled: pageIndex + pageStep >= items.length,
                  className: "p-2 rounded-full bg-slate-100 text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-200",
                  children: u.jsx(Oo, {
                    className: isArabic ? "rotate-180" : ""
                  })
                })]
              }), u.jsx(Xa, {
                mode: "wait",
                children: ["numbers", "letters", "colors", "animals", "food", "words"].includes(category) ? u.jsx("div", {
                  className: "flex flex-wrap justify-center items-center gap-8 md:gap-12 w-full",
                  children: t.practiceData[category].slice(pageIndex, pageIndex + itemCount).map((O, F) => u.jsxs(bt.div, {
                    initial: {
                      opacity: 0,
                      scale: .9
                    },
                    animate: {
                      opacity: 1,
                      scale: activeIndex === F ? 1.15 : 1,
                      color: activeIndex === F ? "#6366f1" : "#475569"
                    },
                    className: "flex flex-col items-center gap-4",
                    children: [u.jsx("div", {
                      className: "h-24 flex flex-col items-center justify-end",
                      children: activeIndex === F && u.jsxs(bt.div, {
                        initial: {
                          opacity: 0,
                          y: 10
                        },
                        animate: {
                          opacity: 1,
                          y: 0
                        },
                        className: "flex flex-col items-center gap-2",
                        children: [u.jsx(dj, {
                          className: "w-8 h-8 text-indigo-400"
                        }), u.jsx("div", {
                          className: "w-16 h-1 bg-slate-100 rounded-full overflow-hidden transform-gpu",
                          children: u.jsx(bt.div, {
                            className: "h-full bg-indigo-400",
                            animate: {
                              width: "100%"
                            },
                            transition: {
                              duration: (11 - speed) * .5
                            }
                          })
                        })]
                      })
                    }), O.icon && u.jsx("div", {
                      className: "w-16 h-16 flex items-center justify-center",
                      children: Xi.cloneElement(O.icon, {
                        className: "w-12 h-12"
                      })
                    }), u.jsx("span", {
                      className: "font-black text-4xl",
                      children: O.text
                    })]
                  }, pageIndex + F))
                }) : u.jsx("div", {
                  className: "text-center max-w-full",
                  children: u.jsx("div", {
                    className: `flex flex-wrap justify-center ${category === "stories" ? "gap-x-2 gap-y-3 text-lg md:text-xl" : "gap-x-4 gap-y-6 text-3xl md:text-4xl"} font-bold leading-relaxed`,
                    children: (() => {
                      var F;
                      const O = (F = t.practiceData[category]) == null ? void 0 : F[pageIndex];
                      return typeof O != "string" ? null : O.split(/\s+/).map((ct, st) => u.jsx(bt.span, {
                        animate: {
                          color: st === activeIndex ? "#6366f1" : "#475569",
                          scale: st === activeIndex ? 1.1 : 1,
                          opacity: st === activeIndex ? 1 : .72
                        },
                        className: "transition-all px-1",
                        children: ct
                      }, st));
                    })()
                  })
                })
              })]
            })]
          })]
        }, "slower-rate-practice"), screen === "easy-onset-practice" && u.jsxs(bt.div, {
          variants: viewMotion,
          initial: "initial",
          animate: "animate",
          exit: "exit",
          className: "space-y-6 md:space-y-10",
          children: [u.jsx("div", {
            className: "bg-indigo-50/50 p-4 md:p-6 rounded-3xl border border-indigo-100/50 text-center",
            children: u.jsx("p", {
              className: "text-indigo-900 font-medium text-sm md:text-lg",
              children: t.easyOnsetIntro
            })
          }), u.jsx("div", {
            className: "ff-categories flex flex-wrap gap-1 md:gap-2 p-1.5 bg-slate-100 rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-inner items-center justify-center sm:justify-start",
            children: ["numbers", "letters", "words", "sentences", "stories", "practice"].map(O => u.jsx("button", {
              onClick: event => {
                event.currentTarget.focus();
                O === "practice" ? setShowLetters(!0) : (setCategory(O), resetPractice(), setPageIndex(0));
              },
              className: `py-1.5 md:py-2.5 px-3 rounded-xl font-bold text-[9px] md:text-sm transition-all ${category === O ? "bg-white shadow-sm text-indigo-600 ring-1 ring-slate-200" : "text-slate-500 hover:bg-slate-50"}`,
              "aria-pressed": category === O,
              children: t[O]
            }, O))
          }), u.jsxs("div", {
            className: "flex flex-col md:flex-row gap-4 md:gap-8 w-full",
            children: [u.jsxs("div", {
              className: "ff-toolbar flex flex-row md:flex-col gap-2 md:gap-4 w-full md:w-32 shrink-0",
              children: [u.jsx("div", {
                className: "flex-1 md:flex-none",
                children: u.jsxs("button", {
                  onClick: togglePractice,
                  className: `w-full md:aspect-square py-3 md:py-0 md:h-32 rounded-2xl md:rounded-[2rem] font-black flex flex-row md:flex-col items-center justify-center gap-2 shadow-lg md:shadow-xl transition-all active:scale-95 group ${playing ? "bg-slate-100 text-slate-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`,
                  title: playing ? t.pause : t.play,
                  children: [playing ? u.jsx(Ui, {
                    className: "w-5 h-5 md:w-10 md:h-10"
                  }) : u.jsx(Fs, {
                    className: "w-5 h-5 md:w-10 md:h-10 fill-current"
                  }), u.jsx("span", {
                    className: "text-[9px] md:text-[10px] uppercase tracking-widest",
                    children: playing ? t.pause : t.play
                  })]
                })
              }), u.jsxs("div", {
                className: "flex flex-row md:flex-col gap-2 md:gap-3 flex-1 md:flex-none p-1.5 md:p-2 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100",
                children: [u.jsx("button", {
                  onClick: event => { event.currentTarget.focus(); setShowInfo(true); },
                  className: "flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-50",
                  title: t.info,
                  children: u.jsx(xa, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                 }), u.jsx("button", {
                  onClick: resetPractice, title: t.reset,
                  className: 'ff-reset', children: u.jsx(cf, { className: 'w-5 h-5' })
                }), u.jsx("button", {
                  onClick: () => setAutoNext(!autoNext),
                  "aria-pressed": autoNext,
                  className: `flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all ${autoNext ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-slate-400 border-slate-200"}`,
                  title: t.autoAdvance,
                  children: u.jsx(Vo, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                }), ["numbers", "letters", "words", "practice"].includes(category) && u.jsxs("div", {
                  className: "flex flex-row md:flex-col items-center gap-1",
                  children: [u.jsx("button", {
                    onClick: () => setItemCount(O => Math.min(3, O + 1)),
                    className: "flex-1 md:aspect-square py-2 md:py-0 w-8 md:w-full rounded-xl md:rounded-2xl bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-50",
                    title: t.moreItems,
                    children: u.jsx(Ps, {
                      className: "w-5 h-5 md:w-6 md:h-6"
                    })
                  }), u.jsx("span", {
                    className: "text-[10px] font-black text-slate-400 min-w-[12px] text-center",
                    children: itemCount
                  }), u.jsx("button", {
                    onClick: () => setItemCount(O => Math.max(1, O - 1)),
                    className: "flex-1 md:aspect-square py-2 md:py-0 w-8 md:w-full rounded-xl md:rounded-2xl bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-50",
                    title: t.lessItems,
                    children: u.jsx(Hi, {
                      className: "w-5 h-5 md:w-6 md:h-6"
                    })
                  })]
                })]
              }), category === "stories" && u.jsxs("div", {
                className: "ff-onset-speed flex flex-row md:flex-col gap-2 p-2 bg-slate-100 rounded-[2rem] border border-slate-200",
                children: [u.jsx("button", {
                  onClick: () => setOnsetLevel(O => Math.min(3, O + 1)),
                  className: `flex-1 aspect-square rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all ${onsetLevel > 0 ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 hover:bg-indigo-50"}`,
                  title: t.faster,
                  children: u.jsx(ij, {
                    className: "w-6 h-6"
                  })
                }), u.jsx("button", {
                  onClick: () => setOnsetLevel(0),
                  className: `flex-1 aspect-square rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all ${onsetLevel === 0 ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 hover:bg-indigo-50"}`,
                  title: t.normal,
                  children: u.jsx("span", {
                    className: "font-black text-[10px]",
                    children: "1x"
                  })
                }), u.jsx("button", {
                  onClick: () => setOnsetLevel(O => Math.max(-3, O - 1)),
                  className: `flex-1 aspect-square rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all ${onsetLevel < 0 ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 hover:bg-indigo-50"}`,
                  title: t.slow,
                  children: u.jsx(tj, {
                    className: "w-6 h-6"
                  })
                })]
              }), u.jsxs("div", {
                className: "flex flex-row md:flex-col gap-2 md:gap-3 p-1.5 md:p-2 bg-indigo-50/50 rounded-2xl md:rounded-[2rem] border border-indigo-100/50 mt-auto",
                children: [u.jsx('p', {
                  className: 'ff-recording-feedback', role: recordingError ? 'alert' : 'status',
                  children: recordingError || (recordingPending ? t.recordingPending : recording ? t.recording : recordingUrl ? t.recordingReady : t.record)
                }), recording ? u.jsx("button", {
                  onClick: stopRecording,
                  className: "flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl bg-rose-600 text-white border border-rose-700 flex items-center justify-center shadow-sm active:scale-95 transition-all animate-pulse",
                  title: t.stop,
                  children: u.jsx(Vf, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                }) : u.jsx("button", {
                  onClick: startRecording,
                  disabled: recordingPending,
                  className: "flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl bg-white text-rose-600 border border-rose-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-rose-50",
                  title: recordingPending ? t.recordingPending : t.record,
                  children: u.jsx(Of, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                }), recordingUrl && u.jsxs(u.Fragment, {
                  children: [u.jsx("button", {
                    onClick: playRecording,
                    className: "flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-50",
                    title: t.playRecording,
                    children: u.jsx(gT, {
                      className: "w-5 h-5 md:w-6 md:h-6"
                    })
                  }), u.jsx("button", {
                    onClick: clearRecording,
                    className: "flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl bg-white text-slate-400 border border-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-slate-50 hover:text-rose-600",
                    title: t.clear,
                    children: u.jsx(sT, {
                      className: "w-5 h-5 md:w-6 md:h-6"
                    })
                  })]
                })]
              })]
            }), u.jsxs("div", {
              className: "ff-practice-card flex-1 w-full min-w-0 min-h-[300px] md:min-h-[550px] flex flex-col items-center justify-center p-4 md:p-12 bg-white rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden transform-gpu",
              children: [u.jsxs("div", {
                className: "ff-pagination absolute top-6 left-6 right-6 flex justify-between items-center",
                children: [u.jsx("button", {
                  onClick: previousPage,
                  "aria-label": t.prev,
                  disabled: pageIndex === 0,
                  className: "p-3 rounded-2xl bg-slate-100 text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-200 active:scale-90",
                  children: u.jsx($s, {
                    className: `w-5 h-5 ${isArabic ? "rotate-180" : ""}`
                  })
                }), u.jsx("div", {
                  className: "px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200",
                  children: u.jsxs("span", {
                    className: "text-[10px] font-black text-slate-500 uppercase tracking-widest",
                    children: [pageNumber, " / ", pageCount]
                  })
                }), u.jsx("button", {
                  onClick: nextPage,
                  "aria-label": t.next,
                  disabled: pageIndex + pageStep >= items.length,
                  className: "p-3 rounded-2xl bg-slate-100 text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-200 active:scale-90",
                  children: u.jsx(Oo, {
                    className: `w-5 h-5 ${isArabic ? "rotate-180" : ""}`
                  })
                })]
              }), u.jsx(Xa, {
                mode: "wait",
                children: ["numbers", "letters", "words", "practice"].includes(category) ? u.jsx("div", {
                  className: "flex flex-wrap justify-center items-center gap-8 md:gap-12 w-full",
                  children: (category === "practice" && letter ? t.practiceData.letterWords[letter].map(F => ({
                    text: F,
                    icon: null
                  })) : t.practiceData[category]).slice(pageIndex, pageIndex + itemCount).map((F, ct) => u.jsxs(bt.div, {
                    layout: !0,
                    className: "flex flex-col items-center gap-4 min-w-[120px]",
                    initial: {
                      opacity: 0,
                      scale: .8
                    },
                    animate: {
                      opacity: 1,
                      scale: 1
                    },
                    exit: {
                      opacity: 0,
                      scale: .8
                    },
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    },
                    children: [u.jsx("div", {
                      className: "h-24 flex flex-col items-center justify-end",
                      children: ct === 0 ? u.jsxs(bt.div, {
                        animate: {
                          scale: activeIndex === ct && onsetPhase === "breath" ? 1.1 : 1,
                          opacity: activeIndex === ct && onsetPhase === "breath" ? 1 : .3
                        },
                        className: "flex flex-col items-center gap-2",
                        children: [u.jsx(Gn, {
                          className: "w-10 h-10 text-sky-400"
                        }), u.jsx("div", {
                          className: "w-20 h-2 bg-slate-100 rounded-full overflow-hidden transform-gpu",
                          children: u.jsx(bt.div, {
                            className: "h-full bg-sky-400",
                            animate: {
                              width: activeIndex === ct && onsetPhase === "breath" ? `${onsetProgress}%` : "0%"
                            },
                            transition: {
                              duration: .1
                            }
                          })
                        })]
                      }) : u.jsx("div", {
                        className: "h-20"
                      })
                    }), u.jsxs(bt.div, {
                      animate: {
                        opacity: activeIndex === ct && onsetPhase === "vocalize" ? 1 : .72,
                        scale: activeIndex === ct && onsetPhase === "vocalize" ? 1.2 : 1,
                        color: activeIndex === ct && onsetPhase === "vocalize" ? "#6366f1" : "#475569"
                      },
                      className: "flex flex-col items-center gap-4",
                      children: [F.icon && u.jsx("div", {
                        className: "w-16 h-16 flex items-center justify-center",
                        children: Xi.cloneElement(F.icon, {
                          className: "w-12 h-12"
                        })
                      }), u.jsx("span", {
                        className: "font-black text-4xl",
                        children: F.text
                      })]
                    })]
                  }, pageIndex + ct))
                }) : u.jsx("div", {
                  className: "text-center max-w-full",
                  children: u.jsx("div", {
                    className: "flex flex-col items-center gap-8",
                    children: u.jsx("div", {
                      className: `flex flex-wrap justify-center gap-x-4 gap-y-10 font-bold leading-relaxed ${category === "stories" ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"}`,
                      children: (() => {
                        var st;
                        const O = (st = t.practiceData[category]) == null ? void 0 : st[pageIndex];
                        if (typeof O != "string") return null;
                        O.split(/\s+/);
                        let F = 0;
                        return (category === "stories" ? splitPhrases(O) : [O]).map((Jt, Xt) => {
                          const Lt = Jt.trim().split(/\s+/),
                            be = F;
                          return F += Lt.length, u.jsxs("div", {
                            className: "flex flex-wrap justify-center gap-x-4 gap-y-6 relative pt-20",
                            children: [u.jsxs(bt.div, {
                              animate: {
                                scale: activeIndex === be && onsetPhase === "breath" ? 1.2 : 1,
                                opacity: activeIndex === be && onsetPhase === "breath" ? 1 : .1
                              },
                              className: "absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2",
                              children: [u.jsx(Gn, {
                                className: "w-10 h-10 text-sky-400"
                              }), u.jsx("div", {
                                className: "w-24 h-2 bg-slate-100 rounded-full overflow-hidden transform-gpu",
                                children: u.jsx(bt.div, {
                                  className: "h-full bg-sky-400",
                                  animate: {
                                    width: activeIndex === be && onsetPhase === "breath" ? `${onsetProgress}%` : "0%"
                                  },
                                  transition: {
                                    duration: .1
                                  }
                                })
                              })]
                            }), Lt.map((Ae, ce) => {
                              const sn = be + ce;
                              return u.jsx(bt.span, {
                                animate: {
                                  color: onsetPhase === "vocalize" && sn === activeIndex ? "#6366f1" : "#475569",
                                  scale: onsetPhase === "vocalize" && sn === activeIndex ? 1.1 : 1,
                                  opacity: onsetPhase === "vocalize" && sn === activeIndex ? 1 : .72
                                },
                                children: Ae
                              }, ce);
                            })]
                          }, Xt);
                        });
                      })()
                    })
                  })
                })
              })]
            })]
          })]
        }, "easy-onset-practice"), screen === "stuttering-modification" && u.jsxs(bt.div, {
          variants: viewMotion,
          initial: "initial",
          animate: "animate",
          exit: "exit",
          className: "space-y-4 md:space-y-12",
          children: [u.jsx("div", {
            className: "bg-emerald-50 p-4 md:p-6 rounded-3xl border border-emerald-100 text-center",
            children: u.jsx("p", {
              className: "text-emerald-900 font-medium text-sm md:text-lg",
              children: t.stutteringIntro
            })
          }), u.jsxs("div", {
            className: "grid grid-cols-3 gap-3 md:gap-12",
            children: [u.jsx(TechniqueButton, {
              title: t.cancellations,
              icon: u.jsx(cf, {}),
              color: "bg-emerald-500",
              onClick: () => {
                setScreen("cancellation-practice"), setCategory("words"), setPageIndex(0), setItemCount(3);
              }
            }), u.jsx(TechniqueButton, {
              title: t.pullOuts,
              icon: u.jsx(fr, {}),
              color: "bg-emerald-500",
              onClick: () => {
                setScreen("pull-out-practice"), setCategory("words"), setPageIndex(0), setItemCount(3);
              }
            }), u.jsx(TechniqueButton, {
              title: t.prepSets,
              icon: u.jsx(Bf, {}),
              color: "bg-emerald-500",
              onClick: () => {
                setScreen("prep-set-practice"), setCategory("words"), setPageIndex(0), setItemCount(3);
              }
            })]
          }), u.jsxs("div", {
            className: "p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden transform-gpu",
            children: [u.jsx("div", {
              className: "absolute top-0 left-0 w-2 h-full bg-emerald-500"
            }), u.jsx("p", {
              className: "text-slate-700 text-lg italic leading-relaxed",
              children: t.stutteringQuote
            })]
          })]
        }, "stuttering-modification"), screen === "light-contact-practice" && u.jsxs(bt.div, {
          variants: viewMotion,
          initial: "initial",
          animate: "animate",
          exit: "exit",
          className: "space-y-6 md:space-y-8",
          children: [u.jsx("div", {
            className: "bg-indigo-50/50 p-4 md:p-6 rounded-3xl border border-indigo-100/50 text-center",
            children: u.jsx("p", {
              className: "text-indigo-900 font-medium text-sm md:text-lg",
              children: t.lightContacts
            })
          }), u.jsx("div", {
            className: "ff-categories flex flex-wrap gap-1 md:gap-2 p-1.5 bg-slate-100 rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-inner items-center justify-center sm:justify-start",
            children: ["plosives", "words", "sentences"].map(O => u.jsx("button", {
              onClick: () => {
                setCategory(O), resetPractice(), setPageIndex(0);
              },
              className: `py-1.5 md:py-2.5 px-3 rounded-xl font-bold text-[9px] md:text-sm transition-all ${category === O ? "bg-white shadow-sm text-indigo-600 ring-1 ring-slate-200" : "text-slate-500 hover:bg-slate-50"}`,
              "aria-pressed": category === O,
              children: t[O]
            }, O))
          }), u.jsxs("div", {
            className: "flex flex-col md:flex-row gap-8 w-full",
            children: [u.jsxs("div", {
              className: "ff-toolbar flex flex-row md:flex-col gap-2 md:gap-4 w-full md:w-32 shrink-0",
              children: [u.jsx("div", {
                className: "flex-1 md:flex-none",
                children: u.jsxs("button", {
                  onClick: togglePractice,
                  className: `w-full md:aspect-square py-3 md:py-0 md:h-32 rounded-2xl md:rounded-[2rem] font-black flex flex-row md:flex-col items-center justify-center gap-2 shadow-lg md:shadow-xl transition-all active:scale-95 group ${playing ? "bg-slate-100 text-slate-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`,
                  title: playing ? t.pause : t.play,
                  children: [playing ? u.jsx(Ui, {
                    className: "w-5 h-5 md:w-10 md:h-10"
                  }) : u.jsx(Fs, {
                    className: "w-5 h-5 md:w-10 md:h-10 fill-current"
                  }), u.jsx("span", {
                    className: "text-[9px] md:text-[10px] uppercase tracking-widest",
                    children: playing ? t.pause : t.play
                  })]
                })
              }), u.jsxs("div", {
                className: "flex flex-row md:flex-col gap-2 md:gap-3 flex-1 md:flex-none p-1.5 md:p-2 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100",
                children: [u.jsx("button", {
                  onClick: event => { event.currentTarget.focus(); setShowInfo(true); },
                  className: "flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-50",
                  title: t.info,
                  children: u.jsx(xa, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                 }), u.jsx("button", {
                  onClick: resetPractice, title: t.reset,
                  className: 'ff-reset', children: u.jsx(cf, { className: 'w-5 h-5' })
                }), u.jsx("button", {
                  onClick: () => setAutoNext(!autoNext),
                  "aria-pressed": autoNext,
                  className: `flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all ${autoNext ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-slate-400 border-slate-200"}`,
                  title: t.autoAdvance,
                  children: u.jsx(Vo, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                }), ["plosives", "words"].includes(category) && u.jsxs("div", {
                  className: "flex flex-row md:flex-col items-center gap-1",
                  children: [u.jsx("button", {
                    onClick: () => setItemCount(O => Math.min(3, O + 1)),
                    className: "flex-1 md:aspect-square py-2 md:py-0 w-8 md:w-full rounded-xl md:rounded-2xl bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-50",
                    title: t.moreItems,
                    children: u.jsx(Ps, {
                      className: "w-5 h-5 md:w-6 md:h-6"
                    })
                  }), u.jsx("span", {
                    className: "text-[10px] font-black text-slate-400 min-w-[12px] text-center",
                    children: itemCount
                  }), u.jsx("button", {
                    onClick: () => setItemCount(O => Math.max(1, O - 1)),
                    className: "flex-1 md:aspect-square py-2 md:py-0 w-8 md:w-full rounded-xl md:rounded-2xl bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-50",
                    title: t.lessItems,
                    children: u.jsx(Hi, {
                      className: "w-5 h-5 md:w-6 md:h-6"
                    })
                  })]
                })]
              })]
            }), u.jsxs("div", {
              className: "ff-practice-card flex-1 w-full min-w-0 min-h-[300px] md:min-h-[550px] flex flex-col items-center justify-center p-4 md:p-12 bg-white rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden transform-gpu",
              children: [u.jsxs("div", {
                className: "ff-pagination absolute top-4 left-4 right-4 flex justify-between items-center",
                children: [u.jsx("button", {
                  onClick: previousPage,
                  "aria-label": t.prev,
                  disabled: pageIndex === 0,
                  className: "p-3 rounded-2xl bg-slate-100 text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-200 active:scale-90",
                  children: u.jsx($s, {
                    className: `w-5 h-5 ${isArabic ? "rotate-180" : ""}`
                  })
                }), u.jsx("div", {
                  className: "px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200",
                  children: u.jsxs("span", {
                    className: "text-[10px] font-black text-slate-500 uppercase tracking-widest",
                    children: [pageNumber, " / ", pageCount]
                  })
                }), u.jsx("button", {
                  onClick: nextPage,
                  "aria-label": t.next,
                  disabled: pageIndex + pageStep >= items.length,
                  className: "p-3 rounded-2xl bg-slate-100 text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-200 active:scale-90",
                  children: u.jsx(Oo, {
                    className: `w-5 h-5 ${isArabic ? "rotate-180" : ""}`
                  })
                })]
              }), u.jsx(Xa, {
                mode: "wait",
                children: ["plosives", "words"].includes(category) ? u.jsx("div", {
                  className: "flex flex-wrap justify-center gap-12 md:gap-20",
                  children: t.practiceData[category].slice(pageIndex, pageIndex + itemCount).map((O, F) => u.jsxs(bt.div, {
                    initial: {
                      scale: .8,
                      opacity: 0
                    },
                    animate: {
                      scale: 1,
                      opacity: 1
                    },
                    exit: {
                      scale: .8,
                      opacity: 0
                    },
                    className: "relative",
                    children: [u.jsx("div", {
                      className: "h-24 flex flex-col items-center justify-end",
                      children: activeIndex === F && u.jsxs(bt.div, {
                        initial: {
                          opacity: 0,
                          scale: .5
                        },
                        animate: {
                          opacity: 1,
                          scale: 1
                        },
                        className: "flex flex-col items-center gap-2",
                        children: [u.jsx(Mj, {
                          className: "w-10 h-10 text-indigo-300"
                        }), u.jsx("span", {
                          className: "text-[10px] font-black text-indigo-400 uppercase tracking-widest",
                          children: t.light
                        })]
                      })
                    }), u.jsxs(bt.div, {
                      animate: {
                        opacity: activeIndex === F ? 1 : .72,
                        scale: activeIndex === F ? 1.2 : 1,
                        color: activeIndex === F ? "#6366f1" : "#475569"
                      },
                      className: "flex flex-col items-center gap-4",
                      children: [O.icon && u.jsx("div", {
                        className: "w-16 h-16 flex items-center justify-center",
                        children: Xi.cloneElement(O.icon, {
                          className: "w-12 h-12"
                        })
                      }), u.jsx("span", {
                        className: "font-black text-4xl",
                        children: O.text
                      })]
                    })]
                  }, F))
                }) : u.jsx("div", {
                  className: "text-center max-w-full",
                  children: u.jsx("div", {
                    className: "flex flex-col items-center gap-8",
                    children: u.jsx("div", {
                      className: "flex flex-wrap justify-center gap-x-4 gap-y-10 font-bold leading-relaxed text-3xl md:text-4xl w-full",
                      children: t.practiceData[category][pageIndex].split(/\s+/).map((ct, st) => u.jsx(bt.span, {
                        animate: {
                          color: st === activeIndex ? "#6366f1" : "#475569",
                          scale: st === activeIndex ? 1.1 : 1,
                          opacity: st === activeIndex ? 1 : .72
                        },
                        children: ct
                      }, st))
                    })
                  })
                })
              })]
            })]
          })]
        }, "light-contact-practice"), ["cancellation-practice", "pull-out-practice", "prep-set-practice"].includes(screen) && u.jsxs(bt.div, {
          variants: viewMotion,
          initial: "initial",
          animate: "animate",
          exit: "exit",
          className: "space-y-6 md:space-y-8",
          children: [u.jsx("div", {
            className: "bg-emerald-50/50 p-4 md:p-6 rounded-3xl border border-emerald-100/50 text-center",
            children: u.jsx("p", {
              className: "text-emerald-900 font-medium text-sm md:text-lg",
              children: screen === "cancellation-practice" ? t.cancellationIntro : screen === "pull-out-practice" ? t.pullOutIntro : t.prepSetIntro
            })
          }), u.jsx("div", {
            className: "ff-categories flex flex-wrap gap-1 md:gap-2 p-1.5 bg-slate-100 rounded-xl md:rounded-2xl border border-slate-200 justify-center sm:justify-start items-center",
            children: ["words", "sentences", "stories"].map(O => u.jsx("button", {
              onClick: () => {
                setCategory(O), resetPractice(), setPageIndex(0);
              },
              className: `py-1.5 md:py-2.5 px-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm transition-all ${category === O ? "bg-white shadow-sm text-emerald-600 ring-1 ring-slate-200" : "text-slate-500 hover:bg-slate-50"}`,
              "aria-pressed": category === O,
              children: t[O]
            }, O))
          }), u.jsxs("div", {
            className: "flex flex-col md:flex-row gap-4 md:gap-8 w-full",
            children: [u.jsxs("div", {
              className: "ff-toolbar flex flex-row md:flex-col gap-2 md:gap-4 w-full md:w-32 shrink-0",
              children: [u.jsx("div", {
                className: "flex-1 md:flex-none",
                children: u.jsxs("button", {
                  onClick: togglePractice,
                  className: `w-full md:aspect-square py-3 md:py-0 md:h-32 rounded-2xl md:rounded-[2rem] font-black flex flex-row md:flex-col items-center justify-center gap-2 shadow-lg md:shadow-xl transition-all active:scale-95 group ${playing ? "bg-slate-100 text-slate-600" : "bg-emerald-600 text-white hover:bg-emerald-700"}`,
                  title: playing ? t.pause : t.play,
                  children: [playing ? u.jsx(Ui, {
                    className: "w-5 h-5 md:w-10 md:h-10"
                  }) : u.jsx(Fs, {
                    className: "w-5 h-5 md:w-10 md:h-10 fill-current"
                  }), u.jsx("span", {
                    className: "text-[9px] md:text-[10px] uppercase tracking-widest",
                    children: playing ? t.pause : t.play
                  })]
                })
              }), u.jsxs("div", {
                className: "flex flex-row md:flex-col gap-2 md:gap-3 flex-1 md:flex-none p-1.5 md:p-2 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100",
                children: [u.jsx("button", {
                  onClick: event => { event.currentTarget.focus(); setShowInfo(true); },
                  className: "flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl bg-white text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-emerald-50",
                  title: t.info,
                  children: u.jsx(xa, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                 }), u.jsx("button", {
                  onClick: resetPractice, title: t.reset,
                  className: 'ff-reset', children: u.jsx(cf, { className: 'w-5 h-5' })
                }), u.jsx("button", {
                  onClick: () => setAutoNext(!autoNext),
                  "aria-pressed": autoNext,
                  className: `flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all ${autoNext ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-slate-400 border-slate-200"}`,
                  title: t.autoAdvance,
                  children: u.jsx(Vo, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                }), ["words"].includes(category) && u.jsxs("div", {
                  className: "flex flex-row md:flex-col items-center gap-1",
                  children: [u.jsx("button", {
                    onClick: () => setItemCount(O => Math.min(3, O + 1)),
                    className: "flex-1 md:aspect-square py-2 md:py-0 w-8 md:w-full rounded-xl md:rounded-2xl bg-white text-emerald-600 border border-emerald-50 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-emerald-50",
                    title: t.moreItems,
                    children: u.jsx(Ps, {
                      className: "w-5 h-5"
                    })
                  }), u.jsx("span", {
                    className: "text-[10px] font-black text-slate-400 min-w-[12px] text-center",
                    children: itemCount
                  }), u.jsx("button", {
                    onClick: () => setItemCount(O => Math.max(1, O - 1)),
                    className: "flex-1 md:aspect-square py-2 md:py-0 w-8 md:w-full rounded-xl md:rounded-2xl bg-white text-emerald-600 border border-emerald-50 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-emerald-50",
                    title: t.lessItems,
                    children: u.jsx(Hi, {
                      className: "w-5 h-5"
                    })
                  })]
                })]
              })]
            }), u.jsxs("div", {
              className: "ff-practice-card flex-1 w-full min-w-0 min-h-[300px] md:min-h-[550px] flex flex-col items-center justify-center p-4 md:p-12 bg-white rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden transform-gpu",
              children: [u.jsxs("div", {
                className: "ff-pagination absolute top-6 left-6 right-6 flex justify-between items-center",
                children: [u.jsx("button", {
                  onClick: previousPage,
                  "aria-label": t.prev,
                  disabled: pageIndex === 0,
                  className: "p-3 rounded-2xl bg-slate-100 text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-200 active:scale-90",
                  children: u.jsx($s, {
                    className: `w-5 h-5 ${isArabic ? "rotate-180" : ""}`
                  })
                }), u.jsx("div", {
                  className: "px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200",
                  children: u.jsxs("span", {
                    className: "text-[10px] font-black text-slate-500 uppercase tracking-widest",
                    children: [pageNumber, " / ", pageCount]
                  })
                }), u.jsx("button", {
                  onClick: nextPage,
                  "aria-label": t.next,
                  disabled: pageIndex + pageStep >= items.length,
                  className: "p-3 rounded-2xl bg-slate-100 text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-200 active:scale-90",
                  children: u.jsx(Oo, {
                    className: `w-5 h-5 ${isArabic ? "rotate-180" : ""}`
                  })
                })]
              }), u.jsx(Xa, {
                mode: "wait",
                children: u.jsx("div", {
                  className: "text-center max-w-full w-full",
                  children: u.jsxs("div", {
                    className: "flex flex-col items-center gap-12",
                    children: [u.jsxs("div", {
                      className: "h-32 flex items-center justify-center gap-4",
                      children: [screen === "cancellation-practice" && u.jsxs(u.Fragment, {
                        children: [u.jsxs("div", {
                          className: `flex flex-col items-center gap-2 transition-all duration-500 ${modPhase === "stutter" ? "scale-110 opacity-100" : "scale-90 opacity-30"}`,
                          children: [u.jsx("div", {
                            className: "w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600",
                            children: u.jsx(va, {
                              className: "w-6 h-6"
                            })
                          }), u.jsx("span", {
                            className: "text-[10px] font-bold uppercase tracking-tighter",
                            children: t.stutter
                          })]
                        }), u.jsx("div", {
                          className: "w-8 h-px bg-slate-200"
                        }), u.jsxs("div", {
                          className: `flex flex-col items-center gap-2 transition-all duration-500 ${modPhase === "pause" ? "scale-110 opacity-100" : "scale-90 opacity-30"}`,
                          children: [u.jsx("div", {
                            className: "w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600",
                            children: u.jsx(Ui, {
                              className: "w-6 h-6"
                            })
                          }), u.jsx("span", {
                            className: "text-[10px] font-bold uppercase tracking-tighter",
                            children: t.pause
                          })]
                        }), u.jsx("div", {
                          className: "w-8 h-px bg-slate-200"
                        }), u.jsxs("div", {
                          className: `flex flex-col items-center gap-2 transition-all duration-500 ${modPhase === "repeat" ? "scale-110 opacity-100" : "scale-90 opacity-30"}`,
                          children: [u.jsx("div", {
                            className: "w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600",
                            children: u.jsx(cf, {
                              className: "w-6 h-6"
                            })
                          }), u.jsx("span", {
                            className: "text-[10px] font-bold uppercase tracking-tighter",
                            children: t.repeat
                          })]
                        })]
                      }), screen === "pull-out-practice" && u.jsxs(u.Fragment, {
                        children: [u.jsxs("div", {
                          className: `flex flex-col items-center gap-2 transition-all duration-500 ${modPhase === "stutter" ? "scale-110 opacity-100" : "scale-90 opacity-30"}`,
                          children: [u.jsx("div", {
                            className: "w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600",
                            children: u.jsx(va, {
                              className: "w-6 h-6"
                            })
                          }), u.jsx("span", {
                            className: "text-[10px] font-bold uppercase tracking-tighter",
                            children: t.stutter
                          })]
                        }), u.jsx("div", {
                          className: "w-12 h-px bg-slate-200"
                        }), u.jsxs("div", {
                          className: `flex flex-col items-center gap-2 transition-all duration-500 ${modPhase === "transition" ? "scale-110 opacity-100" : "scale-90 opacity-30"}`,
                          children: [u.jsx("div", {
                            className: "w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600",
                            children: u.jsx(fr, {
                              className: "w-6 h-6"
                            })
                          }), u.jsx("span", {
                            className: "text-[10px] font-bold uppercase tracking-tighter",
                            children: t.transition
                          })]
                        })]
                      }), screen === "prep-set-practice" && u.jsxs(u.Fragment, {
                        children: [u.jsxs("div", {
                          className: `flex flex-col items-center gap-2 transition-all duration-500 ${modPhase === "prepare" ? "scale-110 opacity-100" : "scale-90 opacity-30"}`,
                          children: [u.jsx("div", {
                            className: "w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600",
                            children: u.jsx(al, {
                              className: "w-6 h-6"
                            })
                          }), u.jsx("span", {
                            className: "text-[10px] font-bold uppercase tracking-tighter",
                            children: t.prepare
                          })]
                        }), u.jsx("div", {
                          className: "w-12 h-px bg-slate-200"
                        }), u.jsxs("div", {
                          className: `flex flex-col items-center gap-2 transition-all duration-500 ${modPhase === "smooth" ? "scale-110 opacity-100" : "scale-90 opacity-30"}`,
                          children: [u.jsx("div", {
                            className: "w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600",
                            children: u.jsx(Gn, {
                              className: "w-6 h-6"
                            })
                          }), u.jsx("span", {
                            className: "text-[10px] font-bold uppercase tracking-tighter",
                            children: t.smooth
                          })]
                        })]
                      })]
                    }), u.jsx("div", {
                      className: `flex flex-wrap justify-center gap-x-4 gap-y-6 font-bold leading-relaxed ${["sentences", "stories"].includes(category) ? "text-2xl md:text-3xl" : "text-5xl md:text-6xl"}`,
                      children: (() => {
                        var st;
                        const O = (st = t.practiceData[category]) == null ? void 0 : st[pageIndex];
                        if (!O) return null;
                        const F = typeof O == "string" ? O : O.text;
                        const words = singleItemCategories.has(category) ? items.slice(pageIndex, pageIndex + itemCount).map(item => item.text) : F.split(/\s+/);
                        return words.map((Jt, Xt) => u.jsx(bt.span, {
                          animate: {
                            color: Xt === activeIndex ? modPhase === "stutter" ? "#ef4444" : modPhase === "pause" || modPhase === "prepare" ? "#f59e0b" : "#10b981" : "#475569",
                            scale: Xt === activeIndex ? 1.1 : 1,
                            opacity: Xt === activeIndex ? 1 : .3
                          },
                          children: Jt
                        }, Xt));
                      })()
                    })]
                  })
                })
              })]
            })]
          })]
        }, screen), screen === "breathing-techniques" && u.jsxs(bt.div, {
          variants: viewMotion,
          initial: "initial",
          animate: "animate",
          exit: "exit",
          className: "space-y-4 md:space-y-12",
          children: [u.jsx("div", {
            className: "bg-amber-50 p-4 md:p-6 rounded-3xl border border-amber-100 text-center",
            children: u.jsx("p", {
              className: "text-amber-900 font-medium text-sm md:text-lg",
              children: t.breathingIntro
            })
          }), u.jsxs("div", {
            className: "grid grid-cols-3 gap-3 md:gap-12",
            children: [u.jsx(TechniqueButton, {
              title: t.breathingInfo.techniques[0].name,
              icon: u.jsx(Gn, {}),
              color: "bg-amber-500",
              onClick: () => {
                setScreen("breathing-practice"), setBreathingPreset(0), setInhale(4), setHold(2), setExhale(4), resetPractice();
              }
            }), u.jsx(TechniqueButton, {
              title: t.breathingInfo.techniques[1].name,
              icon: u.jsx(va, {}),
              color: "bg-amber-500",
              onClick: () => {
                setScreen("breathing-practice"), setBreathingPreset(1), setInhale(3), setHold(3), setExhale(3), resetPractice();
              }
            }), u.jsx(TechniqueButton, {
              title: t.breathingInfo.techniques[2].name,
              icon: u.jsx(Uf, {}),
              color: "bg-amber-500",
              onClick: () => {
                setScreen("breathing-practice"), setBreathingPreset(2), setInhale(3), setHold(1), setExhale(6), resetPractice();
              }
            })]
          }), u.jsxs("div", {
            className: "p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden transform-gpu",
            children: [u.jsx("div", {
              className: "absolute top-0 left-0 w-2 h-full bg-amber-500"
            }), u.jsx("p", {
              className: "text-slate-700 text-lg italic leading-relaxed",
              children: lang === "ar" ? "التنفس الصحيح هو مفتاح الكلام الهادئ والطلاقة الطبيعية." : "Proper breathing is the key to calm speech and natural fluency."
            })]
          })]
        }, "breathing-techniques"), screen === "breathing-practice" && u.jsxs(bt.div, {
          variants: viewMotion,
          initial: "initial",
          animate: "animate",
          exit: "exit",
          className: "space-y-8",
          children: [u.jsx("div", {
            className: "bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 text-center",
            children: u.jsx("p", {
              className: "text-amber-900 font-medium text-lg",
              children: t.breathingIntro
            })
          }), u.jsxs("div", {
            className: "flex flex-col md:flex-row gap-4 md:gap-8 w-full",
            children: [u.jsxs("div", {
              className: "ff-toolbar flex flex-row md:flex-col gap-2 md:gap-4 w-full md:w-32 shrink-0",
              children: [u.jsx("div", {
                className: "flex-1 md:flex-none",
                children: u.jsxs("button", {
                  onClick: togglePractice,
                  className: `w-full md:aspect-square py-3 md:py-0 md:h-32 rounded-2xl md:rounded-[2rem] font-black flex flex-row md:flex-col items-center justify-center gap-2 shadow-lg md:shadow-xl transition-all active:scale-95 group ${playing ? "bg-slate-100 text-slate-600" : "bg-amber-500 text-white hover:bg-amber-600"}`,
                  title: playing ? t.pause : t.play,
                  children: [playing ? u.jsx(Ui, {
                    className: "w-5 h-5 md:w-10 md:h-10"
                  }) : u.jsx(Fs, {
                    className: "w-5 h-5 md:w-10 md:h-10 fill-current"
                  }), u.jsx("span", {
                    className: "text-[9px] md:text-[10px] uppercase tracking-widest",
                    children: playing ? t.pause : t.play
                  })]
                })
              }), u.jsxs("div", {
                className: "flex flex-row md:flex-col gap-2 md:gap-3 flex-1 md:flex-none p-1.5 md:p-2 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100",
                children: [u.jsx("button", {
                  onClick: event => { event.currentTarget.focus(); setShowInfo(true); },
                  className: "flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl bg-white text-amber-600 border border-amber-100 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-amber-50",
                  title: t.info,
                  children: u.jsx(xa, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                }), u.jsx("button", {
                  onClick: resetPractice,
                  className: "flex-1 md:aspect-square py-2 md:py-0 rounded-xl md:rounded-2xl bg-white text-slate-500 border border-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-slate-50",
                  title: t.reset,
                  children: u.jsx(cf, {
                    className: "w-5 h-5 md:w-6 md:h-6"
                  })
                })]
              })]
            }), u.jsxs("div", {
              className: "ff-practice-card flex-1 w-full min-w-0 min-h-[400px] md:min-h-[550px] flex flex-col items-center p-4 md:p-12 bg-white rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden transform-gpu",
              children: [u.jsxs("div", {
                className: "w-full mb-6 p-1.5 md:p-2 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-200 flex flex-col lg:flex-row gap-1.5 md:gap-2 items-center justify-between shadow-sm",
                children: [u.jsxs("div", {
                  className: "flex flex-wrap items-center justify-center gap-1.5 md:gap-2 w-full lg:w-auto",
                  children: [u.jsxs("div", {
                    className: "flex flex-col gap-0.5 flex-1 md:flex-none p-2 md:p-3 bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm",
                    children: [u.jsx("label", {
                      className: "text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none",
                      children: t.inhale
                    }), u.jsxs("div", {
                      className: "flex items-center gap-2 md:gap-3",
                      children: [u.jsx("input", {
                        type: "range",
                        min: "1",
                        max: "10",
                        value: inhale,
                      "aria-label": t.inhale,
                        onChange: O => setInhale(parseInt(O.target.value)),
                        className: "w-20 md:w-24 accent-indigo-600 h-2 md:h-3"
                      }), u.jsxs("span", {
                        className: "text-[10px] md:text-xs font-bold text-indigo-700 w-5 md:w-6",
                        children: [inhale, "s"]
                      })]
                    })]
                  }), u.jsxs("div", {
                    className: "flex flex-col gap-0.5 flex-1 md:flex-none p-2 md:p-3 bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm",
                    children: [u.jsx("label", {
                      className: "text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none",
                      children: t.hold
                    }), u.jsxs("div", {
                      className: "flex items-center gap-2 md:gap-3",
                      children: [u.jsx("input", {
                        type: "range",
                        min: "1",
                        max: "10",
                        value: hold,
                      "aria-label": t.hold,
                        onChange: O => setHold(parseInt(O.target.value)),
                        className: "w-20 md:w-24 accent-amber-600 h-2 md:h-3"
                      }), u.jsxs("span", {
                        className: "text-[10px] md:text-xs font-bold text-amber-700 w-5 md:w-6",
                        children: [hold, "s"]
                      })]
                    })]
                  }), u.jsxs("div", {
                    className: "flex flex-col gap-0.5 flex-1 md:flex-none p-2 md:p-3 bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm",
                    children: [u.jsx("label", {
                      className: "text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none",
                      children: t.exhale
                    }), u.jsxs("div", {
                      className: "flex items-center gap-2 md:gap-3",
                      children: [u.jsx("input", {
                        type: "range",
                        min: "1",
                        max: "10",
                        value: exhale,
                      "aria-label": t.exhale,
                        onChange: O => setExhale(parseInt(O.target.value)),
                        className: "w-20 md:w-24 accent-emerald-600 h-2 md:h-3"
                      }), u.jsxs("span", {
                        className: "text-[10px] md:text-xs font-bold text-emerald-700 w-5 md:w-6",
                        children: [exhale, "s"]
                      })]
                    })]
                  })]
                }), u.jsx("div", {
                  className: "px-4 py-1.5 md:px-6 md:py-2 bg-white rounded-full border border-slate-100 shadow-sm",
                  children: u.jsxs("span", {
                    className: "text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest",
                    children: [t.duration, ": ", inhale + hold + exhale, "s"]
                  })
                })]
              }), u.jsx("div", {
                className: "flex flex-col items-center gap-12 w-full max-w-md mt-4",
                children: u.jsxs("div", {
                  className: "ff-breath-circle relative w-64 h-64 flex items-center justify-center",
                  children: [u.jsx(bt.div, {
                    className: `absolute inset-0 rounded-full transition-colors duration-500 ${breathPhase === "inhale" ? "bg-indigo-100/50" : breathPhase === "hold" ? "bg-amber-100/50" : breathPhase === "exhale" ? "bg-emerald-100/50" : "bg-slate-100/50"}`,
                    animate: {
                      scale: breathPhase === "inhale" || breathPhase === "hold" ? 1.3 : 1,
                      opacity: breathPhase === "idle" ? .2 : .5
                    },
                    transition: {
                      duration: breathPhase === "inhale" ? inhale : breathPhase === "exhale" ? exhale : .5
                    }
                  }), u.jsx(bt.div, {
                    className: `w-48 h-48 rounded-full flex items-center justify-center text-white shadow-2xl z-10 transition-colors duration-500 ${breathPhase === "inhale" ? "bg-indigo-600" : breathPhase === "hold" ? "bg-amber-600" : breathPhase === "exhale" ? "bg-emerald-600" : "bg-slate-400"}`,
                    animate: {
                      scale: breathPhase === "inhale" || breathPhase === "hold" ? 1.15 : 1
                    },
                    transition: {
                      duration: breathPhase === "inhale" ? inhale : breathPhase === "exhale" ? exhale : .5
                    },
                    children: u.jsx("span", {
                      className: "text-2xl font-black uppercase tracking-widest",
                      children: breathPhase === "inhale" ? t.inhale : breathPhase === "hold" ? t.hold : breathPhase === "exhale" ? t.exhale : t.play
                    })
                  }), u.jsxs("svg", {
                    className: "absolute inset-0 w-full h-full -rotate-90",
                    children: [u.jsx("circle", {
                      cx: "128",
                      cy: "128",
                      r: "120",
                      fill: "none",
                      stroke: "#f3f4f6",
                      strokeWidth: "8"
                    }), u.jsx(bt.circle, {
                      cx: "128",
                      cy: "128",
                      r: "120",
                      fill: "none",
                      stroke: breathPhase === "inhale" ? "#4f46e5" : breathPhase === "hold" ? "#f59e0b" : breathPhase === "exhale" ? "#10b981" : "#475569",
                      strokeWidth: "8",
                      strokeDasharray: "754",
                      animate: {
                        strokeDashoffset: 754 - 754 * breathProgress / 100
                      },
                      transition: {
                        duration: .1
                      }
                    })]
                  })]
                })
              })]
            })]
          })]
        }, "breathing-practice")]
      })
    }), u.jsx(StrategyDialog, {
      isOpen: showInfo,
      onClose: () => setShowInfo(!1),
      info: screen === "easy-onset-practice" ? t.easyOnsetInfo : screen === "light-contact-practice" ? t.lightContactInfo : screen === "slower-rate-practice" ? t.slowerRateInfo : screen === "cancellation-practice" ? t.cancellationInfo : screen === "pull-out-practice" ? t.pullOutInfo : screen === "prep-set-practice" ? t.prepSetInfo : screen === "breathing-practice" ? t.breathingInfo : t.slowerRateInfo,
      lang: lang
    }), u.jsx(AboutDialog, {
      isOpen: showAbout,
      onClose: () => setShowAbout(!1),
      info: t.appInfo,
      lang: lang
    }), u.jsx(Xa, {
      children: showLetters && u.jsxs(Dialog, {
        onClose: () => setShowLetters(false), label: t.chooseLetter,
        className: "fixed inset-0 z-50 flex items-center justify-center p-4",
        children: [u.jsx(bt.div, {
          initial: {
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          exit: {
            opacity: 0
          },
          onClick: () => setShowLetters(!1),
              "aria-label": t.close,
          className: "absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        }), u.jsxs(bt.div, {
          initial: {
            opacity: 0,
            scale: .9,
            y: 20
          },
          animate: {
            opacity: 1,
            scale: 1,
            y: 0
          },
          exit: {
            opacity: 0,
            scale: .9,
            y: 20
          },
          className: "relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200",
          children: [u.jsxs("div", {
            className: "p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50",
            children: [u.jsx("h2", {
              className: `text-xl md:text-2xl font-black text-indigo-900 ${isArabic ? "font-arabic" : ""}`,
              children: t.chooseLetter
            }), u.jsx("button", {
              onClick: () => setShowLetters(!1),
              "aria-label": t.close,
              className: "p-2 rounded-xl hover:bg-white transition-colors",
              children: u.jsx(pd, {
                className: "w-6 h-6 text-indigo-400"
              })
            })]
          }), u.jsx("div", {
            className: "p-4 md:p-8 overflow-y-auto max-h-[70vh]",
            children: u.jsx("div", {
              className: "grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-3",
              children: Object.keys(t.practiceData.letterWords).map(O => u.jsx("button", {
                onClick: () => {
                  setLetter(O), setCategory("practice"), setPageIndex(0), resetPractice(), setShowLetters(!1);
                },
                className: "aspect-square flex items-center justify-center text-2xl md:text-3xl font-black rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95",
                children: O
              }, O))
            })
          })]
        })]
      })
    }), screen.endsWith('-practice') && u.jsxs('section', {
      className: 'ff-status', 'aria-label': t.sessionStatus,
      children: [u.jsx('p', { role: 'status', children: playing ? `${t.running} ${phaseLabel}` : completed ? t.finished : elapsedRef.current > 0 ? t.paused : t.ready }),
        screen === 'easy-onset-practice' && u.jsxs(u.Fragment, { children: [
          u.jsx('p', { children: t.recordingHint }),
          recordingUrl && u.jsx('audio', { controls: true, src: recordingUrl, preload: 'metadata', 'aria-label': t.playRecording }),
        ] })]
    }), u.jsx(PwaPanel, { lang, home: screen === 'home', busy: playing || recording || recordingPending }), u.jsx("footer", {
      className: "mt-auto py-8 px-6 text-center border-t border-slate-100 bg-slate-50/50",
      children: u.jsxs("div", {
        className: "max-w-md mx-auto space-y-1",
        children: [u.jsx("p", {
          className: "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]",
          children: "Speech and Language Pathology"
        }), u.jsx("p", {
          className: "text-sm font-bold text-slate-700",
          children: "Ahmad Ghanem"
        }), u.jsx("p", {
          className: "text-xs text-emerald-600 font-medium",
          children: "slp.ahmadghanem@gmail.com"
        })]
      })
    })]
  });
}
yb.createRoot(document.getElementById("root")).render(u.jsx(Y.StrictMode, {
  children: u.jsx(App, {})
}));
