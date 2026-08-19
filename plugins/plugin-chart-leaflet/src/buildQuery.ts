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
import {
  buildQueryContext,
  ensureIsArray,
    QueryFormData,
} from '@superset-ui/core';

/**
 * The buildQuery function is used to create an instance of QueryContext that's
 * sent to the chart data endpoint. In addition to containing information of which
 * datasource to use, it specifies the type (e.g. full payload, samples, query) and
 * format (e.g. CSV or JSON) of the result and whether or not to force refresh the data from
 * the datasource as opposed to using a cached copy of the data, if available.
 *
 * More importantly though, QueryContext contains a property `queries`, which is an array of
 * QueryObjects specifying individual data requests to be made. A QueryObject specifies which
 * columns, metrics and filters, among others, to use during the query. Usually it will be enough
 * to specify just one query based on the baseQueryObject, but for some more advanced use cases
 * it is possible to define post processing operations in the QueryObject, or multiple queries
 * if a viz needs multiple different result sets.
 */
export default function buildQuery(formData: QueryFormData) {
  const {
    geometry,
    colorMetric,
    colorDimension,
    tooltipMetric,
    tooltipDimension,
    iconUrlColumn,
    radiusMetric
  } = formData;
  // Initialisiere groupby und metrics mit Fallback-Werten

  let groupby: string[] = [];
  let metrics: any[] = [];

  // Prüfe und füge einzigartige groupby-Werte hinzu
  if (geometry) groupby.push(geometry);
  if (colorDimension) groupby.push(...ensureIsArray(colorDimension));
  if (tooltipDimension) groupby.push(...ensureIsArray(tooltipDimension));
  if (iconUrlColumn) groupby.push(...ensureIsArray(iconUrlColumn));

  groupby = [...new Set(groupby)];

  // Konvertiere zu Array
  const colorMetrics = ensureIsArray(colorMetric);
  const tooltipMetrics = ensureIsArray(tooltipMetric);
  const radiusMetrics = ensureIsArray(radiusMetric);

  // Füge `color_metric` hinzu, falls vorhanden
  if (colorMetrics.length > 0) {
    metrics.push(...colorMetrics);
  }

  tooltipMetrics.forEach(metric => {
    const isIncluded = metrics.some(m => m.label === metric.label);
    if (!isIncluded) {
      metrics.push(metric);
    }
  });

  // Füge `radius_metric` hinzu, falls vorhanden und noch nicht enthalten
  if (radiusMetrics.length > 0 && !metrics.some(m => m.label === radiusMetrics[0]?.label)) {
    metrics.push(radiusMetrics[0]);
  }

  return buildQueryContext(formData, baseQueryObject => {
    const queryObject = {
      ...baseQueryObject,
      groupby,
    };

    if (metrics.length > 0) {
      queryObject.metrics = metrics;
    }

    return [queryObject];
  });
}
