// ------- DATA (Parts 1 & 2 combined) -------
// Insert your full DATA object here (Parts 1 & 2 combined exactly as provided)
// For brevity, I'll represent it as a placeholder here:
const DATA = {
  en: {
    meta: {
      // ... your English meta properties ...
      "form-title": "Vocabulary Survey",
      "basic-info-header": "Basic Information",
      "label-child-name": "Child’s Name:",
      "label-parent-name": "Parent’s Name:",
      "label-child-dob": "Date of Birth (DOB):",
      "label-survey-date": "Date of Survey Completion:",
      "instructions-header": "Instructions",
      "instructions-text-short": "Please check each word that your child says spontaneously (without imitation). Do not include words that your child only understands. Count words even if they are mispronounced, as long as they are recognizable.",
      "instructions-text-full": [
        "This survey helps track your child's language development. Your honest responses are crucial.",
        "Spontaneous means the child says the word on their own, not just repeating what they heard.",
        "If the child uses a word in a different context (e.g., 'moo' for cow), it still counts."
      ],
      "show-more-instructions-button": "Show More Instructions",
      "hide-more-instructions-button": "Hide Instructions",
      "findings-summary-header": "Findings Summary & Automatic Scoring",
      "findings-summary-text": "Based on your selections, your child’s vocabulary size is approximately [total-words-checked] words, and the mean phrase length is about [mean-phrase-length]. Normative data for 24 months indicates a vocabulary mean of approximately [vocab-mean] ± [vocab-sd] words.",
      "suggestion-low-vocab": "Consider consulting a speech and language therapist if concerns persist.",
      "suggestion-average-vocab": "Your child's vocabulary appears to be within the expected range.",
      "suggestion-high-vocab": "Your child shows strong vocabulary development. Keep encouraging language use!",
      "suggestion-mpl-generic": "Mean phrase length assessment typically requires more detailed language samples.",
      "checked-words-header": "Words Checked",
      "total-words-checked-label": "Total Words Checked",
      "no-words-checked-in-category": "No words checked in this category.",
      "search-placeholder": "Search for a word...",
      "export-text": "Export as .txt"
    },
    norms: {
      vocabularyMean: 323,
      vocabularySD: 177.9,
      mplMean: 4.46,
      mplSD: 2.25
    },
     checklist: {
      "Animals & Animal Sounds": [
        { en: "Dog", ar: "كلب" }, { en: "Cat", ar: "قط" }, { en: "Duck", ar: "بطة" },
        { en: "Cow", ar: "بقرة" }, { en: "Meow", ar: "مياو" }, { en: "Moo", ar: "موو" },
        { en: "Bear", ar: "دب" }, { en: "Bee", ar: "نحلة" }, { en: "Bird", ar: "طائر" },
        { en: "Bunny/Rabbit", ar: "أرنب" }, { en: "Butterfly", ar: "فراشة" }, { en: "Chicken", ar: "دجاجة" },
        { en: "Lamb", ar: "خروف" }, { en: "Lion", ar: "أسد" }, { en: "Monkey", ar: "قرد" },
        { en: "Mouse", ar: "فأر" }, { en: "Owl", ar: "بومة" }, { en: "Penguin", ar: "بطريق" },
        { en: "Pig", ar: "خنزير" }, { en: "Horse", ar: "حصان" }, { en: "Kitten", ar: "هريرة" },
        { en: "Deer", ar: "غزال" }, { en: "Donkey", ar: "حمار" }, { en: "Elephant", ar: "فيل" },
        { en: "Fish", ar: "سمك" }, { en: "Frog", ar: "ضفدع" }, { en: "Giraffe", ar: "زرافة" },
        { en: "Goose", ar: "إوزة" }, { en: "Squirrel", ar: "سنجاب" }, { en: "Tiger", ar: "نمر" },
        { en: "Turkey", ar: "ديك رومي" }, { en: "Turtle", ar: "سلحفاة" }
      ],
      "Vehicles": [
        { en: "Aeroplane / Plane", ar: "طائرة" }, { en: "Bicycle / Bike", ar: "دراجة" },
        { en: "Boat", ar: "قارب" }, { en: "Truck / Lorry", ar: "شاحنة" },
        { en: "Motorbike", ar: "دراجة نارية" }, { en: "Bus", ar: "حافلة" },
        { en: "Car", ar: "سيارة" }, { en: "Fire Engine", ar: "سيارة إطفاء" },
        { en: "Train", ar: "قطار" }
      ],
      "Toys": [
        { en: "Ball", ar: "كرة" }, { en: "Balloon", ar: "بالون" },
        { en: "Block / Brick", ar: "مكعب / طوبة" }, { en: "Doll", ar: "عروسة" },
        { en: "Teddy Bear", ar: "دبدوبة" }, { en: "Toy", ar: "لعبة" },
        { en: "Book", ar: "كتاب" }, { en: "Bubble", ar: "فقاعة" }
      ],
      "Food & Drink": [
        { en: "Apple", ar: "تفاحة" }, { en: "Banana", ar: "موز" },
        { en: "Biscuit", ar: "بسكويت" }, { en: "Bread", ar: "خبز" },
        { en: "Butter", ar: "زبدة" }, { en: "Cake", ar: "كعكة" },
        { en: "Cereal", ar: "حبوب" }, { en: "Cheese", ar: "جبن" },
        { en: "Chicken", ar: "دجاج" }, { en: "Chips", ar: "رقائق البطاطا" },
        { en: "Coffee", ar: "قهوة" }, { en: "Drink", ar: "مشروب" },
        { en: "Egg", ar: "بيضة" }, { en: "Fish", ar: "سمك" },
        { en: "Lemon", ar: "ليمون" }, { en: "Lollipop", ar: "مصاصة" },
        { en: "Marshmallow", ar: "مارشميلو" }, { en: "Melon", ar: "شمام" },
        { en: "Pear", ar: "كمثرى" }, { en: "Porridge", ar: "عصيدة" },
        { en: "Raisins", ar: "زبيب" }, { en: "Sandwich", ar: "ساندويتش" },
        { en: "Strawberry", ar: "فراولة" }, { en: "Tomato", ar: "طماطم" }
      ],
      "Body Parts": [
        { en: "Arm", ar: "ذراع" }, { en: "Belly Button", ar: "سُرّة" },
        { en: "Ear", ar: "أذن" }, { en: "Eye", ar: "عين" },
        { en: "Face", ar: "وجه" }, { en: "Finger", ar: "إصبع" },
        { en: "Foot", ar: "قدم" }, { en: "Tongue", ar: "لسان" },
        { en: "Tooth", ar: "سن" }
      ],
      "Clothes - Group 1": [
        { en: "Bib", ar: "مريلة" }, { en: "Boots", ar: "حذاء" },
        { en: "Button", ar: "زر" }, { en: "Coat", ar: "معطف" }
      ],
      "Clothes - Group 2": [
        { en: "Dress", ar: "فستان" }, { en: "Glasses / Specs", ar: "نظارة" },
        { en: "Hat", ar: "قبعة" }, { en: "Jacket", ar: "سترة" },
        { en: "Jeans", ar: "جينز" }, { en: "Jumper / Sweater", ar: "كنزة" },
        { en: "Nappy", ar: "حفاضة" }, { en: "Necklace", ar: "قلادة" },
        { en: "Pyjamas", ar: "بيجاما" }, { en: "Shirt", ar: "قميص" }
      ],
      "Furniture - Group 1": [
        { en: "Bath / Bathtub", ar: "حوض استحمام" }, { en: "Bathroom", ar: "حمام" },
        { en: "Bed", ar: "سرير" }, { en: "Bedroom", ar: "غرفة نوم" },
        { en: "Chair", ar: "كرسي" }, { en: "Cooker / Stove / Oven", ar: "موقد / فرن" },
        { en: "Shoe", ar: "حذاء" }, { en: "Shorts", ar: "شورت" },
        { en: "Sock", ar: "جورب" }, { en: "Trousers", ar: "بنطلون" },
        { en: "Zip", ar: "سحاب" }, { en: "Living Room", ar: "غرفة المعيشة" },
        { en: "Play Pen", ar: "مهد لعب" }, { en: "Potty", ar: "مرحاض صغير" },
        { en: "Refrigerator / Fridge", ar: "ثلاجة" }, { en: "Rocking Chair", ar: "كرسي هزاز" },
        { en: "Settee / Sofa", ar: "أريكة" }, { en: "Cot", ar: "سرير أطفال" },
        { en: "Sink", ar: "حوض" }, { en: "Door", ar: "باب" },
        { en: "Drawer", ar: "درج" }, { en: "Garage", ar: "مرآب" },
        { en: "High Chair", ar: "كرسي عالي للأطفال" }, { en: "Kitchen", ar: "مطبخ" }
      ],
      "Household Items - Group 2": [
        { en: "Bin", ar: "سلة مهملات" }, { en: "Blanket", ar: "بطانية" },
        { en: "Bottle", ar: "زجاجة" }, { en: "Box", ar: "صندوق" },
        { en: "Broom", ar: "مكنسة" }, { en: "Brush", ar: "فرشاة" },
        { en: "Clock", ar: "ساعة" }, { en: "Comb", ar: "مشط" },
        { en: "Cup", ar: "كوب" }, { en: "Dish", ar: "طبق" },
        { en: "Dummy", ar: "لهاية" }, { en: "Fork", ar: "شوكة" },
        { en: "Glass", ar: "كأس" }, { en: "Hammer", ar: "مطرقة" },
        { en: "Hoover / Vacuum", ar: "مكنسة كهربائية" }, { en: "Paper", ar: "ورق" },
        { en: "Penny", ar: "قرش" }, { en: "Picture", ar: "صورة" },
        { en: "Pillow", ar: "وسادة" }, { en: "Plant", ar: "نبتة" },
        { en: "Plate", ar: "صحن" }, { en: "Purse", ar: "حقيبة يد" },
        { en: "Radio", ar: "راديو" }, { en: "Rubbish", ar: "قمامة" },
        { en: "Scissors", ar: "مقص" }
      ],
      "Household Items - Group 3": [
        { en: "Jug", ar: "إبريق" }, { en: "Key", ar: "مفتاح" },
        { en: "Lamp", ar: "مصباح" }, { en: "Light", ar: "ضوء" },
        { en: "Medicine", ar: "دواء" }, { en: "Money", ar: "مال" },
        { en: "Mug", ar: "فنجان" }
      ],
      "People": [
        { en: "Aunt", ar: "عمة" }, { en: "Baby", ar: "طفل" },
        { en: "Boy", ar: "ولد" }, { en: "Brother", ar: "أخ" },
        { en: "Child", ar: "طفل" }, { en: "Daddy", ar: "أبي" },
        { en: "Doctor", ar: "طبيب" }, { en: "Friend", ar: "صديق" },
        { en: "Person", ar: "شخص" }, { en: "Policeman", ar: "شرطي" },
        { en: "Sister", ar: "أخت" }, { en: "Girl", ar: "فتاة" },
        { en: "Grandma", ar: "جدة" }, { en: "Grandpa", ar: "جد" },
        { en: "Lady", ar: "سيدة" }, { en: "Man", ar: "رجل" },
        { en: "Mummy", ar: "أم" }, { en: "Nanny", ar: "مربية" },
        { en: "People", ar: "أناس" }, { en: "Teacher", ar: "معلم" },
        { en: "Uncle", ar: "عم" }
      ],
      "Games & Routines": [
        { en: "Bath", ar: "حمام / استحمام" }, { en: "Breakfast", ar: "فطور" },
        { en: "Bye bye", ar: "وداعاً" }, { en: "Dinner", ar: "عشاء" },
        { en: "Don't", ar: "لا" }, { en: "Hello", ar: "مرحباً" },
        { en: "Hi", ar: "أهلاً" }, { en: "Soap", ar: "صابون" },
        { en: "Spoon", ar: "ملعقة" }, { en: "Telephone", ar: "هاتف" },
        { en: "Toothbrush", ar: "فرشاة أسنان" }, { en: "Towel", ar: "منشفة" },
        { en: "Watch", ar: "ساعة" }, { en: "No", ar: "لا" },
        { en: "Pat-a-cake", ar: "لعبة التصفيق" }, { en: "Peekaboo", ar: "بيكابو" },
        { en: "Please", ar: "من فضلك" }, { en: "Shh / Hush", ar: "اسكت / هادئ" },
        { en: "Tea", ar: "شاي" }, { en: "Thank you", ar: "شكراً" },
        { en: "Lunch", ar: "غداء" }, { en: "Nap", ar: "قيلولة" },
        { en: "Night night", ar: "تصبح على خير / ليلة سعيدة" }, { en: "Wait", ar: "انتظر" },
        { en: "Want to", ar: "أريد أن" }, { en: "Yes", ar: "نعم" }
      ],
      "Action Words": [
        { en: "Bite", ar: "يعض" }, { en: "Blow", ar: "ينفخ" },
        { en: "Break", ar: "يكسر" }, { en: "Bring", ar: "يجلب" },
        { en: "Bump", ar: "يصطدم" }, { en: "Call", ar: "ينادي" },
        { en: "Carry", ar: "يحمل" }, { en: "Catch", ar: "يمسك" },
        { en: "Clean", ar: "ينظف" }, { en: "Cry", ar: "يبكي" },
        { en: "Cuddle", ar: "يعانق" }, { en: "Cut", ar: "يقطع" },
        { en: "Dance", ar: "يرقص" }, { en: "Eat", ar: "يأكل" },
        { en: "Fall", ar: "يسقط" }, { en: "Find", ar: "يجد" },
        { en: "Finish", ar: "ينهي" }, { en: "Get", ar: "يحصل" },
        { en: "Give", ar: "يعطي" }, { en: "Go", ar: "يذهب" },
        { en: "Have", ar: "يملك" }, { en: "Hear", ar: "يسمع" },
        { en: "Help", ar: "يساعد" }, { en: "Hit", ar: "يضرب" },
        { en: "Hug", ar: "يعانق" }, { en: "Hurry", ar: "يستعجل" },
        { en: "Jump", ar: "يقفز" }, { en: "Kick", ar: "يركل" },
        { en: "Kiss", ar: "يقبّل" }, { en: "Look", ar: "ينظر" },
        { en: "Love", ar: "يحب" }, { en: "Make", ar: "يصنع" },
        { en: "Open", ar: "يفتح" }, { en: "Play", ar: "يلعب" },
        { en: "Pull", ar: "يشد" }, { en: "Push", ar: "يدفع" },
        { en: "Put", ar: "يضع" }, { en: "Read", ar: "يقرأ" },
        { en: "Ride", ar: "يركب" }, { en: "Run", ar: "يجري" },
        { en: "Say", ar: "يقول" }, { en: "Scratch", ar: "يخدش" },
        { en: "See", ar: "يري" }, { en: "Show", ar: "يظهر" },
        { en: "Shut/Close", ar: "يغلق" }, { en: "Sing", ar: "يغني" },
        { en: "Sleep", ar: "ينام" }, { en: "Smile", ar: "يبتسم" },
        { en: "Splash", ar: "يرش" }, { en: "Stop", ar: "يتوقف" },
        { en: "Swim", ar: "يسبح" }, { en: "Swing", ar: "يتأرجح" },
        { en: "Take", ar: "يأخذ" }, { en: "Tell", ar: "يخبر" },
        { en: "Throw", ar: "يرمي" }, { en: "Tickle", ar: "يدغدغ" },
        { en: "Walk", ar: "يمشي" }, { en: "Draw", ar: "يرسم" },
        { en: "Drink", ar: "يشرب" }, { en: "Drive", ar: "يقود" },
        { en: "Drop", ar: "يسقط" }, { en: "Wash", ar: "يغسل" },
        { en: "Watch", ar: "يشاهد" }, { en: "Wipe", ar: "يمسح" },
        { en: "Write", ar: "يكتب" }
      ],
      "Descriptive Words - Group 1": [
        { en: "All gone", ar: "اختفى" }, { en: "Asleep", ar: "نائم" },
        { en: "Bad", ar: "سيئ" }, { en: "Big", ar: "كبير" },
        { en: "Blue", ar: "أزرق" }, { en: "Broken", ar: "مكسور" },
        { en: "Careful", ar: "حذر" }, { en: "Dark", ar: "مظلم" },
        { en: "Dirty", ar: "متسخ" }, { en: "Dry", ar: "جاف" },
        { en: "Empty", ar: "فارغ" }, { en: "Fast", ar: "سريع" },
        { en: "Clean", ar: "نظيف" }, { en: "Cold", ar: "بارد" }
      ],
      "Descriptive Words - Group 2": [
        { en: "Fine", ar: "جيد" }, { en: "Gentle", ar: "لطيف" },
        { en: "Good", ar: "جيد" }, { en: "Green", ar: "أخضر" },
        { en: "Happy", ar: "سعيد" }, { en: "Hard", ar: "قاسي" },
        { en: "Hot", ar: "حار" }, { en: "Hungry", ar: "جائع" },
        { en: "Hurt", ar: "مجروح" }, { en: "Little", ar: "صغير" },
        { en: "Nasty", ar: "مقرف" }, { en: "Naughty", ar: "شقي" },
        { en: "Nice", ar: "لطيف" }, { en: "Old", ar: "قديم" },
        { en: "Pretty", ar: "جميل" }, { en: "Red", ar: "أحمر" },
        { en: "Sad", ar: "حزين" }, { en: "Scared", ar: "خائف" },
        { en: "Sick", ar: "مريض" }, { en: "Sleepy", ar: "نعسان" },
        { en: "Soft", ar: "ناعم" }, { en: "Thirsty", ar: "عطشان" },
        { en: "Tired", ar: "متعب" }, { en: "Wet", ar: "مبلل" },
        { en: "Yellow", ar: "أصفر" }
      ],
      "Question Words": [
        { en: "How", ar: "كيف" }, { en: "What", ar: "ماذا" },
        { en: "When", ar: "متى" }, { en: "Who", ar: "من" },
        { en: "Why", ar: "لماذا" }, { en: "Where", ar: "أين" }
      ],
      "Time": [
        { en: "Day", ar: "يوم" }, { en: "Later", ar: "لاحقاً" },
        { en: "Morning", ar: "صباح" }, { en: "Night", ar: "ليلة" },
        { en: "Now", ar: "الآن" }, { en: "Today", ar: "اليوم" },
        { en: "Tomorrow", ar: "غدًا" }, { en: "Tonight", ar: "الليلة" }
      ],
      "Pronouns": [
        { en: "Her", ar: "لها" }, { en: "His", ar: "له" },
        { en: "I", ar: "أنا" }, { en: "It", ar: "هو/هي" },
        { en: "Me", ar: "إياي" }, { en: "Mine", ar: "ملكي" },
        { en: "My", ar: "لي" }, { en: "That", ar: "ذالك" },
        { en: "This", ar: "هذا" }, { en: "You", ar: "أنت" },
        { en: "Your", ar: "لك" }
      ],
      "Prepositions": [
        { en: "Away", ar: "بعيد" }, { en: "Back", ar: "خلف" },
        { en: "Down", ar: "أسفل" }, { en: "In", ar: "في" },
        { en: "Inside", ar: "داخل" }, { en: "Off", ar: "عن" },
        { en: "On", ar: "على" }, { en: "Out", ar: "خارج" },
        { en: "There", ar: "هناك" }, { en: "Under", ar: "تحت" },
        { en: "Up", ar: "فوق" }
      ],
      "Quantifiers": [
        { en: "All", ar: "كل" }, { en: "Again", ar: "مرة أخرى" },
        { en: "Another", ar: "آخر" }, { en: "More", ar: "أكثر" },
        { en: "None", ar: "لا شيء" }, { en: "Other", ar: "آخر" },
        { en: "Same", ar: "نفسه" }, { en: "Some", ar: "بعض" }
      ],
      "Extra Words": [
        { en: "Chase", ar: "يطارد" }, { en: "Smell", ar: "يشم" },
        { en: "Ant", ar: "نملة" }, { en: "Camel", ar: "جمل" },
        { en: "Caterpillar", ar: "يرقة" }, { en: "Crab", ar: "سلطعون" },
        { en: "Dolphin", ar: "دولفين" }, { en: "Koala", ar: "كوالا" },
        { en: "Lizard", ar: "سحلية" }, { en: "Octopus", ar: "أخطبوط" },
        { en: "Ambulance", ar: "سيارة إسعاف" }, { en: "Crane", ar: "رافعة" },
        { en: "Digger", ar: "حفارة" }, { en: "Beans", ar: "فول" },
        { en: "Blackberry", ar: "توت أسود" }, { en: "Blueberry", ar: "توت أزرق" },
        { en: "Cherry", ar: "كرز" }, { en: "Chocolate", ar: "شوكولاتة" },
        { en: "Cookie", ar: "بسكويت" }, { en: "Cracker", ar: "مقرمشات" },
        { en: "Cucumber", ar: "خيار" }, { en: "Grape", ar: "عنب" },
        { en: "Green Beans", ar: "فاصوليا خضراء" }, { en: "Haribo", ar: "اهاريبو" },
        { en: "Panda", ar: "باندا" }, { en: "Rabbit", ar: "أرنب" },
        { en: "Seal", ar: "فقمة" }, { en: "Snail", ar: "حلزون" },
        { en: "Swan", ar: "بجعة" }, { en: "Worm", ar: "دودة" },
        { en: "Zebra", ar: "حمار الوحش" }, { en: "Helicopter", ar: "مروحية" },
        { en: "Rocket", ar: "صاروخ" }, { en: "Tractor", ar: "جرار" },
        { en: "Belt", ar: "حزام" }, { en: "Ribbon", ar: "شريط" },
        { en: "Curtains", ar: "ستائر" }, { en: "Dryer", ar: "مجفف" },
        { en: "Microwave", ar: "ميكروويف" }, { en: "Backpack", ar: "حقيبة ظهر" },
        { en: "Bag", ar: "حقيبة" }, { en: "Camera", ar: "كاميرا" },
        { en: "CD", ar: "سي دي" }, { en: "Computer", ar: "كمبيوتر" },
        { en: "Cushion", ar: "مخدة" }, { en: "DVD", ar: "دي في دي" },
        { en: "Handbag", ar: "حقيبة يد" }, { en: "Hanger", ar: "علاقة" },
        { en: "Headphones", ar: "سماعات" }, { en: "Iron", ar: "مكواة" },
        { en: "Keyboard", ar: "لوحة مفاتيح" }, { en: "Laptop", ar: "لابتوب" },
        { en: "Mouse", ar: "فأرة" }, { en: "Acorn", ar: "بلوط" },
        { en: "Dirt", ar: "تراب" }, { en: "Grass", ar: "عشب" },
        { en: "Farm", ar: "مزرعة" }, { en: "Flag", ar: "علم" },
        { en: "Footpath", ar: "ممشى" }, { en: "Leaf", ar: "ورقة شجرة" },
        { en: "Mud", ar: "طين" }, { en: "Pebble", ar: "حصاة" },
        { en: "Puddle", ar: "بركة ماء" }, { en: "Alien", ar: "كائن فضائي" },
        { en: "Astronaut", ar: "رائد فضاء" }, { en: "Clown", ar: "مهرج" },
        { en: "Tie", ar: "ربطة" }, { en: "Ghost", ar: "شبح" },
        { en: "Monster", ar: "وحش" }, { en: "Antler", ar: "قرن" },
        { en: "Feather", ar: "ريشة" }, { en: "Feet", ar: "أقدام" },
        { en: "Fin", ar: "زعفة" }, { en: "Flipper", ar: "زعفة" },
        { en: "Fur", ar: "فرو" }, { en: "Horn", ar: "قرن" },
        { en: "Paw", ar: "مخلب" }, { en: "Bonnet", ar: "غطاء السيارة" },
        { en: "Boot", ar: "صندوق السيارة" }, { en: "Handle", ar: "مقبض" },
        { en: "E-mail", ar: "البريد الإلكتروني" }, { en: "Facebook", ar: "فيسبوك" },
        { en: "Google", ar: "جوجل" }, { en: "Internet", ar: "الإنترنت" },
        { en: "Online", ar: "عبر الإنترنت" }, { en: "Skype", ar: "سكايب" },
        { en: "Youtube", ar: "يوتيوب" }, { en: "Scales", ar: "قشور" },
        { en: "Shell", ar: "صدف" }, { en: "Snout", ar: "خشم" },
        { en: "Skin", ar: "جلد" }, { en: "Spots", ar: "بقع" },
        { en: "Stripes", ar: "خطوط" }, { en: "Wings", ar: "أجنحة" },
        { en: "Switch", ar: "مفتاح التشغيل" }, { en: "Wheel", ar: "عجلة" },
        { en: "Pirate", ar: "قرصان" }, { en: "Robot", ar: "روبوت" }
      ]
    }
  },

  ar: {
    meta: {
      "form-title": "مسح تطور اللغة",
      "basic-info-header": "المعلومات الأساسية",
      "label-child-name": "اسم الطفل:",
      "label-parent-name": "اسم الوالد:",
      "label-child-dob": "تاريخ الميلاد:",
      "label-survey-date": "تاريخ إكمال المسح:",
      "instructions-header": "التعليمات",
      "instructions-text-short": "يرجى تحديد كل كلمة يقولها طفلك بشكل عفوي (بدون تقليد). لا تُدرج الكلمات التي يفهمها طفلك فقط. احتسب الكلمات حتى لو كانت منطوقة بشكل غير صحيح، طالما أنها يمكن التعرف عليها.",
      "instructions-text-full": [
        "يساعد هذا المسح في تتبع تطور لغة طفلك. إجاباتك الصادقة حاسمة.",
        "عفوي يعني أن الطفل يقول الكلمة من تلقاء نفسه، وليس فقط ترديد ما سمعه.",
        "إذا استخدم الطفل كلمة في سياق مختلف (مثل 'موو' للبقرة)، فإنها لا تزال تُحتسب."
      ],
      "show-more-instructions-button": "عرض المزيد من التعليمات",
      "hide-more-instructions-button": "إخفاء التعليمات",
      "findings-summary-header": "ملخص النتائج والتسجيل التلقائي",
      "findings-summary-text": "بناءً على اختياراتك، يبلغ حجم مفردات طفلك حوالي [total-words-checked] كلمة، ويبلغ متوسط طول الجملة حوالي [mean-phrase-length]. تشير البيانات المعيارية لعمر 24 شهرًا إلى متوسط مفردات يبلغ حوالي [vocab-mean] ± [vocab-sd] كلمة.",
      "suggestion-low-vocab": "فكر في استشارة أخصائي نطق ولغة إذا استمرت المخاوف.",
      "suggestion-average-vocab": "تبدو مفردات طفلك ضمن النطاق المتوقع.",
      "suggestion-high-vocab": "يُظهر طفلك تطورًا قويًا في المفردات. استمر في تشجيع استخدام اللغة!",
      "suggestion-mpl-generic": "يتطلب تقييم متوسط طول الجملة عادةً عينات لغوية أكثر تفصيلاً.",
      "checked-words-header": "الكلمات التي تم تحديدها",
      "total-words-checked-label": "إجمالي الكلمات المحددة",
      "no-words-checked-in-category": "لا توجد كلمات محددة في هذه الفئة.",
      "search-placeholder": "ابحث عن كلمة...",
      "export-text": "تصدير كـ .txt"
    },
    norms: {
      vocabularyMean: 290,
      vocabularySD: 160,
      mplMean: 4.20,
      mplSD: 2.10
    },
    checklist: {
      "حيوانات وأصوات حيوانات": [
        { en: "Dog", ar: "كلب" }, { en: "Cat", ar: "قط" }, { en: "Duck", ar: "بطة" },
        { en: "Cow", ar: "بقرة" }, { en: "Meow", ar: "مياو" }, { en: "Moo", ar: "موو" },
        { en: "Bear", ar: "دب" }, { en: "Bee", ar: "نحلة" }, { en: "Bird", ar: "طائر" },
        { en: "Bunny/Rabbit", ar: "أرنب" }, { en: "Butterfly", ar: "فراشة" }, { en: "Chicken", ar: "دجاجة" },
        { en: "Lamb", ar: "خروف" }, { en: "Lion", ar: "أسد" }, { en: "Monkey", ar: "قرد" },
        { en: "Mouse", ar: "فأر" }, { en: "Owl", ar: "بومة" }, { en: "Penguin", ar: "بطريق" },
        { en: "Pig", ar: "خنزير" }, { en: "Horse", ar: "حصان" }, { en: "Kitten", ar: "هريرة" },
        { en: "Deer", ar: "غزال" }, { en: "Donkey", ar: "حمار" }, { en: "Elephant", ar: "فيل" },
        { en: "Fish", ar: "سمك" }, { en: "Frog", ar: "ضفدع" }, { en: "Giraffe", ar: "زرافة" },
        { en: "Goose", ar: "إوزة" }, { en: "Squirrel", ar: "سنجاب" }, { en: "Tiger", ar: "نمر" },
        { en: "Turkey", ar: "ديك رومي" }, { en: "Turtle", ar: "سلحفاة" }
      ],
      "مركبات": [
        { en: "Aeroplane / Plane", ar: "طائرة" }, { en: "Bicycle / Bike", ar: "دراجة" },
        { en: "Boat", ar: "قارب" }, { en: "Truck / Lorry", ar: "شاحنة" },
        { en: "Motorbike", ar: "دراجة نارية" }, { en: "Bus", ar: "حافلة" },
        { en: "Car", ar: "سيارة" }, { en: "Fire Engine", ar: "سيارة إطفاء" },
        { en: "Train", ar: "قطار" }
      ],
      "ألعاب": [
        { en: "Ball", ar: "كرة" }, { en: "Balloon", ar: "بالون" },
        { en: "Block / Brick", ar: "مكعب / طوبة" }, { en: "Doll", ar: "عروسة" },
        { en: "Teddy Bear", ar: "دبدوبة" }, { en: "Toy", ar: "لعبة" },
        { en: "Book", ar: "كتاب" }, { en: "Bubble", ar: "فقاعة" }
      ],
      "طعام وشراب": [
        { en: "Apple", ar: "تفاحة" }, { en: "Banana", ar: "موز" },
        { en: "Biscuit", ar: "بسكويت" }, { en: "Bread", ar: "خبز" },
        { en: "Butter", ar: "زبدة" }, { en: "Cake", ar: "كعكة" },
        { en: "Cereal", ar: "حبوب" }, { en: "Cheese", ar: "جبن" },
        { en: "Chicken", ar: "دجاج" }, { en: "Chips", ar: "رقائق البطاطا" },
        { en: "Coffee", ar: "قهوة" }, { en: "Drink", ar: "مشروب" },
        { en: "Egg", ar: "بيضة" }, { en: "Fish", ar: "سمك" },
        { en: "Lemon", ar: "ليمون" }, { en: "Lollipop", ar: "مصاصة" },
        { en: "Marshmallow", ar: "مارشميلو" }, { en: "Melon", ar: "شمام" },
        { en: "Pear", ar: "كمثرى" }, { en: "Porridge", ar: "عصيدة" },
        { en: "Raisins", ar: "زبيب" }, { en: "Sandwich", ar: "ساندويتش" },
        { en: "Strawberry", ar: "فراولة" }, { en: "Tomato", ar: "طماطم" }
      ],
      "أجزاء الجسم": [
        { en: "Arm", ar: "ذراع" }, { en: "Belly Button", ar: "سُرّة" },
        { en: "Ear", ar: "أذن" }, { en: "Eye", ar: "عين" },
        { en: "Face", ar: "وجه" }, { en: "Finger", ar: "إصبع" },
        { en: "Foot", ar: "قدم" }, { en: "Tongue", ar: "لسان" },
        { en: "Tooth", ar: "سن" }
      ],
      "ملابس - المجموعة 1": [
        { en: "Bib", ar: "مريلة" }, { en: "Boots", ar: "حذاء" },
        { en: "Button", ar: "زر" }, { en: "Coat", ar: "معطف" }
      ],
      "ملابس - المجموعة 2": [
        { en: "Dress", ar: "فستان" }, { en: "Glasses / Specs", ar: "نظارة" },
        { en: "Hat", ar: "قبعة" }, { en: "Jacket", ar: "سترة" },
        { en: "Jeans", ar: "جينز" }, { en: "Jumper / Sweater", ar: "كنزة" },
        { en: "Nappy", ar: "حفاضة" }, { en: "Necklace", ar: "قلادة" },
        { en: "Pyjamas", ar: "بيجاما" }, { en: "Shirt", ar: "قميص" }
      ],
      "أثاث - المجموعة 1": [
        { en: "Bath / Bathtub", ar: "حوض استحمام" }, { en: "Bathroom", ar: "حمام" },
        { en: "Bed", ar: "سرير" }, { en: "Bedroom", ar: "غرفة نوم" },
        { en: "Chair", ar: "كرسي" }, { en: "Cooker / Stove / Oven", ar: "موقد / فرن" },
        { en: "Shoe", ar: "حذاء" }, { en: "Shorts", ar: "شورت" },
        { en: "Sock", ar: "جورب" }, { en: "Trousers", ar: "بنطلون" },
        { en: "Zip", ar: "سحاب" }, { en: "Living Room", ar: "غرفة المعيشة" },
        { en: "Play Pen", ar: "مهد لعب" }, { en: "Potty", ar: "مرحاض صغير" },
        { en: "Refrigerator / Fridge", ar: "ثلاجة" }, { en: "Rocking Chair", ar: "كرسي هزاز" },
        { en: "Settee / Sofa", ar: "أريكة" }, { en: "Cot", ar: "سرير أطفال" },
        { en: "Sink", ar: "حوض" }, { en: "Door", ar: "باب" },
        { en: "Drawer", ar: "درج" }, { en: "Garage", ar: "مرآب" },
        { en: "High Chair", ar: "كرسي عالي للأطفال" }, { en: "Kitchen", ar: "مطبخ" }
      ],
      "الأدوات المنزلية - المجموعة 2": [
        { en: "Bin", ar: "سلة مهملات" }, { en: "Blanket", ar: "بطانية" },
        { en: "Bottle", ar: "زجاجة" }, { en: "Box", ar: "صندوق" },
        { en: "Broom", ar: "مكنسة" }, { en: "Brush", ar: "فرشاة" },
        { en: "Clock", ar: "ساعة" }, { en: "Comb", ar: "مشط" },
        { en: "Cup", ar: "كوب" }, { en: "Dish", ar: "طبق" },
        { en: "Dummy", ar: "لهاية" }, { en: "Fork", ar: "شوكة" },
        { en: "Glass", ar: "كأس" }, { en: "Hammer", ar: "مطرقة" },
        { en: "Hoover / Vacuum", ar: "مكنسة كهربائية" }, { en: "Paper", ar: "ورق" },
        { en: "Penny", ar: "قرش" }, { en: "Picture", ar: "صورة" },
        { en: "Pillow", ar: "وسادة" }, { en: "Plant", ar: "نبتة" },
        { en: "Plate", ar: "صحن" }, { en: "Purse", ar: "حقيبة يد" },
        { en: "Radio", ar: "راديو" }, { en: "Rubbish", ar: "قمامة" },
        { en: "Scissors", ar: "مقص" }
      ],
      "الأدوات المنزلية - المجموعة 3": [
        { en: "Jug", ar: "إبريق" }, { en: "Key", ar: "مفتاح" },
        { en: "Lamp", ar: "مصباح" }, { en: "Light", ar: "ضوء" },
        { en: "Medicine", ar: "دواء" }, { en: "Money", ar: "مال" },
        { en: "Mug", ar: "فنجان" }
      ],
      "أشخاص": [
        { en: "Aunt", ar: "عمة" }, { en: "Baby", ar: "طفل" },
        { en: "Boy", ar: "ولد" }, { en: "Brother", ar: "أخ" },
        { en: "Child", ar: "طفل" }, { en: "Daddy", ar: "أبي" },
        { en: "Doctor", ar: "طبيب" }, { en: "Friend", ar: "صديق" },
        { en: "Person", ar: "شخص" }, { en: "Policeman", ar: "شرطي" },
        { en: "Sister", ar: "أخت" }, { en: "Girl", ar: "فتاة" },
        { en: "Grandma", ar: "جدة" }, { en: "Grandpa", ar: "جد" },
        { en: "Lady", ar: "سيدة" }, { en: "Man", ar: "رجل" },
        { en: "Mummy", ar: "أم" }, { en: "Nanny", ar: "مربية" },
        { en: "People", ar: "أناس" }, { en: "Teacher", ar: "معلم" },
        { en: "Uncle", ar: "عم" }
      ],
      "ألعاب وروتينات": [
        { en: "Bath", ar: "حمام / استحمام" }, { en: "Breakfast", ar: "فطور" },
        { en: "Bye bye", ar: "وداعاً" }, { en: "Dinner", ar: "عشاء" },
        { en: "Don't", ar: "لا" }, { en: "Hello", ar: "مرحباً" },
        { en: "Hi", ar: "أهلاً" }, { en: "Soap", ar: "صابون" },
        { en: "Spoon", ar: "ملعقة" }, { en: "Telephone", ar: "هاتف" },
        { en: "Toothbrush", ar: "فرشاة أسنان" }, { en: "Towel", ar: "منشفة" },
        { en: "Watch", ar: "ساعة" }, { en: "No", ar: "لا" },
        { en: "Pat-a-cake", ar: "لعبة التصفيق" }, { en: "Peekaboo", ar: "بيكابو" },
        { en: "Please", ar: "من فضلك" }, { en: "Shh / Hush", ar: "اسكت / هادئ" },
        { en: "Tea", ar: "شاي" }, { en: "Thank you", ar: "شكراً" },
        { en: "Lunch", ar: "غداء" }, { en: "Nap", ar: "قيلولة" },
        { en: "Night night", ar: "تصبح على خير / ليلة سعيدة" }, { en: "Wait", ar: "انتظر" },
        { en: "Want to", ar: "أريد أن" }, { en: "Yes", ar: "نعم" }
      ],
      "أفعال": [
        { en: "Bite", ar: "يعض" }, { en: "Blow", ar: "ينفخ" },
        { en: "Break", ar: "يكسر" }, { en: "Bring", ar: "يجلب" },
        { en: "Bump", ar: "يصطدم" }, { en: "Call", ar: "ينادي" },
        { en: "Carry", ar: "يحمل" }, { en: "Catch", ar: "يمسك" },
        { en: "Clean", ar: "ينظف" }, { en: "Cry", ar: "يبكي" },
        { en: "Cuddle", ar: "يعانق" }, { en: "Cut", ar: "يقطع" },
        { en: "Dance", ar: "يرقص" }, { en: "Eat", ar: "يأكل" },
        { en: "Fall", ar: "يسقط" }, { en: "Find", ar: "يجد" },
        { en: "Finish", ar: "ينهي" }, { en: "Get", ar: "يحصل" },
        { en: "Give", ar: "يعطي" }, { en: "Go", ar: "يذهب" },
        { en: "Have", ar: "يملك" }, { en: "Hear", ar: "يسمع" },
        { en: "Help", ar: "يساعد" }, { en: "Hit", ar: "يضرب" },
        { en: "Hug", ar: "يعانق" }, { en: "Hurry", ar: "يستعجل" },
        { en: "Jump", ar: "يقفز" }, { en: "Kick", ar: "يركل" },
        { en: "Kiss", ar: "يقبّل" }, { en: "Look", ar: "ينظر" },
        { en: "Love", ar: "يحب" }, { en: "Make", ar: "يصنع" },
        { en: "Open", ar: "يفتح" }, { en: "Play", ar: "يلعب" },
        { en: "Pull", ar: "يشد" }, { en: "Push", ar: "يدفع" },
        { en: "Put", ar: "يضع" }, { en: "Read", ar: "يقرأ" },
        { en: "Ride", ar: "يركب" }, { en: "Run", ar: "يجري" },
        { en: "Say", ar: "يقول" }, { en: "Scratch", ar: "يخدش" },
        { en: "See", ar: "يري" }, { en: "Show", ar: "يظهر" },
        { en: "Shut/Close", ar: "يغلق" }, { en: "Sing", ar: "يغني" },
        { en: "Sleep", ar: "ينام" }, { en: "Smile", ar: "يبتسم" },
        { en: "Splash", ar: "يرش" }, { en: "Stop", ar: "يتوقف" },
        { en: "Swim", ar: "يسبح" }, { en: "Swing", ar: "يتأرجح" },
        { en: "Take", ar: "يأخذ" }, { en: "Tell", ar: "يخبر" },
        { en: "Throw", ar: "يرمي" }, { en: "Tickle", ar: "يدغدغ" },
        { en: "Walk", ar: "يمشي" }, { en: "Draw", ar: "يرسم" },
        { en: "Drink", ar: "يشرب" }, { en: "Drive", ar: "يقود" },
        { en: "Drop", ar: "يسقط" }, { en: "Wash", ar: "يغسل" },
        { en: "Watch", ar: "يشاهد" }, { en: "Wipe", ar: "يمسح" },
        { en: "Write", ar: "يكتب" }
      ],
      "كلمات وصفية - المجموعة 1": [
        { en: "All gone", ar: "اختفى" }, { en: "Asleep", ar: "نائم" },
        { en: "Bad", ar: "سيئ" }, { en: "Big", ar: "كبير" },
        { en: "Blue", ar: "أزرق" }, { en: "Broken", ar: "مكسور" },
        { en: "Careful", ar: "حذر" }, { en: "Dark", ar: "مظلم" },
        { en: "Dirty", ar: "متسخ" }, { en: "Dry", ar: "جاف" },
        { en: "Empty", ar: "فارغ" }, { en: "Fast", ar: "سريع" },
        { en: "Clean", ar: "نظيف" }, { en: "Cold", ar: "بارد" }
      ],
      "كلمات وصفية - المجموعة 2": [
        { en: "Fine", ar: "جيد" }, { en: "Gentle", ar: "لطيف" },
        { en: "Good", ar: "جيد" }, { en: "Green", ar: "أخضر" },
        { en: "Happy", ar: "سعيد" }, { en: "Hard", ar: "قاسي" },
        { en: "Hot", ar: "حار" }, { en: "Hungry", ar: "جائع" },
        { en: "Hurt", ar: "مجروح" }, { en: "Little", ar: "صغير" },
        { en: "Nasty", ar: "مقرف" }, { en: "Naughty", ar: "شقي" },
        { en: "Nice", ar: "لطيف" }, { en: "Old", ar: "قديم" },
        { en: "Pretty", ar: "جميل" }, { en: "Red", ar: "أحمر" },
        { en: "Sad", ar: "حزين" }, { en: "Scared", ar: "خائف" },
        { en: "Sick", ar: "مريض" }, { en: "Sleepy", ar: "نعسان" },
        { en: "Soft", ar: "ناعم" }, { en: "Thirsty", ar: "عطشان" },
        { en: "Tired", ar: "متعب" }, { en: "Wet", ar: "مبلل" },
        { en: "Yellow", ar: "أصفر" }
      ],
      "كلمات الاستفهام": [
        { en: "How", ar: "كيف" }, { en: "What", ar: "ماذا" },
        { en: "When", ar: "متى" }, { en: "Who", ar: "من" },
        { en: "Why", ar: "لماذا" }, { en: "Where", ar: "أين" }
      ],
      "الوقت": [
        { en: "Day", ar: "يوم" }, { en: "Later", ar: "لاحقاً" },
        { en: "Morning", ar: "صباح" }, { en: "Night", ar: "ليلة" },
        { en: "Now", ar: "الآن" }, { en: "Today", ar: "اليوم" },
        { en: "Tomorrow", ar: "غدًا" }, { en: "Tonight", ar: "الليلة" }
      ],
      "ضمائر": [
        { en: "Her", ar: "لها" }, { en: "His", ar: "له" },
        { en: "I", ar: "أنا" }, { en: "It", ar: "هو/هي" },
        { en: "Me", ar: "إياي" }, { en: "Mine", ar: "ملكي" },
        { en: "My", ar: "لي" }, { en: "That", ar: "ذالك" },
        { en: "This", ar: "هذا" }, { en: "You", ar: "أنت" },
        { en: "Your", ar: "لك" }
      ],
      "حروف الجر": [
        { en: "Away", ar: "بعيد" }, { en: "Back", ar: "خلف" },
        { en: "Down", ar: "أسفل" }, { en: "In", ar: "في" },
        { en: "Inside", ar: "داخل" }, { en: "Off", ar: "عن" },
        { en: "On", ar: "على" }, { en: "Out", ar: "خارج" },
        { en: "There", ar: "هناك" }, { en: "Under", ar: "تحت" },
        { en: "Up", ar: "فوق" }
      ],
      "كميات": [
        { en: "All", ar: "كل" }, { en: "Again", ar: "مرة أخرى" },
        { en: "Another", ar: "آخر" }, { en: "More", ar: "أكثر" },
        { en: "None", ar: "لا شيء" }, { en: "Other", ar: "آخر" },
        { en: "Same", ar: "نفسه" }, { en: "Some", ar: "بعض" }
      ],
      "كلمات إضافية": [
        { en: "Chase", ar: "يطارد" }, { en: "Smell", ar: "يشم" },
        { en: "Ant", ar: "نملة" }, { en: "Camel", ar: "جمل" },
        { en: "Caterpillar", ar: "يرقة" }, { en: "Crab", ar: "سلطعون" },
        { en: "Dolphin", ar: "دولفين" }, { en: "Koala", ar: "كوالا" },
        { en: "Lizard", ar: "سحلية" }, { en: "Octopus", ar: "أخطبوط" },
        { en: "Ambulance", ar: "سيارة إسعاف" }, { en: "Crane", ar: "رافعة" },
        { en: "Digger", ar: "حفارة" }, { en: "Beans", ar: "فول" },
        { en: "Blackberry", ar: "توت أسود" }, { en: "Blueberry", ar: "توت أزرق" },
        { en: "Cherry", ar: "كرز" }, { en: "Chocolate", ar: "شوكولاتة" },
        { en: "Cookie", ar: "بسكويت" }, { en: "Cracker", ar: "مقرمشات" },
        { en: "Cucumber", ar: "خيار" }, { en: "Grape", ar: "عنب" },
        { en: "Green Beans", ar: "فاصوليا خضراء" }, { en: "Haribo", ar: "اهاريبو" },
        { en: "Panda", ar: "باندا" }, { en: "Rabbit", ar: "أرنب" },
        { en: "Seal", ar: "فقمة" }, { en: "Snail", ar: "حلزون" },
        { en: "Swan", ar: "بجعة" }, { en: "Worm", ar: "دودة" },
        { en: "Zebra", ar: "حمار الوحش" }, { en: "Helicopter", ar: "مروحية" },
        { en: "Rocket", ar: "صاروخ" }, { en: "Tractor", ar: "جرار" },
        { en: "Belt", ar: "حزام" }, { en: "Ribbon", ar: "شريط" },
        { en: "Curtains", ar: "ستائر" }, { en: "Dryer", ar: "مجفف" },
        { en: "Microwave", ar: "ميكروويف" }, { en: "Backpack", ar: "حقيبة ظهر" },
        { en: "Bag", ar: "حقيبة" }, { en: "Camera", ar: "كاميرا" },
        { en: "CD", ar: "سي دي" }, { en: "Computer", ar: "كمبيوتر" },
        { en: "Cushion", ar: "مخدة" }, { en: "DVD", ar: "دي في دي" },
        { en: "Handbag", ar: "حقيبة يد" }, { en: "Hanger", ar: "علاقة" },
        { en: "Headphones", ar: "سماعات" }, { en: "Iron", ar: "مكواة" },
        { en: "Keyboard", ar: "لوحة مفاتيح" }, { en: "Laptop", ar: "لابتوب" },
        { en: "Mouse", ar: "فأرة" }, { en: "Acorn", ar: "بلوط" },
        { en: "Dirt", ar: "تراب" }, { en: "Grass", ar: "عشب" },
        { en: "Farm", ar: "مزرعة" }, { en: "Flag", ar: "علم" },
        { en: "Footpath", ar: "ممشى" }, { en: "Leaf", ar: "ورقة شجرة" },
        { en: "Mud", ar: "طين" }, { en: "Pebble", ar: "حصاة" },
        { en: "Puddle", ar: "بركة ماء" }, { en: "Alien", ar: "كائن فضائي" },
        { en: "Astronaut", ar: "رائد فضاء" }, { en: "Clown", ar: "مهرج" },
        { en: "Tie", ar: "ربطة" }, { en: "Ghost", ar: "شبح" },
        { en: "Monster", ar: "وحش" }, { en: "Antler", ar: "قرن" },
        { en: "Feather", ar: "ريشة" }, { en: "Feet", ar: "أقدام" },
        { en: "Fin", ar: "زعفة" }, { en: "Flipper", ar: "زعفة" },
        { en: "Fur", ar: "فرو" }, { en: "Horn", ar: "قرن" },
        { en: "Paw", ar: "مخلب" }, { en: "Bonnet", ar: "غطاء السيارة" },
        { en: "Boot", ar: "صندوق السيارة" }, { en: "Handle", ar: "مقبض" },
        { en: "E-mail", ar: "البريد الإلكتروني" }, { en: "Facebook", ar: "فيسبوك" },
        { en: "Google", ar: "جوجل" }, { en: "Internet", ar: "الإنترنت" },
        { en: "Online", ar: "عبر الإنترنت" }, { en: "Skype", ar: "سكايب" },
        { en: "Youtube", ar: "يوتيوب" }, { en: "Scales", ar: "قشور" },
        { en: "Shell", ar: "صدف" }, { en: "Snout", ar: "خشم" },
        { en: "Skin", ar: "جلد" }, { en: "Spots", ar: "بقع" },
        { en: "Stripes", ar: "خطوط" }, { en: "Wings", ar: "أجنحة" },
        { en: "Switch", ar: "مفتاح التشغيل" }, { en: "Wheel", ar: "عجلة" },
        { en: "Pirate", ar: "قرصان" }, { en: "Robot", ar: "روبوت" }
      ]
    }
  }
};

