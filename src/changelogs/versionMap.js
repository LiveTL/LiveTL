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
      else if(v[2] <= 6) return '6.1.6';
      else if(v[2] <= 7) return '6.1.7';
      else if(v[2] <= 8) return '6.1.8';
      else if(v[2] <= 9) return '6.1.9';
      else if(v[2] <= 10) return '6.1.10';
      break;
    }
    case 2: {
      if(v[2] <= 0) return '6.2.0';
      if(v[2] <= 1) return '6.2.1';
      if(v[2] <= 2) return '6.2.2';
      break;
    }
    case 3: {
      if(v[2] <= 1) return '6.3.1';
      if(v[2] <= 2) return '6.3.2';
      if(v[2] <= 3) return '6.3.3';
      if(v[2] <= 5) return '6.3.5';
    }
    }
  }
  }
  return '';
}