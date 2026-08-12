export type InjuryId = "trauma" | "cardiac" | "burn" | "other";

export interface Injury {
  id: InjuryId;
  label: string;
  sub: string;
}

export const INJURIES: Injury[] = [
  { id: "trauma", label: "Accident / Trauma", sub: "Bleeding, fracture, collision" },
  { id: "cardiac", label: "Cardiac Arrest", sub: "No pulse, unresponsive" },
  { id: "burn", label: "Severe Burn", sub: "Fire, scald, chemical" },
  { id: "other", label: "Other", sub: "Unclear or multiple" },
];

export interface Hospital {
  name: string;
  distance: string;
  eta: string;
  capacity: string;
  ready: boolean;
  /** Free emergency beds right now. */
  bedsFree: number;
  bedsTotal: number;
  phone: string;
}

export const RECOMMENDED: Record<InjuryId, Hospital> = {
  trauma: {
    name: "St. Xavier Trauma Center",
    distance: "4.2 km",
    eta: "6 min via ambulance",
    capacity: "Trauma Surgeon & Bed Ready",
    ready: true,
    bedsFree: 4,
    bedsTotal: 12,
    phone: "+18005550142",
  },
  cardiac: {
    name: "Northgate Cardiac Institute",
    distance: "3.1 km",
    eta: "5 min via ambulance",
    capacity: "Cath Lab Open • ICU Bed Ready",
    ready: true,
    bedsFree: 2,
    bedsTotal: 8,
    phone: "+18005550188",
  },
  burn: {
    name: "Riverside Burn Unit",
    distance: "5.8 km",
    eta: "8 min via ambulance",
    capacity: "Burn Bay 2 Available",
    ready: true,
    bedsFree: 3,
    bedsTotal: 6,
    phone: "+18005550164",
  },
  other: {
    name: "City General Emergency",
    distance: "2.7 km",
    eta: "4 min via ambulance",
    capacity: "ER Physician Available",
    ready: true,
    bedsFree: 7,
    bedsTotal: 20,
    phone: "+18005550110",
  },
};

export const ALTERNATIVES: Hospital[] = [
  {
    name: "Mercy Hill Hospital",
    distance: "6.9 km",
    eta: "11 min",
    capacity: "2 beds • no trauma surgeon",
    ready: false,
    bedsFree: 2,
    bedsTotal: 14,
    phone: "+18005550176",
  },
  {
    name: "Lakeside Medical",
    distance: "9.4 km",
    eta: "15 min",
    capacity: "At capacity • diverting",
    ready: false,
    bedsFree: 0,
    bedsTotal: 10,
    phone: "+18005550193",
  },
];


export interface FirstAidStep {
  title: string;
  detail: string;
}

export const FIRST_AID: Record<InjuryId, { title: string; steps: FirstAidStep[]; rhythm: boolean }> =
  {
    trauma: {
      title: "Control the bleeding",
      rhythm: false,
      steps: [
        { title: "Do not move the patient", detail: "Unless there is fire or traffic danger." },
        { title: "Press firmly on the wound", detail: "Clean cloth. Hold steady pressure." },
        { title: "Keep them warm", detail: "Cover with a jacket. Talk to them." },
      ],
    },
    cardiac: {
      title: "Start CPR — follow the pulse",
      rhythm: true,
      steps: [
        { title: "Push hard, centre of chest", detail: "Heel of hand, arms straight." },
        { title: "Match the pulsing ring", detail: "110 compressions per minute." },
        { title: "Do not stop", detail: "Continue until medics take over." },
      ],
    },
    burn: {
      title: "Cool the burn",
      rhythm: false,
      steps: [
        { title: "Cool running water, 20 min", detail: "Never ice, never butter." },
        { title: "Remove tight items", detail: "Rings, watches, belts — not stuck fabric." },
        { title: "Cover loosely", detail: "Cling film or a clean non-fluffy cloth." },
      ],
    },
    other: {
      title: "Keep them stable",
      rhythm: false,
      steps: [
        { title: "Check breathing", detail: "Tilt head back, look at the chest." },
        { title: "Recovery position", detail: "On their side if unconscious but breathing." },
        { title: "Stay on this screen", detail: "Medics will sync on arrival." },
      ],
    },
  };

