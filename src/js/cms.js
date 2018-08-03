import React from 'react';
import CMS from 'netlify-cms';

class ColorControl extends React.Component {
  render() {
    return (
      <input
        style={{ height: '80px' }}
        type="color"
        value={this.props.value}
        onInput={e => this.props.onChange(e.target.value)}
      />
    );
  }
}

CMS.registerPreviewStyle('/css/final.css');
CMS.registerWidget('color', ColorControl);
