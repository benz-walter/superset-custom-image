/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { ChartProps, TimeseriesDataRecord } from '@superset-ui/core';

export default function transformProps(chartProps: ChartProps) {
  const { width, height, formData, queriesData } = chartProps;
  const { boldText, headerFontSize, headerText} = formData;
  const data = queriesData[0].data as TimeseriesDataRecord[];

  const colorMetric = formData.colorMetric
  const colorDimension = formData.colorDimension
  const geometry = formData.geometry
  const tooltipMetric = formData.tooltipMetric
  const tooltipDimension = formData.tooltipDimension
  const iconUrlColumn = formData.iconUrlColumn
  const radiusMetric = formData.radiusMetric
  return {
    width,
    height,
    data,
    geometry,
    colorMetric,
    colorDimension,
    tooltipMetric,
    tooltipDimension,
    iconUrlColumn,
    radiusMetric,
    payload: queriesData,
    boldText,
    headerFontSize,
    headerText,
    formData,
  };
}
