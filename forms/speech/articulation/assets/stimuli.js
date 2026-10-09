// Editable Syrian Levantine draft forms; confirm the family dialect and actual target.
const SOUNDS = [
  {
    "id": "s1",
    "letter": "ء",
    "ipa": "ʔ",
    "probes": [
      {
        "id": "s1-0",
        "position": "أول الكلمة",
        "word": "أسد",
        "image": "1.png",
        "spoken": "أسد",
        "reference": "ʔasad",
        "targetIPA": "ʔ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "lion"
      },
      {
        "id": "s1-1",
        "position": "وسط الكلمة",
        "word": "فأس",
        "image": "2.png",
        "spoken": "فأس",
        "reference": "faʔs",
        "targetIPA": "ʔ",
        "referenceNote": "المرجع المختار فأس /faʔs/. إذا كانت فاس مقبولة في لهجة الأسرة، سجّلها كنطق لهجي أو عدّل المرجع.",
        "gloss": "axe"
      },
      {
        "id": "s1-2",
        "position": "آخر الكلمة",
        "word": "ماء",
        "image": "3.png",
        "spoken": "ماء",
        "reference": "maːʔ",
        "targetIPA": "ʔ",
        "referenceNote": "المرجع المختار ماء /maːʔ/. إذا كانت مي أو ماي أو ما مقبولة في لهجة الأسرة، لا تُحسب تلقائياً كخطأ؛ عدّل المرجع أو سجّلها كنطق لهجي.",
        "gloss": "water"
      }
    ]
  },
  {
    "id": "s2",
    "letter": "ب",
    "ipa": "b",
    "probes": [
      {
        "id": "s2-0",
        "position": "أول الكلمة",
        "word": "بطة",
        "image": "4.png",
        "spoken": "بطّة",
        "reference": "batˤtˤa",
        "targetIPA": "b",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "duck"
      },
      {
        "id": "s2-1",
        "position": "وسط الكلمة",
        "word": "جبل",
        "image": "5.png",
        "spoken": "جبل",
        "reference": "ʒabal",
        "targetIPA": "b",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "mountain"
      },
      {
        "id": "s2-2",
        "position": "آخر الكلمة",
        "word": "كلب",
        "image": "6.png",
        "spoken": "كلب",
        "reference": "kalb",
        "targetIPA": "b",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "dog"
      }
    ]
  },
  {
    "id": "s3",
    "letter": "ت",
    "ipa": "t",
    "probes": [
      {
        "id": "s3-0",
        "position": "أول الكلمة",
        "word": "تفاح",
        "image": "7.png",
        "spoken": "تفّاح",
        "reference": "təffaːħ",
        "targetIPA": "t",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "apples"
      },
      {
        "id": "s3-1",
        "position": "وسط الكلمة",
        "word": "كتاب",
        "image": "8.png",
        "spoken": "كتاب",
        "reference": "ktaːb",
        "targetIPA": "t",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "book"
      },
      {
        "id": "s3-2",
        "position": "آخر الكلمة",
        "word": "بيت",
        "image": "9.png",
        "spoken": "بيت",
        "reference": "beːt",
        "targetIPA": "t",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "house"
      }
    ]
  },
  {
    "id": "s4",
    "letter": "ث",
    "ipa": "θ",
    "probes": [
      {
        "id": "s4-0",
        "position": "أول الكلمة",
        "word": "ثعلب",
        "image": "10.png",
        "spoken": "تعلب",
        "reference": "taʕlab",
        "targetIPA": "t",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "fox"
      },
      {
        "id": "s4-1",
        "position": "وسط الكلمة",
        "word": "مثلث",
        "image": "11.png",
        "spoken": "مثلّث",
        "reference": "msallas",
        "targetIPA": "s",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "triangle"
      },
      {
        "id": "s4-2",
        "position": "آخر الكلمة",
        "word": "مثلث",
        "image": "11.png",
        "spoken": "مثلّث",
        "reference": "msallas",
        "targetIPA": "s",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "triangle"
      }
    ]
  },
  {
    "id": "s5",
    "letter": "ج",
    "ipa": "dʒ / ʒ",
    "probes": [
      {
        "id": "s5-0",
        "position": "أول الكلمة",
        "word": "جمل",
        "image": "12.png",
        "spoken": "جمل",
        "reference": "ʒamal",
        "targetIPA": "ʒ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "camel"
      },
      {
        "id": "s5-1",
        "position": "وسط الكلمة",
        "word": "دجاج",
        "image": "13.png",
        "spoken": "دجاج",
        "reference": "dəʒaːʒ",
        "targetIPA": "ʒ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "chickens"
      },
      {
        "id": "s5-2",
        "position": "آخر الكلمة",
        "word": "تاج",
        "image": "14.png",
        "spoken": "تاج",
        "reference": "taːʒ",
        "targetIPA": "ʒ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "crown"
      }
    ]
  },
  {
    "id": "s6",
    "letter": "ح",
    "ipa": "ħ",
    "probes": [
      {
        "id": "s6-0",
        "position": "أول الكلمة",
        "word": "حصان",
        "image": "15.png",
        "spoken": "حصان",
        "reference": "ħsˤaːn",
        "targetIPA": "ħ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "horse"
      },
      {
        "id": "s6-1",
        "position": "وسط الكلمة",
        "word": "سلحفاة",
        "image": "16.png",
        "spoken": "سلحفة",
        "reference": "səlħafe",
        "targetIPA": "ħ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "turtle"
      },
      {
        "id": "s6-2",
        "position": "آخر الكلمة",
        "word": "تفاح",
        "image": "7.png",
        "spoken": "تفّاح",
        "reference": "təffaːħ",
        "targetIPA": "ħ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "apples"
      }
    ]
  },
  {
    "id": "s7",
    "letter": "خ",
    "ipa": "x",
    "probes": [
      {
        "id": "s7-0",
        "position": "أول الكلمة",
        "word": "خبز",
        "image": "17.png",
        "spoken": "خبز",
        "reference": "xəbəz",
        "targetIPA": "x",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "bread"
      },
      {
        "id": "s7-1",
        "position": "وسط الكلمة",
        "word": "نخلة",
        "image": "18.png",
        "spoken": "نخلة",
        "reference": "naxle",
        "targetIPA": "x",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "palm tree"
      },
      {
        "id": "s7-2",
        "position": "آخر الكلمة",
        "word": "بطيخ",
        "image": "19.png",
        "spoken": "بطّيخ",
        "reference": "batˤtˤiːx",
        "targetIPA": "x",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "watermelon"
      }
    ]
  },
  {
    "id": "s8",
    "letter": "د",
    "ipa": "d",
    "probes": [
      {
        "id": "s8-0",
        "position": "أول الكلمة",
        "word": "دب",
        "image": "20.png",
        "spoken": "دبّ",
        "reference": "dəbb",
        "targetIPA": "d",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "bear"
      },
      {
        "id": "s8-1",
        "position": "وسط الكلمة",
        "word": "مدرسة",
        "image": "21.png",
        "spoken": "مدرسة",
        "reference": "madrase",
        "targetIPA": "d",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "school"
      },
      {
        "id": "s8-2",
        "position": "آخر الكلمة",
        "word": "يد",
        "image": "22.png",
        "spoken": "إيد",
        "reference": "ʔiːd",
        "targetIPA": "d",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "hand"
      }
    ]
  },
  {
    "id": "s9",
    "letter": "ذ",
    "ipa": "ð",
    "probes": [
      {
        "id": "s9-0",
        "position": "أول الكلمة",
        "word": "ذرة",
        "image": "23.png",
        "spoken": "درة",
        "reference": "dura",
        "targetIPA": "d",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "corn on the cob"
      },
      {
        "id": "s9-1",
        "position": "وسط الكلمة",
        "word": "أذن",
        "image": "24.png",
        "spoken": "إدن",
        "reference": "ʔiden",
        "targetIPA": "d",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "ear"
      },
      {
        "id": "s9-2",
        "position": "آخر الكلمة",
        "word": "قنفذ",
        "image": "25.png",
        "spoken": "قنفد",
        "reference": "ʔənfəd",
        "targetIPA": "d",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "hedgehog"
      }
    ]
  },
  {
    "id": "s10",
    "letter": "ر",
    "ipa": "r",
    "probes": [
      {
        "id": "s10-0",
        "position": "أول الكلمة",
        "word": "رمان",
        "image": "26.png",
        "spoken": "رمّان",
        "reference": "rəmmaːn",
        "targetIPA": "r",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "pomegranate"
      },
      {
        "id": "s10-1",
        "position": "وسط الكلمة",
        "word": "كرسي",
        "image": "27.png",
        "spoken": "كرسي",
        "reference": "kərsi",
        "targetIPA": "r",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "chair"
      },
      {
        "id": "s10-2",
        "position": "آخر الكلمة",
        "word": "قمر",
        "image": "28.png",
        "spoken": "قمر",
        "reference": "ʔamar",
        "targetIPA": "r",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "moon"
      }
    ]
  },
  {
    "id": "s11",
    "letter": "ز",
    "ipa": "z",
    "probes": [
      {
        "id": "s11-0",
        "position": "أول الكلمة",
        "word": "زهرة",
        "image": "29.png",
        "spoken": "زهرة",
        "reference": "zahra",
        "targetIPA": "z",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "flower"
      },
      {
        "id": "s11-1",
        "position": "وسط الكلمة",
        "word": "ميزان",
        "image": "30.png",
        "spoken": "ميزان",
        "reference": "miːzaːn",
        "targetIPA": "z",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "weighing scale"
      },
      {
        "id": "s11-2",
        "position": "آخر الكلمة",
        "word": "موز",
        "image": "31.png",
        "spoken": "موز",
        "reference": "moːz",
        "targetIPA": "z",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "bananas"
      }
    ]
  },
  {
    "id": "s12",
    "letter": "س",
    "ipa": "s",
    "probes": [
      {
        "id": "s12-0",
        "position": "أول الكلمة",
        "word": "سمكة",
        "image": "32.png",
        "spoken": "سمكة",
        "reference": "samake",
        "targetIPA": "s",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "one fish"
      },
      {
        "id": "s12-1",
        "position": "وسط الكلمة",
        "word": "أسد",
        "image": "1.png",
        "spoken": "أسد",
        "reference": "ʔasad",
        "targetIPA": "s",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "lion"
      },
      {
        "id": "s12-2",
        "position": "آخر الكلمة",
        "word": "شمس",
        "image": "33.png",
        "spoken": "شمس",
        "reference": "ʃams",
        "targetIPA": "s",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "sun"
      }
    ]
  },
  {
    "id": "s13",
    "letter": "ش",
    "ipa": "ʃ",
    "probes": [
      {
        "id": "s13-0",
        "position": "أول الكلمة",
        "word": "شجرة",
        "image": "34.png",
        "spoken": "شجرة",
        "reference": "ʃaʒara",
        "targetIPA": "ʃ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "tree"
      },
      {
        "id": "s13-1",
        "position": "وسط الكلمة",
        "word": "فراشة",
        "image": "35.png",
        "spoken": "فراشة",
        "reference": "faraːʃe",
        "targetIPA": "ʃ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "butterfly"
      },
      {
        "id": "s13-2",
        "position": "آخر الكلمة",
        "word": "ريش",
        "image": "36.png",
        "spoken": "ريش",
        "reference": "riːʃ",
        "targetIPA": "ʃ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "feathers"
      }
    ]
  },
  {
    "id": "s14",
    "letter": "ص",
    "ipa": "sˤ",
    "probes": [
      {
        "id": "s14-0",
        "position": "أول الكلمة",
        "word": "صابون",
        "image": "37.png",
        "spoken": "صابون",
        "reference": "sˤaːbuːn",
        "targetIPA": "sˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "soap"
      },
      {
        "id": "s14-1",
        "position": "وسط الكلمة",
        "word": "عصير",
        "image": "38.png",
        "spoken": "عصير",
        "reference": "ʕasˤiːr",
        "targetIPA": "sˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "juice"
      },
      {
        "id": "s14-2",
        "position": "آخر الكلمة",
        "word": "قفص",
        "image": "39.png",
        "spoken": "قفص",
        "reference": "ʔafasˤ",
        "targetIPA": "sˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "cage"
      }
    ]
  },
  {
    "id": "s15",
    "letter": "ض",
    "ipa": "dˤ",
    "probes": [
      {
        "id": "s15-0",
        "position": "أول الكلمة",
        "word": "ضفدع",
        "image": "40.png",
        "spoken": "ضفدع",
        "reference": "dˤəfdˤaʕ",
        "targetIPA": "dˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "frog"
      },
      {
        "id": "s15-1",
        "position": "وسط الكلمة",
        "word": "بيضة",
        "image": "41.png",
        "spoken": "بيضة",
        "reference": "beːdˤa",
        "targetIPA": "dˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "one egg"
      },
      {
        "id": "s15-2",
        "position": "آخر الكلمة",
        "word": "بيض",
        "image": "42.png",
        "spoken": "بيض",
        "reference": "beːdˤ",
        "targetIPA": "dˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "several eggs"
      }
    ]
  },
  {
    "id": "s16",
    "letter": "ط",
    "ipa": "tˤ",
    "probes": [
      {
        "id": "s16-0",
        "position": "أول الكلمة",
        "word": "طائرة",
        "image": "43.png",
        "spoken": "طيّارة",
        "reference": "tˤajjaːra",
        "targetIPA": "tˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "airplane"
      },
      {
        "id": "s16-1",
        "position": "وسط الكلمة",
        "word": "بطة",
        "image": "4.png",
        "spoken": "بطّة",
        "reference": "batˤtˤa",
        "targetIPA": "tˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "duck"
      },
      {
        "id": "s16-2",
        "position": "آخر الكلمة",
        "word": "قط",
        "image": "44.png",
        "spoken": "قطّ",
        "reference": "ʔətˤtˤ",
        "targetIPA": "tˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "cat"
      }
    ]
  },
  {
    "id": "s17",
    "letter": "ظ",
    "ipa": "ðˤ / zˤ",
    "probes": [
      {
        "id": "s17-0",
        "position": "أول الكلمة",
        "word": "ظرف",
        "image": "45.png",
        "spoken": "ظرف",
        "reference": "zˤarf",
        "targetIPA": "zˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "envelope"
      },
      {
        "id": "s17-1",
        "position": "وسط الكلمة",
        "word": "مظلة",
        "image": "46.png",
        "spoken": "مظلّة",
        "reference": "mzˤalle",
        "targetIPA": "zˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "umbrella"
      },
      {
        "id": "s17-2",
        "position": "آخر الكلمة",
        "word": "حظ",
        "image": "47.png",
        "spoken": "حظّ",
        "reference": "ħazˤzˤ",
        "targetIPA": "zˤ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "luck (a lucky prize winner; abstract prompt, not reliably picture-nameable)"
      }
    ]
  },
  {
    "id": "s18",
    "letter": "ع",
    "ipa": "ʕ",
    "probes": [
      {
        "id": "s18-0",
        "position": "أول الكلمة",
        "word": "عين",
        "image": "48.png",
        "spoken": "عين",
        "reference": "ʕeːn",
        "targetIPA": "ʕ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "eye"
      },
      {
        "id": "s18-1",
        "position": "وسط الكلمة",
        "word": "لعبة",
        "image": "49.png",
        "spoken": "لعبة",
        "reference": "ləʕbe",
        "targetIPA": "ʕ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "toy"
      },
      {
        "id": "s18-2",
        "position": "آخر الكلمة",
        "word": "إصبع",
        "image": "50.png",
        "spoken": "إصبع",
        "reference": "ʔəsˤbaʕ",
        "targetIPA": "ʕ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "finger"
      }
    ]
  },
  {
    "id": "s19",
    "letter": "غ",
    "ipa": "ɣ",
    "probes": [
      {
        "id": "s19-0",
        "position": "أول الكلمة",
        "word": "غيمة",
        "image": "51.png",
        "spoken": "غيمة",
        "reference": "ɣeːme",
        "targetIPA": "ɣ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "cloud"
      },
      {
        "id": "s19-1",
        "position": "وسط الكلمة",
        "word": "مغسلة",
        "image": "52.png",
        "spoken": "مغسلة",
        "reference": "maɣsale",
        "targetIPA": "ɣ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "washbasin / sink"
      },
      {
        "id": "s19-2",
        "position": "آخر الكلمة",
        "word": "صمغ",
        "image": "53.png",
        "spoken": "صمغ",
        "reference": "sˤamɣ",
        "targetIPA": "ɣ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "glue"
      }
    ]
  },
  {
    "id": "s20",
    "letter": "ف",
    "ipa": "f",
    "probes": [
      {
        "id": "s20-0",
        "position": "أول الكلمة",
        "word": "فراشة",
        "image": "35.png",
        "spoken": "فراشة",
        "reference": "faraːʃe",
        "targetIPA": "f",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "butterfly"
      },
      {
        "id": "s20-1",
        "position": "وسط الكلمة",
        "word": "تفاح",
        "image": "7.png",
        "spoken": "تفّاح",
        "reference": "təffaːħ",
        "targetIPA": "f",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "apples"
      },
      {
        "id": "s20-2",
        "position": "آخر الكلمة",
        "word": "خروف",
        "image": "54.png",
        "spoken": "خروف",
        "reference": "xaruːf",
        "targetIPA": "f",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "sheep"
      }
    ]
  },
  {
    "id": "s21",
    "letter": "ق",
    "ipa": "q",
    "probes": [
      {
        "id": "s21-0",
        "position": "أول الكلمة",
        "word": "قلم",
        "image": "55.png",
        "spoken": "قلم",
        "reference": "ʔalam",
        "targetIPA": "ʔ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "pencil / pen (agree on the intended label)"
      },
      {
        "id": "s21-1",
        "position": "وسط الكلمة",
        "word": "بقرة",
        "image": "56.png",
        "spoken": "بقرة",
        "reference": "baʔara",
        "targetIPA": "ʔ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "cow"
      },
      {
        "id": "s21-2",
        "position": "آخر الكلمة",
        "word": "برق",
        "image": "57.png",
        "spoken": "برق",
        "reference": "barʔ",
        "targetIPA": "ʔ",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "lightning"
      }
    ]
  },
  {
    "id": "s22",
    "letter": "ك",
    "ipa": "k",
    "probes": [
      {
        "id": "s22-0",
        "position": "أول الكلمة",
        "word": "كلب",
        "image": "6.png",
        "spoken": "كلب",
        "reference": "kalb",
        "targetIPA": "k",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "dog"
      },
      {
        "id": "s22-1",
        "position": "وسط الكلمة",
        "word": "سمكة",
        "image": "32.png",
        "spoken": "سمكة",
        "reference": "samake",
        "targetIPA": "k",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "one fish"
      },
      {
        "id": "s22-2",
        "position": "آخر الكلمة",
        "word": "سمك",
        "image": "58.png",
        "spoken": "سمك",
        "reference": "samak",
        "targetIPA": "k",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "several fish"
      }
    ]
  },
  {
    "id": "s23",
    "letter": "ل",
    "ipa": "l",
    "probes": [
      {
        "id": "s23-0",
        "position": "أول الكلمة",
        "word": "ليمون",
        "image": "59.png",
        "spoken": "ليمون",
        "reference": "leːmuːn",
        "targetIPA": "l",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "lemons"
      },
      {
        "id": "s23-1",
        "position": "وسط الكلمة",
        "word": "قلم",
        "image": "55.png",
        "spoken": "قلم",
        "reference": "ʔalam",
        "targetIPA": "l",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "pencil / pen (agree on the intended label)"
      },
      {
        "id": "s23-2",
        "position": "آخر الكلمة",
        "word": "فيل",
        "image": "60.png",
        "spoken": "فيل",
        "reference": "fiːl",
        "targetIPA": "l",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "elephant"
      }
    ]
  },
  {
    "id": "s24",
    "letter": "م",
    "ipa": "m",
    "probes": [
      {
        "id": "s24-0",
        "position": "أول الكلمة",
        "word": "موز",
        "image": "31.png",
        "spoken": "موز",
        "reference": "moːz",
        "targetIPA": "m",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "bananas"
      },
      {
        "id": "s24-1",
        "position": "وسط الكلمة",
        "word": "سمكة",
        "image": "32.png",
        "spoken": "سمكة",
        "reference": "samake",
        "targetIPA": "m",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "one fish"
      },
      {
        "id": "s24-2",
        "position": "آخر الكلمة",
        "word": "قلم",
        "image": "55.png",
        "spoken": "قلم",
        "reference": "ʔalam",
        "targetIPA": "m",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "pencil / pen (agree on the intended label)"
      }
    ]
  },
  {
    "id": "s25",
    "letter": "ن",
    "ipa": "n",
    "probes": [
      {
        "id": "s25-0",
        "position": "أول الكلمة",
        "word": "نخلة",
        "image": "18.png",
        "spoken": "نخلة",
        "reference": "naxle",
        "targetIPA": "n",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "palm tree"
      },
      {
        "id": "s25-1",
        "position": "وسط الكلمة",
        "word": "عنب",
        "image": "61.png",
        "spoken": "عنب",
        "reference": "ʕənab",
        "targetIPA": "n",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "grapes"
      },
      {
        "id": "s25-2",
        "position": "آخر الكلمة",
        "word": "حصان",
        "image": "15.png",
        "spoken": "حصان",
        "reference": "ħsˤaːn",
        "targetIPA": "n",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "horse"
      }
    ]
  },
  {
    "id": "s26",
    "letter": "ه",
    "ipa": "h",
    "probes": [
      {
        "id": "s26-0",
        "position": "أول الكلمة",
        "word": "هلال",
        "image": "62.png",
        "spoken": "هلال",
        "reference": "hlaːl",
        "targetIPA": "h",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "crescent moon"
      },
      {
        "id": "s26-1",
        "position": "وسط الكلمة",
        "word": "مهر",
        "image": "63.png",
        "spoken": "مهر",
        "reference": "məhr",
        "targetIPA": "h",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "foal / young horse"
      },
      {
        "id": "s26-2",
        "position": "آخر الكلمة",
        "word": "وجه",
        "image": "64.png",
        "spoken": "وشّ",
        "reference": "wəʃʃ",
        "targetIPA": null,
        "referenceNote": "الصوت المدرج غير موجود في هذه الصيغة الشامية؛ لا يُصحح كخطأ. اختر كلمة بديلة مناسبة أو تجاوز البند.",
        "gloss": "face"
      }
    ]
  },
  {
    "id": "s27",
    "letter": "و",
    "ipa": "w",
    "probes": [
      {
        "id": "s27-0",
        "position": "أول الكلمة",
        "word": "وردة",
        "image": "65.png",
        "spoken": "وردة",
        "reference": "warde",
        "targetIPA": "w",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "rose"
      },
      {
        "id": "s27-1",
        "position": "وسط الكلمة",
        "word": "دواء",
        "image": "66.png",
        "spoken": "دوا",
        "reference": "dawa",
        "targetIPA": "w",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "medicine"
      },
      {
        "id": "s27-2",
        "position": "آخر الكلمة",
        "word": "دلو",
        "image": "67.png",
        "spoken": "دلو",
        "reference": "dalu",
        "targetIPA": null,
        "referenceNote": "الصوت المدرج غير موجود في هذه الصيغة الشامية؛ لا يُصحح كخطأ. اختر كلمة بديلة مناسبة أو تجاوز البند.",
        "gloss": "bucket"
      }
    ]
  },
  {
    "id": "s28",
    "letter": "ي",
    "ipa": "j",
    "probes": [
      {
        "id": "s28-0",
        "position": "أول الكلمة",
        "word": "يد",
        "image": "22.png",
        "spoken": "إيد",
        "reference": "ʔiːd",
        "targetIPA": null,
        "referenceNote": "الصوت المدرج غير موجود في هذه الصيغة الشامية؛ لا يُصحح كخطأ. اختر كلمة بديلة مناسبة أو تجاوز البند.",
        "gloss": "hand"
      },
      {
        "id": "s28-1",
        "position": "وسط الكلمة",
        "word": "سيارة",
        "image": "68.png",
        "spoken": "سيّارة",
        "reference": "sajjaːra",
        "targetIPA": "j",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "car"
      },
      {
        "id": "s28-2",
        "position": "آخر الكلمة",
        "word": "شاي",
        "image": "69.png",
        "spoken": "شاي",
        "reference": "ʃaːj",
        "targetIPA": "j",
        "referenceNote": "مرجع سوري مديني مبدئي قابل للتعديل؛ راجع نطق الأسرة وموضع الصوت.",
        "gloss": "tea"
      }
    ]
  }
];
