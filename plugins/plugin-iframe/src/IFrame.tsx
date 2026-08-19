import {SupersetPluginChartIFrameProps, SupersetPluginChartIFrameStylesProps} from './types';
import {styled} from '@apache-superset/core/theme';

const Styles = styled.div<SupersetPluginChartIFrameStylesProps>`
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
