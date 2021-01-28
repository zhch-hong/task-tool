import XLSX, { CellAddress } from 'xlsx';

function excel2json(path: string) {
  const wb = XLSX.readFile(path);
  const map: Map<string, Record<string, Array<Record<string | number, any>>>> = new Map();

  wb.SheetNames.forEach((name) => {
    const sheet = wb.Sheets[name];
    const json = XLSX.utils.sheet_to_json<Record<string | number, any>>(sheet);
    const columns = getTableColumns(sheet);
    const fullKeys = columns.map((c) => c.field);

    const data: Array<Record<string, any>> = json.map((object) => {
      const _object: Record<string, any> = {};

      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          const element = object[key];
          _object[key] = element;
        }
      }

      fullProperty(fullKeys, _object);
      return _object;
    });

    const value = {
      columns,
      data,
    };

    map.set(name, value);
  });

  return map;
}

function fullProperty(fullKeys: Array<string>, object: Record<string | number, any>): void {
  fullKeys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(object, key)) {
      object[key] = null;
    }
  });
}

function getTableColumns(sheet: XLSX.WorkSheet): Array<Record<string, string>> {
  const columns: Array<Record<string, string>> = [];
  const ref = sheet['!ref'];

  if (typeof ref !== 'undefined') {
    const range = XLSX.utils.decode_range(ref);

    for (let col = range.s.c; col <= range.e.c; col++) {
      const address: CellAddress = { c: col, r: range.s.r };
      const cell: XLSX.CellObject | undefined = sheet[XLSX.utils.encode_cell(address)];

      if (cell) {
        const name = XLSX.utils.format_cell(cell);
        columns.push({ title: name, field: name });
      }
    }
  }

  return columns;
}

export { excel2json };
