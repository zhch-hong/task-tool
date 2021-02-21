export type SheetName = 'task' | 'process_data' | 'source' | 'condition' | 'award_data';

export type WorkbookMap = Map<SheetName, Record<string, string>[]>;

export type TemplateType = 'base' | 'process' | 'source';
