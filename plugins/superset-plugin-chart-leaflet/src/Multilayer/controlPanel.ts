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
    ControlPanelConfig,
    ControlPanelsContainerProps,
    getStandardizedControls,
    sharedControls,
} from '@superset-ui/chart-controls';

import {t, validateNonEmpty,} from '@superset-ui/core';

import {DEFAULT_FORM_DATA} from "../types";


const config: ControlPanelConfig = {

    controlPanelSections: [
        {
            label: t('Charts'),
            expanded: true,
            controlSetRows: [
                [
                  {
                    name: 'leaflet_slices',
                    config: {
                      type: 'SelectAsyncControl',
                      multi: true,
                      label: t('Leaflet charts'),
                      validators: [validateNonEmpty],
                      default: [],
                      description: t(
                        'Pick a set of leaflet charts to layer on top of one another',
                      ),
                      dataEndpoint:
                        '/sliceasync/api/read?_flt_0_viz_type=leaflet_',
                      placeholder: t('Select charts'),
                      onAsyncErrorMessage: t('Error while fetching charts'),
                      mutator: (data: {
                        result?: { id: number; slice_name: string }[];
                      }) => {
                        if (!data?.result) {
                          return [];
                        }
                        return data.result.map(o => ({
                          value: o.id,
                          label: o.slice_name,
                        }));
                      },
                    },
                  },
                  null,
                ],
            ],
        },
        {
            label: t('WMS'),
            expanded: false,
            controlSetRows: [
                [
                    {
                        name: 'wmsOpacity',
                        config: {
                            type: 'SliderControl',
                            label: t('Opacity'),
                            description: t('Opacity of WMS. Between 0 and 1.'),
                            default: 0.8,
                            step: 0.01,
                            min: 0,
                            max: 1,
                            renderTrigger: false
                        }
                    }
                ],
                [
                    {
                          name: 'wmsUrl',
                          config: {
                            type: 'TextControl',
                            label: t('WMS URL'),
                            description: t('URL to web map service'),
                            renderTrigger: false,
                          }
                    }
                ],
                [
                    {
                          name: 'wmsLayers',
                          config: {
                            type: 'TextControl',
                            label: t('WMS Layers'),
                            description: t('Layers to show'),
                            renderTrigger: false,
                          }
                    }
                ],
            ]
        },
        {
            label: t('Map'),
            expanded: true,
            controlSetRows: [
                [
                    {
                        name: 'tile_style',
                        config: {
                            type: 'SelectControl',
                            label: t('Map Style'),
                            clearable: false,
                            renderTrigger: false,
                            freeForm: true,
                            choices: [

                                ['https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', t('OpenStreetMap')],
                                ['https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', t('OpenStreetMap HOT')],
                                ['https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png', t('OpenStreetMap BZH')],
                                ['https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', t('ÖPNV')],
                                ['https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', t('OpenTopoMap')],
                                ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', t('Google Road')],
                                ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', t('Google Hybrid')],
                                ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', t('Google Satellite')],
                                ['https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png', t('BaseMapDE.Color')],
                                ['https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_grau/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png', t('BaseMapDE.Grey')],
                                ['http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png', t('TopPlusOpen.Color')],
                                ['http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png', t('TopPlusOpen.Grey')],
                                ['https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', t('CyclOSM')],
                                ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', t('Esri.WorldStreetMap')],
                                ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', t('Esri.WorldTopoMap')],
                                ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', t('Esri.WorldImagery')],
                                ['https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', t('Esri.NatGeoWorldMap')],
                                ['http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png', t('MtbMap')],
                                ['https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', t('CartoDB.Positron')],
                                ['https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', t('CartoDB.DarkMatter')],
                                ['https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', t('CartoDB.Voyager')],
                            ],
                            default: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                            description: t(
                                'Base layer map style',
                            ),
                        },
                    },
                ],
            ],
        },
    ],

};
export default config;
