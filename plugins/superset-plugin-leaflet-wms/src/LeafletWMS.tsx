import React, {useEffect, useState} from 'react';
import {SupersetPluginChartLeafletWMSProps, SupersetPluginChartLeafletWMSStylesProps} from './types';
import {styled} from '@superset-ui/core';
import {MapContainer, Popup, TileLayer, useMapEvents, WMSTileLayer} from "react-leaflet";

import L from 'leaflet';
import proj4 from 'proj4';
import {formatFeatureInfoResponse} from "./transformXML";


const Styles = styled.div<SupersetPluginChartLeafletWMSStylesProps>`
    padding: ${({theme}) => theme.gridUnit * 4}px;
    border-radius: ${({theme}) => theme.gridUnit * 2}px;

    pre {
        height: ${({theme, headerFontSize, height}) => (
                height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]
        )}px;
    }

    .box {
        float: left;
        height: 15px;
        width: 20px;
        margin-right: 15px;
    }

    /* Essenzielle Leaflet-Styles inline */


    .leaflet-pane,
    .leaflet-tile,
    .leaflet-marker-icon,
    .leaflet-layer {
        position: absolute;
        left: 0;
        top: 0;
    }

    .leaflet-tile-pane {
        z-index: 2;
    }

    .leaflet-overlay-pane {
        z-index: 4;
    }

    .leaflet-shadow-pane {
        z-index: 5;
    }

    .leaflet-marker-pane {
        z-index: 6;
    }

    .leaflet-tooltip-pane {
        z-index: 7;
    }

    .leaflet-popup-pane {
        z-index: 8;
    }

    .leaflet-tile {
        filter: inherit;
        visibility: hidden;
    }

    .leaflet-tile-loaded {
        visibility: inherit;
    }

    .leaflet-popup-pane,
    .leaflet-control {
        cursor: auto;
    }

    /* popup */

    .leaflet-popup {
        position: absolute;
        text-align: center;
    }

    .leaflet-popup-content-wrapper {
        padding: 1px;
        text-align: left;
        -webkit-border-radius: 20px;
        border-radius: 20px;
    }

    .leaflet-popup-content {
        margin: 14px 20px;
        line-height: 1.4;
    }

    .leaflet-popup-content p {
        margin: 18px 0;
    }

    .leaflet-popup-tip-container {
        margin: 0 auto;
        width: 40px;
        height: 20px;
        position: relative;
        overflow: hidden;
    }

    .leaflet-popup-tip {
        width: 15px;
        height: 15px;
        padding: 1px;

        margin: -8px auto 0;

        -webkit-transform: rotate(45deg);
        -moz-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        -o-transform: rotate(45deg);
        transform: rotate(45deg);
    }

    .leaflet-popup-content-wrapper, .leaflet-popup-tip {
        background: white;

        box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
    }

    .leaflet-container a.leaflet-popup-close-button {
        position: absolute;
        top: 0;
        right: 0;
        padding: 4px 5px 0 0;
        text-align: center;
        width: 18px;
        height: 14px;
        font: 16px/14px Tahoma, Verdana, sans-serif;
        color: #c3c3c3;
        text-decoration: none;
        font-weight: bold;
        background: transparent;
    }

    .leaflet-container a.leaflet-popup-close-button:hover {
        color: #999;
    }

    .leaflet-popup-scrolled {
        overflow: auto;
        border-bottom: 1px solid #ddd;
        border-top: 1px solid #ddd;
    }
`;

const transformToUTM32 = (lat: number, lng: number): [number, number] => {
    // Vereinfachte Transformation für UTM Zone 32N
    // Dies ist eine Näherung und nicht so genau wie proj4,
    // aber ausreichend für die meisten Anwendungsfälle
    const a = 6378137.0; // Äquatorradius WGS84
    const f = 1/298.257223563; // Abplattung WGS84
    const e2 = 2*f - f*f; // Quadrat der ersten Exzentrizität

    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    const zoneCentralMeridian = 9.0 * Math.PI / 180; // UTM Zone 32

    // Näherungsformel für UTM-Projektion
    const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad));
    const T = Math.tan(latRad) * Math.tan(latRad);
    const C = e2 * Math.cos(latRad) * Math.cos(latRad) / (1 - e2);
    const A = Math.cos(latRad) * (lngRad - zoneCentralMeridian);

    // Berechnungen für Easting (x) und Northing (y)
    const M = a * ((1 - e2/4 - 3*e2*e2/64) * latRad
                 - (3*e2/8 + 3*e2*e2/32) * Math.sin(2*latRad)
                 + (15*e2*e2/256) * Math.sin(4*latRad));

    const x = 500000 + 0.9996 * N * (A + (1-T+C)*A*A*A/6 + (5-18*T+T*T+72*C-58)*A*A*A*A*A/120);
    const y = 0.9996 * (M + N * Math.tan(latRad) * (A*A/2 + (5-T+9*C+4*C*C)*A*A*A*A/24 + (61-58*T+T*T+600*C-330)*A*A*A*A*A*A/720));

    // Falscher Nordwert für nördliche Hemisphäre
    const northing = y;

    return [x, northing];
};

// Transformation einer BoundingBox von EPSG:4326 nach EPSG:25832
const transformBoundingBox = (bounds) => {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  // Umwandlung der Ecken
  const swUtm = transformToUTM32(sw.lat, sw.lng);
  const neUtm = transformToUTM32(ne.lat, ne.lng);

  // BBOX String im Format "minx,miny,maxx,maxy"
  return `${swUtm[0]},${swUtm[1]},${neUtm[0]},${neUtm[1]}`;
};

