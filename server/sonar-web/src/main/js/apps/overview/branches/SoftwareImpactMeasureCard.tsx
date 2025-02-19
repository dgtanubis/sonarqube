/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import styled from '@emotion/styled';
import { LinkHighlight, LinkStandalone, Tooltip } from '@sonarsource/echoes-react';
import { Badge, LightGreyCard, LightGreyCardTitle, TextBold, TextSubdued } from 'design-system';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatMeasure } from '~sonar-aligned/helpers/measures';
import { getComponentIssuesUrl } from '~sonar-aligned/helpers/urls';
import { MetricKey, MetricType } from '~sonar-aligned/types/metrics';
import { DEFAULT_ISSUES_QUERY } from '../../../components/shared/utils';
import {
  SOFTWARE_QUALITIES_METRIC_KEYS_MAP,
  getIssueTypeBySoftwareQuality,
} from '../../../helpers/issues';
import { isDefined } from '../../../helpers/types';
import { Branch } from '../../../types/branch-like';
import {
  SoftwareImpactMeasureData,
  SoftwareImpactSeverity,
  SoftwareQuality,
} from '../../../types/clean-code-taxonomy';
import { QualityGateStatusConditionEnhanced } from '../../../types/quality-gates';
import { Component, MeasureEnhanced } from '../../../types/types';
import { Status, softwareQualityToMeasure } from '../utils';
import SoftwareImpactMeasureBreakdownCard from './SoftwareImpactMeasureBreakdownCard';
import SoftwareImpactMeasureRating from './SoftwareImpactMeasureRating';

export interface SoftwareImpactBreakdownCardProps {
  component: Component;
  conditions: QualityGateStatusConditionEnhanced[];
  softwareQuality: SoftwareQuality;
  ratingMetricKey: MetricKey;
  measures: MeasureEnhanced[];
  branch?: Branch;
}

export function SoftwareImpactMeasureCard(props: Readonly<SoftwareImpactBreakdownCardProps>) {
  const { component, conditions, softwareQuality, ratingMetricKey, measures, branch } = props;

  const intl = useIntl();

  // Find measure for this software quality
  const metricKey = softwareQualityToMeasure(softwareQuality);
  const measureRaw = measures.find((m) => m.metric.key === metricKey);
  const measure = JSON.parse(measureRaw?.value ?? 'null') as SoftwareImpactMeasureData;
  const alternativeMeasure = measures.find(
    (m) => m.metric.key === SOFTWARE_QUALITIES_METRIC_KEYS_MAP[softwareQuality].deprecatedMetric,
  );

  // Find rating measure
  const ratingMeasure = measures.find((m) => m.metric.key === ratingMetricKey);

  const count = formatMeasure(measure?.total ?? alternativeMeasure?.value, MetricType.ShortInteger);

  const totalLinkHref = getComponentIssuesUrl(component.key, {
    ...DEFAULT_ISSUES_QUERY,
    ...(isDefined(measure)
      ? { impactSoftwareQualities: softwareQuality }
      : { types: getIssueTypeBySoftwareQuality(softwareQuality) }),
    branch: branch?.name,
  });

  // We highlight the highest severity breakdown card with non-zero count
  const highlightedSeverity =
    measure &&
    [SoftwareImpactSeverity.High, SoftwareImpactSeverity.Medium, SoftwareImpactSeverity.Low].find(
      (severity) => measure[severity] > 0,
    );

  const countTooltipOverlay = intl.formatMessage({
    id: 'overview.measures.software_impact.count_tooltip',
  });

  const failed = conditions.some((c) => c.level === Status.ERROR && c.metric === ratingMetricKey);

  return (
    <LightGreyCard
      data-testid={`overview__software-impact-card-${softwareQuality}`}
      className="sw-w-1/3 sw-overflow-hidden sw-rounded-2 sw-p-4 sw-flex-col"
    >
      <LightGreyCardTitle>
        <TextBold name={intl.formatMessage({ id: `software_quality.${softwareQuality}` })} />
        {failed && (
          <Badge className="sw-h-fit" variant="deleted">
            <FormattedMessage id="overview.measures.failed_badge" />
          </Badge>
        )}
      </LightGreyCardTitle>
      <div className="sw-flex sw-flex-col sw-gap-3">
        <div className="sw-flex sw-mt-4">
          <div className="sw-flex sw-gap-1 sw-items-center">
            {count ? (
              <Tooltip content={countTooltipOverlay}>
                <LinkStandalone
                  data-testid={`overview__software-impact-${softwareQuality}`}
                  aria-label={intl.formatMessage(
                    {
                      id: `overview.measures.software_impact.see_list_of_x_open_issues`,
                    },
                    {
                      count,
                      softwareQuality: intl.formatMessage({
                        id: `software_quality.${softwareQuality}`,
                      }),
                    },
                  )}
                  className="sw-text-lg sw-font-semibold"
                  highlight={LinkHighlight.CurrentColor}
                  to={totalLinkHref}
                >
                  {count}
                </LinkStandalone>
              </Tooltip>
            ) : (
              <StyledDash className="sw-font-bold" name="-" />
            )}
            <TextSubdued className="sw-self-end sw-body-sm sw-pb-1">
              {intl.formatMessage({ id: 'overview.measures.software_impact.total_open_issues' })}
            </TextSubdued>
          </div>

          <div className="sw-flex-grow sw-flex sw-justify-end">
            <SoftwareImpactMeasureRating
              softwareQuality={softwareQuality}
              value={ratingMeasure?.value}
            />
          </div>
        </div>
        {measure && (
          <div className="sw-flex sw-gap-2">
            {[
              SoftwareImpactSeverity.High,
              SoftwareImpactSeverity.Medium,
              SoftwareImpactSeverity.Low,
            ].map((severity) => (
              <SoftwareImpactMeasureBreakdownCard
                branch={branch}
                key={severity}
                component={component}
                softwareQuality={softwareQuality}
                value={measure?.[severity]?.toString()}
                severity={severity}
                active={highlightedSeverity === severity}
              />
            ))}
          </div>
        )}
      </div>
    </LightGreyCard>
  );
}

const StyledDash = styled(TextBold)`
  font-size: 36px;
`;

export default SoftwareImpactMeasureCard;
