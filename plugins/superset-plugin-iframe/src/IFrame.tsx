import React from 'react';
import {SupersetPluginChartIFrameProps, SupersetPluginChartIFrameStylesProps} from './types';
import {styled} from '@superset-ui/core';

const Styles = styled.div<SupersetPluginChartIFrameStylesProps>`
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
`;

function IFrameChart(props: SupersetPluginChartIFrameProps) {
    const { formData, height, width } = props;
    return (
        <Styles
            height={height}
            width={width}
            headerFontSize="m"
            boldText={false}
>
            <iframe src={formData.externalWebsite}
                style={{
                    width: '90%',
                    height: '80vh',
                    border: 'none',
                    display: 'block'
                }}
/>
        </Styles>
    );
}

export default IFrameChart;