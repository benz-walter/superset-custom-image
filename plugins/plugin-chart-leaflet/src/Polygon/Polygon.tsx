import {useEffect, useRef, useState} from 'react';
import {
  SupersetPluginChartLeafletProps, SupersetPluginChartLeafletQueryFormData, GeoJSONFeature, ColorSetup
} from '../types';
import {GeoJSON, MapContainer, TileLayer, Tooltip, WMSTileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {Styles} from "../utils/style";
import { TimeseriesDataRecord } from '@superset-ui/core';
import {
  ChangeView,
    createColorSetup, createLegend, createToolTipData,
    LegendWrapper,
    mapPointTooltip,
    MapWrapper,
    styleFeature,
    Wrapper
} from "../utils/common";


export const renderGeoJSON = (
  fd: SupersetPluginChartLeafletQueryFormData,
  data: TimeseriesDataRecord[],
  geo: GeoJSONFeature[],
  colorSetup: ColorSetup,
) => {
    let fixedColor = fd.fixedColor
    let lineWidth = fd.lineWidth
    let opacity = fd.opacity
    let tooltipText = fd.tooltipText
    let fillColor = fd.fillColor
    let lineColor = fd.lineColor
    let tooltipData = createToolTipData(fd, data)
    return geo.map((feature, index) => {
        return (
            <GeoJSON
                key={(feature.id || index) + JSON.stringify(feature) + JSON.stringify(fd)}
                data={feature as any}
                style={(feature) => styleFeature(fd, feature, index, fixedColor, colorSetup, fillColor, lineWidth, opacity, lineColor)}
            >
                {Object.keys(tooltipData).length > 0 && <Tooltip key={(feature.id || index) + JSON.stringify(feature) + JSON.stringify(fd) + 'ToolTip'}>{mapPointTooltip(index, tooltipData, fd.customTooltip, tooltipText)}</Tooltip>}
            </GeoJSON>
        );

    });
};

function MapWithGeoJSON(props: SupersetPluginChartLeafletProps) {
    const mapRef = useRef(null);
    const {data, formData, payload} = props;
    const [geoData, setGeoData] = useState<GeoJSONFeature[] | null>(null)
    const [filteredData, setFilteredData] = useState<TimeseriesDataRecord[] | null>(null)
    const [colorSetup, setColorSetup] = useState<ColorSetup | null>(null)
    const colTypes = payload?.[0]?.coltypes || [];
    const colNames = payload?.[0]?.colnames || [];

    useEffect(() => {
        let tempData = data.map((d) => {
            const geom = d[formData['geometry'] as string];
            return typeof geom === 'string' ? JSON.parse(geom) : geom;
        });
        tempData = tempData.filter(element => element !== null);
        let tempFilteredData = data.filter(element => element !== null);
        setFilteredData(tempFilteredData)
        setGeoData(tempData);
    }, [data, formData]);

    useEffect(() => {
        let tempColorSetup = createColorSetup(formData, data, colTypes, colNames)
        setColorSetup(tempColorSetup)
    }, [data, formData])


    return (
        <Styles>
            <Wrapper>
                <MapWrapper>
                    <MapContainer ref={mapRef} center={[0, 0]} zoom={10} maxZoom={20}
                                  style={{width: "100%", height: "100%", zIndex: 1}}>
                        <ChangeView geoData={geoData} />
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

                        {geoData && colorSetup && filteredData && renderGeoJSON(formData, filteredData, geoData, colorSetup)}
                    </MapContainer>
                </MapWrapper>
                {formData.showLegend && colorSetup && colorSetup.colorData?.length > 0 && colorSetup.colorData[0] !== undefined && (formData.colorDimension || (Array.isArray(formData.colorMetric) ? formData.colorMetric.length > 0 : !!formData.colorMetric)) &&
                    <LegendWrapper>
                        {createLegend(formData, data, colTypes, colNames, colorSetup)}
                    </LegendWrapper>}
            </Wrapper>
        </Styles>
    );
}

export default MapWithGeoJSON;
