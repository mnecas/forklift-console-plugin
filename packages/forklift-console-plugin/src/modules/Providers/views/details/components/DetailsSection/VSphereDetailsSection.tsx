import React from 'react';
import {
  EditProviderURLModal,
  EditProviderVDDKImage,
  useModal,
} from 'src/modules/Providers/modals';
import { HELP_LINK_HREF } from 'src/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Text } from '@patternfly/react-core';

import { DetailsItem, OwnerReferencesItem } from '../../../../utils';

import { DetailsSectionProps } from './DetailsSection';

export const VSphereDetailsSection: React.FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { provider, inventory } = data;

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <DetailsItem
        title={t('Type')}
        content={provider?.spec?.type}
        moreInfoLink={HELP_LINK_HREF}
        helpContent={
          <Text>{t(`Allowed values are openshift, ovirt, vsphere, and openstack.`)}</Text>
        }
        crumbs={['Provider', 'spec', 'type']}
      />

      <DetailsItem
        title={t('Product')}
        content={inventory?.['product'] || <span className="text-muted">{t('Empty')}</span>}
        helpContent={<Text>{t(`VMware only: vSphere product name.`)}</Text>}
        crumbs={['Inventory', 'providers', `${provider.spec.type}`, '[UID]']}
      />

      <DetailsItem
        title={t('Name')}
        content={provider?.metadata?.name}
        moreInfoLink={'https://kubernetes.io/docs/concepts/overview/working-with-objects/names'}
        helpContent={
          <Text>
            {t(
              'Name is primarily intended for creation idempotence and configuration definition. Cannot be updated.',
            )}
          </Text>
        }
        crumbs={['Provider', 'metadata', 'name']}
      />

      <DetailsItem
        title={t('Namespace')}
        content={
          <ResourceLink
            groupVersionKind={{ version: 'v1', kind: 'Namespace' }}
            name={provider?.metadata?.namespace}
            namespace={provider?.metadata?.namespace}
          />
        }
        moreInfoLink={
          'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces'
        }
        helpContent={t(
          `Namespace defines the space within which each name must be unique.
       An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation.
       Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty.`,
        )}
        crumbs={['Provider', 'metadata', 'namespace']}
      />

      <DetailsItem
        title={t('URL')}
        content={provider?.spec?.url || <span className="text-muted">{t('Empty')}</span>}
        moreInfoLink={
          'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces'
        }
        helpContent={<Text>{t(`The provider URL. Empty may be used for the host provider.`)}</Text>}
        crumbs={['Provider', 'spec', 'url']}
        onEdit={() => showModal(<EditProviderURLModal resource={provider} />)}
      />

      <DetailsItem
        title={t('Secret')}
        content={
          provider?.spec?.secret.name ? (
            <ResourceLink
              groupVersionKind={{ version: 'v1', kind: 'Secret' }}
              name={provider?.spec?.secret.name}
              namespace={provider?.spec?.secret.namespace}
            />
          ) : (
            <span className="text-muted">{t('No secret')}</span>
          )
        }
        helpContent={t(
          `References a secret containing credentials and other confidential information. Empty may be used for the host provider.`,
        )}
        crumbs={['Provider', 'spec', 'secret']}
      />

      <DetailsItem
        title={t('Created at')}
        content={<Timestamp timestamp={provider?.metadata?.creationTimestamp} />}
        helpContent={
          <Text>
            {t(
              `CreationTimestamp is a timestamp representing the server time when this object was created.
          It is not guaranteed to be set in happens-before order across separate operations.
          Clients may not set this value. It is represented in RFC3339 form and is in UTC.`,
            )}
          </Text>
        }
        crumbs={['Provider', 'metadata', 'creationTimestamp']}
      />

      <DetailsItem
        title={t('vddk Init Image')}
        content={
          provider?.spec?.settings?.['vddkInitImage'] || (
            <span className="text-muted">{t('Empty')}</span>
          )
        }
        helpContent={<Text>{t(`VMware only: Specify the VDDK image that you created.`)}</Text>}
        crumbs={['Provider', 'spec', 'settings', 'vddkInitImage']}
        onEdit={() => showModal(<EditProviderVDDKImage resource={provider} />)}
      />

      <DetailsItem
        title={t('Owner')}
        content={<OwnerReferencesItem resource={provider} />}
        helpContent={
          <Text>
            {t(
              `List of objects depended by this object. If ALL objects in the list have been deleted, this object will be garbage collected.
          If this object is managed by a controller, then an entry in this list will point to this controller,
          with the controller field set to true. There cannot be more than one managing controller.`,
            )}
          </Text>
        }
        crumbs={['Provider', 'metadata', 'ownerReferences']}
      />
    </DescriptionList>
  );
};