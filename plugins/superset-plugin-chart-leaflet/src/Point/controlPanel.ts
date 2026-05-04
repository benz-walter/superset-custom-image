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


const geometry: typeof sharedControls.groupby = {
    type: 'SelectControl',
    label: t('GeoJSON column'),
    description: t('Column containing geoJSON'),
    multi: false,
    freeForm: true,
    allowAll: true,
    commaChoosesOption: false,
    default: [],
    valueKey: 'column_name',
    mapStateToProps: ({datasource, controls}) => ({
        options: datasource?.columns || [],
        queryMode: 'raw',
    }),
    validators: [validateNonEmpty],
};


const colorDimension: typeof sharedControls.groupby = {
    ...sharedControls.groupby,
    label: t('Color Dimension'),
    description: t('Column used to color the geometry'),
    multi: false,
    freeForm: true,
    allowAll: true,
    commaChoosesOption: false,
    default: [],
    valueKey: 'column_name',
    visibility: ({controls}: ControlPanelsContainerProps) =>
        Boolean(!controls?.fixedColor?.value),
};


const colorMetric: typeof sharedControls.metric = {
    ...sharedControls.metric,
    label: t('Color Metric'),
    description: t('Column used to color the geometry'),
    multi: false,
    freeForm: true,
    allowAll: true,
    commaChoosesOption: false,
    default: [],
    valueKey: 'column_name',
    validators: [],
    visibility: ({controls}: ControlPanelsContainerProps) =>
        Boolean(!controls?.fixedColor?.value),
};


const tooltipDimension: typeof sharedControls.groupby = {
    ...sharedControls.groupby,
    label: t('Tooltip Dimensions'),
    description: t('Columns used for tooltip'),
    multi: true,
    freeForm: true,
    allowAll: true,
    commaChoosesOption: false,
    default: [],
    valueKey: 'column_name',
};


const tooltipMetric: typeof sharedControls.metrics = {
    ...sharedControls.metrics,
    label: t('Tooltip Metrics'),
    description: t('Columns used for tooltip'),
    multi: true,
    freeForm: true,
    allowAll: true,
    commaChoosesOption: false,
    default: [],
    valueKey: 'column_name',
    validators: [],
};


const iconUrlColumn: typeof sharedControls.groupby = {
    type: 'SelectControl',
    label: t('Icon Url Column'),
    description: t('Column used to setup marker icon urls'),
    multi: false,
    freeForm: true,
    allowAll: true,
    commaChoosesOption: false,
    default: [],
    valueKey: 'column_name',
    mapStateToProps: ({datasource, controls}) => ({
        options: datasource?.columns || [],
        queryMode: 'raw',
    }),
    visibility: ({controls}: ControlPanelsContainerProps) =>
        Boolean(controls?.markerIconUrl?.value),
};


const radiusMetric: typeof sharedControls.metrics = {
    ...sharedControls.metrics,
    label: t('Radius column'),
    description: t('Column used for radius'),
    multi: false,
    freeForm: true,
    allowAll: true,
    commaChoosesOption: true,
    default: [],
    valueKey: 'column_name',
    validators: [],
    visibility: ({controls}: ControlPanelsContainerProps) =>
        Boolean(!controls?.fixedRadius?.value),
};
//
const {
    fixedColor,
    lineColor,
    showLegend,
    radius,
    radiusMin,
    radiusMax,
    markerIconUrl,
    markerSize,
    customTooltip,
    fixedRadius,
    lineWidth,
    legendTitleSize,
} = DEFAULT_FORM_DATA;

