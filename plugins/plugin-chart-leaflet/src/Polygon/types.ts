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
import { SupersetPluginChartLeafletQueryFormData } from '../types';

export const DEFAULT_FORM_DATA: SupersetPluginChartLeafletQueryFormData = {
  datasource: '',
  viz_type: 'leaflet_polygon',
  fixedColor: true,
  continuousColor: true,
  lineColor: { r: 33, g: 27, b: 66, a: 1 },
  permanentTooltip: false,
  showLegend: true,
  lineWidth: 1,
  radius: 5,
  radiusMin: 1,
  radiusMax: 10,
  markerIconUrl: false,
  markerSize: 32,
  customTooltip: false,
  fixedRadius: true,
  legendTitleSize: 12,
};
