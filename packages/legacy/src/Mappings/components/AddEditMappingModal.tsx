import * as React from 'react';
import * as yup from 'yup';
import {
  Modal,
  Button,
  Form,
  Grid,
  GridItem,
  Stack,
  Flex,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFormField, useFormState, ValidatedTextInput } from '@migtools/lib-ui';
import { MappingBuilder, IMappingBuilderItem, mappingBuilderItemsSchema, getDefaultTarget } from './MappingBuilder';
import { getMappingFromBuilderItems } from './MappingBuilder/helpers';
import {
  MappingType,
  IOpenShiftProvider,
  Mapping,
  SourceInventoryProvider,
} from 'legacy/src/queries/types';
import {
  useInventoryProvidersQuery,
  useMappingResourceQueries,
  useCreateMappingMutation,
  getMappingNameSchema,
  useMappingsQuery,
  usePatchMappingMutation,
  findProvidersByRefs,
  useClusterProvidersQuery,
} from 'legacy/src/queries';
import { usePausedPollingEffect } from 'legacy/src/common/context';
import { LoadingEmptyState } from 'legacy/src/common/components/LoadingEmptyState';

import './AddEditMappingModal.css';
import { UseQueryResult } from 'react-query';
import { useEditingMappingPrefillEffect } from './helpers';
import { IKubeList } from 'legacy/src/client/types';
import {
  ResolvedQuery,
  ResolvedQueries,
  QuerySpinnerMode,
} from 'legacy/src/common/components/ResolvedQuery';
import { ProviderSelect } from 'legacy/src/common/components/ProviderSelect';
import { ENV } from 'legacy/src/common/constants';

interface IAddEditMappingModalProps {
  title: string;
  onClose: () => void;
  mappingType: MappingType;
  mappingBeingEdited: Mapping | null;
  setActiveMapType: React.Dispatch<React.SetStateAction<MappingType>>;
  namespace?:string;
  isFixed?:boolean;
}

const useMappingFormState = (
  mappingsQuery: UseQueryResult<IKubeList<Mapping>>,
  mappingBeingEdited: Mapping | null
) =>
  useFormState({
    name: useFormField(
      '',
      getMappingNameSchema(mappingsQuery, mappingBeingEdited).label('Name').required()
    ),
    sourceProvider: useFormField<SourceInventoryProvider | null>(
      null,
      yup.mixed<SourceInventoryProvider>().label('Source provider').required()
    ),
    targetProvider: useFormField<IOpenShiftProvider | null>(
      null,
      yup.mixed<IOpenShiftProvider>().label('Target provider').required()
    ),
    builderItems: useFormField<IMappingBuilderItem[]>(
      [],
      mappingBuilderItemsSchema
    ),
  });

export type MappingFormState = ReturnType<typeof useMappingFormState>;

