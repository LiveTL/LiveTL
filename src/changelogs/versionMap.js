export default function(version) {
  const v = version.split('.').map(d => parseInt(d));
  if (v[0] == 6 && v[1] == 0) return '6.0';
  return '';
}