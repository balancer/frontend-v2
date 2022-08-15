export type Sticky = 'horizontal' | 'vertical' | 'both';
export type Data = any;
export type ColumnDefinition<T = Data> = {
  // Column Header Label
  name: string;
  // Unique ID
  id: string;
  // Key or function to access data from the row
  accessor: string | ((row: T) => string);
  // Slot ID for custom rendering the cell
  Cell?: string;
  // Slot ID for custom rendering a header
  Header?: string;
  // Is the column sortable
  isSortable?: boolean;
  // Extra classes to supply to the column. E.g. min width
  className?: string;
  // Left or right aligned content. E.g. Numbers should be right aligned
  align?: 'left' | 'right' | 'center';
  // Should the column width grow to fit available space?
  noGrow?: boolean;
  // Set to true to hide the column
  hidden?: boolean;
  // Accessor for sorting purposes
  sortKey?: string | ((row: T) => unknown);

  width?: number;

  totalsCell?: string;

  cellClassName?: string;
};
