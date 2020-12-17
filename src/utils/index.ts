export { getRowMap } from './findRow';
export { getSheet } from './likeSheet';
export { readFile, writeFile } from './fileStream';
export { getTreeData, getTreeDataDefault } from './filtFileTree';
export { propertySlice } from './propertySlice';
export { sheet2json, workbook2map } from './sheetToJson';
export { setColumnKey } from './setColumnKey';
export { parseString2Number } from '../asserts/parseString2Number';
export { stringify } from './stringify';
export { updateBase, updateProcess, updateSource } from './updateTask';
export { excel2map, map2excel } from './cutoverExcelMap';

/**
 * 删除现有的数据，递归删除
 * @param sheet
 * @param col
 * @param id
 */
export function deleteExisting(
  list: Record<string, string>[],
  col: string,
  value: number | string
) {
  const index = list.findIndex(
    (item) => item[col].toString() === value.toString()
  );
  if (index !== -1) {
    list.splice(index, 1);
    deleteExisting(list, col, value);
  }
}
