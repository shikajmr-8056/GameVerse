export interface MathQ { text: string; answer: number; topic: string; options: number[] }

const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function opts(ans: number): number[] {
  const s = new Set([ans]);
  while (s.size < 4) s.add(ans + r(-10, 10) || ans + s.size);
  return [...s].sort(() => Math.random() - 0.5);
}

export function makeQuestion(grade: number, difficulty: 1 | 2 | 3 = 2): MathQ {
  const k = difficulty;
  let text = "", answer = 0, topic = "";
  if (grade <= 6) {
    const t = r(0, 3);
    if (t === 0) { const a = r(10, 40 * k), b = r(5, 30 * k); text = `${a} + ${b} = ?`; answer = a + b; topic = "Addition"; }
    else if (t === 1) { const a = r(2, 6 + 3 * k), b = r(2, 9 + k); text = `${a} × ${b} = ?`; answer = a * b; topic = "Multiplication"; }
    else if (t === 2) { const b = r(2, 9), q = r(2, 5 + 3 * k); text = `${b * q} ÷ ${b} = ?`; answer = q; topic = "Division"; }
    else { const l = r(2, 9 + k), w = r(2, 8); text = `Perimeter of a ${l} × ${w} rectangle?`; answer = 2 * (l + w); topic = "Geometry"; }
  } else if (grade <= 8) {
    const t = r(0, 3);
    if (t === 0) { const p = [10, 20, 25, 50][r(0, 3)], n = r(1, 8) * 20; text = `${p}% of ${n} = ?`; answer = (p * n) / 100; topic = "Percentages"; }
    else if (t === 1) { const a = r(-15, 15), b = r(-15, 15); text = `(${a}) + (${b}) = ?`; answer = a + b; topic = "Integers"; }
    else if (t === 2) { const x = r(1, 10 * k), a = r(2, 6), b = r(1, 20); text = `If ${a}x + ${b} = ${a * x + b}, x = ?`; answer = x; topic = "Algebra"; }
    else { const a = r(1, 5), b = r(1, 5), m = r(2, 6); text = `${a}:${b} = ${a * m}:?`; answer = b * m; topic = "Ratios"; }
  } else if (grade <= 10) {
    const t = r(0, 2);
    if (t === 0) { const x = r(-9, 12), a = r(2, 9), b = r(-20, 20), c = r(1, 4); text = `Solve: ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${a * x + b + c * 0}`; answer = x; topic = "Linear equations"; }
    else if (t === 1) { const nums = Array.from({ length: 5 }, () => r(1, 20)); const s = nums.reduce((a, b) => a + b, 0); const fix = 5 - (s % 5); nums[4] += fix === 5 ? 0 : fix; text = `Mean of ${nums.join(", ")}?`; answer = nums.reduce((a, b) => a + b, 0) / 5; topic = "Statistics"; }
    else { const tri = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]][r(0, 3)]; text = `Right triangle legs ${tri[0]} and ${tri[1]}. Hypotenuse?`; answer = tri[2]; topic = "Geometry"; }
  } else {
    const t = r(0, 2);
    if (t === 0) { const a = r(2, 5), n = r(2, 4); text = `d/dx (${a}x^${n}) at x = 1?`; answer = a * n; topic = "Calculus"; }
    else if (t === 1) { const n = r(4, 7); text = `${n}C2 = ?`; answer = (n * (n - 1)) / 2; topic = "Combinatorics"; }
    else { const a = r(1, 5), d = r(2, 6), n = r(5, 10); text = `AP: a=${a}, d=${d}. Term ${n}?`; answer = a + (n - 1) * d; topic = "Sequences"; }
  }
  return { text, answer, topic, options: opts(answer) };
}
