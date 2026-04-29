import React from "react";
import {addSeparator} from "./common";

const getLegendColor = (colorSetup, value) => {
    if (colorSetup.dataType === 'categorical') {
        return colorSetup.colorMap[value];
    } else {
        return colorSetup.colorScale(value).hex();
    }
};

export const Legend = ({colorSetup, legendTitle}) => {
    const nColors = 100
    const getColorScaleLegend = () => {
        let colors = []
        const legendItems = [];
        if (colorSetup.dataType === 'continuous') {
            let data = [colorSetup.colorLimits[0].toFixed(1)]
            const step = (colorSetup.colorLimits[1] - colorSetup.colorLimits[0]) / nColors
            let i
            for (i = 1; i < nColors - 1; i++) {
                data.push(null);
            }
            data.push(colorSetup.colorLimits[1].toFixed(1))
            let tempColorData = []
            for (i = 0; i < nColors; i++) {
                tempColorData.push((colorSetup.colorLimits[0] + i * step).toFixed(1));
            }
            colors = tempColorData.map((value) => {
                return getLegendColor(colorSetup, value);
            });
            legendItems.push(<li key={JSON.stringify(colorSetup.colorLimits[0])}
                                 style={{height: '10px'}}>{addSeparator(parseFloat(colorSetup.colorLimits[0].toFixed(1)))}</li>)
            for (let i = 0; i < data.length; i++) {
                legendItems.push(
                    <li key={i}><span style={{background: colors[i]}}></span></li>
                );

            }
            legendItems.push(<li key={JSON.stringify(colorSetup.colorLimits[1])} style={{
                height: '10px',
                paddingTop: '110px'
            }}>{addSeparator(parseFloat(colorSetup.colorLimits[1].toFixed(1)))}</li>)

            return (
                <div>{legendItems}</div>
            );
        } else if (colorSetup.dataType === 'numberCategorical') {
            let data = colorSetup.colorData.sort((a, b) => a - b)
            colors = data.map((value) => {
                return getLegendColor(colorSetup, value);
            });

            for (let i = 0; i < data.length; i++) {
                const entry = data[i].length === 0 ? 'UNNAMED' : data[i]
                legendItems.push(
                    <li key={i}><span style={{background: colors[i]}}></span>{addSeparator(entry)}</li>
                );
            }
            return (
                <div>{legendItems}</div>
            );
        } else {
            for (let key of Object.keys(colorSetup.colorMap)) {
                let background = colorSetup.colorMap[key]
                if (key === '<p></p>') {
                    key = 'UNNAMED'
                }
                legendItems.push(
                    <li><span style={{background: background}}></span>
                        <div dangerouslySetInnerHTML={{__html: key}}/>
                    </li>
                );
            }
            return (
                <div>{legendItems}</div>
            );
        }
    };
    if (colorSetup.dataType === 'continuous') {
        return (
            <div className='legend'>
                <div className='horilegend-title'
                     style={{fontSize: colorSetup.legendTitleSize}}>{legendTitle || colorSetup.legendColorName}</div>
                <div className='horilegend-scale'>
                    <ul className='horilegend-labels'>
                        {getColorScaleLegend()}
                    </ul>
                </div>
            </div>
        );
    }
    return (
        <div className='legend'>
            <div className='legend-title'
                 style={{fontSize: colorSetup.legendTitleSize}}>{legendTitle || colorSetup.legendColorName}</div>
            <div className='legend-scale'>
                <ul className='legend-labels'>
                    {getColorScaleLegend()}
                </ul>
            </div>
        </div>
    );
};