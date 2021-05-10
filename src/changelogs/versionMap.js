export default function(version) {
  const v = version.split('.').map(d => parseInt(d));
  if (v[0] == 6) {
    switch (v[1]) {
    case 0: return '6.0';
    case 1: return '6.1';
    }
  }
  return '';
}