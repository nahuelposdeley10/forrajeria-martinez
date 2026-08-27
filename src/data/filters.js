export const toKey = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const STAGE_TAGS = [
  { key: 'adulto', label: 'Adulto', re: /(^|\W)adult(?:o|os|a|as)?(\W|$)/ },
  { key: 'cachorro', label: 'Cachorro', re: /cachorr|puppy|kitten|gatit/ },
  { key: 'senior', label: 'Senior', re: /senior|vitality|vitalidad|mayores|\b7\s*a[ñn]os/ },
]

export const SIZE_TAGS = [
  { key: 'pequenio', label: 'Pequeño', re: /peque[ñn]|mini|\bchic[oa]/ },
  { key: 'mediano', label: 'Mediano', re: /median|medium|med-?grande/ },
  { key: 'grande', label: 'Grande', re: /grand|large/ },
]

export const BREED_DEFS = [
  { key: 'caniche', label: 'Caniche', re: /caniche/ },
  { key: 'ovejero', label: 'Ovejero', re: /ovejero/ },
  { key: 'salchicha', label: 'Salchicha (Dachshund)', re: /salchicha|dachshund/ },
  { key: 'bulldog', label: 'Bulldog', re: /bulldog/ },
  { key: 'labrador', label: 'Labrador', re: /labrador/ },
  { key: 'boxer', label: 'Boxer', re: /boxer/ },
  { key: 'golden', label: 'Golden', re: /golden/ },
  { key: 'cocker', label: 'Cocker', re: /cocker/ },
]