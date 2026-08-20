import L from 'leaflet';
import chroma from 'chroma-js';
import styled from "styled-components";
import {Legend} from "./legend";
import { ColorSetup } from "../types";
import { useMap } from 'react-leaflet';
import {useEffect} from 'react';

export function ChangeView({ geoData }: { geoData: any }) {
  const map = useMap();
  useEffect(() => {
    if (map && geoData && geoData.length > 0) {
      try {
        const bounds = L.geoJSON(geoData).getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds);
        }
      } catch (e) {
        console.error('Failed to fit bounds:', e);
      }
    }
  }, [geoData, map]);

  return null;
}

export function rgbToHex(red: number, green: number, blue: number) {
    const rgb = (red << 16) | (green << 8) | (blue << 0);
    return '#' + (0x1000000 + rgb).toString(16).slice(1);
}

export const getColor = (index: number, colorSetup: ColorSetup) => {
    let value = colorSetup.colorData[index]
    if ((colorSetup.dataType === 'categorical')) {
        return colorSetup.colorMap[value];
    } else {
        return colorSetup.colorScale(value).hex();
    }
};

export const getRadius = (index: number, radiusData: any[], minRadius: number, maxRadius: number, radiusLimits: number[]) => {
    const value = radiusData[index]
    return minRadius + (maxRadius - minRadius) / radiusLimits[1] * value;
};


export const styleFeature = (formData: any, feature: any, index: number, fixedColor: boolean, colorSetup: ColorSetup, fillColor: any, lineWidth: number, opacity: number, lineColor: any) => {
    return {
        fillColor: fixedColor || !colorSetup.colorData ? rgbToHex(fillColor['r'], fillColor['g'], fillColor['b']) : getColor(index, colorSetup),
        color: fixedColor || !colorSetup.colorData ? rgbToHex(lineColor['r'], lineColor['g'], lineColor['b']) : getColor(index, colorSetup),
        weight: lineWidth,
        opacity: opacity,
        fillOpacity: opacity,
    };
};
export function parseHTML(html: string) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}

export function addSeparator(value: any) {
    if (value !== undefined && value !== null) {
        return value.toLocaleString("de-DE");
    }
    return value;
}

export function createColorSetup(formData: any, data: any[], coltypes: any[], colnames: any[]) {
    let tempSetup: ColorSetup = {
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
        tempSetup.colorData = data.map((d: any) => {
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
        tempSetup.colorData = data.map((d: any) => {
            return d[formData[tempSetup.colorDataType].label];
        });
        tempSetup.colorLimits = [Math.min(...tempSetup.colorData), Math.max(...tempSetup.colorData)]
        tempSetup.colorScale = createColorScale(formData.colorScale, tempSetup.colorLimits)
    }
    return tempSetup;
}

export const createColorMap = (colorScale: any, colorData: any[]) => {
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

export const createColorScale = (colorScale: any, colorLimits: number[]) => {
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


export const mapPointTooltip = (index: number, tooltipData: Record<string, any[]>, customTooltip: boolean, tooltipText?: string) => {
    let columns = Object.keys(tooltipData)
    if (customTooltip && tooltipText) {
        const processedHtmlStr = tooltipText.replace(/\${data\['(\w+|\w+\(\w+\))'\]}/g, (_match: string, p1: string) => addSeparator(tooltipData[p1]?.[index]) || '');
        return (
            <div dangerouslySetInnerHTML={{ __html: processedHtmlStr }} />
        )
    }
    return (
        <div>
            {columns.map(column => (
                <div key={column}>
                    <strong>{column}:</strong> {addSeparator(tooltipData[column]?.[index])}<br/>
                </div>
            ))}
        </div>
    )
};

export const createLegend = (fd: any, data: any[], coltypes: any[], colnames: any[], colorSetup: ColorSetup) => {
    return <Legend
        key={JSON.stringify(fd) + 'Legend'}
        colorSetup={colorSetup}
        legendTitle={fd.legendTitle}
    />
}

export const createToolTipData = (fd: any, data: any[]) => {
    let tooltipData: Record<string, any[]> = {}
    if (fd.tooltipDimension) {
        fd.tooltipDimension.forEach((key: any) => {
            tooltipData[key] = data.map((d: any) => {
                return d[key];
            });
        })
    }
    if (fd.tooltipMetric) {
        fd.tooltipMetric.forEach((key: any) => {
            tooltipData[key.label] = data.map((d: any) => {
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
