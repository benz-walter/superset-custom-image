import L from 'leaflet';
import chroma from 'chroma-js';
import React from "react";
import styled from "styled-components";
import {Legend} from "./legend";


export function adjustViewport(mapRef, geojsonData) {
    if (geojsonData == null) return [0, 0];
    mapRef.current.fitBounds(L.geoJSON(geojsonData).getBounds());
}


export function rgbToHex(red, green, blue) {
    const rgb = (red << 16) | (green << 8) | (blue << 0);
    return '#' + (0x1000000 + rgb).toString(16).slice(1);
}

export const getColor = (index, colorSetup) => {
    let value = colorSetup.colorData[index]
    if ((colorSetup.dataType === 'categorical')) {
        return colorSetup.colorMap[value];
    } else {
        return colorSetup.colorScale(value).hex();
    }
};

export const getRadius = (index, radiusData, minRadius, maxRadius, radiusLimits) => {
    const value = radiusData[index]
    return minRadius + (maxRadius - minRadius) / radiusLimits[1] * value;
};


export const styleFeature = (formData, feature, index, fixedColor,colorSetup, fillColor, lineWidth, opacity, lineColor) => {
    return {
        fillColor: fixedColor || !colorSetup.colorData ? rgbToHex(fillColor['r'], fillColor['g'], fillColor['b']) : getColor(index, colorSetup),
        color: fixedColor || !colorSetup.colorData ? rgbToHex(lineColor['r'], lineColor['g'], lineColor['b']) : getColor(index, colorSetup),
        weight: lineWidth,
        opacity: opacity,
        fillOpacity: opacity,
    };
};
export function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}

export function addSeparator(value) {
    if (value !== undefined && value !== null) {
        return value.toLocaleString("de-DE");
    }
    return value;
}

export function createColorSetup(formData, data,  coltypes, colnames)  {
    let tempSetup = {
        dataType: 'continuous',
        colorLimits: [0, 100],
        colorMap: {},
        colorScale: null,
        colorDataType: 'colorDimension',
        legendColorName: '',
        colorData: [],
        sortedColorData: []
    }
    if (formData.colorDimension && formData.colorMetric?.length == 0) {
        tempSetup.colorDataType = 'colorDimension'
        tempSetup.legendColorName = formData[tempSetup.colorDataType]
        tempSetup.colorData = data.map((d) => {
            return d[formData[tempSetup.colorDataType]];
        });
        if (formData.customColorSelect && formData.customColor) {
            tempSetup.dataType = 'categorical'
            tempSetup.colorMap = JSON.parse(formData.customColor)
            const defaultColor = tempSetup.colorMap['default'] || '#000000';
            tempSetup.colorMap = { ...tempSetup.colorMap };
            const uniqueValues = [...new Set(tempSetup.colorData)];
            uniqueValues.forEach(val => {
                if (tempSetup.colorMap[val] === undefined) {
                    tempSetup.colorMap[val] = defaultColor;
                }
            });

            tempSetup.sortedColorData = uniqueValues.sort();
        }
        else if (coltypes[colnames.indexOf(formData.colorDimension)] === 1) {
            tempSetup.dataType = 'categorical'
            tempSetup.colorMap = createColorMap(formData.colorScale, tempSetup.colorData)
            tempSetup.sortedColorData = [...new Set(tempSetup.colorData)].sort()
        } else {
            tempSetup.dataType = 'continuous'
            tempSetup.colorLimits = [Math.min(...tempSetup.colorData), Math.max(...tempSetup.colorData)]
            tempSetup.colorScale = createColorScale(formData.colorScale, tempSetup.colorLimits)
        }
    } else if (formData.colorMetric) {
        tempSetup.colorDataType = 'colorMetric'
        tempSetup.dataType = 'continuous'
        tempSetup.legendColorName = formData[tempSetup.colorDataType].label
        tempSetup.colorData = data.map((d) => {
            return d[formData[tempSetup.colorDataType].label];
        });
        tempSetup.colorLimits = [Math.min(...tempSetup.colorData), Math.max(...tempSetup.colorData)]
        tempSetup.colorScale = createColorScale(formData.colorScale, tempSetup.colorLimits)
    }
    return tempSetup;
}

