/**
 * Forklift API
 * Migration toolkit for virtualization (Forklift) API definitions.
 *
 * The version of the OpenAPI document: 2.4.0
 * Contact Email: kubev2v-dev@redhat.com
 * License: Apache-2.0
 *
 * NOTE: This file is auto generated by crdtotypes (https://github.com/yaacov/crdtoapi/).
 * https://github.com/yaacov/crdtoapi/README.crdtotypes
 */

import { V1beta1PlanSpecVmsHooksHook } from './V1beta1PlanSpecVmsHooksHook';

/**
 * Plan hook.
 *
 * @export
 */
export interface V1beta1PlanSpecVmsHooks {
  /** hook
   * Hook reference.
   *
   * @required {false}
   */
  hook?: V1beta1PlanSpecVmsHooksHook;
  /** step
   * Pipeline step.
   *
   * @required {true}
   */
  step: string;
}
