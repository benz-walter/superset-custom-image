import React, {useEffect, useRef, useState} from 'react';
import {SupersetPluginChartLeafletProps} from '../types';
import {GeoJSON, MapContainer, TileLayer, Tooltip, WMSTileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {Styles} from "../utils/style";
import {
    adjustViewport,
    createColorSetup,
    createLegend,
    createToolTipData,
    LegendWrapper,
    mapPointTooltip,
    MapWrapper,
    styleFeature,
    Wrapper
} from "../utils/common";


export const renderGeoJSON = (fd, data, geo, colorSetup) => {
    let fixedColor = fd.fixedColor
    let lineWidth = fd.lineWidth
    let opacity = fd.opacity
    let tooltipText = fd.tooltipText
    let lineColor = fd.lineColor
    let tooltipData = createToolTipData(fd, data)
    return geo.map((feature, index) => {
        return (
            <GeoJSON
                key={(feature.id || index) + JSON.stringify(feature) + JSON.stringify(fd)}
                data={feature}
                style={(feature) => styleFeature(fd, feature, index, fixedColor, colorSetup, lineColor, lineWidth, opacity, lineColor)}
            >
                {Object.keys(tooltipData).length > 0 && <Tooltip
                    key={(feature.id || index) + JSON.stringify(feature) + JSON.stringify(fd) + 'ToolTip'}>{mapPointTooltip(index, tooltipData, fd.customTooltip, tooltipText)}</Tooltip>}
            </GeoJSON>
        );

    });
};

function MapWithGeoJSON(props: SupersetPluginChartLeafletProps) {
    const mapRef = useRef(null);
    const {data, formData, payload} = props;
    const [geoData, setGeoData] = useState(null)
    const [filteredData, setFilteredData] = useState(null)
    const [colorSetup, setColorSetup] = useState(null)
    const colTypes = payload[0].coltypes;
    const colNames = payload[0].colnames;

    useEffect(() => {
        let tempData = data.map((d) => {
            return JSON.parse(d[formData['geometry']]);
        });
        tempData = tempData.filter(element => element !== null);
        let tempFilteredData = data.filter(element => element !== null);
        setFilteredData(tempFilteredData)
        setGeoData(tempData);
    }, [data, formData]);

    useEffect(() => {
        let tempColorSetup = createColorSetup(formData, data, colTypes, colNames)
        setColorSetup(tempColorSetup)
    }, [data, formData]);

    useEffect(() => {
        if (mapRef.current && geoData) {
            adjustViewport(mapRef, geoData);
        }
    }, [geoData]);


    return (
        <Styles>
            <Wrapper>
                <MapWrapper>
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
                        {geoData && colorSetup && renderGeoJSON(formData, filteredData, geoData, colorSetup)}
                    </MapContainer>
                </MapWrapper>
                {formData.showLegend && colorSetup && colorSetup.colorData?.length > 0 && colorSetup.colorData[0] != undefined && (formData.colorDimension || formData.colorMetric?.length > 0) &&
                    <LegendWrapper>
                        {createLegend(formData, data, colTypes, colNames, colorSetup)}
                    </LegendWrapper>}
            </Wrapper>
        </Styles>
    );
}

export default MapWithGeoJSON;