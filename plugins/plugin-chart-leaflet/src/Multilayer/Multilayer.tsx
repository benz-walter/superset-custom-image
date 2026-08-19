import {useEffect, useRef, useState} from 'react';
import {SupersetPluginChartLeafletProps, LeafletSetup} from '../types';
import {TileLayer, MapContainer, WMSTileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {Styles} from "../utils/style";
import {
    adjustViewport,
    createColorSetup,
    createLegend,
    LayerMapWrapper,
    LayerWrapper
} from "../utils/common";
import {renderGeoJSON as polygonJson} from "../Polygon/Polygon";
import {renderGeoJSON as pointJson} from "../Point/Point";
import {renderGeoJSON as linestringJson} from "../Linestring/Linestring";

const SETUP: LeafletSetup = {
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
    const [chartData, setChartData] = useState<Record<string, any>>({})
    const [chartSetup, setChartSetup] = useState<Record<string, any>>({})
    const [sliceIDOrder, setSliceIDOrder] = useState<any[]>([])


    useEffect(() => {
        const baseUrl = window.location.origin;
        const fetchChartSetup = async (slice_id: string | number) => {
            if (!slice_id || isNaN(Number(slice_id))) return null;
            try {
                const response = await fetch(`${baseUrl}/api/v1/chart/${slice_id}`);
                if (!response.ok) {
                    throw new Error('Netzwerkantwort war nicht in Ordnung');
                }
                return await response.json();
            } catch (error) {
                console.error('Es gab ein Problem mit dem Abrufen der Daten:', error);
                return null;
            }
        };
        const fetchChartData = async (slice_id: string | number) => {
            if (!slice_id || isNaN(Number(slice_id))) return null;
            try {
                const response = await fetch(`${baseUrl}/api/v1/chart/${slice_id}/data/`);
                if (!response.ok) {
                    throw new Error('Netzwerkantwort war nicht in Ordnung');
                }
                return await response.json();
            } catch (error) {
                console.error('Es gab ein Problem mit dem Abrufen der Daten:', error);
                return null;
            }
        };

        let tempChartData: Record<string, any> = {};
        let tempChartSetup: Record<string, any> = {};
        const fetchAllChartData = async () => {
            let tempSliceIDOrder: any[] = [];
            if (Array.isArray(formData.leafletSlices)) {
                for (const slice_id of formData.leafletSlices) {
                    if (slice_id && !isNaN(Number(slice_id))) {
                        const data = await fetchChartData(slice_id);
                        if (data) {
                            tempChartData[slice_id] = data;
                            tempSliceIDOrder.push(slice_id);
                        }
                    }
                }
            }
            setChartData(tempChartData);
            setSliceIDOrder(tempSliceIDOrder);
        };
        const fetchAllChartSetup = async () => {
            if (Array.isArray(formData.leafletSlices)) {
                for (const slice_id of formData.leafletSlices) {
                    if (slice_id && !isNaN(Number(slice_id))) {
                        const setup = await fetchChartSetup(slice_id);
                        if (setup) {
                            tempChartSetup[slice_id] = setup;
                        }
                    }
                }
            }
            setChartSetup(tempChartSetup);
        };
        fetchAllChartData();
        fetchAllChartSetup();

    }, [formData]);

    useEffect(() => {
        let totalGeo: any[] = []
        Object.keys(chartData).forEach(slice_id => {
            const data = SETUP.chartData[slice_id];  // Daten für das aktuelle Chart
            const fd = SETUP.chartParams[slice_id];  // Params für das aktuelle Chart
            if (data && fd && fd['geometry']) {
                const geoData = data.map((d: any) => {
                    const geom = d[fd['geometry'] as string];
                    return typeof geom === 'string' ? JSON.parse(geom) : geom;
                });
                totalGeo = [...totalGeo, ...geoData];
            }
        });
        if (mapRef.current && totalGeo.length > 0) {
            adjustViewport(mapRef, totalGeo);
        }
    }, [chartData]);

    const getLayers = () => {
        Object.keys(chartData).forEach(key => {
            SETUP.chartData[key] = chartData[key]?.result?.[0]?.data;
            SETUP.colNames[key] = chartData[key]?.result?.[0]?.colnames;
            SETUP.colTypes[key] = chartData[key]?.result?.[0]?.coltypes;
        })
        Object.keys(chartSetup).forEach(key => {
            if (chartSetup[key]?.result?.params) {
                SETUP.chartParams[key] = JSON.parse(chartSetup[key].result.params);
            }
            if (chartSetup[key]?.result?.query_context) {
                SETUP.chartQueryContext[key] = JSON.parse(chartSetup[key].result.query_context);
            }
        })

        const layers: any[] = []

        sliceIDOrder.forEach(slice_id => {
            const data = SETUP.chartData[slice_id];  // Daten für das aktuelle Chart
            const fd = SETUP.chartParams[slice_id];  // Params für das aktuelle Chart
            if (data && fd) {
                const colorSetup = createColorSetup(SETUP.chartParams[slice_id], SETUP.chartData[slice_id], SETUP.colTypes[slice_id], SETUP.colNames[slice_id]);
                SETUP.colSetup[slice_id] = colorSetup
                const geoData = data.map((d: any) => {
                    const geom = d[fd['geometry'] as string];
                    return typeof geom === 'string' ? JSON.parse(geom) : geom;
                });
                if (fd.viz_type == "leaflet_polygon") {
                    layers.push(polygonJson(fd, data, geoData, colorSetup));
                }
                else if (fd.viz_type == "leaflet_linestring") {
                    layers.push(linestringJson(fd, data, geoData, colorSetup));
                }
                else {
                    layers.push(pointJson(fd, data, geoData, colorSetup));
                }
            }
        });

        return layers;
    }
    const getLegends = () => {
        return sliceIDOrder.map(slice_id => {
            const fd = SETUP.chartParams[slice_id];
            const data = SETUP.chartData[slice_id]
            const colTypes = SETUP.colTypes[slice_id];
            const colNames = SETUP.colNames[slice_id];
            const colorSetup = SETUP.colSetup[slice_id];
            if (sliceIDOrder && fd?.showLegend && colorSetup && colorSetup.colorData?.length > 0 && colorSetup.colorData[0] !== undefined && (fd.colorDimension || (Array.isArray(fd.colorMetric) ? fd.colorMetric.length > 0 : !!fd.colorMetric))){
                return createLegend(fd, data, colTypes, colNames, colorSetup);
            }
            return null;
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
