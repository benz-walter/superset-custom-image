import React, {useEffect, useRef, useState} from 'react';
import {SupersetPluginChartLeafletProps} from '../types';
import {CircleMarker, MapContainer, Marker, TileLayer, Tooltip, WMSTileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {Styles} from "../utils/style";
import {
    adjustViewport,
    createColorSetup,
    createLegend, createToolTipData,
    getColor,
    getRadius,
    LegendWrapper,
    mapPointTooltip,
    MapWrapper,
    rgbToHex,
    Wrapper
} from "../utils/common";

export const renderGeoJSON = (fd, data, geo, colorSetup) => {
    let radiusData = []
    let radiusLimits = []
    let minRadius = null
    let maxRadius = null
    let fixedColor = fd.fixedColor
    let lineWidth = fd.lineWidth
    let opacity = fd.opacity
    let fillColor = fd.fillColor
    let lineColor = fd.lineColor
    let tooltipText = fd.tooltipText
    let tooltipData = createToolTipData(fd, data)

    if (fd.radiusMetric && fd.radiusMetric instanceof Object) {
        radiusData = data.map((d) => {
            return d[fd.radiusMetric.label];
        });
        radiusLimits = [Math.min(...radiusData), Math.max(...radiusData)]
        maxRadius = fd['radiusMax']
        minRadius = fd['radiusMin']
    }

    return geo.map((feature, index) => {
        const {coordinates} = feature.geometry;
        if (fd.markerIconUrl && fd.iconUrlColumn?.length > 0) {
            const markerIcon = new L.Icon({
                iconUrl: data[index][fd.iconUrlColumn] || 'data/black-placeholder-variant.png',
                iconSize: [fd.markerSize, null], // Größe des Icons
            })
            return (
                <Marker
                    key={(feature.id || index) + JSON.stringify(feature) + JSON.stringify(fd)}
                    position={[coordinates[1], coordinates[0]]}
                    icon={markerIcon}
                >
                    {Object.keys(tooltipData).length > 0 &&
                        <Tooltip
                            key={(feature.id || index) + JSON.stringify(feature) + JSON.stringify(fd) + 'ToolTip'}>{mapPointTooltip(index, tooltipData, fd.customTooltip, tooltipText)}</Tooltip>}
                </Marker>
            )
        } else {
            return (
                <CircleMarker
                    key={(feature.id || index) + JSON.stringify(feature) + JSON.stringify(fd)}
                    center={[coordinates[1], coordinates[0]]}
                    fillColor={!fixedColor && colorSetup.colorData ? getColor(index, colorSetup) : rgbToHex(fillColor['r'], fillColor['g'], fillColor['b'])}
                    radius={fd.fixedRadius || radiusData === null ||  radiusData.every(item => item === undefined) ? fd.radius : getRadius(index, radiusData, minRadius, maxRadius, radiusLimits)}
                    weight={lineWidth}
                    color={!fixedColor && colorSetup.colorData ? getColor(index, colorSetup) : rgbToHex(lineColor['r'], lineColor['g'], lineColor['b'])}
                    opacity={opacity}
                    fillOpacity={opacity}
                >
                    {Object.keys(tooltipData).length > 0 &&
                        <Tooltip
                            key={(feature.id || index) + JSON.stringify(feature) + JSON.stringify(fd) + 'ToolTip'}>{mapPointTooltip(index, tooltipData, fd.customTooltip, tooltipText)}</Tooltip>}
                </CircleMarker>
            );
        }
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
                        {geoData && renderGeoJSON(formData, filteredData, geoData, colorSetup)}
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