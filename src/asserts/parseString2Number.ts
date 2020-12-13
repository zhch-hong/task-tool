export function parseString2Number(object: Record<string, any>) {
  const _obj: Record<string, any> = {};
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element = object[key];
      if (key === 'process' || key === 'awards' || key === 'condition_value') {
        _obj[key] = element.toString();
      } else {
        if (typeof element === 'string' && element !== '') {
          if (Number(element).toString() !== 'NaN') {
            _obj[key] = Number(element);
          } else if (element === 'true') {
            _obj[key] = true;
          } else if (element === 'false') {
            _obj[key] = false;
          } else {
            _obj[key] = element;
          }
        } else {
          _obj[key] = element;
        }
      }
    }
  }
  Object.assign(object, _obj);
}