// ------- DOM ELEMENTS ---------
const formTitleEl = document.getElementById("form-title");
const mainEl = document.querySelector("main");
const exportBtnEl = document.getElementById("export-btn");
const testedLangSelect = document.getElementById("tested-language");

const basicInfoHeader = document.getElementById("basic-info-section").querySelector(".card-header");
const labelChildName = document.getElementById("label-child-name");
const labelParentName = document.getElementById("label-parent-name");
const labelChildDob = document.getElementById("label-child-dob");
const labelSurveyDate = document.getElementById("label-survey-date");

const instructionsHeader = document.getElementById("instructions-section").querySelector(".card-header");
const instructionsTextShort = document.getElementById("instructions-text-short");
const instructionsTextFull = document.getElementById("instructions-text-full");
const toggleInstructionsBtn = document.getElementById("toggle-instructions-btn");

const findingsSummaryHeader = document.getElementById("findings-summary-section").querySelector(".card-header");
const findingsSummaryText = document.getElementById("findings-summary-text");
const suggestionsList = document.getElementById("suggestions-list");

// Modal elements
const normsModal = document.getElementById("norms-modal");
const modalTitle = document.getElementById("modal-title");
const normsTableHeader = document.getElementById("norms-table-header");
const normsTableBody = document.getElementById("norms-table-body");
const closeModalBtn = normsModal.querySelector(".close-button");

