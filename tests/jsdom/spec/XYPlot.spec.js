import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import { XYPlot, Bar } from '../../../src/index.js';

describe('XYPlot', () => {
  const commonXYProps = {
    xDomain: [0, 10],
    yDomain: [0, 100],
    xyPlotClassName: 'xy-plot',
    xyPlotStyle: { fill: 'blue' },
    xyPlotContainerStyle: { opacity: '0.5' },
  };

  it('renders SVG with given width, height, style and className (or a default)', () => {
    const chart = mount(<XYPlot width={600} height={800} {...commonXYProps} />);
    const svg = chart.find('svg');
    const plot = chart.find('.rct-plot-background');

    // svg className returns SvgAnimatedString, so access baseVal to get string
    // for chai contains to test against
    expect(svg.getDOMNode().className.baseVal).to.contain(
      commonXYProps.xyPlotClassName,
    );

    expect(svg.getDOMNode().style._values).to.eql(
      commonXYProps.xyPlotContainerStyle,
    );
    expect(plot.getDOMNode().style._values).to.eql(commonXYProps.xyPlotStyle);

    const node = svg.instance();
    expect(node.tagName.toLowerCase()).to.equal('svg');
    expect(node.getAttribute('width')).to.equal('600');
    expect(node.getAttribute('height')).to.equal('800');

    const chart2 = mount(<XYPlot {...commonXYProps} />);
    const node2 = chart2.find('svg').instance();
    expect(node2.tagName.toLowerCase()).to.equal('svg');
    expect(parseInt(node2.getAttribute('width'), 10))
      .to.be.a('number')
      .and.to.be.above(0);
    expect(parseInt(node2.getAttribute('height'), 10))
      .to.be.a('number')
      .and.to.be.above(0);
  });

  it('renders inner chart area with given margin', () => {
    const size = 400;
    const margin = {
      marginTop: 10,
      marginBottom: 20,
      marginLeft: 30,
      marginRight: 40,
    };
    const chart = mount(
      <XYPlot width={size} height={size} {...margin} {...commonXYProps} />,
    );
    const inner = chart.find('.rct-chart-inner').instance();
    const bg = chart.find('.rct-plot-background').instance();
    expect(inner.getAttribute('transform').replace(/\s/, '')).to.contain(
      `translate(${margin.marginLeft},${margin.marginTop})`,
    );
    expect(parseInt(bg.getAttribute('width'), 10)).to.equal(
      size - (margin.marginLeft + margin.marginRight),
    );
    expect(parseInt(bg.getAttribute('height'), 10)).to.equal(
      size - (margin.marginTop + margin.marginBottom),
    );
  });

  it('renders children with correct props', () => {
    const barProps = {
      x: 0,
      y: 0,
      yEnd: 30,
      style: { fill: 'red' },
      onMouseMove: sinon.spy(),
    };
    const chart = mount(
      <XYPlot
        width={600}
        height={800}
        {...commonXYProps}
        onMouseMove={sinon.spy()}
      >
        <Bar {...barProps} />
      </XYPlot>,
    );

    const bar = chart.find(Bar);

    // Make sure props passed into bar are correctly passed down by XYPlot and not overriden
    Object.keys(barProps).forEach(k => {
      expect(bar.props()[k]).to.equal(barProps[k]);
    });

    // Make sure click handlers passed into bar are correctly triggered
    expect(chart.props().onMouseMove).not.to.have.been.called;
    expect(bar.props().onMouseMove).not.to.have.been.called;
    bar.simulate('mousemove');
    expect(chart.props().onMouseMove).to.have.been.called;
    expect(bar.props().onMouseMove).to.have.been.called;
  });

  it('triggers event handlers', () => {
    const mouseHandlers = {
      onMouseMove: sinon.spy(),
      onMouseEnter: sinon.spy(),
      onMouseLeave: sinon.spy(),
      onMouseDown: sinon.spy(),
      onMouseUp: sinon.spy(),
      onClick: sinon.spy(),
    };
    const chart = mount(<XYPlot {...commonXYProps} {...mouseHandlers} />);
    const chartProps = chart.props();
    const expectedKeys = [
      'event',
      'outerX',
      'outerY',
      'innerX',
      'innerY',
      'xValue',
      'yValue',
      'xScale',
      'yScale',
      'marginTop',
      'marginBottom',
      'marginLeft',
      'marginRight',
    ];

    Object.keys(mouseHandlers).forEach(handler => {
      const handlerSimulateEventName = handler.substring(2).toLowerCase();

      expect(chartProps[handler]).not.to.have.been.called;
      chart.simulate(handlerSimulateEventName);
      expect(chartProps[handler]).to.have.been.called;
      expect(Object.keys(chartProps[handler].args[0][0])).to.eql(expectedKeys);
    });
  });

  it('renders SVG with defs when provided', () => {
    const chart = mount(
      <XYPlot
        width={600}
        height={800}
        defs={
          <linearGradient id="Gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="blue" />
            <stop offset="50%" stopColor="white" />
            <stop offset="100%" stopColor="red" />
          </linearGradient>
        }
        {...commonXYProps}
      />,
    );
    const linearGradient = chart.find('#Gradient');
    expect(linearGradient).to.have.length(1);
  });
});