export const AddEditMappingModal: React.FunctionComponent<IAddEditMappingModalProps> = ({
  title,
  onClose,
  mappingType,
  mappingBeingEdited,
  setActiveMapType,
  namespace = ENV.DEFAULT_NAMESPACE,
  isFixed = false,
}: IAddEditMappingModalProps) => {
  usePausedPollingEffect();

  const mappingsQuery = useMappingsQuery(mappingType, namespace);
  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery(namespace);

  const form = useMappingFormState(mappingsQuery, mappingBeingEdited);

  const mappingBeingEditedProviders = findProvidersByRefs(
    mappingBeingEdited?.spec.provider || null,
    inventoryProvidersQuery
  );

  const mappingResourceQueries = useMappingResourceQueries(
    form.values.sourceProvider || mappingBeingEditedProviders.sourceProvider,
    form.values.targetProvider || mappingBeingEditedProviders.targetProvider,
    mappingType
  );

  const { isDonePrefilling } = useEditingMappingPrefillEffect(
    form,
    mappingBeingEdited,
    mappingType,
    mappingBeingEditedProviders,
    inventoryProvidersQuery,
    mappingResourceQueries
  );

  // If you change providers, reset the mapping selections.
  React.useEffect(() => {
    if (isDonePrefilling) {
      form.fields.builderItems.setValue([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.sourceProvider, form.values.targetProvider]);

  const createMappingMutation = useCreateMappingMutation(mappingType, namespace, onClose);
  const patchMappingMutation = usePatchMappingMutation(mappingType, namespace, onClose);

  const mutateMapping = !mappingBeingEdited
    ? createMappingMutation.mutate
    : patchMappingMutation.mutate;
  const mutationResult = !mappingBeingEdited ? createMappingMutation : patchMappingMutation;

  return (
    <Modal
      className="addEditMappingModal"
      variant="medium"
      title={title}
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <ResolvedQuery
            result={mutationResult}
            errorTitle={`Cannot ${!mappingBeingEdited ? 'create' : 'save'} mapping`}
            spinnerMode={QuerySpinnerMode.Inline}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              onClick={() => {
                if (form.values.sourceProvider && form.values.targetProvider) {
                  const generatedMapping = getMappingFromBuilderItems({
                    mappingType,
                    mappingName: form.values.name,
                    generateName: null,
                    sourceProvider: form.values.sourceProvider,
                    targetProvider: form.values.targetProvider,
                    builderItems: form.values.builderItems,
                  });
                  mutateMapping(generatedMapping);
                }
              }}
              isDisabled={!form.isDirty || !form.isValid || mutationResult.isLoading}
            >
              {!mappingBeingEdited ? 'Create' : 'Save'}
            </Button>
            <Button
              id="modal-cancel-button"
              key="cancel"
              variant="link"
              onClick={onClose}
              isDisabled={mutationResult.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <Form className="extraSelectMargin">
        <ResolvedQueries
          results={[inventoryProvidersQuery, clusterProvidersQuery]}
          errorTitles={[
            'Cannot load provider inventory data',
            'Cannot load providers from cluster',
          ]}
        >
          {!isDonePrefilling ? (
            <LoadingEmptyState />
          ) : (
            <>
              <Grid hasGutter className={spacing.mbMd}>
                <GridItem md={6}>
                  <FormGroup label="Namespace (default to migration operator namespace)" fieldId="mapping-namespace">
                    <TextInput
                      id="mapping-namespace"
                      aria-label="Mapping namespace"
                      value={namespace}
                      isDisabled={true}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem md={6} className={spacing.mbMd}>
                  <ValidatedTextInput
                    field={form.fields.name}
                    isRequired
                    fieldId="mapping-name"
                    inputProps={{
                      isDisabled: !!mappingBeingEdited,
                    }}
                  />
                </GridItem>
                <GridItem md={6}>
                  <ProviderSelect
                    providerRole="source"
                    field={form.fields.sourceProvider}
                    notReadyTooltipPosition="right"
                    menuAppendTo="parent"
                    maxHeight="40vh"
                    namespace={namespace}
                  />
                </GridItem>
                <GridItem md={6}>
                  <ProviderSelect
                    providerRole="target"
                    field={form.fields.targetProvider}
                    menuAppendTo="parent"
                    maxHeight="40vh"
                    namespace={namespace}
                  />
                </GridItem>
              </Grid>
              {form.values.sourceProvider && form.values.targetProvider ? (
                <ResolvedQueries
                  results={mappingResourceQueries.queries}
                  errorTitles={[
                    'Cannot load source provider resources',
                    'Cannot load target provider resources',
                  ]}
                >
                  <MappingBuilder
                    mappingType={mappingType}
                    sourceProviderType={form.values.sourceProvider?.type || 'vsphere'}
                    availableSources={mappingResourceQueries.availableSources}
                    availableTargets={mappingResourceQueries.availableTargets}
                    builderItems={form.values.builderItems.length ? 
                      form.values.builderItems : [{source: null, target: getDefaultTarget(mappingResourceQueries.availableTargets, mappingType)}]}
                    setBuilderItems={form.fields.builderItems.setValue}
                  />
                </ResolvedQueries>
              ) : null}
            </>
          )}
        </ResolvedQueries>
      </Form>
    </Modal>
  );
};
