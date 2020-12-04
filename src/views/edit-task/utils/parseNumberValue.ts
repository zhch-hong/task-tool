export function strValToNumber(object: Record<string, any>) {
  const _object: Record<string, any> = {};
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element = object[key];
      if (
        typeof element === 'string' &&
        parseFloat(element).toString() !== 'NaN'
      ) {
        _object[key] = parseFloat(element);
      } else {
        _object[key] = element;
      }
    }
  }
  return _object;
}
