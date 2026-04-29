/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useEffect, createRef } from 'react';
import { styled } from '@superset-ui/core';
import { SupersetPluginChartCompareProps, SupersetPluginChartCompareStylesProps } from './types';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<SupersetPluginChartCompareStylesProps>`
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;

  pre {
    height: ${({ theme, headerFontSize, height }) => (
      height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]
    )}px;
  }

  .Root {
    height: calc(60% - 15px);
    width: 95%;
    margin-left: auto;
    margin-right: auto;
  }
  .Headertext {
    width: 65%;
  }
  .HeaderBox {
    display: flex; 
    justify-content: space-between;
    font-size: 0.9em;
  }
  .NameEntry {
    width: 60%;
  }
  .HeaderLine {
    width: 35%;
    display: flex;
    justify-content: space-between;
  }
  .Content {
    height: calc(60% - 15px);
    width: 100%;    
    overflow-y: scroll;
  }
  .List {
    list-style-type: none;  
    padding: 0;
    margin: 0;
    position: relative;
    overflow-y: scroll;
    height:300px;
  }
  .ListEntry {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    flex-direction: row;
    align-items: center;
    width: 100%;
    cursor: pointer;
    list-style: none;
  }
  .SmallBox {
    width: 35%;
  }
  .ValueBox {
    display: flex;
    justify-content: space-between;
  }
  .GreenPart {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    background-color: Green;
    height: 3px;
    border-radius: 2px;
  }
  .RedPart {
    background-color: Red;
    height: 3px;
    border-radius: 3px;
  }
  .TrendBox {
    width: 5%;
    align-items: center !important;
    padding-left: 10px;
    text-align: center;
  }
  .ListItem {
    border-bottom: 0 solid #e3e3e3;
    justify-content: space-between;
    padding: 3px 5px !important;
    flex-direction: column;
    align-items: flex-start !important;
  }
`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function SupersetPluginChartCompare(props: SupersetPluginChartCompareProps) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉

  const rootElem = createRef<HTMLDivElement>();

  // Often, you just want to access the DOM and do whatever you want.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    // const root = rootElem.current as HTMLElement;
    // console.log('Plugin element', root);
  });

  const { data, name_col, pos_col, neg_col, trend_col, height, width } = props;
  const name_entries = [...new Set(data.map(value => value[name_col]))].sort()
  console.log("Print", name_col, pos_col, neg_col, trend_col)

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <script src="https://kit.fontawesome.com/a076d05399.js" crossOrigin="anonymous"></script>
      <div className='Root'>
        <div className='Header'> <h3 className="Headertext">{props.headerText}</h3> </div>
        <div>
          <div className='HeaderBox'>
            <div className='NameEntry' style={{paddingLeft: '5px'}}><b>{name_col}</b></div>
            <div className='HeaderLine' style={{paddingRight: '5px'}}>
                <div><b>{pos_col}</b></div>
                <div><b>{neg_col}</b></div>
            </div>
            <div className='TrendBox'><b>{trend_col}</b></div>
          </div>
        <div className='Content'>
          <ul className='List'>
            {
              name_entries.map((entry) => {
                let found_entry: any = {};
                data.forEach(get_entry);

                function get_entry(value: any, index: number, array: Array<any>) {
                  if (value[name_col] == entry) {
                    found_entry = value
                  }
                }

                let sum = found_entry[pos_col] + found_entry[neg_col]
                // let max_value = Math.max(...Object.values(result))
                // let sum = 0;
                // Object.values(result).forEach(item => {sum += item})
                let rem_width: string = String(found_entry[neg_col]/sum*100) + '%'
                let trend_class = 'arrow-right';
                const trend_entry = found_entry[trend_col];
                if (trend_entry == 0) {
                  trend_class = "TrendBox fa-solid fa-arrow-right"
                }
                else if (trend_entry<0){
                  trend_class = "TrendBox fa-solid fa-arrow-down"
                }
                else {
                  trend_class = "TrendBox fa-solid fa-arrow-up"
                }
                return (
                  <li className='ListItem'>
                    <div className='ListEntry'>
                      <div className='NameEntry'> {entry} </div>
                      <small className='SmallBox'>
                        <div className='ValueBox'>
                          <div>{found_entry[pos_col]}</div>
                          <div>{found_entry[neg_col]}</div>
                        </div>
                        <div className='GreenPart'>
                          <div className='RedPart' style={{width: rem_width}}></div>
                        </div>
                      </small>
                      <div className={trend_class} style={{paddingLeft: '20px'}}></div>
                    </div>
                  </li>
                );
              }
            )}
          </ul>
        </div>
        </div>
      </div>
    </Styles>
  );
}
