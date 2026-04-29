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
import {ControlPanelConfig,} from '@superset-ui/chart-controls';

import {t,} from '@superset-ui/core';

let serviceChoices: [string, string][] = [];
let isLoading = false;

const DEFAULT_VIEWPORT = {
    longitude: 7.835008,
    latitude: 47.99296,
    zoom: 14,
    bearing: 0,
    pitch: 0,
};
// Laden Sie die Daten beim ersten Laden des Moduls
const loadServiceNames = async () => {
    if (isLoading) return;
    isLoading = true;
    try {
        const response = await fetch('https://geoportal.freiburg.de/freigis/ressources/services-internet.json');
        if (!response.ok) {
            console.error('Fehler beim Abrufen der Services: Server-Fehler', response.status);
            return;
        }
        const data = await response.json();
        // Erstellen Sie ein Set, um Duplikate zu vermeiden
        const uniqueServices = new Set();

        // Verarbeiten Sie die Daten und entfernen Sie Duplikate
        serviceChoices = data.filter(item => item.typ == 'WMS' && item.url && item.layers)
            .filter((service: any) => {
                // Prüfen, ob der Name bereits existiert
                if (!service.name || uniqueServices.has(service.name)) {
                    return false;
                }
                // Name zum Set hinzufügen und Service beibehalten
                uniqueServices.add(service.name);
                return true;
            })
            .map((service: any) => {
                return [service.name, service.name]; // Format: [value, label]
            });
        // Optional: Sortieren Sie die Dienste alphabetisch
        serviceChoices.sort((a, b) => a[0].localeCompare(b[0]));

    } catch (error) {
        console.error('Fehler beim Abrufen der Services:', error);
    } finally {
        isLoading = false;
    }
};

// Starten Sie den Ladevorgang sofort
loadServiceNames();


const config: ControlPanelConfig = {

    controlPanelSections: [
        {
            label: t('Map Settings'),
            expanded: true,
            controlSetRows: [
                [
                    {
                        name: 'show_map',
                        config: {
                            type: 'CheckboxControl',
                            label: t('Show Background Map'),
                            renderTrigger: true,
                            default: true,
                            description: t('Whether to display the map (toggles)'),
                        },
                    },
                ],
                [
                    {
                        name: 'wms_layer_name',
                        config: {
                            type: 'SelectControl',
                            label: 'WMS-Layer',
                            default: null,
                            description: 'Select layers',
                            renderTrigger: false,
                            multi: true,
                            mapStateToProps: () => {
                                // Wenn keine Daten geladen sind, laden Sie sie erneut
                                if (serviceChoices.length === 0 && !isLoading) {
                                    loadServiceNames();
                                }
                                return {
                                    choices: serviceChoices,
                                    isLoading: isLoading,
                                };
                            },

                        },
                    },
                ],
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
                            default: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                            description: t(
                                'Base layer map style',
                            ),
                        },
                    },
                ],
            ],
        },
        {
            label: t('Map Options'),
            expanded: true,
            controlSetRows: [
                [
                    {
                        name: 'viewport',
                        config: {
                            type: 'ViewportControl',
                            label: 'Viewport',
                            renderTrigger: false,
                            description: t('Parameters related to the view and perspective on the map'),
                            // default is whole world mostly centered
                            default: DEFAULT_VIEWPORT,
                            // Viewport changes shouldn't prompt user to re-run query
                            dontRefreshOnChange: true,
                        },
                    },
                    // {
                    //     name: 'longitude',
                    //     config: {
                    //         type: 'TextControl',
                    //         label: 'Longitude',
                    //         description: 'Set Longitude',
                    //         renderTrigger: false,
                    //         default: 7.835008,
                    //     },
                    // },
                ],
                // [
                //     {
                //         name: 'zoomFactor',
                //         config: {
                //             type: 'SliderControl',
                //             label: 'Zoom Factor',
                //             description: 'Set Zoom Factor',
                //             renderTrigger: true,
                //               default: 0.7,
                //               step: 1,
                //               min: 0,
                //               max: 20,
                //         },
                //     },
                // ],
                [
                    {
                        name: 'opacity',
                        config: {
                            type: 'SliderControl',
                            label: 'Opacity',
                            description: 'Set Opacity',
                            renderTrigger: true,
                            default: 0.7,
                            step: 0.1,
                            min: 0,
                            max: 1,
                        },
                    },
                ],
            ]
        }
    ],
};
export default config;
