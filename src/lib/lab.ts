export type PartKind = 'battery' | 'resistor' | 'led' | 'switch' | 'capacitor';
export interface Part { id: string; kind: PartKind; value: number; x: number; y: number }
export interface Wire { from: string; to: string }
export function analyzeCircuit(parts: Part[], wires: Wire[], time: number) {
  const battery = parts.find(p => p.kind === 'battery');
  if (!battery) return { closed: false, current: 0, voltage: 0, resistance: 0, charge: 0, warning: 'Add a battery.' };
  const visited = new Set<string>(); let cursor = battery.id; let closed = false;
  for (let i = 0; i <= parts.length; i++) {
    if (visited.has(cursor)) { closed = cursor === battery.id; break; }
    visited.add(cursor);
    const next = wires.find(w => w.from === cursor); if (!next) break; cursor = next.to;
  }
  const active = parts.filter(p => visited.has(p.id));
  closed = closed && active.length > 1 && !active.some(p => p.kind === 'switch' && p.value === 0);
  const resistance = active.filter(p => p.kind === 'resistor').reduce((sum,p) => sum + p.value, 0);
  const led = active.some(p => p.kind === 'led');
  const voltage = battery.value;
  const cap = active.find(p => p.kind === 'capacitor');
  const tau = Math.max(resistance, 1) * (cap?.value ?? 0) / 1e6;
  const charge = cap && closed ? voltage * (1 - Math.exp(-time / Math.max(tau, .001))) : 0;
  const current = closed ? Math.max(0, voltage - (led ? 2 : 0)) / Math.max(resistance, 1) * (cap ? Math.exp(-time / Math.max(tau,.001)) : 1) : 0;
  return { closed, current, voltage, resistance, charge, warning: !closed ? 'Open circuit' : resistance === 0 ? 'Short circuit — add resistance.' : led && current > .03 ? 'LED overcurrent — increase resistance.' : 'Circuit running' };
}
export const CHALLENGES = [
  { id: 'sum', title: 'Sum two numbers', topic: 'Input & arithmetic', prompt: 'Read two integers from input and print their sum.', input: '7 5', expected: '12', tests: [['7 5','12'],['-3 8','5'],['0 0','0']], starters: { JavaScript: 'const [a, b] = input.trim().split(/\\s+/).map(Number);\nconsole.log(a + b);', Python: 'a, b = map(int, input().split())\nprint(a + b)' } },
  { id: 'even', title: 'Even or odd', topic: 'Conditionals', prompt: 'Read an integer. Print EVEN if it is even, otherwise ODD.', input: '8', expected: 'EVEN', tests: [['8','EVEN'],['7','ODD'],['0','EVEN']], starters: { JavaScript: 'const n = Number(input);\n// Print EVEN or ODD\n', Python: 'n = int(input())\n# Print EVEN or ODD\n' } },
  { id: 'factorial', title: 'Factorial', topic: 'Loops', prompt: 'Read an integer n (0–10). Print n factorial. 0 factorial is 1.', input: '5', expected: '120', tests: [['5','120'],['0','1'],['7','5040']], starters: { JavaScript: 'const n = Number(input);\nlet result = 1;\n// Multiply from 1 to n\nconsole.log(result);', Python: 'n = int(input())\nresult = 1\n# Multiply from 1 to n\nprint(result)' } },
  { id: 'max', title: 'Largest number', topic: 'Arrays', prompt: 'Read space-separated integers and print the largest.', input: '4 9 2', expected: '9', tests: [['4 9 2','9'],['-3 -1 -8','-1'],['42','42']], starters: { JavaScript: 'const numbers = input.trim().split(/\\s+/).map(Number);\n// Find the largest\n', Python: 'numbers = list(map(int, input().split()))\n# Find the largest\n' } },
  { id: 'reverse', title: 'Reverse a word', topic: 'Strings', prompt: 'Read a word and print it reversed.', input: 'vidya', expected: 'aydiv', tests: [['vidya','aydiv'],['level','level'],['abc','cba']], starters: { JavaScript: '// input contains the word\n', Python: 'word = input()\n' } },
] as const;
export function normalizeOutput(output: string) { return output.trim().replace(/\r/g, ''); }
