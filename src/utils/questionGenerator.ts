
import { Question } from '@/types/quiz';

const createKarimenQuestions = (): Question[] => {
  const baseQuestions = [
    { text: "Cars drive on the left side of the road in Japan.", answer: true, explanation: "In Japan, vehicles are legally required to drive on the left side of the road." },
    { text: "At intersections without traffic signals, vehicles coming from the right have priority.", answer: true, explanation: "At intersections of equal width without signals, vehicles coming from the right have priority." },
    { text: "Pedestrians have priority at crosswalks.", answer: true, explanation: "Pedestrians always have priority at crosswalks, and vehicles must stop and give way to pedestrians." },
    { text: "You must come to a complete stop at red lights.", answer: true, explanation: "At red lights, you must come to a complete stop before the stop line and wait until the light turns green." },
    { text: "Using mobile phones while driving is prohibited.", answer: true, explanation: "Using mobile phones while driving is prohibited by traffic law and carries penalties." },
    { text: "In rainy weather, you need to maintain a longer following distance than usual.", answer: true, explanation: "In rainy weather, roads become slippery and braking distance increases, so you need to maintain a longer following distance." },
    { text: "Yellow lights mean you should speed up to pass through.", answer: false, explanation: "Yellow lights mean caution and prepare to stop. You should only proceed if you cannot stop safely." },
    { text: "Drunk driving is acceptable if it's just a small amount.", answer: false, explanation: "Drunk driving is prohibited by law regardless of the amount and can cause serious accidents." },
    { text: "Seat belts are only required on highways.", answer: false, explanation: "Seat belts are mandatory for all seats on both regular roads and highways." },
    { text: "Speed limits are just guidelines and can be slightly exceeded.", answer: false, explanation: "Speed limits are legally mandated maximum speeds, and exceeding them is a traffic violation." },
  ];

  const questions: Question[] = [];
  for (let i = 0; i < 150; i++) {
    const baseIndex = i % baseQuestions.length;
    const base = baseQuestions[baseIndex];
    questions.push({
      id: i + 1,
      question_text: `${base.text} (Question ${i + 1})`,
      answer: base.answer,
      explanation: base.explanation,
      category: 'Karimen',
      is_premium: i >= 50
    });
  }
  return questions;
};

const createHonMenQuestions = (): Question[] => {
  const baseQuestions = [
    { text: "The minimum speed on highways is 50 km/h.", answer: true, explanation: "The minimum speed on highways is set at 50 km/h, and driving below this speed is a violation." },
    { text: "When overtaking, you should pass on the right side.", answer: true, explanation: "Overtaking should be done on the right side, and you should return to the left lane promptly after overtaking." },
    { text: "Traffic laws do not apply in parking lots.", answer: false, explanation: "Traffic laws may apply in parking lots as well, and safe driving responsibilities are always required." },
    { text: "Checking mirrors is only necessary when starting the vehicle.", answer: false, explanation: "Mirror checks are necessary not only when starting but also when changing lanes, stopping, and at all times while driving." },
    { text: "Motorcycles under 50cc can drive on highways.", answer: false, explanation: "Motorcycles under 50cc (moped) are prohibited from entering highways." },
    { text: "Headlights must be turned on at night.", answer: true, explanation: "Headlights must be turned on at night and during twilight hours to ensure visibility and inform other traffic participants of your vehicle's presence." },
    { text: "At stop signs, you can proceed slowly without coming to a complete stop.", answer: false, explanation: "At stop signs, you must come to a complete stop and then check for safety before proceeding." },
    { text: "Cars with expired vehicle inspection cannot be driven on public roads.", answer: true, explanation: "Cars with expired vehicle inspection cannot be driven on public roads, and violations carry heavy penalties." },
    { text: "Compulsory automobile liability insurance is optional.", answer: false, explanation: "Compulsory automobile liability insurance is legally mandated, and driving without it is illegal." },
    { text: "At railway crossings, you must stop and check for safety.", answer: true, explanation: "At railway crossings, you must come to a complete stop and check left and right for safety before crossing." },
  ];

  const questions: Question[] = [];
  for (let i = 0; i < 150; i++) {
    const baseIndex = i % baseQuestions.length;
    const base = baseQuestions[baseIndex];
    questions.push({
      id: i + 1001, // Different ID range for HonMen
      question_text: `${base.text} (Full License Question ${i + 1})`,
      answer: base.answer,
      explanation: base.explanation,
      category: 'HonMen',
      is_premium: i >= 50
    });
  }
  return questions;
};

export const generateAllQuestions = (): Question[] => {
  return [...createKarimenQuestions(), ...createHonMenQuestions()];
};
