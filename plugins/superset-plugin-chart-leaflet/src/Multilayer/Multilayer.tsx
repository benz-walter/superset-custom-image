import React, {useEffect, useRef, useState} from 'react';
import {SupersetPluginChartLeafletProps} from '../types';
import {Tooltip, TileLayer, CircleMarker, MapContainer, Marker, WMSTileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {Styles} from "../utils/style";
import {
    adjustViewport,
    createColorMap,
    createColorScale,
    createColorSetup,
    createLegend,
    getColor,
    getRadius,
    LayerLegendWrapper,
    LayerMapWrapper,
    LayerWrapper,
    LegendWrapper,
    mapPointTooltip,
    MapWrapper,
    rgbToHex,
    Wrapper
} from "../utils/common";
import {Legend} from "../utils/legend";
import {renderGeoJSON as polygonJson} from "../Polygon/Polygon";
import {renderGeoJSON as pointJson} from "../Point/Point";
import {renderGeoJSON as linestringJson} from "../Linestring/Linestring";

const SETUP = {
    chartParams: {},
    chartQueryContext: {},
    chartData: {},
    colNames: {},
    colTypes: {},
    colSetup: {},
}


function MapWithGeoJSON(props: SupersetPluginChartLeafletProps) {
    const mapRef = useRef(null);
    const {formData} = props;
    const [chartData, setChartData] = useState({})
    const [chartSetup, setChartSetup] = useState({})
    const [sliceIDOrder, setSliceIDOrder] = useState([])


    useEffect(() => {
        const baseUrl = window.location.origin;
        const fetchChartSetup = async (slice_id) => {
            try {
                const response = await fetch(`${baseUrl}/api/v1/chart/${slice_id}`);
                if (!response.ok) {
                    throw new Error('Netzwerkantwort war nicht in Ordnung');
                }
                return await response.json();
            } catch (error) {
                console.error('Es gab ein Problem mit dem Abrufen der Daten:', error);
            }
        };
        const fetchChartData = async (slice_id) => {
            try {
                const response = await fetch(`${baseUrl}/api/v1/chart/${slice_id}/data/`);
                if (!response.ok) {
                    throw new Error('Netzwerkantwort war nicht in Ordnung');
                }
                return await response.json();
            } catch (error) {
                console.error('Es gab ein Problem mit dem Abrufen der Daten:', error);
            }
        };

        let tempChartData = {};
        let tempChartSetup = {};
        const fetchAllChartData = async () => {
            let tempSliceIDOrder = [];
            for (const slice_id of formData.leafletSlices) {
                tempChartData[slice_id] = await fetchChartData(slice_id);
                tempSliceIDOrder.push(slice_id);
            }
            setChartData(tempChartData);
            setSliceIDOrder(tempSliceIDOrder);
        };
        const fetchAllChartSetup = async () => {
            for (const slice_id of formData.leafletSlices) {
                tempChartSetup[slice_id] = await fetchChartSetup(slice_id);
            }
            setChartSetup(tempChartSetup);
        };
        fetchAllChartData();
        fetchAllChartSetup();

    }, [formData]);

    useEffect(() => {
        let totalGeo = []
        Object.keys(chartData).map(slice_id => {
            const data = SETUP.chartData[slice_id];  // Daten für das aktuelle Chart
            const fd = SETUP.chartParams[slice_id];  // Params für das aktuelle Chart
            const geoData = data.map((d) => {
                return JSON.parse(d[fd['geometry']])
            })
            totalGeo = [...totalGeo, ...geoData]
        })
        if (mapRef.current && totalGeo.length > 0) {
            adjustViewport(mapRef, totalGeo);
        }
    }, [chartData]);

    const getLayers = () => {
        Object.keys(chartData).forEach(key => {
            SETUP.chartData[key] = chartData[key].result[0].data;
            SETUP.colNames[key] = chartData[key].result[0].colnames
            SETUP.colTypes[key] = chartData[key].result[0].coltypes
        })
        Object.keys(chartSetup).forEach(key => {
            SETUP.chartParams[key] = JSON.parse(chartSetup[key].result.params);
            SETUP.chartQueryContext[key] = JSON.parse(chartSetup[key].result.query_context);
        })
        // const polygonLayers = [];
        // const linestringLayers = [];
        // const pointLayers = [];

        const layers = []

        sliceIDOrder.forEach(slice_id => {
            const data = SETUP.chartData[slice_id];  // Daten für das aktuelle Chart
            const fd = SETUP.chartParams[slice_id];  // Params für das aktuelle Chart
            const colorSetup= createColorSetup(SETUP.chartParams[slice_id], SETUP.chartData[slice_id], SETUP.colTypes[slice_id], SETUP.colNames[slice_id]);
            SETUP.colSetup[slice_id] = colorSetup
            const geoData = data.map((d) => JSON.parse(d[fd['geometry']]));
            if (fd.viz_type == "leaflet_polygon") {
                layers.push(polygonJson(fd, data, geoData, colorSetup));
            }
            else if (fd.viz_type == "leaflet_linestring") {
                layers.push(linestringJson(fd, data, geoData, colorSetup));
            }
            else {
                layers.push(pointJson(fd, data, geoData, colorSetup));
            }
            // switch (fd.viz_type) {
            //     case "leaflet_polygon":
            //         polygonLayers.push(polygonJson(fd, data, geoData, colorSetup));
            //         break;
            //     case "leaflet_linestring":
            //         linestringLayers.push(linestringJson(fd, data, geoData, colorSetup));
            //         break;
            //     case "leaflet_point":
            //         pointLayers.push(pointJson(fd, data, geoData, colorSetup));
            //         break;
            //     default:
            //         break;
            // }
        });

        // Kombiniere alle Layer in der gewünschten Reihenfolge
        // return [...polygonLayers, ...linestringLayers, ...pointLayers];
        return layers;
    }
    const getLegends = () => {
        return sliceIDOrder.map(slice_id => {
            const fd = SETUP.chartParams[slice_id];
            const data = SETUP.chartData[slice_id]
            const colTypes = SETUP.colTypes[slice_id];
            const colNames = SETUP.colNames[slice_id];
            const colorSetup = SETUP.colSetup[slice_id];
            if (sliceIDOrder && fd.showLegend && colorSetup &&  colorSetup.colorData?.length > 0 && colorSetup.colorData[0] != undefined && (fd.colorDimension || fd.colorMetric?.length > 0)){
                return createLegend(fd, data, colTypes, colNames, colorSetup)
            }
        });
    }
    return (
        <Styles>
            <LayerWrapper className={'LayerWrapper'}>
                <LayerMapWrapper>
                    <MapContainer ref={mapRef} center={[0, 0]} zoom={10} maxZoom={20}
                                  style={{width: "100%", height: "100%", zIndex: 1}}>
                        <TileLayer url={formData.tileStyle} maxZoom={20}/>
                        {formData.wmsUrl && (
                            <WMSTileLayer
                                url={formData.wmsUrl}
                                params={{
                                    layers: formData.wmsLayers,
                                    format: 'image/png',
                                    transparent: true,
                                }}
                                maxZoom={20}
                                opacity={formData.wmsOpacity}
                            />
                        )}
                        {chartData && chartSetup && sliceIDOrder && getLayers()}
                    </MapContainer>
                </LayerMapWrapper>
                <div key={'LegendWrapper'} className='layer-legend-wrapper'>
                {getLegends()}
                </div>
            </LayerWrapper>
        </Styles>
    );
}

export default MapWithGeoJSON;
