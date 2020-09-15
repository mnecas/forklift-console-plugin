import * as React from 'react';
import {
  Mapping,
  MappingType,
  INetworkMapping,
  IStorageMapping,
  INetworkMappingItem,
  IStorageMappingItem,
} from '../types';
import { Level, LevelItem, Button, Pagination } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  sortable,
  classNames as classNamesTransform,
  IRow,
  expandable,
} from '@patternfly/react-table';
import { useSelectionState } from '@konveyor/lib-ui';
import { useSortState, usePaginationState } from '@app/common/hooks';
import { IVMwareProvider } from '@app/Providers/types';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { OutlinedHddIcon, NetworkIcon, DatabaseIcon } from '@patternfly/react-icons';
import ProviderStatus from '@app/Providers/components/ProvidersTable/ProviderStatus';
import VMwareProviderActionsDropdown from '@app/Providers/components/ProvidersTable/VMware/VMwareProviderActionsDropdown';
import VMwareProviderHostsTable from '@app/Providers/components/ProvidersTable/VMware/VMwareProviderHostsTable';
import MappingsActionsDropdown from './MappingsActionsDropdown';

interface IMappingsTableProps {
  mappings: Mapping[];
  mappingType: string;
  toggleAddEditModal: () => void;
}

const MappingsTable: React.FunctionComponent<IMappingsTableProps> = ({
  mappings,
  mappingType,
  toggleAddEditModal,
}: IMappingsTableProps) => {
  const getSortValues = (mapping: Mapping) => {
    const { name, provider } = mapping;
    return [name, provider.source.name, provider.target.name, ''];
  };

  const { sortBy, onSort, sortedItems } = useSortState(mappings, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const {
    selectedItems: expandedMappings,
    toggleItemSelected: toggleMappingExpanded,
    isItemSelected,
  } = useSelectionState<Mapping>({
    items: sortedItems,
    isEqual: (a, b) => a.name === b.name,
  });

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable], cellFormatters: [expandable] },
    { title: 'Source provider', transforms: [sortable] },
    { title: 'Target provider', transforms: [sortable] },
    {
      title: <>{mappingType === MappingType.Network ? 'Network mappings' : 'Storage mappings'}</>,
      transforms: [sortable],
    },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
    { title: '' },
  ];

  const rows: IRow[] = [];
  currentPageItems.forEach((mapping: Mapping) => {
    const { name, provider, items } = mapping;
    //TODO: update to use isItemSelected from useSelectionState hook when we start using redux
    const isExpanded = isItemSelected(mapping);
    rows.push({
      meta: { mapping },
      isOpen: isExpanded,
      cells: [
        name,
        provider.source?.name,
        provider.target?.name,
        {
          title: (
            <>
              {mappingType === MappingType.Network ? (
                <NetworkIcon key="hosts-icon" />
              ) : (
                <DatabaseIcon key="storage-icon" />
              )}{' '}
              {items ? items.length : 0}
            </>
          ),
        },
        {
          title: <MappingsActionsDropdown />,
        },
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        cells: [
          {
            title: (
              <div>
                TODO: mapping details table
                {/* <MappingDetailsTable {...props} /> */}
              </div>
            ),
            props: { colSpan: columns.length, className: tableStyles.modifiers.noPadding },
          },
        ],
      });
    }
  });
  // I wonder if we can make use of generics right in the props interface?
  // Might be overkill: https://wanago.io/2020/03/09/functional-react-components-with-generic-props-in-typescript/

  // TODO remove this stuff, just demonstrating how we can handle these types maybe?
  // These kind of checks can be in helpers instead of here.
  mappings.forEach((m) => {
    if (m.type === MappingType.Network) {
      const mapping = m as INetworkMapping;
      console.log('Do something with network mapping', mapping);
    }
    if (m.type === MappingType.Storage) {
      const mapping = m as IStorageMapping;
      console.log('Do something with storage mapping', mapping);
    }
    return {};
  });

  return (
    <>
      <Level>
        <LevelItem>
          <Button
            key="confirm"
            variant="primary"
            onClick={() => {
              toggleAddEditModal();
            }}
          >
            Add mapping
          </Button>
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
        </LevelItem>
      </Level>
      <Table
        aria-label="Mappings table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onCollapse={(event, rowKey, isOpen, rowData) => {
          toggleMappingExpanded(rowData.meta.mapping);
        }}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        {...paginationProps}
        widgetId="providers-table-pagination-bottom"
        variant="bottom"
      />
    </>
  );
};

export default MappingsTable;