// Normative buttons next to export
const showNormsEnBtn = document.getElementById("show-norms-en-btn");
const showNormsArBtn = document.getElementById("show-norms-ar-btn");

// Current language variable
let currentTestLang = testedLangSelect.value;

// ----------- FUNCTIONS -------------

/**
 * Applies the selected language and rebuilds all dynamic content.
 * @param {string} lang The language code ('en' or 'ar')
 */
function applyLanguage(lang) {
  currentTestLang = lang;

  // Update direction and font
  if (lang === "ar") {
    document.documentElement.dir = "rtl";
    document.body.style.fontFamily = "'Noto Sans Arabic', Arial, sans-serif";
    document.documentElement.lang = "ar";
  } else {
    document.documentElement.dir = "ltr";
    document.body.style.fontFamily = "";
    document.documentElement.lang = "en";
  }

  const meta = DATA[lang].meta;

  // Update static UI text elements
  formTitleEl.textContent = meta["form-title"];
  basicInfoHeader.textContent = meta["basic-info-header"];
  labelChildName.textContent = meta["label-child-name"];
  labelParentName.textContent = meta["label-parent-name"];
  labelChildDob.textContent = meta["label-child-dob"];
  labelSurveyDate.textContent = meta["label-survey-date"];
  instructionsHeader.textContent = meta["instructions-header"];
  instructionsTextShort.textContent = meta["instructions-text-short"];
  instructionsTextFull.innerHTML = meta["instructions-text-full"].map(p => `<p>${p}</p>`).join("");
  toggleInstructionsBtn.textContent = meta["show-more-instructions-button"];
  findingsSummaryHeader.textContent = meta["findings-summary-header"];
  exportBtnEl.textContent = meta["export-text"] || "Export as .txt";

  // Clear detailed summary area (in case recalculation not immediate)
  findingsSummaryText.textContent = "";
  suggestionsList.innerHTML = "";

  // Rebuild checklist sections
  buildWordChecklistSections(DATA[lang].checklist);

  // Reset instructions hidden state
  instructionsTextFull.classList.add("hidden");
  toggleInstructionsBtn.textContent = meta["show-more-instructions-button"];

  // Recalculate summary freshly
  calculateAndDisplaySummary();
}

