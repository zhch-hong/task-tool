export function propertySlice(
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> {
  const object: Record<string, any> = {};
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        object[key] = source[key];
      } else {
        object[key] = target[key];
      }
    }
  }
  return object;
}
