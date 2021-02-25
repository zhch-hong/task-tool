/**
 * 删除现有的数据，递归删除
 * @param sheet
 * @param col
 * @param id
 */
function deleteExisting(
  list: Record<string, string>[],
  col: string,
  value: number | string
): Array<Record<string, any>> {
  const index = list.findIndex((item) => item[col] == value);
  const deleteList: Array<Record<string, any>> = [];
  if (index !== -1) {
    const element = list.splice(index, 1);
    deleteList.push(element);
    return deleteExisting(list, col, value).concat(...deleteList);
  }

  return deleteList;
}

/**
 * 将一个对象内能转换为Number类型的String属性值转为Number
 * （process awards condition_value 这三个属性需要为String类型）
 * @param object
 */
function parseString2Number(object: Record<string, any>) {
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

function stringify(params: any) {
  return JSON.parse(JSON.stringify(params));
}

export { getSheet } from './likeSheet';
export { readFileText, writeFileText, readFileBinary, writeFileBinary } from '@/utils/fileSystem';
export { getTreeData, getTreeDataDefault } from './filtFileTree';
export { propertySlice } from './propertySlice';
export { sheet2json, workbook2map } from './sheetToJson';
export { setColumnKey } from './setColumnKey';
export { updateBase, updateProcess, updateSource } from './writeTask';
export { readExcelToMap, writeMapToExcel } from './xlsxIO';
export { writeChanged } from './write-changed';
export { stringify, parseString2Number, deleteExisting };
export { workspanceExcel } from './workspace-excel';
export { openInExcel, revealInFileExplorer } from './reveal-file-way';
export { readLastFile } from './lastOpenFile';