/**
 * Build the checklist UI sections dynamically based on the checklist data.
 * @param {object} checklist Checklist categories with word arrays.
 */
function buildWordChecklistSections(checklist) {
  // Remove old sections
  document.querySelectorAll(".word-checklist-section").forEach(el => el.remove());

  for (const categoryName in checklist) {
    const words = checklist[categoryName];

    // Section container
    const section = document.createElement("section");
    section.className = "card-section word-checklist-section";

    // Header (clickable toggle)
    const header = document.createElement("div");
    header.className = "card-header";
    header.textContent = categoryName;
    section.appendChild(header);

    // Content container, hidden by CSS default
    const content = document.createElement("div");
    content.className = "card-content";
    section.appendChild(content);

    // Search input
    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.className = "search-bar";
    searchInput.placeholder = DATA[currentTestLang].meta["search-placeholder"];
    searchInput.setAttribute("aria-label", searchInput.placeholder);
    searchInput.addEventListener("input", () => filterWordList(searchInput.value, content));
    content.appendChild(searchInput);

    // Word list container
    const listContainer = document.createElement("div");
    listContainer.className = "word-list-container";
    content.appendChild(listContainer);

    // Add each word checkbox and label
    words.forEach(word => {
      const wordItem = document.createElement("div");
      wordItem.className = "word-item";

      const safeId = `chk-${categoryName.replace(/\W/g, "")}-${word.en.replace(/\W/g, "")}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = safeId;
      checkbox.name = `wordChecklist.${categoryName}.${word.en}`;
      checkbox.dataset.wordEn = word.en;
      checkbox.dataset.wordAr = word.ar;
      checkbox.dataset.category = categoryName;
      checkbox.addEventListener("change", calculateAndDisplaySummary);

      const label = document.createElement("label");
      label.htmlFor = safeId;
      label.textContent = `${word.en} (${word.ar})`;

      wordItem.appendChild(label);
      wordItem.appendChild(checkbox);
      listContainer.appendChild(wordItem);
    });

    // Toggle visibility on header click
    header.addEventListener("click", () => {
      content.classList.toggle("visible");
    });

    // Insert before findings summary section
    mainEl.insertBefore(section, document.getElementById("findings-summary-section"));
  }
}

/**
 * Filters visible words in the given category content according to search text.
 * @param {string} text Search filter
 * @param {HTMLElement} contentEl Content container of the category.
 */
function filterWordList(text, contentEl) {
  const filter = text.toLowerCase();
  const wordItems = contentEl.querySelectorAll(".word-item");

  wordItems.forEach(item => {
    const label = item.querySelector("label");
    item.style.display = label.textContent.toLowerCase().includes(filter) ? "flex" : "none";
  });
}

/**
 * Calculate and display the Findings Summary and suggestions.
 */
function calculateAndDisplaySummary() {
  const allChecked = document.querySelectorAll(".word-checklist-section input[type=checkbox]:checked");
  const totalChecked = allChecked.length;

  const norm = DATA[currentTestLang].norms;
  const meta = DATA[currentTestLang].meta;

  let estimatedMPL = "N/A";
  if (totalChecked >= 50) estimatedMPL = "2.5 words";
  else if (totalChecked > 0) estimatedMPL = "1.0 words";

  let summary = meta["findings-summary-text"];
  summary = summary.replace("[total-words-checked]", totalChecked);
  summary = summary.replace("[mean-phrase-length]", estimatedMPL);
  summary = summary.replace("[vocab-mean]", norm.vocabularyMean);
  summary = summary.replace("[vocab-sd]", norm.vocabularySD);

  findingsSummaryText.textContent = summary;

  // Suggestions logic
  suggestionsList.innerHTML = "";
  if (totalChecked < norm.vocabularyMean / 2) {
    suggestionsList.appendChild(createLi(meta["suggestion-low-vocab"]));
  } else if (totalChecked < norm.vocabularyMean) {
    suggestionsList.appendChild(createLi(meta["suggestion-average-vocab"]));
  } else {
    suggestionsList.appendChild(createLi(meta["suggestion-high-vocab"]));
  }
  suggestionsList.appendChild(createLi(meta["suggestion-mpl-generic"]));
}

/**
 * Create a list item element.
 * @param {string} text Text content.
 * @returns {HTMLLIElement}
 */
function createLi(text) {
  const li = document.createElement("li");
  li.textContent = text;
  return li;
}

/**
 * Export form data (basic info + checked words) as plain text file.
 */
function exportFormData() {
  const childName = document.getElementById("child-name").value.trim();
  const parentName = document.getElementById("parent-name").value.trim();
  const childDob = document.getElementById("child-dob").value;
  const surveyDate = document.getElementById("survey-date").value;
  const meta = DATA[currentTestLang].meta;

  let content = `${meta["form-title"]}\n\n`;

  content += `${meta["basic-info-header"]}:\n`;
  content += `${meta["label-child-name"]} ${childName}\n`;
  content += `${meta["label-parent-name"]} ${parentName}\n`;
  content += `${meta["label-child-dob"]} ${childDob}\n`;
  content += `${meta["label-survey-date"]} ${surveyDate}\n\n`;

  content += `${meta["checked-words-header"]}:\n`;

  const checkedCategories = {};
  document.querySelectorAll(".word-checklist-section input[type=checkbox]:checked").forEach(chk => {
    const categoryName = chk.dataset.category;
    if (!checkedCategories[categoryName]) checkedCategories[categoryName] = [];
    checkedCategories[categoryName].push({ en: chk.dataset.wordEn, ar: chk.dataset.wordAr });
  });

  const allCategories = DATA[currentTestLang].checklist;
  for (const categoryName in allCategories) {
    content += `\n${categoryName}:\n`;

    if (checkedCategories[categoryName] && checkedCategories[categoryName].length > 0) {
      checkedCategories[categoryName].forEach(word => {
        content += `- ${word.en} (${word.ar})\n`;
      });
    } else {
      content += `(${meta["no-words-checked-in-category"]})\n`;
    }
  }

  const totalWordsCheckedCount = Object.values(checkedCategories).reduce((sum, arr) => sum + arr.length, 0);
  content += `\n${meta["total-words-checked-label"]}: ${totalWordsCheckedCount}\n\n`;

  content += findingsSummaryText.textContent + "\n\n";

  content += "Suggestions:\n";
  Array.from(suggestionsList.children).forEach(li => {
    content += `- ${li.textContent}\n`;
  });

  const filenameBase = meta["form-title"].replace(/\s+/g, "-");
  const filenameChildPart = childName.replace(/\s+/g, "-") || "Child";
  const filename = `${filenameBase}_${filenameChildPart}.txt`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Show normative modal for selected language norms.
 * @param {string} lang 'en' or 'ar'
 */
function showNormsModal(lang) {
  const normData = DATA[lang]?.norms;
  const meta = DATA[lang]?.meta;
  if (!normData || !meta) return;

  modalTitle.textContent = lang === "en"
    ? "Normative Data (English)"
    : "بيانات معيارية (عربي)";

  normsTableHeader.innerHTML = `
    <th>Measure</th>
    <th>Value ± SD</th>
  `;

  normsTableBody.innerHTML = `
    <tr><td>Vocabulary Mean (words)</td><td>${normData.vocabularyMean} ± ${normData.vocabularySD}</td></tr>
    <tr><td>Mean Phrase Length (words)</td><td>${normData.mplMean} ± ${normData.mplSD}</td></tr>
  `;

  normsModal.classList.remove("hidden");
  normsModal.querySelector(".modal-content").focus();
}

/**
 * Hide the normative modal
 */
function hideNormsModal() {
  normsModal.classList.add("hidden");
}

// ------- Initialization -----------

function init() {
  applyLanguage(currentTestLang);

  testedLangSelect.addEventListener("change", e => {
    applyLanguage(e.target.value);
  });

  exportBtnEl.addEventListener("click", exportFormData);

  toggleInstructionsBtn.addEventListener("click", () => {
    instructionsTextFull.classList.toggle("hidden");
    toggleInstructionsBtn.textContent = instructionsTextFull.classList.contains("hidden")
      ? DATA[currentTestLang].meta["show-more-instructions-button"]
      : DATA[currentTestLang].meta["hide-more-instructions-button"];
  });

  // Normative modal buttons
  showNormsEnBtn.addEventListener("click", () => showNormsModal("en"));
  showNormsArBtn.addEventListener("click", () => showNormsModal("ar"));

  closeModalBtn.addEventListener("click", hideNormsModal);

  normsModal.addEventListener("click", e => {
    if (e.target === normsModal) hideNormsModal();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !normsModal.classList.contains("hidden")) {
      hideNormsModal();
    }
  });

  // Listen changes on basic info inputs to update summary
  document.getElementById("child-name").addEventListener("input", calculateAndDisplaySummary);
  document.getElementById("parent-name").addEventListener("input", calculateAndDisplaySummary);
  document.getElementById("child-dob").addEventListener("change", calculateAndDisplaySummary);
  document.getElementById("survey-date").addEventListener("change", calculateAndDisplaySummary);
}

document.addEventListener("DOMContentLoaded", init);
