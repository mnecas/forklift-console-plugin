import { K8sConditionStatus } from '@kubev2v/common/components/types';
import { PlanState, ProviderType } from '@kubev2v/legacy/common/constants';
import { PlanType } from '@kubev2v/legacy/queries/types';

import { ProviderStatus } from './types';

export const PROVIDERS: Record<ProviderType, (t: (k: string) => string) => string> = {
  vsphere: (t) => t('VMware'),
  ovirt: (t) => t('oVirt'),
  openstack: (t) => t('OpenStack'),
  openshift: (t) => t('KubeVirt'),
};

export const CONDITIONS: Record<K8sConditionStatus, (t: (k: string) => string) => string> = {
  True: (t) => t('True'),
  False: (t) => t('False'),
  Unknown: (t) => t('Unknown'),
};

export const PROVIDER_STATUS: Record<ProviderStatus, (t: (k: string) => string) => string> = {
  Ready: (t) => t('Ready'),
  ConnectionFailed: (t) => t('Connection Failed'),
  Staging: (t) => t('Staging'),
  ValidationFailed: (t) => t('Validation Failed'),
  Unknown: (t) => t('Unknown'),
};

export const PLAN_TYPE: Record<PlanType, (t: (k: string) => string) => string> = {
  Warm: (t) => t('Warm'),
  Cold: (t) => t('Cold'),
};

// based on filterValue provided by getMigStatusState
export const PLAN_STATUS_FILTER: Record<PlanState, (t: (k: string) => string) => string> = {
  // group: Running
  Starting: (t) => t('Running'),
  Copying: (t) => t('Running'),
  'Copying-CutoverScheduled': (t) => t('Running'),
  PipelineRunning: (t) => t('Running'),
  // group: Failed
  'Finished-Failed': (t) => t('Failed'),
  'Copying-Failed': (t) => t('Failed'),
  // group: Canceled
  Canceled: (t) => t('Canceled'),
  'Copying-Canceled': (t) => t('Canceled'),
  // not grouped
  'Finished-Succeeded': (t) => t('Succeeded'),
  'Finished-Incomplete': (t) => t('Finished - Incomplete'),
  Archived: (t) => t('Archived'),
  'NotStarted-NotReady': (t) => t('Not Ready'),
  'NotStarted-Ready': (t) => t('Ready'),
  // group: Other - states missing in the original mapping
  StartingCutover: (t) => t('Other'),
  Archiving: (t) => t('Other'),
  Unknown: (t) => t('Other'),
};