const config: ControlPanelConfig = {

    controlPanelSections: [
        {
            label: t('Query'),
            expanded: true,
            controlSetRows: [
                [
                    {
                        name: 'geometry',
                        config: geometry,
                    },
                ],
                ['adhoc_filters'],
                [
                    {
                        name: 'row_limit',
                        config: sharedControls.row_limit,
                    },
                ],
            ],
        },
        {
            label: t('Colors'),
            expanded: false,
            controlSetRows: [
                [
                    {
                        name: 'fixedColor', //Custom
                        config: {
                            type: 'CheckboxControl',
                            label: t('Use fixed color'),
                            description: t(
                                'Select whether to fix the color value or color by column values.',
                            ),
                            renderTrigger: false,
                            default: fixedColor,
                        },
                    },
                ],
                [
                    {
                        name: 'markerIconUrl', //Custom
                        config: {
                            type: 'CheckboxControl',
                            label: t('Use marker icons'),
                            description: t(
                                'Select whether to marker icon urls for points.',
                            ),
                            renderTrigger: false,
                            default: markerIconUrl,
                        },
                    },
                ],
                [
                    {
                        name: 'iconUrlColumn',
                        config: iconUrlColumn,
                    },
                ],
                [
                    {
                        name: 'markerSize',
                        config: {
                            type: 'SliderControl',
                            label: t('Marker size'),
                            description: t(
                                'Size of marker between 5 and 50 px',
                            ),
                            default: markerSize,
                            step: 1,
                            min: 5,
                            max: 50,
                            renderTrigger: true,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(controls?.markerIconUrl?.value),
                        },
                    },
                ],
                [
                    {
                        name: 'colorMetric',
                        config: colorMetric
                    }
                ],
                [
                    {
                        name: 'colorDimension',
                        config: colorDimension
                    }
                ],
                [
                    {
                        name: 'customColorSelect', //Custom
                        config: {
                            type: 'CheckboxControl',
                            label: t('Custom color mapping'),
                            description: t(
                                'Specify custom color mapping for dimensions, i.e. {"CUSTOM_VALUE_1": "#ff0000", "default": "#000000"}',
                            ),
                            renderTrigger: false,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(!controls?.fixedColor?.value),
                            default: false,
                        },
                    },
                ],
                [
                    {
                        name: 'colorScale',
                        config: {
                            type: 'SelectControl',
                            label: 'Color Scale',
                            default: 'Viridis',
                            choices: [
                                ['', 'GrayScale'],
                                ['Accent', 'Accent'],
                                ['Blues', 'Blues'],
                                ['BlRdYl', 'Black Red Yellow'],
                                ['BrBG', 'Brown Blue Green'],
                                ['BuGn', 'Blue Green'],
                                ['BuPu', 'Blue Purple'],
                                ['Dark2', 'Dark'],
                                ['Greens', 'Greens'],
                                ['Greys', 'Greys'],
                                ['GrYlRd', 'Green Yellow Red'],
                                ['GnBu', 'Green Blue'],
                                ['Oranges', 'Oranges'],
                                ['OrRd', 'Orange Red'],
                                ['Paired', 'Paired'],
                                ['Pastel1', 'Pastel 1'],
                                ['Pastel2', 'Pastel 2'],
                                ['PiYG', 'Pink Green'],
                                ['PRGn', 'Darkpink Green'],
                                ['Purples', 'Purples'],
                                ['PuBu', 'Purple Blue'],
                                ['PuBuGn', 'Purple Blue Green'],
                                ['PuOr', 'Purple Orange'],
                                ['PuRd', 'Purple Red'],
                                ['Reds', 'Reds'],
                                ['RdBu', 'Red Blue'],
                                ['RdGy', 'Red Greys'],
                                ['RdPu', 'Red Purple'],
                                ['RdYlBu', 'Red Yellow Blue'],
                                ['RdYlGr', 'Red Yellow Green'],
                                ['RdGrOr', 'Red Green Orange'],
                                ['RdGrBkOr', 'Red Green Black Orange'],
                                ['Set1', 'Set 1'],
                                ['Set2', 'Set 2'],
                                ['Set3', 'Set 3'],
                                ['Spectral', 'Spectral'],
                                ['Viridis', 'Viridis'],
                                ['YlGn', 'Yellow Green'],
                                ['YlGnBu', 'Yellow Green Blue'],
                                ['YlOrBr', 'Yellow Orange Brown'],
                                ['YlOrRd', 'Yellow Orange Red'],
                                ['YlNa', 'Yellow Navy'],
                            ],
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(!controls?.customColorSelect?.value),
                        },
                    },
                ],
                [
                    {
                        name: 'customColor', //Custom
                        config: {
                            type: 'TextAreaControl',
                            language: 'json',
                            label: t('Custom color Mapping'),
                            description: t(
                                'Specify custom color mapping in JSON format',
                            ),
                            default: '{"default": "#000000"}',
                            height: 100,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(controls?.customColorSelect?.value),
                        },
                    },
                ],
                [
                    {
                        name: 'lineColor',
                        config: {
                            type: 'ColorPickerControl',
                            label: t('Line color'),
                            description: t('Select line color for geometry'),
                            renderTrigger: true,
                            default: lineColor,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(controls?.fixedColor?.value),
                        },
                    },
                ],
                [
                    {
                        name: 'fillColor',
                        config: {
                            type: 'ColorPickerControl',
                            label: t('Fill color'),
                            description: t('Select fill color for geometry'),
                            renderTrigger: true,
                            default: lineColor,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(controls?.fixedColor?.value),
                        },
                    },
                ],
            ]
        },
        {
            label: t('Shape'),
            expanded: false,
            controlSetRows: [
                [
                    {
                        name: 'opacity',
                        config: {
                            type: 'SliderControl',
                            label: t('Opacity'),
                            description: t(
                                'Opacity of polygons. Between 0 and 1.',
                            ),
                            default: 0.8,
                            step: 0.01,
                            min: 0,
                            max: 1,
                            renderTrigger: false,
                        },
                    },
                ],
                [
                    {
                        name: 'lineWidth',
                        config: {
                            type: 'SliderControl',
                            label: t('Line width'),
                            description: t(
                                'Line width of polygons and linestrings',
                            ),
                            default: lineWidth,
                            step: 1,
                            min: 1,
                            max: 10,
                            renderTrigger: true,
                        },
                    },
                ],
                [
                    {
                        name: 'fixedRadius', //Custom
                        config: {
                            type: 'CheckboxControl',
                            label: t('Fixed point radius'),
                            description: t(
                                'Set fixed point radius or choose column for radius.',
                            ),
                            renderTrigger: false,
                            default: fixedRadius,
                        },
                    },
                ],
                [
                    {
                        name: 'radiusMetric',
                        config: radiusMetric,
                    },
                ],
                [
                    {
                        name: 'radiusMin',
                        config: {
                            type: 'SliderControl',
                            label: t('Minimum radius'),
                            description: t(
                                'Minimum value for radius scale',
                            ),
                            default: radiusMin,
                            step: 0.5,
                            min: 1,
                            max: 50,
                            renderTrigger: true,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(!controls?.fixedRadius?.value),
                        },
                    },
                ],
                [
                    {
                        name: 'radiusMax',
                        config: {
                            type: 'SliderControl',
                            label: t('Maximum radius'),
                            description: t(
                                'Maximum value for radius scale',
                            ),
                            default: radiusMax,
                            step: 0.5,
                            min: 2,
                            max: 50,
                            renderTrigger: true,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(!controls?.fixedRadius?.value),
                        },
                    },
                ],
                [
                    {
                        name: 'radius',
                        config: {
                            type: 'SliderControl',
                            label: t('Radius'),
                            description: t(
                                'Radius of points between 1 and 50',
                            ),
                            default: radius,
                            step: 0.5,
                            min: 1,
                            max: 50,
                            renderTrigger: true,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(controls?.fixedRadius?.value),
                        },
                    },
                ],
            ]
        },
        {
            label: t('Legend'),
            expanded: false,
            controlSetRows: [
                [
                    {
                        name: 'showLegend', //Custom
                        config: {
                            type: 'CheckboxControl',
                            label: t('Show legend'),
                            description: t(
                                'Select whether to display legend.',
                            ),
                            renderTrigger: true,
                            default: showLegend,
                        },
                    },
                ],
                [
                    {
                        name: 'legendTitle', //Custom
                        config: {
                            type: 'TextControl',
                            label: t('Legend title'),
                            description: t('Input for alternative legend title'),
                            renderTrigger: false,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(controls?.showLegend?.value),
                        },
                    },
                ],
                [
                    {
                        name: 'legendTitleSize', //Custom
                        config: {
                            type: 'SliderControl',
                            label: t('Legend title size'),
                            description: t('Select font size of legend title'),
                            step: 1,
                            min: 5,
                            max: 50,
                            renderTrigger: true,
                            default: legendTitleSize,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(controls?.showLegend?.value),
                        },
                    },
                ],
            ]
        },
        {
            label: t('Tooltip'),
            expanded: false,
            controlSetRows: [
                [
                    {
                        name: 'tooltipMetric',
                        config: tooltipMetric,
                    },
                ],
                [
                    {
                        name: 'tooltipDimension',
                        config: tooltipDimension,
                    },
                ],
                [
                    {
                        name: 'customTooltip', //Custom
                        config: {
                            type: 'CheckboxControl',
                            label: t('Custom tooltip'),
                            description: t(
                                'Select whether to use custom tooltip text.',
                            ),
                            renderTrigger: true,
                            default: customTooltip,
                        },
                    },
                ],
                [
                    {
                        name: 'tooltipText',
                        config: {
                            type: 'TextAreaControl',
                            language: 'txt',
                            label: t('Tooltip text'),
                            description: t(
                                'Custom tooltip text',
                            ),
                            default: '',
                            height: 100,
                            visibility: ({controls}: ControlPanelsContainerProps) =>
                                Boolean(controls?.customTooltip?.value),
                        },
                    },
                ],
            ]
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
            expanded: false,
            controlSetRows: [
                [
                    {
                        name: 'tileStyle',
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
    formDataOverrides: formData => ({
        ...formData,
        color_metric: getStandardizedControls().shiftMetric(),
    }),
};
export default config;
