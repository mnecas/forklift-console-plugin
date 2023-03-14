import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PROVIDERS_REFERENCE } from 'legacy/src/common/constants';
import { CreatePlanButton } from 'legacy/src/Plans/components/CreatePlanButton';
import { createK8sPath } from 'legacy/src/queries/helpers';
import ForkliftEmptyState from 'src/components/empty-states/ForkliftEmptyState';
import automationIcon from 'src/components/empty-states/images/automation.svg';
import { HELP_LINK_HREF } from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';

import { Flex, FlexItem } from '@patternfly/react-core';

import { useHasSufficientProviders } from '../Providers/data';

const AutomationIcon = () => <img src={automationIcon} className="forklift-empty-state__icon" />;

const EmptyStatePlans: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useTranslation();

  const hasSufficientProviders = useHasSufficientProviders(namespace);

  return (
    <ForkliftEmptyState
      icon={AutomationIcon}
      title={t('No Plans found.')}
      textContent={
        !hasSufficientProviders ? (
          <Flex direction={{ default: 'column' }}>
            <FlexItem>
              <Trans t={t} ns="plugin__forklift-console-plugin">
                Migration plans are used to plan migration or virtualization workloads from source
                providers to target providers. At least one source and one target provider must be
                available in order to create a migration plan,{' '}
                <a className="co-external-link" href={HELP_LINK_HREF}>
                  Learn more
                </a>
              </Trans>
            </FlexItem>
            <FlexItem>
              <Trans t={t} ns="plugin__forklift-console-plugin">
                Go to the{' '}
                <Link to={createK8sPath(PROVIDERS_REFERENCE, namespace)}>providers list page</Link>{' '}
                to create a provider.
              </Trans>
            </FlexItem>
          </Flex>
        ) : (
          t(
            'Migration plans are used to plan migration or virtualization workloads from source providers to target providers',
          )
        )
      }
      callForActionButtons={hasSufficientProviders && <CreatePlanButton namespace={namespace} />}
    />
  );
};

export default EmptyStatePlans;