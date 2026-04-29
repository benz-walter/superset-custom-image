import {styled} from "@superset-ui/core";
import {SupersetPluginChartLeafletStylesProps} from "../types";


export const Styles = styled.div<SupersetPluginChartLeafletStylesProps>`
    padding: ${({theme}) => theme.gridUnit * 4}px;
    border-radius: ${({theme}) => theme.gridUnit * 2}px;

    pre {
        height: ${({theme, headerFontSize, height}) => (
                height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]
        )}px;
    }

    .polygon-tooltip {
        background-color: transparent !important; /* Hintergrundfarbe auf transparent setzen */
        border: none !important; /* Rand entfernen */
        box-shadow: none !important; /* Schatten entfernen */
        color: #333;
    }

    .legend {
        border-radius: 10px;
        //transform: translateY(50%);
        //width: 200px;
        background-color: rgba(255, 255, 255, 0.5);
        padding: 0.5%;
        max-height: 30%;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .legend .legend-title {
        text-align: left;
        margin-bottom: 5px;
        font-weight: bold;
        font-size: 90%;
    }

    .legend .legend-scale ul {
        margin: 0;
        margin-bottom: 5px;
        padding: 0;
        float: left;
        list-style: none;
        display: flex;
        min-width: 80px; /* Minimalwert */
    }

    .legend .legend-scale ul li {
        font-size: 60%;
        list-style: none;
        margin-left: 0;
        line-height: 18px;
        margin-bottom: 2px;
        text-overflow: ellipsis;
    }

    .legend ul.legend-labels li span {
        display: block;
        float: left;
        height: 16px;
        width: 30px;
        margin-right: 5px;
        margin-left: 0;
        border: 1px solid #999;
    }

    .horilegend {
        border-radius: 10px;
        //transform: translateY(50%);
        //width: 200px;
        background-color: rgba(255, 255, 255, 0.5);
        padding: 0.5%;
        max-height: 30%;
    }

    .legend .horilegend-title {
        text-align: left;
        margin-bottom: 8px;
        font-weight: bold;
        font-size: 90%;
    }

    .legend .horilegend-scale ul {
        //margin-left: 20%;
        padding: 0;
        float: left;
        list-style: none;
        display: flex;
    }

    .legend .horilegend-scale ul li {
        font-size: 60%;
        list-style: none;
        margin-left: 0;
        line-height: 1px;
        margin-bottom: 0;
        //text-align: center;
    }

    .legend ul.horilegend-labels li span {
        display: block;
        float: left;
        height: 1px;
        width: 30px;
        margin-right: 5px;
        margin-left: 0;
        border: none;
    }

    .box {
        float: left;
        height: 15px;
        width: 20px;
        margin-right: 15px;
    }

    .layer-legend-wrapper {
        width: 7%;
        display: flex;
        flex-direction: column; /* Setze die Richtung auf Spalten */
        justify-content: center;
        margin-left: 10px;
        align-items: center;
    }
`;