// Interface für FeatureInfo
interface FeatureInfo {
    content: string;
    latlng: L.LatLng;
}

// FeatureInfoHandler Komponente
const FeatureInfoHandler: React.FC<{
    wmsLayers: Array<{
        url: string;
        layers: string;
        version: string;
    }>;
}> = ({ wmsLayers }) => {
    const [featureInfo, setFeatureInfo] = useState<FeatureInfo | null>(null);
    const map = useMapEvents({
        click: async (e) => {
            // Für jeden WMS-Layer GetFeatureInfo anfordern
            for (const layer of wmsLayers) {
                try {
                    const info = await getFeatureInfo(e.latlng, layer, map);
                    if (info && info.trim() !== '') {
                        setFeatureInfo({
                            content: info,
                            latlng: e.latlng
                        });
                        return; // Stoppt nach dem ersten erfolgreichen Ergebnis
                    }
                } catch (error) {
                    console.error('Fehler beim Abrufen der FeatureInfo:', error);
                }
            }
            // Wenn kein Layer Informationen liefert, Popup schließen
            setFeatureInfo(null);
        }
    });

    // GetFeatureInfo URL erstellen
    const getFeatureInfoUrl = (latlng: L.LatLng, layer: any, map: L.Map): string => {
        const point = map.latLngToContainerPoint(latlng);
        const size = map.getSize();
        const params: any = {
            request: 'GetFeatureInfo',
            service: 'WMS',
            srs: 'EPSG:25832',
            styles: '',
            transparent: true,
            version: layer.version,
            format: 'image/png',
            bbox: transformBoundingBox(map.getBounds()),
            height: size.y,
            width: size.x,
            layers: layer.layers,
            query_layers: layer.layers,
            info_format: 'application/vnd.ogc.gml',
            singletile: layer.singleTile,
            featurecount: layer.featureCount,  // Erhöhe die Anzahl der abzufragenden Features
        };

        // Anpassung für WMS 1.3.0
        if (layer.version === '1.3.0') {
            params.crs = params.srs;
            delete params.srs;
            params.i = point.x;
            params.j = point.y;
        } else {
            params.x = point.x;
            params.y = point.y;
        }

        return layer.url + L.Util.getParamString(params, layer.url, true);
    };

    // FeatureInfo abrufen
    const getFeatureInfo = async (latlng: L.LatLng, layer: any, map: L.Map): Promise<string> => {
        const url = getFeatureInfoUrl(latlng, layer, map);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            return formatFeatureInfoResponse(text, layer.layers);
        } catch (error) {
            console.error('Fehler beim Abrufen der FeatureInfo:', error);
            return '';
        }
    };

    return featureInfo ? (
        <Popup position={featureInfo.latlng}>
            <div dangerouslySetInnerHTML={{ __html: featureInfo.content }} />
        </Popup>
    ) : null;
};

function LeafletWMSChart(props: SupersetPluginChartLeafletWMSProps) {
    const {formData, width, height, headerFontSize, boldText} = props;
    const [servicesData, setServicesData] = useState<Array<any> | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://geoportal.freiburg.de/freigis/ressources/services-internet.json');
                if (!response.ok) {
                    console.error('Fehler beim Abrufen der Services: Server-Fehler', response.status);
                    return;
                }
                let jsonData = await response.json();
                jsonData = jsonData.filter((item: any) =>
                    item.typ === 'WMS' &&
                    item.url &&
                    item.layers &&
                    !item.name.includes('Bebauungsplan')
                );
                setServicesData(jsonData);
            } catch (error) {
                console.error('Fehler beim Abrufen der Services:', error);
            }
        };

        fetchData();
    }, []);

    // Filtern Sie die WMS-Layer basierend auf den ausgewählten Namen
    const selectedLayers = servicesData && formData.wmsLayerName
        ? servicesData.filter((item: any) =>
            formData.wmsLayerName.includes(item.name)
          )
        : [];

    return (
        <Styles
            height={height}
            width={width}
            headerFontSize={headerFontSize}
            boldText={boldText}
        >
            <div style={{height: "100vh", width: "100%"}}>
                <MapContainer
                    center={[formData.viewport.latitude, formData.viewport.longitude]}
                    zoom={formData.viewport.zoom}
                    style={{width: "100%", height: "100%", zIndex: 1}}
                    maxZoom={20}
                >
                    {formData.showMap && (
                        <TileLayer url={formData.tileStyle} maxZoom={20}/>
                    )}

                    {/* WMS-Layer */}
                    {selectedLayers.map((layerData: any, index: number) => (
                        <WMSTileLayer
                            key={`wms-layer-${index}-${layerData.name}`}
                            url={layerData.url}
                            layers={layerData.layers as string}
                            format={'image/png'}
                            transparent={true}
                            version={layerData.version}
                            attribution={''}
                            opacity={formData.opacity}
                            zIndex={10}
                            maxZoom={20}
                        />
                    ))}

                    {/* Feature Info Handler */}
                    {selectedLayers.length > 0 && (
                        <FeatureInfoHandler
                            wmsLayers={selectedLayers.map((layer: any) => ({
                                url: layer.url,
                                layers: layer.layers,
                                version: layer.version,
                                singleTile: layer.singletile,
                                featureCount: layer.featurecount,
                            }))}
                        />
                    )}
                </MapContainer>
            </div>
        </Styles>
    );
}

export default LeafletWMSChart;
