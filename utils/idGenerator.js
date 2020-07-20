export default () => {
  return (new Date().valueOf() * Math.round(Math.random() * 100)).toString();
};