const DYNAMIC_RULES: { keywords: string[], data: { title: string, rhythm: boolean, steps: FirstAidStep[] } }[] = [
  {
    keywords: ["chok", "heimlich"],
    data: {
      title: "Clear the airway", rhythm: false, steps: [
        { title: "5 Back Blows", detail: "Hit firmly between shoulder blades." },
        { title: "5 Abdominal Thrusts", detail: "Heimlich maneuver, pull inwards and upwards." },
        { title: "Alternate", detail: "Keep alternating until object is dislodged." }
      ]
    }
  },
  {
    keywords: ["drown", "water", "pool", "ocean"],
    data: {
      title: "Check breathing & CPR", rhythm: true, steps: [
        { title: "Get them out of water", detail: "Place on a flat surface safely." },
        { title: "Check breathing", detail: "Tilt head back, listen for 10 seconds." },
        { title: "Start CPR if unresponsive", detail: "Give 5 rescue breaths, then 30 chest compressions." }
      ]
    }
  },
  {
    keywords: ["pois", "overdose", "swallow", "drink", "toxic", "chemical swallow"],
    data: {
      title: "Identify & Monitor", rhythm: false, steps: [
        { title: "Do NOT induce vomiting", detail: "Unless told by poison control." },
        { title: "Keep the container", detail: "Medics need to know exactly what was taken." },
        { title: "Recovery position", detail: "If unconscious but breathing." }
      ]
    }
  },
  {
    keywords: ["seizure", "fit", "convuls", "epilep"],
    data: {
      title: "Protect from injury", rhythm: false, steps: [
        { title: "Clear the area", detail: "Move hard or sharp objects away." },
        { title: "Do not hold them down", detail: "Let the seizure run its course." },
        { title: "Time it", detail: "Note exactly how long it lasts for medics." }
      ]
    }
  },
  {
    keywords: ["allerg", "anaphyl", "sting", "bee", "wasp", "swell", "peanut"],
    data: {
      title: "Check for EpiPen / Auto-injector", rhythm: false, steps: [
        { title: "Use auto-injector", detail: "If they have one, help them use it immediately." },
        { title: "Keep them calm", detail: "Have them sit or lie down flat." },
        { title: "Monitor breathing", detail: "Be prepared to start CPR if they stop breathing." }
      ]
    }
  },
  {
    keywords: ["stroke", "face", "speech", "arm"],
    data: {
      title: "Think FAST", rhythm: false, steps: [
        { title: "Check Face & Arms", detail: "Ask them to smile and raise both arms." },
        { title: "Check Speech", detail: "Ask them to repeat a simple sentence." },
        { title: "Note the time", detail: "Medics MUST know when symptoms started." }
      ]
    }
  },
  {
    keywords: ["fall", "drop", "slip", "trip", "jump", "roof", "ladder"],
    data: {
      title: "Do NOT move them", rhythm: false, steps: [
        { title: "Suspect spinal injury", detail: "Do not move their head, neck, or back." },
        { title: "Stop any bleeding", detail: "Apply firm pressure to any bleeding wounds." },
        { title: "Keep them warm and still", detail: "Cover them with a coat or blanket." }
      ]
    }
  },
  {
    keywords: ["heart attack", "chest pain", "angina", "cardiac"],
    data: {
      title: "Suspected Heart Attack", rhythm: false, steps: [
        { title: "Sit them down", detail: "Keep them calm, make them comfortable (e.g. w-position)." },
        { title: "Give Aspirin", detail: "If not allergic, have them slowly chew 300mg of aspirin." },
        { title: "Monitor", detail: "Be ready to start CPR if they become unresponsive." }
      ]
    }
  },
  {
    keywords: ["asthma", "breath", "wheez", "inhaler", "chok"],
    data: {
      title: "Asthma Attack", rhythm: false, steps: [
        { title: "Sit them upright", detail: "Do not let them lie down. Loosen tight clothing." },
        { title: "Help them use inhaler", detail: "1 puff of reliever inhaler every 30-60 seconds." },
        { title: "Reassure them", detail: "Keep them calm. Panic makes breathing harder." }
      ]
    }
  },
  {
    keywords: ["bleed", "cut", "stab", "slash", "wound", "blood", "amputat", "gash", "lacerat"],
    data: {
      title: "Severe Bleeding", rhythm: false, steps: [
        { title: "Apply direct pressure", detail: "Use a clean cloth or hands directly on the wound." },
        { title: "Elevate if possible", detail: "Keep the wounded area above the heart." },
        { title: "Do not remove objects", detail: "If something is impaled, apply pressure around it, not on it." }
      ]
    }
  },
  {
    keywords: ["break", "broken", "fracture", "bone", "snap", "sprain"],
    data: {
      title: "Broken Bone / Fracture", rhythm: false, steps: [
        { title: "Do NOT realign the bone", detail: "Keep the limb in the position you found it." },
        { title: "Immobilize the area", detail: "Support the injury with a makeshift splint or cushion." },
        { title: "Apply ice (if closed)", detail: "Wrap ice in a cloth to reduce swelling." }
      ]
    }
  },
  {
    keywords: ["head", "concussion", "skull", "brain"],
    data: {
      title: "Head Injury", rhythm: false, steps: [
        { title: "Keep them still", detail: "Do not move their neck if spine injury is suspected." },
        { title: "Stop bleeding", detail: "Apply gentle pressure. Do not press hard on skull." },
        { title: "Monitor consciousness", detail: "Check if they are alert, confused, or unresponsive." }
      ]
    }
  },
  {
    keywords: ["diabet", "sugar", "insulin", "hypo", "hyper"],
    data: {
      title: "Diabetic Emergency", rhythm: false, steps: [
        { title: "Give sugar (if conscious)", detail: "Fruit juice, regular soda, or sweets." },
        { title: "Do NOT give insulin", detail: "Unless they can self-administer it." },
        { title: "If unconscious", detail: "Place in recovery position. Do not put anything in mouth." }
      ]
    }
  },
  {
    keywords: ["electric", "shock", "lightning", "electrocute", "socket", "wire"],
    data: {
      title: "Electrical Injury", rhythm: false, steps: [
        { title: "Do NOT touch them", detail: "Ensure the power source is turned off first." },
        { title: "Call for help", detail: "Electrical burns can cause internal damage." },
        { title: "Check breathing", detail: "Start CPR if they are unresponsive and power is off." }
      ]
    }
  },
  {
    keywords: ["burn", "fire", "scald", "hot", "flame", "boiling"],
    data: {
      title: "Burn Injury", rhythm: false, steps: [
        { title: "Cool the burn", detail: "Cool running water for 20 minutes. Never ice." },
        { title: "Remove tight items", detail: "Rings, watches, belts — but NOT stuck clothing." },
        { title: "Cover loosely", detail: "Use cling film or a clean non-fluffy cloth." }
      ]
    }
  },
  {
    keywords: ["cold", "freeze", "hypothermia", "snow", "ice", "frostbite"],
    data: {
      title: "Hypothermia / Frostbite", rhythm: false, steps: [
        { title: "Move to a warm place", detail: "Get them out of the cold immediately." },
        { title: "Remove wet clothing", detail: "Replace with dry, warm blankets." },
        { title: "Warm gradually", detail: "Use body heat or warm (not hot) drinks. Do not rub skin." }
      ]
    }
  },
  {
    keywords: ["heat", "sun", "exhaustion", "sunstroke", "dehydrat"],
    data: {
      title: "Heat Exhaustion / Stroke", rhythm: false, steps: [
        { title: "Move to a cool place", detail: "Get them into shade or air conditioning." },
        { title: "Cool them down", detail: "Apply cool, wet cloths or spray with water." },
        { title: "Give fluids (if conscious)", detail: "Small sips of water or sports drink." }
      ]
    }
  },
  {
    keywords: ["eye", "blind", "chemical in eye", "poke"],
    data: {
      title: "Eye Injury", rhythm: false, steps: [
        { title: "Do NOT rub the eye", detail: "It can cause further damage." },
        { title: "Flush with water", detail: "If chemicals, flush continuously for 15+ minutes." },
        { title: "Cover both eyes", detail: "Prevents movement of the injured eye." }
      ]
    }
  },
  {
    keywords: ["nose", "nosebleed", "bleeding nose"],
    data: {
      title: "Nosebleed", rhythm: false, steps: [
        { title: "Sit upright and lean forward", detail: "Do NOT lean back. Blood can cause choking." },
        { title: "Pinch the nose", detail: "Pinch the soft part for 10-15 minutes continuously." },
        { title: "Breathe through mouth", detail: "Keep calm and spit out any blood in mouth." }
      ]
    }
  },
  {
    keywords: ["spine", "neck", "back", "paraly"],
    data: {
      title: "Spinal / Neck Injury", rhythm: false, steps: [
        { title: "Do NOT move them", detail: "Hold their head and neck completely still." },
        { title: "Keep them calm", detail: "Tell them not to move their head to look at you." },
        { title: "Only move if in danger", detail: "If you must move them, roll the body as one unit (log roll)." }
      ]
    }
  },
  {
    keywords: ["snake", "venom", "bite", "spider", "rabid", "dog bite"],
    data: {
      title: "Animal / Snake Bite", rhythm: false, steps: [
        { title: "Keep still and calm", detail: "Movement spreads venom faster." },
        { title: "Do NOT suck out venom", detail: "Do not cut the wound or use a tourniquet." },
        { title: "Wash the wound", detail: "Wash with soap and water (unless it's a venomous snake)." }
      ]
    }
  },
  {
    keywords: ["tooth", "teeth", "dental", "knocked out"],
    data: {
      title: "Knocked Out Tooth", rhythm: false, steps: [
        { title: "Handle by the crown", detail: "Do not touch the root of the tooth." },
        { title: "Keep it moist", detail: "Place it in milk, or the person's own saliva." },
        { title: "Stop bleeding", detail: "Have them bite down gently on a clean gauze." }
      ]
    }
  },
  {
    keywords: ["faint", "pass out", "unconscious", "blackout", "collapse"],
    data: {
      title: "Fainting / Unconscious", rhythm: false, steps: [
        { title: "Check breathing", detail: "If not breathing, start CPR immediately." },
        { title: "Lay them flat", detail: "Elevate their legs if possible to restore blood flow." },
        { title: "Recovery position", detail: "If breathing but unresponsive, roll onto their side." }
      ]
    }
  },
  {
    keywords: ["crush", "trapped", "heavy", "pinned"],
    data: {
      title: "Crush Injury", rhythm: false, steps: [
        { title: "Remove the object IF quick", detail: "If crushed for less than 15 mins, remove weight." },
        { title: "Do NOT remove if trapped long", detail: "If trapped >15 mins, wait for medics (Crush Syndrome)." },
        { title: "Stop any bleeding", detail: "Apply pressure to accessible wounds." }
      ]
    }
  }
];

export function getDynamicFirstAid(injury: InjuryId, details?: string): { title: string; steps: FirstAidStep[]; rhythm: boolean } {
  if (injury !== "other" || !details) {
    return FIRST_AID[injury];
  }

  const d = details.toLowerCase();
  
  for (const rule of DYNAMIC_RULES) {
    if (rule.keywords.some(keyword => d.includes(keyword))) {
      return rule.data;
    }
  }

  // Fallback for generic "other" texts
  return FIRST_AID["other"];
}
