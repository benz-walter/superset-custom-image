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
import { SupersetPluginOccupancySpotsProps, SupersetPluginOccupancySpotsStylesProps } from './types';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const COLORS = {
  red: '#ef5350',
  green: '#66bb6a',
  orange: '#ff9800',
  black: '#000000'
};

const Styles = styled.div<SupersetPluginOccupancySpotsStylesProps>`
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  background-color:#fff;
  color:#2d2d2d;
  
  .progress-container {
    padding: 0 0 3px;
    position: relative
  }

  .progress-container .label {
      display: flex;
      justify-content: space-between;
      text-transform: uppercase;
      color: #2d2d2d;
      font-size: .8rem;
      padding-left: 0;
      padding-right: 0;
  }

    .progress-container .numbers {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: 1.1rem;
        color: #555;
        background: #e3e3e3;
        border-radius: 3px;
        padding: 0 5px;
        margin-bottom: 10px
    }

    .progress-container .numbers .percent {
        border: 3px solid #fff;
        font-size: 1.3rem;
        background: Red;
        border-radius: 6px;
        color: #fff;
        padding: 2px 5px;
        position: absolute;
        margin-top: -8px;
        margin-left: calc(50% - 43px);
        width: 60px;
        text-align: center;
        opacity: 0;
        z-index: 20
    }

    .progress-container .numbers .percent.blank {
        background: Green;
        background: #555;
        color: #f7f7f7;
        opacity: 1;
        z-index: 10
    }

    .progress-container .numbers .percent sub {
        font-size: .6em;
        letter-spacing: 1px;
        position: absolute;
        left: 3px;
        top: 5px;
    }

    .progress-container .numbers .percent div {
        text-align: right;
        position: relative;
        margin: 4px -3px -4px 0
    }

    .progress-container .progress {
        display: flex;
        height: 1.2rem;
        overflow: hidden;
        font-size: .75rem;
        background-color: #e9ecef;
        border-radius: .25rem;
        margin: 5px 0
    }

    .progress-container .progress .progress-bar {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        color: #fff;
        text-align: center;
        white-space: nowrap;
        background-color: #0d6efd;
        transition: width .6s ease
    }

    .progress-container .progress.success .outoforder {
        background-color: ${COLORS.black};;
    }

    .progress-container .progress.success .available {
        background-color: ${COLORS.green};;
    }

    .progress-container .progress.success .occupied {
        background-color: ${COLORS.red};;
    }

    .progress-container .progress.success .unknown {
        background-color: ${COLORS.orange};;
    }
    ul.things-list {
      padding: 0;
      margin: 0;
    }
    ul.things-list li {
      flex-direction: column;
      list-style-type: none;  
      padding: 0;
      margin: 0;
    }

    ul.things-list li div.thing-item {
        padding: 0;
        margin: 3px 0;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end
    }

    ul.things-list li div.thing-item div {
        cursor: pointer;
        display: flex;
        flex-wrap: wrap
    }

    ul.things-list li .thing-item-details {
        clear: both;
        overflow: hidden;
        max-height: 0;
        transition: max-height .5s, padding .5s;
        background: #f5f5f5;
        box-shadow: inset 1px 1px 5px #0003;
        border-radius: 3px;
        padding: 0
    }

    ul.things-list li .thing-item-details.on {
        max-height: 175px;
        overflow-y: auto;
        padding: 5px
    }

    ul.things-list li .thing-item-details div.status-dot {
        margin-right: 5px
    }

    ul.things-list li .thing-item-details .thing-item-detail {
        margin: 6px 0;
        display: flex
    }

    ul.things-list li i.button.bi.bi-geo-fill,
    ul.things-list li i.button.bi.bi-map {
        float: right;
        margin-left: 10px
    }

    ul.things-list li i.button.bi.bi-geo-fill {
        float: none;
        margin-left: 0
    }

    ul.things-list li.expanded i.button.bi.bi-geo-fill {
        float: right
    }

    ul.things-list li div.status-dot {
        background: #ffb74d;
        border-radius: 50%;
        width: 15px;
        height: 15px;
        display: inline-block;
        margin-left: 5px
    }

    ul.things-list li div.status-dot.available {
        background: ${COLORS.green};
    }

    ul.things-list li div.status-dot.charging {
        background: ${COLORS.red};
    }

    ul.things-list li div.status-dot.outoforder {
        background: #000
    }

    ul.things-list li div.status-dot.reserved {
        background: ${COLORS.orange};
    }

    ul.things-list li div.status-dot.blocked {
        background: ${COLORS.red};
    }

    ul.things-list li div.status-dot.Operative {
        background: ${COLORS.green};
    }

    ul.things-list li div.status-dot.Inoperative {
        background: ${COLORS.orange};
    }

    ul.things-list li .tools {
        position: absolute;
        right: 5px;
        padding: 1px 3px;
        cursor: pointer
    }

    ul.things-list li .tools:hover {
        background: #e3e3e3;
        transform: scale(1.2)
    }

    .rit-bar-chart {
        position: relative;
        height: 60%;
        width: 100%;
        margin: -40px 0
    }

    .support-logos {
        position: absolute;
        top: 6px;
        right: 35px
    }

    .support-logos .support-logo {
        height: 35px
    }

`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function SupersetPluginOccupancySpots(props: SupersetPluginOccupancySpotsProps) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  
  const rootElem = createRef<HTMLDivElement>();

  // Often, you just want to access the DOM and do whatever you want.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    // const root = rootElem.current as HTMLElement;
    // console.log('Plugin element', root);
  });

  // console.log('Plugin props', props);

  const { data, name_cols, status_col, height, width } = props;
  const name_entries = [...new Set(data.map(value => value[name_cols[0]]))].sort()
  const operators = name_entries.map(value => data.find(entry => entry[name_cols[0]] === value)[name_cols[1]])
  let n_free = 0;
  let n_occupied = 0;
  let n_unknown = 0;
  let n_out_of_order = 0;
  data.forEach(item => {
    if (item[status_col] == 1) {
      n_free += 1;
    }
    else if (item[status_col] == 2) {
      n_occupied += 1;
    }
    else if (item[status_col] == 3) {
      n_unknown += 1;
    }
    else if (item[status_col] == 4) {
      n_out_of_order += 1;
    }
  })
  const fraction_free = n_free / (n_free + n_occupied + n_unknown + n_out_of_order) * 100;
  const fraction_occ = n_occupied / (n_free + n_occupied + n_unknown + n_out_of_order) * 100;
  const fraction_unk = n_unknown / (n_free + n_occupied + n_unknown + n_out_of_order) * 100;
  const fraction_oo = n_out_of_order / (n_free + n_occupied + n_unknown + n_out_of_order) * 100;
  const a_rem_width: string = String(fraction_free) + '%'
  const o_rem_width: string = String(fraction_occ) + '%'
  const u_rem_width: string = String(fraction_unk) + '%'
  const oo_rem_width: string = String(fraction_oo) + '%'
  console.log(a_rem_width, o_rem_width, u_rem_width, oo_rem_width)


  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <div className="widget-header" style={{width: '60%'}}><h3>{props.headerText}</h3></div>
      <div className="progress-container" style={{width: '60%'}}>
        <div className="label">
            <div>Frei</div>
            <div>Belegt</div>
        </div>
        <div className="numbers">
            <div className="actual">{n_free}</div>
            <div className="percent blank"><sub>frei</sub>
                <div>{fraction_free.toFixed()} %</div>
            </div>
            <div className="total">{n_occupied}</div>
        </div>
        <div className="progress success">
            <div role="progressbar" className="available" style={{width: a_rem_width}}></div>
            <div role="progressbar" className="occupied" style={{width: o_rem_width}}></div>
            <div role="progressbar" className="unknown" style={{width: u_rem_width}}></div>
            <div role="progressbar" className="outoforder" style={{width: oo_rem_width}}></div>
        </div>
      </div>
      <div className="widget-content scrollGradient" style={{height: 'calc(100% - 150px)', width: '60%'}}>
        <ul className="things-list">
        {
          name_entries.map((entry) => {
            let index = name_entries.indexOf(entry)
            let operator = operators[index]
            let state_values = data.filter(value => value[name_cols[0]] === entry)
            
            return (
              <li id="w-ladestation_thing_3530" className="ng-star-inserted">
                <div className="thing-item">
                  <div style={{flexGrow: 10}} className="ng-star-inserted">
                      <div
                        style={{display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap', flexGrow: 10}}>
                        {entry}<br/><small>{operator}</small></div>
                  </div>
                  <div>
                  {
                    state_values.map((value) => {
                      let class_name = '';
                      if (value[status_col] == 1) {
                        class_name = 'available'
                      }
                      else if (value[status_col] == 2) {
                        class_name = 'charging'
                      }
                      else if (value[status_col] == 3) {
                        class_name = 'reserved'
                      }
                      else if (value[status_col] == 4) {
                        class_name = 'outoforder'
                      }
                      class_name += ' status-dot ng-star-inserted'
            
                    return (
                      <div className={class_name}></div>
                    )}
                  )}
                  </div>
                </div>
              </li>
            );
          }
        )}
        </ul>
      </div>
    </Styles>
  );
}
