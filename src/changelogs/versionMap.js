export default function(version) {
  const v = version.split('.').map(d => parseInt(d));
  switch (v[0]) {
  case 6: {
    switch (v[1]) {
    case 0: return '6.0';
    case 1: {
      if(v[2] <= 1) return '6.1.0';
      else if(v[2] <= 3) return '6.1.2';
      else if(v[2] <= 4) return '6.1.4';
      else if(v[2] <= 5) return '6.1.5';
    }
    }
  }
  }
  return '';
}