export const createColorMap = (colorScale, colorData) => {
    let scale = colorScale
    if (colorScale == 'RdYlGr') {
        scale = ['red', 'yellow', 'green']
    } else if (colorScale == 'GrYlRd') {
        scale = ['green', 'yellow', 'red']
    } else if (colorScale == 'BlRdYl') {
        scale = ['black', 'red', 'yellow']
    } else if (colorScale == 'YlNa') {
        scale = ['yellow', 'navy']
    } else if (colorScale == 'RdGrOr') {
        scale = ['red', 'green', 'orange']
    } else if (colorScale == 'RdGrBkOr') {
        scale = ['red', 'green', 'black', 'orange']
    }
    let sortedColorData = [...new Set(colorData)].sort()
    const stringColors = chroma.scale(scale).mode('lab').colors(sortedColorData.length);
    let colorMap = Object.fromEntries(
        stringColors.map((num, index) => [sortedColorData[index], num])
    );
    return colorMap
}

export const createColorScale = (colorScale, colorLimits) => {
    let scale = colorScale;
    if (colorScale == 'RdYlGr') {
        scale = ['red', 'yellow', 'green']
    } else if (colorScale == 'GrYlRd') {
        scale = ['green', 'yellow', 'red']
    } else if (colorScale == 'BlRdYl') {
        scale = ['black', 'red', 'yellow']
    } else if (colorScale == 'YlNa') {
        scale = ['yellow', 'navy']
    } else if (colorScale == 'RdGrOr') {
        scale = ['red', 'green', 'orange']
    } else if (colorScale == 'RdGrBkOr') {
        scale = ['red', 'green', 'black', 'orange']
    }
    return chroma.scale(scale).domain([colorLimits[0], colorLimits[1]]).mode('lab');
}


export const mapPointTooltip = (index, tooltipData, customTooltip, tooltipText) => {
    let columns = Object.keys(tooltipData)
    if (customTooltip && tooltipText) {
        const processedHtmlStr = tooltipText.replace(/\${data\['(\w+|\w+\(\w+\))'\]}/g, (match, p1) => addSeparator(tooltipData[p1][index]) || '');
        return (
            <div dangerouslySetInnerHTML={{ __html: processedHtmlStr }} />
        )
    }
    return (
        <div>
            {columns.map(column => (
                <div key={column}>
                    <strong>{column}:</strong> {addSeparator(tooltipData[column][index])}<br/>
                </div>
            ))}
        </div>
    )
};

export const createLegend = (fd, data, coltypes, colnames, colorSetup) => {
    return <Legend
        key={JSON.stringify(fd) + 'Legend'}
        colorSetup={colorSetup}
        legendTitle={fd.legendTitle}
    />
}

export const createToolTipData = (fd, data) => {
    let tooltipData = {}
    if (fd.tooltipDimension) {
        fd.tooltipDimension.forEach(key => {
            tooltipData[key] = data.map((d) => {
                return d[key];
            });
        })
    }
    if (fd.tooltipMetric) {
        fd.tooltipMetric.forEach(key => {
            tooltipData[key.label] = data.map((d) => {
                return d[key.label];
            });
        })
    }
    return tooltipData
}

export const Wrapper = styled.div`
    display: flex;
    height: 100vh;
`;

export const MapWrapper = styled.div`
    width: 93%;//flex: 9; // Diese Flex-Eigenschaft bestimmt, wie viel Platz die Karte relativ zur Legende einnimmt
    position: relative;
`;

export const LegendWrapper = styled.div`
    width: 7%;//flex: 1; // Diese Flex-Eigenschaft bestimmt, wie viel Platz die Legende relativ zur Karte einnimmt
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const LayerWrapper = styled.div`
    display: flex;
    height: 100vh;
    flex-direction: row; /* Dieser Container hält die Karte und die Legenden nebeneinander */
`;

export const LayerMapWrapper = styled.div`
    width: 93%; /* Flex-Eigenschaft bestimmt, wie viel Platz die Karte relativ zur Legende einnimmt */
    position: relative;
`;

export const LayerLegendWrapper = styled.div`
    display: flex;
    flex-direction: column; /* Setze die Richtung auf Spalten */
    justify-content: center;
    margin-left: 10px;
    margin-bottom: 30px;
    align-items: center;
`;