export default function(version) {
  const v = version.split('.').map(d => parseInt(d));
  switch (v[0]) {
  case 6: {
    switch (v[1]) {
    case 0: return '6.0';
    case 1: {
      switch(v[2]){
      case 0: return '6.1.0';
      case 1: return '6.1.1';
      }
    }
    }
  }
  }
  return '';
}