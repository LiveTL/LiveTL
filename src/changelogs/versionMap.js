const changelogSequence = [
  '6.0',
  '6.1.0',
  '6.1.2',
  '6.1.4',
  '6.1.5',
  '6.1.6',
  '6.1.7',
  '6.1.8',
  '6.1.9',
  '6.1.10',
  '6.2.0',
  '6.2.1',
  '6.2.2',
  '6.3.1',
  '6.3.2',
  '6.3.3',
  '6.3.5',
  '6.3.6',
  '6.4',
  '6.4.2',
  '6.4.3'
];
// eslint-disable-next-line no-unused-vars
export default version => {
  // const v = version.split('.').map(d => parseInt(d));
  return changelogSequence[changelogSequence.length - 1];
};
